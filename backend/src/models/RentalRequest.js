const mongoose = require('mongoose');

const rentalRequestSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    tenantEmail: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    nationalId: { type: String, required: true, trim: true },

    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    requestedUnit: { type: mongoose.Schema.Types.ObjectId, required: true },

    landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'assigned', 'rejected'], default: 'pending' },

    assignedLease: { type: mongoose.Schema.Types.ObjectId, ref: 'Lease', default: null }
  },
  { timestamps: true }
);

rentalRequestSchema.index({ tenantEmail: 1, propertyId: 1, requestedUnit: 1, status: 1 });

rentalRequestSchema.index(
  { propertyId: 1, tenantEmail: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: 'pending',
      propertyId: { $exists: true },
      tenantEmail: { $exists: true, $type: 'string' }
    }
  }
);

module.exports = mongoose.model('RentalRequest', rentalRequestSchema);