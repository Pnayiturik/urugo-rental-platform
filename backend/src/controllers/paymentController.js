/**
 * ============================================
 * URUGO RENTAL PLATFORM - PAYMENT CONTROLLER
 * ============================================
 * 
 * ACTIVE PAYMENT METHOD: STRIPE
 * - All new payments use Stripe Checkout
 * - Test Mode Keys Configured
 * - Webhooks supported for async verification
 * 
 * DEPRECATED METHODS:
 * - Paystack (kept for backwards compatibility)
 * - Flutterwave (removed)
 * 
 * Currency: Rwandan Franc (RWF)
 */

const Payment = require('../models/Payment');
const User = require('../models/User');
const Lease = require('../models/Lease');
const Document = require('../models/Document');
const { checkOverduePayments, generateMonthlyPayments } = require('../services/paymentService');
const { sendLandlordNotification } = require('../services/emailService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Flutterwave = require('flutterwave-node-v3');

const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY,
  true  // sandbox / test mode
);

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * @desc    Get all payments for a Landlord
 * @route   GET /api/payments
 */
const getPayments = async (req, res) => {
  try {
    await checkOverduePayments();
    const userId = req.userId || req.user?._id;

    const payments = await Payment.find({ landlordId: userId })
      .populate('tenantId', 'firstName lastName email')
      .populate('propertyId', 'name address')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Backward-compatible alias for old route: POST /api/payments
const createPayment = async (req, res) => {
  return createStripeCheckoutSession(req, res);
};

// Backward-compatible handler for old route: GET /api/payments/:id
const getPaymentById = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;
    const payment = await Payment.findOne({
      _id: req.params.id,
      $or: [{ landlordId: userId }, { tenantId: userId }]
    })
      .populate('tenantId', 'firstName lastName email')
      .populate('propertyId', 'name address');

    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    return res.status(200).json({ success: true, payment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get payments for the logged-in Tenant
 * @route   GET /api/payments/tenant
 */
const getTenantPayments = async (req, res) => {
  try {
    // Note: We use req.userId directly since our logic now links Lease to User model
    const payments = await Payment.find({ tenantId: req.userId })
      .populate('propertyId', 'name address')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Process Payment (Legacy - Use Stripe Instead)
 * @route   POST /api/payments/process
 * @deprecated Use Stripe checkout session instead
 */
const processPayment = async (req, res) => {
  try {
    return res.status(400).json({ 
      success: false,
      message: 'This payment method is deprecated. Please use Stripe checkout instead.',
      redirectTo: '/tenant/wallet'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Verify Payment & Generate Receipt (Document)
 * @route   POST /api/payments/verify
 * Note: This would typically be called by a Webhook or a frontend Verify call
 */
const verifyPaymentStatus = async (req, res) => {
  try {
    const { paymentId, transactionId, status } = req.body;

    if (status === 'successful') {
      const payment = await Payment.findById(paymentId).populate('landlordId tenantId propertyId');
      
      payment.status = 'completed';
      payment.transactionId = transactionId;
      payment.paidDate = new Date();
      await payment.save();

      // 1. Digital Archiving: Save Receipt to Documents tab
      await Document.create([
        {
          title: `Rent Receipt - ${payment.propertyId.name}`,
          type: 'Receipt',
          ownerId: payment.landlordId._id,
          relatedId: payment._id
        },
        {
          title: `Rent Receipt - ${payment.propertyId.name}`,
          type: 'Receipt',
          ownerId: payment.tenantId._id,
          relatedId: payment._id
        }
      ]);

      // 2. Notify Landlord via Branded Email
      await sendLandlordNotification({
        landlordEmail: payment.landlordId.email,
        landlordName: payment.landlordId.firstName,
        tenantName: payment.tenantId.firstName,
        amount: payment.amount,
        propertyName: payment.propertyId.name,
        type: 'payment_received'
      });

      return res.status(200).json({ success: true, message: 'Payment verified and archived' });
    }
    
    res.status(400).json({ success: false, message: 'Payment not successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get Landlord Statistics
 */
const getPaymentStats = async (req, res) => {
  try {
    await checkOverduePayments();
    const payments = await Payment.find({ landlordId: req.userId });

    const stats = {
      totalRevenue: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
      pendingPayments: payments.filter(p => p.status === 'pending').length,
      completedPayments: payments.filter(p => p.status === 'completed').length,
      overduePayments: payments.filter(p => p.status === 'overdue').length,
      totalPayments: payments.length
    };

    res.status(200).json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Verify Paystack Payment (Legacy - Deprecated)
 * @route   POST /api/payments/verify-paystack
 * @deprecated Use Stripe payment verification instead
 */
const verifyPaystackPayment = async (req, res) => {
  try {
    return res.status(400).json({ 
      success: false, 
      message: 'Paystack payments are no longer supported. Please use Stripe checkout.',
      redirectTo: '/tenant/wallet'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/**
 * @desc    Create Stripe Checkout Session for Rent Payment
 * @route   POST /api/payments/create-checkout-session
 */
const createStripeCheckoutSession = async (req, res) => {
  try {
    console.log('💳 Creating Stripe checkout session for user:', req.userId);

    // Get tenant's lease information
    const lease =await Lease.findOne({ tenantId: req.userId })
      .populate('propertyId')
      .populate('landlordId');

    if (!lease) {
      return res.status(404).json({ 
        success: false, 
        message: 'No active lease found' 
      });
    }

    const user = await User.findById(req.userId);

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'rwf',
            product_data: {
              name: `Rent Payment - Unit ${lease.unitNumber}`,
              description: `Monthly rent for ${lease.propertyId?.name || 'Property'}`,
              images: ['https://i.imgur.com/urugo-logo.png'], // Add your logo
            },
            unit_amount: lease.rentAmount , // Stripe expects amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${FRONTEND_URL}/tenant/wallet?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/tenant/wallet?canceled=true`,
      customer_email: user.email,
      metadata: {
        userId: String(req.userId),
        leaseId: String(lease._id),
        propertyId: String(lease.propertyId._id),
        landlordId: String(lease.landlordId._id),
        unitNumber: lease.unitNumber,
        rentAmount: String(lease.rentAmount)
      }
    });

    console.log('✅ Stripe session created:', session.id);

    // Return checkout URL to frontend
    res.json({ 
      success: true,
      url: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error('❌ Stripe checkout error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/**
 * @desc    Handle Stripe Webhook Events
 * @route   POST /api/payments/stripe-webhook
 */
const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify webhook signature
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      event = req.body;
    }

    console.log('🔔 Stripe webhook received:', event.type);

    // Handle checkout completion (success or pending)
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      console.log('✅ Checkout completed for session:', session.id);
      console.log('Payment status:', session.payment_status);
      console.log('Metadata:', session.metadata);

      // Check if already recorded
      const existing = await Payment.findOne({ transactionId: session.id });
      if (existing) {
        console.log('⚠️ Transaction already recorded');
        return res.json({ received: true });
      }

      // Determine payment status
      let paymentStatus = 'pending';
      if (session.payment_status === 'paid') {
        paymentStatus = 'completed';
      }

      // Record transaction
      const payment = await Payment.create({
        tenantId: session.metadata.userId,
        landlordId: session.metadata.landlordId,
        propertyId: session.metadata.propertyId,
        amount: parseInt(session.metadata.rentAmount),
        dueDate: new Date(),
        paidDate: paymentStatus === 'completed' ? new Date() : null,
        paymentMethod: 'stripe',
        transactionId: session.id,
        status: paymentStatus,
        paymentFor: 'rent',
        paymentMonth: new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
      });

      console.log(`✅ Transaction recorded with status: ${paymentStatus}`, payment._id);

      // Only create receipt and notify for successful payments
      if (paymentStatus === 'completed') {
        await Document.create([
          {
            name: `Rent Receipt - ${payment.paymentMonth}`,
            title: `Rent Receipt - ${payment.paymentMonth}`,
            type: 'receipt',
            url: `#receipt-${payment._id}`,
            uploadedBy: session.metadata.userId,
            ownerId: session.metadata.userId,   // tenant sees it
            relatedTo: session.metadata.leaseId,
            relatedModel: 'Lease'
          },
          {
            name: `Rent Receipt - ${payment.paymentMonth}`,
            title: `Rent Receipt - ${payment.paymentMonth}`,
            type: 'receipt',
            url: `#receipt-${payment._id}`,
            uploadedBy: session.metadata.userId,
            ownerId: session.metadata.landlordId, // landlord sees it too
            relatedTo: session.metadata.leaseId,
            relatedModel: 'Lease'
          }
        ]);

        const landlord = await User.findById(session.metadata.landlordId);
        if (landlord?.email) {
          await sendLandlordNotification(
            landlord.email,
            'New Rent Payment Received',
            `Payment of ${payment.amount} RWF received from tenant for Unit ${session.metadata.unitNumber}`
          );
        }
      }
    }

    // Handle expired/failed checkout sessions
    if (event.type === 'checkout.session.expired' || event.type === 'payment_intent.payment_failed') {
      const session = event.data.object;
      const sessionId = session.id || session.metadata?.sessionId;
      
      console.log('❌ Payment failed/expired:', sessionId);

      // Check if already recorded
      const existing = await Payment.findOne({ transactionId: sessionId });
      if (existing) {
        // Update status if it was pending
        if (existing.status === 'pending') {
          existing.status = 'failed';
          await existing.save();
          console.log('✅ Updated transaction status to failed');
        }
      } else if (session.metadata) {
        // Record failed transaction
        const payment = await Payment.create({
          tenantId: session.metadata.userId,
          landlordId: session.metadata.landlordId,
          propertyId: session.metadata.propertyId,
          amount: parseInt(session.metadata.rentAmount),
          dueDate: new Date(),
          paidDate: null,
          paymentMethod: 'stripe',
          transactionId: sessionId,
          status: 'failed',
          paymentFor: 'rent',
          paymentMonth: new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
        });

        console.log('✅ Failed transaction recorded:', payment._id);
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook error:', error.message);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};

/**
 * @desc    Verify Stripe Payment after redirect
 * @route   GET /api/payments/verify-stripe/:sessionId
 */
const verifyStripePayment = async (req, res) => {
  try {
    const { sessionId } = req.params;

    console.log('🔍 Verifying Stripe payment:', sessionId);

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    console.log('Session status:', session.payment_status);
    console.log('Session metadata:', session.metadata);

    // Check if transaction already recorded
    const existingPayment = await Payment.findOne({ transactionId: sessionId });
    
    if (existingPayment) {
      console.log('✅ Transaction already recorded');
      return res.json({
        success: existingPayment.status === 'completed',
        message: `Transaction already recorded with status: ${existingPayment.status}`,
        payment: existingPayment
      });
    }

    // Determine payment status based on Stripe session
    let paymentStatus = 'failed';
    if (session.payment_status === 'paid') {
      paymentStatus = 'completed';
    } else if (session.payment_status === 'unpaid') {
      paymentStatus = 'pending';
    }

    // Record transaction (success or failure)
    const payment = await Payment.create({
      tenantId: session.metadata.userId,
      landlordId: session.metadata.landlordId,
      propertyId: session.metadata.propertyId,
      amount: parseInt(session.metadata.rentAmount),
      dueDate: new Date(),
      paidDate: paymentStatus === 'completed' ? new Date() : null,
      paymentMethod: 'stripe',
      transactionId: session.id,
      status: paymentStatus,
      paymentFor: 'rent',
      receiptUrl: session.receipt_url || ''
    });

    console.log(`✅ Transaction recorded with status: ${paymentStatus}`, payment._id);

    // Only create receipt and notify for successful payments
    if (paymentStatus === 'completed') {
      // Create receipt document for both tenant and landlord
      await Document.create([
        {
          name: `Rent Receipt - ${new Date().toLocaleDateString()}`,
          title: `Rent Receipt - ${new Date().toLocaleDateString()}`,
          type: 'receipt',
          ownerId: session.metadata.userId,        // tenant
          relatedTo: session.metadata.leaseId,
          fileUrl: session.receipt_url || `#receipt-${payment._id}`,
          uploadedBy: session.metadata.userId
        },
        {
          name: `Rent Receipt - ${new Date().toLocaleDateString()}`,
          title: `Rent Receipt - ${new Date().toLocaleDateString()}`,
          type: 'receipt',
          ownerId: session.metadata.landlordId,    // landlord
          relatedTo: session.metadata.leaseId,
          fileUrl: session.receipt_url || `#receipt-${payment._id}`,
          uploadedBy: session.metadata.userId
        }
      ]);

      console.log('✅ Receipt documents created for tenant and landlord');

      // Send notification to landlord
      const landlord = await User.findById(session.metadata.landlordId);
      if (landlord) {
        await sendLandlordNotification(
          landlord.email,
          'New Rent Payment Received',
          `Payment of ${payment.amount} RWF received from tenant for Unit ${session.metadata.unitNumber}`
        );
        console.log('✅ Landlord notification sent');
      }
    }

    return res.json({
      success: paymentStatus === 'completed',
      message: paymentStatus === 'completed' ? 'Payment successful and recorded' : 'Payment failed and recorded',
      payment: {
        id: payment._id,
        amount: payment.amount,
        status: payment.status,
        paidDate: payment.paidDate
      }
    });
  } catch (error) {
    console.error('❌ Stripe verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================================
//  FLUTTERWAVE INTEGRATION
// ============================================================

/**
 * @desc   Initialise a Flutterwave inline payment
 * @route  POST /api/payments/flutterwave/init
 * @access Private (tenant)
 *
 * Returns the config the React frontend uses to open the
 * Flutterwave inline payment modal.
 */
const initFlutterwavePayment = async (req, res) => {
  try {
    const userId    = req.userId || req.user?._id;
    const { paymentFor = 'rent' } = req.body;

    const user  = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // For rent / deposit we need the active lease
    const lease = await Lease.findOne({ tenantId: userId })
      .populate('propertyId')
      .populate('landlordId');

    if (!lease) {
      return res.status(404).json({ success: false, message: 'No active lease found' });
    }

    // Determine amount & description
    let amount;
    let description;
    switch (paymentFor) {
      case 'deposit':
        amount      = lease.propertyId?.cautionFee || 0;
        description = `Security deposit – ${lease.propertyId?.name || 'Property'}`;
        break;
      case 'topup':
        amount      = Number(req.body.amount) || 0;
        description = 'Wallet top-up';
        break;
      default: // rent
        amount      = lease.rentAmount || 0;
        description = `Monthly rent – Unit ${lease.unitNumber}, ${lease.propertyId?.name || 'Property'}`;
    }

    if (amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payment amount' });
    }

    // Create a unique transaction reference
    const txRef = `URUGO-${paymentFor.toUpperCase()}-${userId}-${Date.now()}`;

    // Persist a PENDING payment record so we can update it on webhook/callback
    const pendingPayment = await Payment.create({
      tenantId:      userId,
      landlordId:    lease.landlordId?._id || lease.landlordId,
      propertyId:    lease.propertyId?._id || lease.propertyId,
      amount,
      dueDate:       new Date(),
      paymentMethod: 'flutterwave',
      transactionId: txRef,           // we'll overwrite with the real tx id after verification
      status:        'pending',
      paymentFor:    paymentFor === 'deposit' ? 'deposit' : paymentFor === 'topup' ? 'other' : 'rent',
      paymentMonth:  new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
    });

    // Build the config object the React inline widget expects
    const config = {
      public_key:      process.env.FLW_PUBLIC_KEY,
      tx_ref:          txRef,
      amount,
      currency:        'RWF',
      payment_options: 'card,mobilemoneyrwanda,banktransfer',
      customer: {
        email:        user.email,
        name:         `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        phone_number: user.phone || ''
      },
      customizations: {
        title:       'Urugo Rental Platform',
        description,
        logo:        'https://urugo.netlify.app/logo.png'
      },
      meta: {
        paymentId:  String(pendingPayment._id),
        paymentFor,
        leaseId:    String(lease._id),
        landlordId: String(lease.landlordId?._id || lease.landlordId),
        unitNumber: lease.unitNumber
      }
    };

    return res.status(200).json({ success: true, config });
  } catch (error) {
    console.error('❌ FLW init error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Verify a Flutterwave transaction after the inline callback
 * @route  POST /api/payments/flutterwave/verify
 * @access Private (tenant)
 */
const verifyFlutterwavePayment = async (req, res) => {
  try {
    const { transaction_id, tx_ref } = req.body;

    if (!transaction_id) {
      return res.status(400).json({ success: false, message: 'transaction_id is required' });
    }

    // Call Flutterwave to confirm the transaction
    const flwRes  = await flw.Transaction.verify({ id: transaction_id });
    const flwData = flwRes?.data;

    if (!flwData || flwRes.status !== 'success') {
      return res.status(400).json({ success: false, message: 'Flutterwave verification failed' });
    }

    if (
      flwData.status    !== 'successful' ||
      flwData.currency  !== 'RWF'
    ) {
      return res.status(400).json({
        success: false,
        message: `Transaction not successful. Status: ${flwData.status}`
      });
    }

    // Find our pending payment (match by tx_ref stored in transactionId)
    const refToFind = tx_ref || flwData.tx_ref;
    let payment     = await Payment.findOne({ transactionId: refToFind })
                                   .populate('landlordId tenantId propertyId');

    if (payment && payment.status === 'completed') {
      return res.status(200).json({ success: true, message: 'Already recorded', payment });
    }

    if (payment) {
      // Verify the amount matches (guard against tampered amounts)
      if (Number(flwData.amount) < payment.amount) {
        payment.status = 'partial';
        payment.paidAmount = Number(flwData.amount);
      } else {
        payment.status    = 'completed';
        payment.paidAmount = payment.amount;
      }
      payment.transactionId = String(flwData.id);   // real Flutterwave tx id
      payment.paidDate      = new Date();
      await payment.save();
    } else {
      // Fallback: create the record (webhook may not have fired yet)
      payment = await Payment.create({
        tenantId:      flwData.meta?.userId || req.userId || req.user?._id,
        landlordId:    flwData.meta?.landlordId,
        propertyId:    flwData.meta?.propertyId,
        amount:        Number(flwData.amount),
        paidAmount:    Number(flwData.amount),
        dueDate:       new Date(),
        paidDate:      new Date(),
        paymentMethod: 'flutterwave',
        transactionId: String(flwData.id),
        status:        'completed',
        paymentFor:    flwData.meta?.paymentFor || 'rent',
        paymentMonth:  new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
      });
      await payment.populate('landlordId tenantId propertyId');
    }

    // Only for completed payments: receipt + email
    if (payment.status === 'completed') {
      // Create receipt document
      await Document.create({
        title:       `Flutterwave Receipt – ${payment.paymentMonth || new Date().toLocaleDateString()}`,
        name:        `Flutterwave Receipt – ${payment.paymentMonth || new Date().toLocaleDateString()}`,
        type:        'receipt',
        url:         `#flw-receipt-${payment._id}`,
        uploadedBy:  String(payment.tenantId?._id || payment.tenantId),
        ownerId:     String(payment.tenantId?._id || payment.tenantId),
        relatedTo:   String(flwData.meta?.leaseId || ''),
        relatedModel:'Lease'
      });

      // Notify landlord
      if (payment.landlordId?.email) {
        await sendLandlordNotification(
          payment.landlordId.email,
          'New Rent Payment Received via Flutterwave',
          `Payment of ${payment.amount} RWF received from ${payment.tenantId?.firstName || 'Tenant'} for unit ${flwData.meta?.unitNumber || ''}`
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: payment.status === 'completed' ? 'Payment verified and recorded' : 'Partial payment recorded',
      payment: {
        id:       payment._id,
        amount:   payment.amount,
        status:   payment.status,
        paidDate: payment.paidDate
      }
    });
  } catch (error) {
    console.error('❌ FLW verify error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Flutterwave webhook – server-side real-time event handler
 * @route  POST /api/payments/flutterwave/webhook
 * @access Public (Flutterwave server — verified by hash)
 */
const flutterwaveWebhook = async (req, res) => {
  try {
    const secretHash  = process.env.FLW_WEBHOOK_SECRET;
    const signature   = req.headers['verif-hash'];

    // Reject requests that don't carry the correct secret
    if (secretHash && signature !== secretHash) {
      console.warn('⚠️  FLW webhook: invalid signature');
      return res.status(401).send('Unauthorized');
    }

    const event = req.body;
    console.log('🔔 FLW webhook received:', event?.event, event?.data?.tx_ref);

    // We only care about successful charge completions
    if (event?.event !== 'charge.completed' || event?.data?.status !== 'successful') {
      return res.status(200).json({ received: true });
    }

    const data    = event.data;
    const txRef   = data.tx_ref;
    const txId    = String(data.id);

    // Idempotency – skip if already processed with the real tx id
    const existing = await Payment.findOne({ transactionId: txId });
    if (existing) {
      console.log('⚠️  FLW webhook: already processed', txId);
      return res.status(200).json({ received: true });
    }

    // Find the pending record created during /init
    const payment = await Payment.findOne({ transactionId: txRef })
                                  .populate('landlordId tenantId propertyId');

    if (payment) {
      payment.status        = 'completed';
      payment.paidAmount    = Number(data.amount);
      payment.transactionId = txId;
      payment.paidDate      = new Date();
      await payment.save();

      // Receipt
      await Document.create({
        title:       `Flutterwave Receipt – ${payment.paymentMonth}`,
        name:        `Flutterwave Receipt – ${payment.paymentMonth}`,
        type:        'receipt',
        url:         `#flw-receipt-${payment._id}`,
        uploadedBy:  String(payment.tenantId?._id || payment.tenantId),
        ownerId:     String(payment.tenantId?._id || payment.tenantId),
        relatedModel:'Lease'
      });

      // Email
      if (payment.landlordId?.email) {
        await sendLandlordNotification(
          payment.landlordId.email,
          'Rent Payment Confirmed via Flutterwave',
          `Payment of ${payment.amount} RWF confirmed for ${payment.tenantId?.firstName || 'Tenant'}.`
        );
      }

      console.log('✅ FLW webhook: payment recorded', payment._id);
    } else {
      console.warn('⚠️  FLW webhook: no matching pending payment for', txRef);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ FLW webhook error:', error.message);
    return res.status(500).send(`Webhook Error: ${error.message}`);
  }
};

module.exports = {
  getPayments,
  createPayment,
  getPaymentById,
  getTenantPayments,
  processPayment,
  verifyPaymentStatus,
  getPaymentStats,
  verifyPaystackPayment,
  createStripeCheckoutSession,
  stripeWebhook,
  verifyStripePayment,
  initFlutterwavePayment,
  verifyFlutterwavePayment,
  flutterwaveWebhook
};