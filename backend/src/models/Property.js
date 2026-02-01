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
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
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
  images: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('Property', propertySchema);