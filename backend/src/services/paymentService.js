const Payment = require('../models/Payment');

/**
 * Urugo Payment Service
 * Primary Payment Method: Stripe
 * All payments are processed through Stripe Checkout
 */

/**
 * Check and update overdue payments
 * Calculates 5% weekly penalty for overdue payments
 */
const checkOverduePayments = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all pending payments that are past due date
    const overduePayments = await Payment.find({
      status: 'pending',
      dueDate: { $lt: today }
    });

    for (const payment of overduePayments) {
      payment.status = 'overdue';
      
      // Calculate weeks overdue
      const dueDate = new Date(payment.dueDate);
      const diffTime = Math.abs(today - dueDate);
      const weeksOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
      
      // Apply 5% penalty per week
      const penaltyRate = 0.05;
      payment.penaltyAmount = Math.round(payment.amount * penaltyRate * weeksOverdue);
      
      await payment.save();
      console.log(`🚨 Payment ${payment._id} marked overdue. Penalty: ${payment.penaltyAmount} RWF`);
    }

    return overduePayments.length;
  } catch (error) {
    console.error('❌ Error checking overdue payments:', error);
    return 0;
  }
};

/**
 * Apply late penalty to a specific payment
 * @param {String} paymentId - Payment ID
 * @param {Number} penaltyRate - Penalty rate (e.g., 0.05 for 5%)
 */
const applyLatePenalty = async (paymentId, penaltyRate = 0.05) => {
  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) return null;

    const dueDate = new Date(payment.dueDate);
    const today = new Date();
    const diffTime = Math.abs(today - dueDate);
    const weeksOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));

    // Calculate penalty: 5% per week on original amount
    payment.penaltyAmount = Math.round(payment.amount * penaltyRate * weeksOverdue);
    await payment.save();

    console.log(`💰 Applied ${payment.penaltyAmount} RWF penalty to payment ${paymentId}`);
    return payment;
  } catch (error) {
    console.error('❌ Error applying late penalty:', error);
    return null;
  }
};

/**
 * Generate monthly payment records for active leases
 * This would be called by a cron job at the start of each month
 */
const generateMonthlyPayments = async () => {
  try {
    const Lease = require('../models/Lease');
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Find all active leases
    const activeLeases = await Lease.find({
      status: 'active',
      startDate: { $lte: today },
      endDate: { $gte: today }
    });

    let created = 0;
    for (const lease of activeLeases) {
      // Check if payment already exists for this month
      const existing = await Payment.findOne({
        tenantId: lease.tenantId,
        propertyId: lease.propertyId,
        dueDate: {
          $gte: firstDayOfMonth,
          $lt: new Date(today.getFullYear(), today.getMonth() + 1, 1)
        }
      });

      if (!existing) {
        // Create payment record
        const dueDate = new Date(today.getFullYear(), today.getMonth(), lease.rentDueDay || 1);
        
        await Payment.create({
          tenantId: lease.tenantId,
          landlordId: lease.landlordId,
          propertyId: lease.propertyId,
          amount: lease.rentAmount,
          dueDate: dueDate,
          status: 'pending',
          paymentFor: 'rent',
          paymentMonth: today.toLocaleString('default', { month: 'long', year: 'numeric' })
        });

        created++;
        console.log(`✅ Created payment for lease ${lease._id}`);
      }
    }

    console.log(`💳 Generated ${created} new monthly payments`);
    return created;
  } catch (error) {
    console.error('❌ Error generating monthly payments:', error);
    return 0;
  }
};

module.exports = {
  checkOverduePayments,
  applyLatePenalty,
  generateMonthlyPayments
};