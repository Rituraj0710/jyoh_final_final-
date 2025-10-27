import mongoose from 'mongoose';

const stampFormSchema = new mongoose.Schema({
  // Reference to the original form that triggered this stamp form
  linkedUserFormId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'FormsData'
  },
  // Reference to the user who submitted the original form
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  // Service type from the original form
  serviceType: {
    type: String,
    required: true,
    enum: ['sale-deed', 'will-deed', 'trust-deed', 'property-registration', 'power-of-attorney', 'adoption-deed'],
    trim: true
  },
  
  // e-Stamp Form Fields (from the image provided)
  article: {
    type: String,
    required: true,
    trim: true
  },
  property: {
    type: String,
    required: true,
    trim: true
  },
  consideredPrice: {
    type: Number,
    required: true,
    min: 0
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  amountWords: {
    type: String,
    required: true,
    trim: true
  },
  firstParty: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    }
  },
  secondParty: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    }
  },
  paidBy: {
    type: String,
    required: true,
    trim: true
  },
  purchasedBy: {
    type: String,
    required: true,
    trim: true
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['draft', 'pending', 'verified', 'approved', 'rejected', 'completed'],
    default: 'draft'
  },
  
  // Staff assignment and verification
  assignedToStaff2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  
  // Additional metadata
  formVersion: {
    type: Number,
    default: 1
  },
  
  // Staff notes and comments
  staffNotes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Rejection reason if applicable
  rejectionReason: {
    type: String,
    default: null
  },
  
  // File attachments
  attachments: [{
    fieldName: String,
    fileName: String,
    filePath: String,
    fileSize: Number,
    mimeType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // PDF generation tracking
  pdfGenerated: {
    type: Boolean,
    default: false
  },
  pdfGeneratedAt: {
    type: Date,
    default: null
  },
  pdfPath: {
    type: String,
    default: null
  },
  
  // Last activity tracking
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  lastActivityBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  collection: 'stamp_forms',
  timestamps: true
});

// Indexes for better query performance
stampFormSchema.index({ userId: 1 });
stampFormSchema.index({ serviceType: 1 });
stampFormSchema.index({ status: 1 });
stampFormSchema.index({ assignedToStaff2: 1 });
stampFormSchema.index({ linkedUserFormId: 1 });
stampFormSchema.index({ createdAt: -1 });

// Virtual for form URL
stampFormSchema.virtual('formUrl').get(function() {
  return `/staff2/stamp-forms/${this._id}`;
});

// Method to update status
stampFormSchema.methods.updateStatus = function(status, userId, notes = null) {
  this.status = status;
  this.lastActivityBy = userId;
  this.lastActivityAt = new Date();
  
  if (status === 'verified') {
    this.verifiedBy = userId;
    this.verifiedAt = new Date();
  }
  
  if (notes) {
    this.staffNotes.push({
      note: notes,
      addedBy: userId,
      addedAt: new Date()
    });
  }
  
  return this.save();
};

// Method to assign to Staff 2
stampFormSchema.methods.assignToStaff2 = function(staff2Id) {
  this.assignedToStaff2 = staff2Id;
  this.status = 'pending';
  this.lastActivityAt = new Date();
  return this.save();
};

// Static method to get forms for Staff 2
stampFormSchema.statics.getStaff2Forms = function(staff2Id, options = {}) {
  const query = { assignedToStaff2: staff2Id };
  if (options.status) query.status = options.status;
  
  return this.find(query)
    .populate('userId', 'name email')
    .populate('linkedUserFormId', 'serviceType status')
    .sort({ lastActivityAt: -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0);
};

// Static method to get forms by status
stampFormSchema.statics.getFormsByStatus = function(status, options = {}) {
  const query = { status };
  if (options.serviceType) query.serviceType = options.serviceType;
  
  return this.find(query)
    .populate('userId', 'name email')
    .populate('linkedUserFormId', 'serviceType status')
    .populate('assignedToStaff2', 'name email')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0);
};

// Static method to create from user form data
stampFormSchema.statics.createFromUserForm = async function(userFormData) {
  // Extract relevant data from user form
  const fields = userFormData.fields || {};
  
  // Map user form data to stamp form fields
  const stampData = {
    linkedUserFormId: userFormData._id,
    userId: userFormData.userId,
    serviceType: userFormData.serviceType,
    article: fields.article || '',
    property: fields.propertyAddress || fields.property || '',
    consideredPrice: fields.salePrice || fields.propertyValue || 0,
    amount: fields.stampDuty || fields.amount || 0,
    amountWords: fields.amountWords || this.numberToWords(fields.salePrice || fields.propertyValue || 0),
    firstParty: {
      name: fields.sellerName || fields.firstPartyName || '',
      address: fields.sellerAddress || fields.firstPartyAddress || ''
    },
    secondParty: {
      name: fields.buyerName || fields.secondPartyName || '',
      address: fields.buyerAddress || fields.secondPartyAddress || ''
    },
    paidBy: fields.paidBy || fields.sellerName || '',
    purchasedBy: fields.purchasedBy || fields.buyerName || '',
    status: 'draft',
    lastActivityAt: new Date()
  };
  
  return this.create(stampData);
};

// Helper method to convert numbers to words (basic implementation)
stampFormSchema.statics.numberToWords = function(num) {
  if (num === 0) return 'Zero';
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
  if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + this.numberToWords(num % 100) : '');
  if (num < 1000000) return this.numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + this.numberToWords(num % 1000) : '');
  if (num < 1000000000) return this.numberToWords(Math.floor(num / 1000000)) + ' Million' + (num % 1000000 ? ' ' + this.numberToWords(num % 1000000) : '');
  
  return 'Very Large Amount';
};

export default mongoose.model('StampForm', stampFormSchema);
