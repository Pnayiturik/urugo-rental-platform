const express = require('express');
const router = express.Router();
const { protect, landlordOnly } = require('../middleware/authMiddleware');
const { assignTenantToUnit } = require('../controllers/landlordController');

router.post('/assign-tenant', protect, landlordOnly, assignTenantToUnit);

module.exports = router;