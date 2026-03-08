const mongoose = require('mongoose');

const tenantIncidentSchema = new mongoose.Schema(
  {
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    type: { type: String, enum: ['debt', 'misconduct', 'damage', 'legal'], required: true },
    severity: { type: String, enum: ['minor', 'serious'], default: 'minor' },
    amount: { type: Number, default: 0 },
    description: { type: String, required: true },
    resolved: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('TenantIncident', tenantIncidentSchema);