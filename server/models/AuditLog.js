import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  userRole: {
    type: String,
    required: true,
    enum: ['user1', 'user2', 'staff1', 'staff2', 'staff3', 'staff4', 'staff5', 'admin']
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login', 'logout', 'register',
      'form_create', 'form_update', 'form_submit', 'form_delete',
      'form_approve', 'form_reject', 'form_lock', 'form_unlock',
      'form_assign', 'form_verify', 'form_edit', 'form_view',
      'form_status_change', 'form_data_update', 'form_comment_add',
      'staff_create', 'staff_update', 'staff_deactivate', 'staff_delete', 'staff_reset_password',
      'password_change', 'profile_update',
      'Agent Approved', 'Agent Rejected',
      'unauthorized_access', 'unauthorized_form_view', 'unauthorized_form_edit',
      'unauthorized_form_verify', 'unauthorized_form_approve', 'unauthorized_form_assign',
      'unauthorized_form_lock'
    ]
  },
  resource: {
    type: String,
    enum: ['user', 'form', 'forms_data', 'staff', 'system']
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'resourceModel'
  },
  resourceModel: {
    type: String,
    enum: ['User', 'Form', 'FormsData']
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  success: {
    type: Boolean,
    default: true
  },
  errorMessage: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ userRole: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });
auditLogSchema.index({ timestamp: -1 });

// Virtual for formatted timestamp
auditLogSchema.virtual('formattedTimestamp').get(function() {
  return this.timestamp.toLocaleString();
});

// Static method to log an action
auditLogSchema.statics.logAction = async function({
  userId,
  userRole,
  action,
  resource = 'system',
  resourceId = null,
  resourceModel = null,
  details = {},
  ipAddress = null,
  userAgent = null,
  success = true,
  errorMessage = null
}) {
  try {
    const logEntry = new this({
      userId,
      userRole,
      action,
      resource,
      resourceId,
      resourceModel,
      details,
      ipAddress,
      userAgent,
      success,
      errorMessage
    });
    
    await logEntry.save();
    return logEntry;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw error to avoid breaking the main operation
  }
};

// Static method to get audit logs for a user
auditLogSchema.statics.getUserLogs = function(userId, limit = 50) {
  return this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('userId', 'name email role');
};

// Static method to get audit logs for a resource
auditLogSchema.statics.getResourceLogs = function(resource, resourceId, limit = 50) {
  return this.find({ resource, resourceId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('userId', 'name email role');
};

// Static method to get staff activity logs
auditLogSchema.statics.getStaffActivity = function(limit = 100) {
  return this.find({ 
    userRole: { $in: ['staff1', 'staff2', 'staff3', 'staff4', 'staff5', 'admin'] }
  })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('userId', 'name email role department employeeId');
};

// Static method to get form approval logs
auditLogSchema.statics.getFormApprovalLogs = function(formId, limit = 20) {
  return this.find({ 
    resource: 'form',
    resourceId: formId,
    action: { $in: ['form_approve', 'form_reject', 'form_lock', 'form_unlock'] }
  })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('userId', 'name email role department employeeId');
};

// Static method to get forms data audit logs
auditLogSchema.statics.getFormsDataLogs = function(formId, limit = 50) {
  return this.find({ 
    resource: 'forms_data',
    resourceId: formId
  })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('userId', 'name email role department employeeId');
};

// Static method to get form workflow logs
auditLogSchema.statics.getFormWorkflowLogs = function(formId, limit = 30) {
  return this.find({ 
    $or: [
      { resource: 'forms_data', resourceId: formId },
      { resource: 'form', resourceId: formId }
    ],
    action: { $in: [
      'form_create', 'form_update', 'form_submit', 'form_assign', 
      'form_verify', 'form_approve', 'form_reject', 'form_lock', 
      'form_unlock', 'form_status_change', 'form_data_update'
    ]}
  })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('userId', 'name email role department employeeId');
};

// Static method to get staff form activity logs
auditLogSchema.statics.getStaffFormActivity = function(staffId, limit = 100) {
  return this.find({ 
    userId: staffId,
    resource: 'forms_data',
    action: { $in: [
      'form_assign', 'form_verify', 'form_edit', 'form_view',
      'form_approve', 'form_reject', 'form_status_change'
    ]}
  })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('userId', 'name email role department employeeId');
};

// Static method to get form change history
auditLogSchema.statics.getFormChangeHistory = function(formId, limit = 100) {
  return this.find({ 
    $or: [
      { resource: 'forms_data', resourceId: formId },
      { resource: 'form', resourceId: formId }
    ],
    action: { $in: [
      'form_update', 'form_data_update', 'form_status_change',
      'form_assign', 'form_verify', 'form_approve', 'form_reject'
    ]}
  })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('userId', 'name email role department employeeId');
};

// Static method to get unauthorized access attempts
auditLogSchema.statics.getUnauthorizedAttempts = function(limit = 100) {
  return this.find({ 
    action: { $in: [
      'unauthorized_access', 'unauthorized_form_view', 'unauthorized_form_edit',
      'unauthorized_form_verify', 'unauthorized_form_approve', 'unauthorized_form_assign',
      'unauthorized_form_lock'
    ]}
  })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('userId', 'name email role department employeeId');
};

export default mongoose.model('AuditLog', auditLogSchema);