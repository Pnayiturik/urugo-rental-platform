const Payment = require('../models/Payment');
const Tenant = require('../models/Tenant');
const { processMobileMoneyPayment, generateMonthlyPayments, checkOverduePayments } = require('../services/paymentService');

const getPayments = async (req, res) => {
  try {
    await checkOverduePayments();

    const payments = await Payment.find({ landlordId: req.userId })
      .populate('tenantId')
      .populate({
        path: 'tenantId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email'
        }
      })
      .populate('propertyId', 'name address')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTenantPayments = async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ userId: req.userId });
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant profile not found' });
    }

    await generateMonthlyPayments(tenant);
    await checkOverduePayments();

    const payments = await Payment.find({ tenantId: tenant._id })
      .populate('propertyId', 'name address')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const processPayment = async (req, res) => {
  try {
    const { paymentId, paymentMethod, phoneNumber } = req.body;

    if (!paymentId || !paymentMethod || !phoneNumber) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const tenant = await Tenant.findOne({ userId: req.userId });
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant profile not found' });
    }

    const payment = await Payment.findOne({ _id: paymentId, tenantId: tenant._id });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status === 'completed') {
      return res.status(400).json({ message: 'Payment already completed' });
    }

    const totalAmount = payment.amount + payment.penaltyAmount;

    const paymentResult = await processMobileMoneyPayment({
      phoneNumber,
      amount: totalAmount,
      paymentMethod
    });

    if (paymentResult.success) {
  payment.status = 'completed';
  payment.paymentMethod = paymentMethod;
  payment.phoneNumber = phoneNumber;
  payment.transactionId = paymentResult.transactionId;
  payment.paidDate = new Date();
  await payment.save();

  // Send notification to landlord
  const { sendLandlordNotification } = require('../services/emailService');
  const landlord = await require('../models/User').findById(payment.landlordId);
  const tenantUser = await require('../models/User').findById(tenant.userId);
  
  if (landlord && landlord.email) {
    try {
      await sendLandlordNotification({
        landlordEmail: landlord.email,
        landlordName: `${landlord.firstName} ${landlord.lastName}`,
        tenantName: `${tenantUser.firstName} ${tenantUser.lastName}`,
        amount: payment.amount,
        propertyName: payment.propertyId?.name || 'Property',
        type: 'payment_received'
      });
    } catch (emailError) {
      console.error('Failed to send landlord notification:', emailError);
    }
  }
}

    const populatedPayment = await Payment.findById(payment._id)
      .populate('propertyId', 'name address');

    res.status(200).json({
      success: paymentResult.success,
      payment: populatedPayment,
      message: paymentResult.message
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findOne({ _id: req.params.id, landlordId: req.userId })
      .populate('tenantId')
      .populate({
        path: 'tenantId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email phone'
        }
      })
      .populate('propertyId', 'name address');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.status(200).json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPaymentStats = async (req, res) => {
  try {
    await checkOverduePayments();

    const payments = await Payment.find({ landlordId: req.userId });

    const totalRevenue = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount + p.penaltyAmount, 0);

    const pendingPayments = payments.filter(p => p.status === 'pending').length;
    const completedPayments = payments.filter(p => p.status === 'completed').length;
    const overduePayments = payments.filter(p => p.status === 'overdue').length;

    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyRevenue = payments
      .filter(p => p.status === 'completed' && p.paidDate && p.paidDate.toISOString().slice(0, 7) === currentMonth)
      .reduce((sum, p) => sum + p.amount + p.penaltyAmount, 0);

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        monthlyRevenue,
        pendingPayments,
        completedPayments,
        overduePayments,
        totalPayments: payments.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPayments,
  getTenantPayments,
  processPayment,
  getPaymentById,
  getPaymentStats
};