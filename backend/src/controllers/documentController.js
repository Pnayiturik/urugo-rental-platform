const Document = require('../models/Document');

const getMyDocuments = async (req, res) => {
  try {
    // This finds documents where ownerId matches the logged-in user (Landlord OR Tenant)
    const documents = await Document.find({ ownerId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, documents });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyDocuments };