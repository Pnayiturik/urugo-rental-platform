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

router.get('/', protect, must(paymentController.getPayments, 'getPayments'));
router.post('/', protect, must(paymentController.createPayment, 'createPayment'));
router.get('/:id', protect, must(paymentController.getPaymentById, 'getPaymentById'));

module.exports = router;