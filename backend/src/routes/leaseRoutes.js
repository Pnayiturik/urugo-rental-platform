const express = require('express');
const router = express.Router();
const { createLease, getMyLeases, getTenantLease } = require('../controllers/leaseController');
const { protect, landlordOnly, tenantOnly } = require('../middleware/authMiddleware');

// Landlord routes
router.post('/', protect, landlordOnly, createLease);
router.get('/', protect, landlordOnly, getMyLeases);

// Tenant route
router.get('/my-lease', protect, tenantOnly, getTenantLease);

module.exports = router;