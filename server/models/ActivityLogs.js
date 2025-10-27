import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userType: {
    type: String,
    required: true,
    enum: ['staff', 'agent', 'admin'],
    index: true
  },
  userEmail: {
    type: String,
    required: true,
    index: true
  },
  userName: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    index: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    required: true,
    enum: ['success', 'failure', 'info', 'warning'],
    index: true
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  resourceType: {
    type: String,
    default: null,
    index: true
  },
  resourceId: {
    type: String,
    default: null
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low',
    index: true
  },
  sessionId: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
activityLogSchema.index({ timestamp: -1 });
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ userType: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });
activityLogSchema.index({ status: 1, timestamp: -1 });
activityLogSchema.index({ userEmail: 1, timestamp: -1 });

// Virtual for formatted timestamp
activityLogSchema.virtual('formattedTimestamp').get(function() {
  return this.createdAt.toLocaleString();
});

// Static method to get recent logs
activityLogSchema.statics.getRecentLogs = function(limit = 10) {
  return this.find()
    .populate('userId', 'name email role')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get logs with filters
activityLogSchema.statics.getFilteredLogs = function(filters = {}, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  // Build query
  const query = {};
  
  if (filters.userType) {
    query.userType = filters.userType;
  }
  
  if (filters.action) {
    query.action = { $regex: filters.action, $options: 'i' };
  }
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.userEmail) {
    query.userEmail = { $regex: filters.userEmail, $options: 'i' };
  }
  
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) {
      query.createdAt.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.createdAt.$lte = new Date(filters.endDate);
    }
  }
  
  if (filters.severity) {
    query.severity = filters.severity;
  }

  return this.find(query)
    .populate('userId', 'name email role department')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get log statistics
activityLogSchema.statics.getLogStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalLogs: { $sum: 1 },
        successLogs: {
          $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
        },
        failureLogs: {
          $sum: { $cond: [{ $eq: ['$status', 'failure'] }, 1, 0] }
        },
        staffLogs: {
          $sum: { $cond: [{ $eq: ['$userType', 'staff'] }, 1, 0] }
        },
        agentLogs: {
          $sum: { $cond: [{ $eq: ['$userType', 'agent'] }, 1, 0] }
        }
      }
    }
  ]);
};

// Instance method to format log for display
activityLogSchema.methods.formatForDisplay = function() {
  return {
    id: this._id,
    timestamp: this.createdAt,
    formattedTimestamp: this.formattedTimestamp,
    userType: this.userType,
    userEmail: this.userEmail,
    userName: this.userName,
    action: this.action,
    details: this.details,
    status: this.status,
    severity: this.severity,
    ipAddress: this.ipAddress,
    resourceType: this.resourceType,
    resourceId: this.resourceId
  };
};

export default mongoose.model('ActivityLogs', activityLogSchema);
