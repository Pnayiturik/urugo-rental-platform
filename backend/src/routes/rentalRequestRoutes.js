const express = require('express');
const router = express.Router();
const { protect, landlordOnly } = require('../middleware/authMiddleware');
const { sendRequest, getLandlordRequests, assignAndCreateAccount, getTenantRequests } = require('../controllers/rentalRequestController');
router.get('/tenant', protect, getTenantRequests);

router.post('/public', sendRequest); // no token required
router.get('/landlord/pending', protect, landlordOnly, getLandlordRequests);
router.post('/:id/assign', protect, landlordOnly, assignAndCreateAccount);

module.exports = router;