const Payment = require('../models/Payment');
const User = require('../models/User');
const Document = require('../models/Document');
const { initializeFlutterwavePayment, checkOverduePayments, generateMonthlyPayments } = require('../services/paymentService');
const { sendLandlordNotification } = require('../services/emailService');

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

module.exports = {
  getPayments,
  getTenantPayments,
  processPayment,
  verifyPaymentStatus,
  getPaymentStats
};