const mongoose = require('mongoose');

const leaseSchema = new mongoose.Schema({
  landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  monthlyRent: { type: Number, required: true },
  currency: { type: String, default: 'RWF' },
  
  // For the "Document Management" aspect
  digitalSignatureRef: String, 
  status: { type: String, enum: ['Draft', 'Active', 'Expired', 'Terminated'], default: 'Active' },
  
  // Terms and Conditions (Predefined Templates)
  terms: { type: String, required: true }, 
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lease', leaseSchema);