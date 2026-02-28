const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  name: { type: String },
  title: { type: String },
  type: { 
    type: String, 
    enum: ['Lease', 'Receipt', 'IncomeStatement', 'lease', 'receipt', 'contract', 'other'], 
    required: true 
  },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  relatedId: { type: mongoose.Schema.Types.ObjectId },
  relatedTo: { type: mongoose.Schema.Types.ObjectId },
  relatedModel: { type: String, enum: ['Lease', 'Property', 'Payment'] },
  fileUrl: { type: String },
  url: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);