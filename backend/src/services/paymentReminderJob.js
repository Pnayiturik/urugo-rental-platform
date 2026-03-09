const Payment = require('../models/Payment');
const Tenant = require('../models/Tenant');
const User = require('../models/User');
const { sendPaymentReminder, sendLandlordNotification } = require('./emailService');
const { applyLatePenalty } = require('./paymentService');

const checkAndSendReminders = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);

    const oneDayAgo = new Date(today);
    oneDayAgo.setDate(today.getDate() - 1);

    const pendingPayments = await Payment.find({
      status: { $in: ['pending', 'overdue'] }
    })
      .populate('tenantId', 'firstName lastName email')
      .populate('propertyId', 'name')
      .populate('landlordId', 'firstName lastName email');

    for (const payment of pendingPayments) {
      if (!payment.tenantId) continue;

      const dueDate = new Date(payment.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

      const tenant = payment.tenantId;   // already a User document
      const landlord = payment.landlordId;

      if (daysUntilDue === 3) {
        console.log(`📧 Sending 3-day reminder to ${tenant.email}`);
        await sendPaymentReminder({
          tenantEmail: tenant.email,
          tenantName: `${tenant.firstName} ${tenant.lastName}`,
          amount: payment.amount,
          dueDate: payment.dueDate,
          propertyName: payment.propertyId?.name || 'Your Property',
          daysUntilDue: 3
        });
      }

      if (daysUntilDue === 0) {
        console.log(`📧 Sending due-today reminder to ${tenant.email}`);
        await sendPaymentReminder({
          tenantEmail: tenant.email,
          tenantName: `${tenant.firstName} ${tenant.lastName}`,
          amount: payment.amount,
          dueDate: payment.dueDate,
          propertyName: payment.propertyId?.name || 'Your Property',
          daysUntilDue: 0
        });
      }

      if (daysUntilDue === -1 && payment.status !== 'overdue') {
        console.log(`🚨 Payment ${payment._id} is now overdue`);
        
        payment.status = 'overdue';
        await payment.save();

        await applyLatePenalty(payment._id, 0.05);

        await sendPaymentReminder({
          tenantEmail: tenant.email,
          tenantName: `${tenant.firstName} ${tenant.lastName}`,
          amount: payment.amount + payment.penaltyAmount,
          dueDate: payment.dueDate,
          propertyName: payment.propertyId?.name || 'Your Property',
          daysUntilDue: -1
        });

        if (landlord && landlord.email) {
          await sendLandlordNotification({
            landlordEmail: landlord.email,
            landlordName: `${landlord.firstName} ${landlord.lastName}`,
            tenantName: `${tenant.firstName} ${tenant.lastName}`,
            amount: payment.amount,
            propertyName: payment.propertyId?.name || 'Property',
            type: 'payment_overdue'
          });
        }
      }
    }

    console.log('✅ Payment reminder job completed');
  } catch (error) {
    console.error('❌ Payment reminder job failed:', error);
  }
};

const startReminderScheduler = () => {
  const TWELVE_HOURS = 12 * 60 * 60 * 1000;
  
  checkAndSendReminders();
  
  setInterval(checkAndSendReminders, TWELVE_HOURS);
  
  console.log('🕐 Payment reminder scheduler started (runs every 12 hours)');
};

module.exports = { checkAndSendReminders, startReminderScheduler };