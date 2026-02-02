const express = require('express');
const router = express.Router();
const { getTenants, createTenant, getTenantById, updateTenant, deleteTenant } = require('../controllers/tenantController');
const { protect, landlordOnly } = require('../middleware/authMiddleware');

router.get('/', protect, landlordOnly, getTenants);
router.post('/', protect, landlordOnly, createTenant);
router.get('/:id', protect, landlordOnly, getTenantById);
router.put('/:id', protect, landlordOnly, updateTenant);
router.delete('/:id', protect, landlordOnly, deleteTenant);

module.exports = router;