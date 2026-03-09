const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const paymentController = require('../controllers/paymentController');

const must = (fn, name) => {
  if (typeof fn !== 'function') {
    throw new Error(`paymentRoutes: missing controller handler -> ${name}`);
  }
  return fn;
};

// ── Generic / legacy ─────────────────────────────────────────────────────────
router.get('/',    protect, must(paymentController.getPayments, 'getPayments'));
router.post('/',   protect, must(paymentController.createPayment, 'createPayment'));
router.get('/:id', protect, must(paymentController.getPaymentById, 'getPaymentById'));

// ── Landlord ──────────────────────────────────────────────────────────────────
router.get('/landlord/all',   protect, must(paymentController.getPayments, 'getPayments'));
router.get('/landlord/stats', protect, must(paymentController.getPaymentStats, 'getPaymentStats'));

// ── Tenant ────────────────────────────────────────────────────────────────────
router.get('/tenant',      protect, must(paymentController.getTenantPayments, 'getTenantPayments'));
router.post('/tenant/pay', protect, must(paymentController.processPayment, 'processPayment'));

// ── Stripe ────────────────────────────────────────────────────────────────────
router.post('/create-stripe-session',  protect, must(paymentController.createStripeCheckoutSession, 'createStripeCheckoutSession'));
router.post('/create-checkout-session',protect, must(paymentController.createStripeCheckoutSession, 'createStripeCheckoutSession'));
router.get('/verify-stripe/:sessionId',protect, must(paymentController.verifyStripePayment, 'verifyStripePayment'));
// Raw body required for Stripe webhook signature verification
router.post('/stripe-webhook', express.raw({ type: 'application/json' }), must(paymentController.stripeWebhook, 'stripeWebhook'));

// ── Flutterwave ───────────────────────────────────────────────────────────────
// 1. Initialise – returns config object for the React inline modal
router.post('/flutterwave/init',    protect, must(paymentController.initFlutterwavePayment, 'initFlutterwavePayment'));
// 2. Verify – called from React after the inline callback fires
router.post('/flutterwave/verify',  protect, must(paymentController.verifyFlutterwavePayment, 'verifyFlutterwavePayment'));
// 3. Webhook – called by Flutterwave servers (no auth middleware)
router.post('/flutterwave/webhook', must(paymentController.flutterwaveWebhook, 'flutterwaveWebhook'));

module.exports = router;
