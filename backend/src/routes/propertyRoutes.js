const express = require('express');
const router = express.Router();
const { getProperties, createProperty, getPropertyById, updateProperty, deleteProperty } = require('../controllers/propertyController');
const { protect, landlordOnly } = require('../middleware/authMiddleware');

router.get('/', protect, landlordOnly, getProperties);
router.post('/', protect, landlordOnly, createProperty);
router.get('/:id', protect, landlordOnly, getPropertyById);
router.put('/:id', protect, landlordOnly, updateProperty);
router.delete('/:id', protect, landlordOnly, deleteProperty);

module.exports = router;