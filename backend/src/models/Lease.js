const mongoose = require('mongoose');

const leaseSchema = new mongoose.Schema({
  landlordId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  tenantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  propertyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Property', 
    required: true 
  },
  unitNumber: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  rentAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['active', 'expired', 'terminated', 'Draft', 'Active'], 
    default: 'active' 
  },
  terms: { 
    type: String, 
    default: "Standard Urugo Rental Agreement: Tenant agrees to pay rent on time via MoMo/Airtel." 
  }
}, { timestamps: true });

module.exports = mongoose.model('Lease', leaseSchema);