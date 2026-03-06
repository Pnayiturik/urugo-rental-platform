const mongoose = require('mongoose');

const id16Regex = /^\d{16}$/;

const identitySchema = new mongoose.Schema({
  nationalId: {
    type: String,
    validate: {
      validator: (v) => !v || id16Regex.test(v),
      message: 'Please provide a valid 16-digit National ID'
    }
  },
  passportNumber: { type: String, trim: true }
}, { _id: false });

const leaseSchema = new mongoose.Schema({
  landlordId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  unitNumber: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  rentAmount: { type: Number, required: true },

  // keep existing field for compatibility
  paymentPlan: {
    type: String,
    enum: ['full', 'installments', 'advanced'],
    default: 'full'
  },

  // new explicit lease economics
  cautionFee: { type: Number, default: 0 },
  paymentTerms: {
    type: String,
    enum: ['full', 'installments', 'advanced'],
    default: 'full'
  },

  tenantIdentity: identitySchema,
  landlordIdentity: identitySchema,

  paymentType: {
    type: String,
    enum: ['Partial', 'Overdue', 'Full'],
    default: 'Full'
  },

  status: {
    type: String,
    enum: ['active', 'expired', 'terminated', 'Draft', 'Active'],
    default: 'active'
  },

  terms: {
    type: String,
    default: 'Standard Urugo Rental Agreement'
  }
}, { timestamps: true });

leaseSchema.pre('validate', function () {
  const tenantOk = this.tenantIdentity && (this.tenantIdentity.nationalId || this.tenantIdentity.passportNumber);
  const landlordOk = this.landlordIdentity && (this.landlordIdentity.nationalId || this.landlordIdentity.passportNumber);

  if (!tenantOk) throw new Error('Tenant identity is required (nationalId or passportNumber).');
  if (!landlordOk) throw new Error('Landlord identity is required (nationalId or passportNumber).');
});

module.exports = mongoose.model('Lease', leaseSchema);