const express = require('express');
const router = express.Router();
const { 
  getPayments, 
  getTenantPayments,
  processPayment,
  getPaymentStats
} = require('../controllers/paymentController');
const { protect, landlordOnly, tenantOnly } = require('../middleware/authMiddleware');

router.get('/landlord', protect, landlordOnly, getPayments);
router.get('/landlord/stats', protect, landlordOnly, getPaymentStats);

router.get('/tenant', protect, tenantOnly, getTenantPayments);
router.post('/tenant/pay', protect, tenantOnly, processPayment);

module.exports = router;