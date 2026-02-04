const Payment = require('../models/Payment');
const Tenant = require('../models/Tenant');

const generateTransactionId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `TXN${timestamp}${random}`;
};

const processMobileMoneyPayment = async ({ phoneNumber, amount, paymentMethod }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const success = Math.random() > 0.1;
      
      if (success) {
        resolve({
          success: true,
          transactionId: generateTransactionId(),
          status: 'completed',
          message: `Payment of $${amount} via ${paymentMethod} successful`
        });
      } else {
        resolve({
          success: false,
          status: 'failed',
          message: 'Payment failed. Please try again.'
        });
      }
    }, 2000);
  });
};

const generateMonthlyPayments = async (tenant) => {
  try {
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    const existingPayment = await Payment.findOne({
      tenantId: tenant._id,
      paymentMonth: currentMonth
    });

    if (existingPayment) {
      return existingPayment;
    }

    const dueDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 5);

    const payment = await Payment.create({
      tenantId: tenant._id,
      landlordId: tenant.landlordId,
      propertyId: tenant.propertyId,
      amount: tenant.rentAmount,
      dueDate,
      paymentFor: 'rent',
      paymentMonth: currentMonth,
      status: 'pending'
    });

    return payment;
  } catch (error) {
    console.error('Error generating payment:', error);
    throw error;
  }
};

const checkOverduePayments = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overduePayments = await Payment.updateMany(
      {
        status: 'pending',
        dueDate: { $lt: today }
      },
      {
        $set: { status: 'overdue' }
      }
    );

    return overduePayments;
  } catch (error) {
    console.error('Error checking overdue payments:', error);
    throw error;
  }
};

const applyLatePenalty = async (paymentId, penaltyRate = 0.05) => {
  try {
    const payment = await Payment.findById(paymentId);
    if (!payment || payment.status !== 'overdue') {
      return null;
    }

    const penaltyAmount = payment.amount * penaltyRate;
    payment.penaltyAmount = penaltyAmount;
    await payment.save();

    return payment;
  } catch (error) {
    console.error('Error applying penalty:', error);
    throw error;
  }
};

module.exports = {
  processMobileMoneyPayment,
  generateMonthlyPayments,
  checkOverduePayments,
  applyLatePenalty,
  generateTransactionId
};