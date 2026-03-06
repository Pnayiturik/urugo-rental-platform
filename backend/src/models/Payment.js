const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  dueDate: {
    type: Date,
    required: true
  },
  paidDate: {
    type: Date
  },
  paymentMethod: {
    type: String,
    enum: ['mtn_mobile_money', 'airtel_money', 'stripe', 'card', 'mobile_money', 'flutterwave'],
    sparse: true
  },
  phoneNumber: {
    type: String
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'overdue', 'failed', 'partial'],
    default: 'pending'
  },

  paymentType: {
    type: String,
    enum: ['Partial', 'Overdue', 'Full'],
    default: 'Full'
  },

  paymentFor: {
    type: String,
    enum: ['rent', 'deposit', 'utilities', 'maintenance', 'other'],
    default: 'rent'
  },
  paymentMonth: {
    type: String
  },
  penaltyAmount: {
    type: Number,
    default: 0
  },
  receiptUrl: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);