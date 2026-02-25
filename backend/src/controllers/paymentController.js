const Payment = require('../models/Payment');
const User = require('../models/User');
const Lease = require('../models/Lease');
const Document = require('../models/Document');
const { initializeFlutterwavePayment, checkOverduePayments, generateMonthlyPayments } = require('../services/paymentService');
const { sendLandlordNotification } = require('../services/emailService');
const axios = require('axios');

const PAYSTACK_SECRET_KEY = 'sk_test_3189873c8bbc0c6ca8d7a18d4cec82c9d0043544';

/**
 * @desc    Get all payments for a Landlord
 * @route   GET /api/payments
 */
const getPayments = async (req, res) => {
  try {
    await checkOverduePayments();

    const payments = await Payment.find({ landlordId: req.userId })
      .populate('tenantId', 'firstName lastName email')
      .populate('propertyId', 'name address')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
 * @desc    Initialize Flutterwave MoMo Payment
 * @route   POST /api/payments/process
 */
const processPayment = async (req, res) => {
  try {
    const { paymentId, phoneNumber } = req.body;

    if (!paymentId || !phoneNumber) {
      return res.status(400).json({ message: 'Missing payment ID or phone number' });
    }

    const payment = await Payment.findOne({ _id: paymentId, tenantId: req.userId });
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    if (payment.status === 'completed') {
      return res.status(400).json({ message: 'This rent is already paid' });
    }

    const totalAmount = payment.amount + (payment.penaltyAmount || 0);
    const user = await User.findById(req.userId);

    // Initialize Flutterwave Flow
    const paymentData = await initializeFlutterwavePayment({
      email: user.email,
      amount: totalAmount,
      phone: phoneNumber,
      name: `${user.firstName} ${user.lastName}`,
      tx_ref: `URGO-${paymentId}-${Date.now()}`
    });

    // We return the Flutterwave link to the frontend
    res.status(200).json({
      success: true,
      data: paymentData,
      message: 'Payment link generated'
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
 * @desc    Verify Paystack Payment and Record Transaction
 * @route   POST /api/payments/verify-paystack
 */
const verifyPaystackPayment = async (req, res) => {
  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ success: false, message: 'Payment reference is required' });
    }

    // Verify payment with Paystack API
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const { data } = response.data;

    if (data.status !== 'success') {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment verification failed' 
      });
    }

    // Get lease information
    const lease = await Lease.findOne({ tenantId: req.userId })
      .populate('propertyId')
      .populate('landlordId');

    if (!lease) {
      return res.status(404).json({ 
        success: false, 
        message: 'No active lease found' 
      });
    }

    // Create payment record
    const payment = await Payment.create({
      tenantId: req.userId,
      landlordId: lease.landlordId._id,
      propertyId: lease.propertyId._id,
      amount: data.amount / 100, // Convert from kobo back to RWF
      dueDate: new Date(),
      paidDate: new Date(),
      paymentMethod: data.channel,
      transactionId: reference,
      status: 'completed',
      paymentFor: 'rent',
      paymentMonth: new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
    });

    // Generate receipt document
    const document = await Document.create({
      name: `Rent Receipt - ${payment.paymentMonth}`,
      type: 'receipt',
      url: `#receipt-${payment._id}`,
      uploadedBy: req.userId,
      ownerId: req.userId,
      relatedTo: lease._id,
      relatedModel: 'Lease'
    });

    // Send notification to landlord
    if (lease.landlordId.email) {
      await sendLandlordNotification(
        lease.landlordId.email,
        'New Rent Payment Received',
        `Payment of ${payment.amount} RWF received from tenant for Unit ${lease.unitNumber}`
      );
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified and recorded successfully',
      payment,
      document
    });

  } catch (error) {
    console.error('Paystack verification error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      message: error.response?.data?.message || error.message 
    });
  }
};

module.exports = {
  getPayments,
  getTenantPayments,
  processPayment,
  verifyPaymentStatus,
  getPaymentStats,
  verifyPaystackPayment
};