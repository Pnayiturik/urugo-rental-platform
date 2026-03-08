const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const {
  createLease,
  getMyLeases,
  getMyLease,
  getLeaseById,
  updateLeaseStatus
} = require('../controllers/leaseController');

router.post('/', protect, createLease);
router.get('/', protect, getMyLeases);
router.get('/my', protect, getMyLeases);
router.get('/my-lease', protect, getMyLease);
router.get('/:id', protect, getLeaseById);
router.put('/:id/status', protect, updateLeaseStatus);

module.exports = router;