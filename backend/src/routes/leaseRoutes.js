const express = require('express');
const router = express.Router();
const { createLease, getMyLeases } = require('../controllers/leaseController');
const { protect } = require('../middleware/authMiddleware');

// Protect all lease routes
router.use(protect);

router.post('/', createLease);
router.get('/', getMyLeases);

module.exports = router;