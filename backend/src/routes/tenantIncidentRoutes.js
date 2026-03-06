const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { reportTenantIncident, getTenantIncidentSummary } = require('../controllers/tenantIncidentController');

router.post('/', protect, reportTenantIncident);
router.get('/tenant/:tenantId/summary', protect, getTenantIncidentSummary);

module.exports = router;