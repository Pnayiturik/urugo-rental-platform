const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  unitNumber: {
    type: String,
    required: true
  },
  bedrooms: {
    type: Number,
    required: true
  },
  bathrooms: {
    type: Number,
    required: true
  },
  squareFeet: {
    type: Number
  },
  rent: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['vacant', 'occupied', 'maintenance'],
    default: 'vacant'
  }
});

const propertySchema = new mongoose.Schema({
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String },
    country: { type: String, default: 'Rwanda' }
  },
  propertyType: {
    type: String,
    enum: ['apartment', 'house', 'commercial'],
    required: true
  },
  units: [unitSchema],
  images: {
    type: [String],
    default: []
  },

  cautionFee: { type: Number, default: 0, min: 0 },
  furnishingStatus: {
    type: String,
    enum: ['furnished', 'semi-furnished', 'unfurnished'],
    default: 'unfurnished'
  },
  squareFootage: { type: Number, min: 0 },
  yearBuilt: { type: Number, min: 1800, max: 2100 },
  utilitiesIncluded: {
    type: [String],
    default: []
  },

  paymentTerms: {
    type: String,
    enum: ['full', 'installments', 'advanced'],
    default: 'full'
  },
  rules: [{ type: String, trim: true }],
  locationDetails: {
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    },
    landmarks: [{ type: String, trim: true }],
    proximityNote: { type: String, trim: true }
  },
  minStay: { type: Number, min: 1, default: 30 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Property', propertySchema);