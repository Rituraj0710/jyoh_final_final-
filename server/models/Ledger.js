import mongoose from 'mongoose';

const ledgerSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    unique: true,
    required: true
  },
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FormsData',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transactionType: {
    type: String,
    enum: ['payment', 'refund', 'adjustment', 'commission'],
    default: 'payment'
  },
  amount: {
    type: Number,
    required: true
  },
  stampDuty: {
    type: Number,
    default: 0
  },
  registrationCharge: {
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'netbanking', 'wallet'],
    default: 'upi'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  paymentTransactionId: {
    type: String,
    default: null
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    maxlength: 500
  },
  // Credit/Debit indicator
  credit: {
    type: Number,
    default: 0
  },
  debit: {
    type: Number,
    default: 0
  },
  balance: {
    type: Number,
    default: 0
  },
  // Refund information
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: {
    type: String,
    maxlength: 500
  },
  refundedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
ledgerSchema.index({ userId: 1, createdAt: -1 });
ledgerSchema.index({ formId: 1 });
ledgerSchema.index({ paymentStatus: 1 });
// transactionId already has unique index from schema definition
ledgerSchema.index({ paymentDate: -1 });
ledgerSchema.index({ transactionType: 1 });
ledgerSchema.index({ createdAt: -1 });

// Virtual for transaction summary
ledgerSchema.virtual('transactionSummary').get(function() {
  return {
    totalAmount: this.amount,
    fees: this.stampDuty + this.registrationCharge,
    netAmount: this.amount - (this.stampDuty + this.registrationCharge)
  };
});

// Static method to get ledger entries by user
ledgerSchema.statics.getUserLedger = function(userId, filters = {}) {
  const query = { userId };
  
  if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus;
  if (filters.transactionType) query.transactionType = filters.transactionType;
  if (filters.dateFrom || filters.dateTo) {
    query.paymentDate = {};
    if (filters.dateFrom) query.paymentDate.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) query.paymentDate.$lte = new Date(filters.dateTo);
  }
  
  return this.find(query)
    .populate('userId', 'name email role')
    .populate('formId', 'serviceType formTitle status')
    .populate('verifiedBy', 'name email role')
    .sort({ createdAt: -1 })
    .limit(filters.limit || 100)
    .skip(filters.skip || 0);
};

// Static method to get ledger for admin
ledgerSchema.statics.getAdminLedger = function(filters = {}) {
  const query = {};
  
  if (filters.userId) query.userId = filters.userId;
  if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus;
  if (filters.transactionType) query.transactionType = filters.transactionType;
  if (filters.dateFrom || filters.dateTo) {
    query.paymentDate = {};
    if (filters.dateFrom) query.paymentDate.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) query.paymentDate.$lte = new Date(filters.dateTo);
  }
  
  return this.find(query)
    .populate('userId', 'name email role phone')
    .populate('formId', 'serviceType formTitle status')
    .populate('verifiedBy', 'name email role')
    .sort({ createdAt: -1 })
    .limit(filters.limit || 100)
    .skip(filters.skip || 0);
};

// Static method to calculate totals
ledgerSchema.statics.getTotals = async function(filters = {}) {
  const query = {};
  
  if (filters.userId) query.userId = filters.userId;
  if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus;
  if (filters.dateFrom || filters.dateTo) {
    query.paymentDate = {};
    if (filters.dateFrom) query.paymentDate.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) query.paymentDate.$lte = new Date(filters.dateTo);
  }
  
  const result = await this.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        totalStampDuty: { $sum: '$stampDuty' },
        totalRegistrationCharge: { $sum: '$registrationCharge' },
        totalCredit: { $sum: '$credit' },
        totalDebit: { $sum: '$debit' },
        count: { $sum: 1 }
      }
    }
  ]);
  
  return result[0] || {
    totalAmount: 0,
    totalStampDuty: 0,
    totalRegistrationCharge: 0,
    totalCredit: 0,
    totalDebit: 0,
    count: 0
  };
};

export default mongoose.model('Ledger', ledgerSchema);
