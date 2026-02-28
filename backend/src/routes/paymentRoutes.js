const express = require('express');
const router = express.Router();
const { 
  getPayments, 
  getTenantPayments,
  processPayment,
  getPaymentStats,
  verifyPaystackPayment,
  createStripeCheckoutSession,
  stripeWebhook,
  verifyStripePayment
} = require('../controllers/paymentController');
const { protect, landlordOnly, tenantOnly } = require('../middleware/authMiddleware');

// Landlord payment routes
router.get('/landlord', protect, landlordOnly, getPayments);
router.get('/landlord/stats', protect, landlordOnly, getPaymentStats);

// Tenant payment routes
router.get('/tenant', protect, tenantOnly, getTenantPayments);

// Legacy routes (deprecated - kept for backwards compatibility)
router.post('/tenant/pay', protect, tenantOnly, processPayment); // Deprecated: Use Stripe instead
router.post('/verify-paystack', protect, tenantOnly, verifyPaystackPayment); // Deprecated: Use Stripe instead

// ============================================
// ACTIVE PAYMENT METHOD: STRIPE
// ============================================
router.post('/create-stripe-session', protect, tenantOnly, createStripeCheckoutSession);
router.post('/stripe-webhook', express.raw({type: 'application/json'}), stripeWebhook);
router.get('/verify-stripe/:sessionId', protect, tenantOnly, verifyStripePayment);

module.exports = router;