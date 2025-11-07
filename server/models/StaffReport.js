import mongoose from 'mongoose';

const staffReportSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: 'FormsData',
    default: null
  },
  formType: {
    type: String,
    required: true,
    enum: ['sale-deed', 'will-deed', 'trust-deed', 'property-registration', 'power-of-attorney', 'adoption-deed', 'property-sale-certificate', 'work-report', 'cross-verification-report', 'final-report']
  },
  verificationStatus: {
    type: String,
    required: true,
    enum: ['pending', 'verified', 'rejected', 'needs_revision', 'submitted'],
    default: 'pending'
  },
  editedData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  originalData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  changes: [{
    field: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    changeType: {
      type: String,
      enum: ['added', 'modified', 'removed']
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  remarks: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  stampCalculation: {
    calculatedAmount: {
      type: Number,
      default: 0
    },
    calculationMethod: String,
    applicableRules: [String],
    notes: String
  },
  verificationNotes: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  attachments: [{
    fileName: String,
    filePath: String,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isSubmitted: {
    type: Boolean,
    default: false
  },
  submittedAt: {
    type: Date,
    default: null
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  reviewNotes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
staffReportSchema.index({ staffId: 1, isSubmitted: 1 });
staffReportSchema.index({ formId: 1 });
staffReportSchema.index({ verificationStatus: 1 });
staffReportSchema.index({ formType: 1 });
staffReportSchema.index({ submittedAt: -1 });
staffReportSchema.index({ createdAt: -1 });

// Virtual for form details
staffReportSchema.virtual('formDetails', {
  ref: 'FormsData',
  localField: 'formId',
  foreignField: '_id',
  justOne: true
});

// Virtual for staff details
staffReportSchema.virtual('staffDetails', {
  ref: 'User',
  localField: 'staffId',
  foreignField: '_id',
  justOne: true
});

// Static method to get reports by staff
staffReportSchema.statics.getReportsByStaff = function(staffId, filters = {}) {
  const query = { staffId };
  
  if (filters.verificationStatus) query.verificationStatus = filters.verificationStatus;
  if (filters.formType) query.formType = filters.formType;
  if (filters.isSubmitted !== undefined) query.isSubmitted = filters.isSubmitted;
  if (filters.dateFrom || filters.dateTo) {
    query.createdAt = {};
    if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
  }
  
  return this.find(query)
    .populate('formId', 'formTitle formDescription status fields')
    .populate('staffId', 'name email role department')
    .populate('reviewedBy', 'name email role')
    .sort({ createdAt: -1 })
    .limit(filters.limit || 50)
    .skip(filters.skip || 0);
};

// Static method to get all reports for admin
staffReportSchema.statics.getAllReports = function(filters = {}) {
  const query = {};
  
  if (filters.staffId) query.staffId = filters.staffId;
  if (filters.formType) query.formType = filters.formType;
  if (filters.verificationStatus) query.verificationStatus = filters.verificationStatus;
  if (filters.isSubmitted !== undefined) query.isSubmitted = filters.isSubmitted;
  if (filters.dateFrom || filters.dateTo) {
    query.createdAt = {};
    if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
  }
  
  const reports = this.find(query)
    .populate('staffId', 'name email role department employeeId')
    .populate('reviewedBy', 'name email role')
    .sort({ createdAt: -1 })
    .limit(filters.limit || 100)
    .skip(filters.skip || 0);
  
  // Conditionally populate formId only if it exists
  // Note: Mongoose will skip populate if formId is null
  return reports.populate({
    path: 'formId',
    select: 'formTitle formDescription status fields userId',
    options: { strictPopulate: false }
  });
};

// Instance method to calculate changes
staffReportSchema.methods.calculateChanges = function(originalData, editedData) {
  const changes = [];
  
  // Compare each field
  for (const key in editedData) {
    if (originalData[key] !== editedData[key]) {
      changes.push({
        field: key,
        oldValue: originalData[key],
        newValue: editedData[key],
        changeType: originalData[key] === undefined ? 'added' : 
                   editedData[key] === undefined ? 'removed' : 'modified',
        timestamp: new Date()
      });
    }
  }
  
  // Check for removed fields
  for (const key in originalData) {
    if (editedData[key] === undefined && originalData[key] !== undefined) {
      changes.push({
        field: key,
        oldValue: originalData[key],
        newValue: undefined,
        changeType: 'removed',
        timestamp: new Date()
      });
    }
  }
  
  this.changes = changes;
  return changes;
};

export default mongoose.model('StaffReport', staffReportSchema);

