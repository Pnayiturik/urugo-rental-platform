const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const tenantController = require('../controllers/tenantController');

router.get('/', protect, tenantController.getTenants);
router.post('/', protect, tenantController.createTenant);
router.get('/:id', protect, tenantController.getTenantById);
router.put('/:id', protect, tenantController.updateTenant);
router.delete('/:id', protect, tenantController.deleteTenant);

module.exports = router;