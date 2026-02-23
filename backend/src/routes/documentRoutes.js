const express = require('express');
const router = express.Router();
const { protect, landlordOnly } = require('../middleware/authMiddleware');
const Document = require('../models/Document');

// Get all documents for the logged-in landlord
router.get('/', protect, landlordOnly, async (req, res) => {
  try {
    const documents = await Document.find({ ownerId: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, documents });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single document by ID
router.get('/:id', protect, landlordOnly, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      ownerId: req.userId
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json({ success: true, document });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new document
router.post('/', protect, landlordOnly, async (req, res) => {
  try {
    const document = await Document.create({
      ...req.body,
      ownerId: req.userId
    });

    res.status(201).json({ success: true, document });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a document
router.put('/:id', protect, landlordOnly, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      ownerId: req.userId
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const updatedDocument = await Document.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json({ success: true, document: updatedDocument });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a document
router.delete('/:id', protect, landlordOnly, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      ownerId: req.userId
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    await Document.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
