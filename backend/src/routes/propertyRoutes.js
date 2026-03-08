const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const uploadModule = require('../middleware/uploadMiddleware');
const upload = uploadModule.upload || uploadModule;

const {
  getProperties,
  getPropertyById,
  getPublicProperties,
  getPublicPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadPropertyImages,
  getPropertyImage
} = require('../controllers/propertyController');

router.get('/public', getPublicProperties);
router.get('/public/:id', getPublicPropertyById);
router.get('/image/:id', getPropertyImage); // must stay BEFORE '/:id'

router.get('/my', protect, getProperties);
router.get('/', protect, getProperties);
router.get('/:id', protect, getPropertyById);

router.post('/', protect, createProperty);
router.put('/:id', protect, updateProperty);
router.delete('/:id', protect, deleteProperty);
router.post('/upload', protect, upload.array('images', 10), uploadPropertyImages);
router.post('/upload-images', protect, upload.array('images', 10), uploadPropertyImages);

module.exports = router;