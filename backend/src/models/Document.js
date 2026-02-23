const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['Lease', 'Receipt', 'IncomeStatement'], required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  relatedId: { type: mongoose.Schema.Types.ObjectId }, 
  fileUrl: { type: String }, // Optional: for future PDF integration
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);