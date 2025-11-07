import mongoose from 'mongoose';

const formSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  formType: {
    type: String,
    required: true,
    enum: ['sale-deed', 'will-deed', 'trust-deed', 'property-registration', 'power-of-attorney', 'adoption-deed', 'property-sale-certificate'],
    trim: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'locked'],
    default: 'draft'
  },
  locked: {
    type: Boolean,
    default: false
  },
  lockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lockedAt: {
    type: Date
  },
  approvals: {
    staff1: {
      approved: { type: Boolean, default: false },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      approvedAt: { type: Date },
      comments: { type: String },
      stampAmount: { type: Number },
      calculationNotes: { type: String }
    },
    staff2: {
      approved: { type: Boolean, default: false },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      approvedAt: { type: Date },
      comments: { type: String },
      trusteeValidation: {
        nameVerified: { type: Boolean, default: false },
        addressVerified: { type: Boolean, default: false },
        amountVerified: { type: Boolean, default: false },
        positionVerified: { type: Boolean, default: false }
      }
    },
    staff3: {
      approved: { type: Boolean, default: false },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      approvedAt: { type: Date },
      comments: { type: String },
      landValidation: {
        plotSizeVerified: { type: Boolean, default: false },
        mapVerified: { type: Boolean, default: false },
        documentsVerified: { type: Boolean, default: false }
      }
    },
    staff4: {
      approved: { type: Boolean, default: false },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      approvedAt: { type: Date },
      comments: { type: String },
      overallAssessment: { type: String }
    },
    staff5: {
      approved: { type: Boolean, default: false },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      approvedAt: { type: Date },
      comments: { type: String },
      finalLock: { type: Boolean, default: false }
    }
  },
  currentStage: {
    type: String,
    enum: ['draft', 'staff1', 'staff2', 'staff3', 'staff4', 'staff5', 'completed'],
    default: 'draft'
  },
  submittedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
formSchema.index({ userId: 1 });
formSchema.index({ formType: 1 });
formSchema.index({ status: 1 });
formSchema.index({ locked: 1 });
formSchema.index({ currentStage: 1 });

// Virtual for form progress
formSchema.virtual('progress').get(function() {
  const stages = ['draft', 'staff1', 'staff2', 'staff3', 'staff4', 'staff5', 'completed'];
  const currentIndex = stages.indexOf(this.currentStage);
  return Math.round((currentIndex / (stages.length - 1)) * 100);
});

// Virtual for next stage
formSchema.virtual('nextStage').get(function() {
  const stages = ['draft', 'staff1', 'staff2', 'staff3', 'staff4', 'staff5', 'completed'];
  const currentIndex = stages.indexOf(this.currentStage);
  return currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null;
});

// Instance method to check if form can be edited
formSchema.methods.canEdit = function(userRole) {
  if (this.locked) return false;
  if (this.status === 'completed') return false;
  
  // Users can edit their own forms if not submitted
  if (['user1', 'user2'].includes(userRole) && this.status === 'draft') {
    return true;
  }
  
  // Staff can edit based on current stage
  if (userRole === this.currentStage) {
    return true;
  }
  
  return false;
};

// Instance method to get approval status
formSchema.methods.getApprovalStatus = function() {
  const approvals = this.approvals;
  const status = {
    staff1: approvals.staff1.approved,
    staff2: approvals.staff2.approved,
    staff3: approvals.staff3.approved,
    staff4: approvals.staff4.approved,
    staff5: approvals.staff5.approved
  };
  
  return status;
};

// Static method to find forms by stage
formSchema.statics.findByStage = function(stage) {
  return this.find({ currentStage: stage, locked: false });
};

// Static method to find forms for user
formSchema.statics.findByUser = function(userId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

export default mongoose.model('Form', formSchema);