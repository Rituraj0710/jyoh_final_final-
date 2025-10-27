import AuditLog from '../models/AuditLog.js';
import logger from '../config/logger.js';

class AuditService {
  // Log form creation
  static async logFormCreate(userId, userRole, formData, ipAddress, userAgent) {
    try {
      await AuditLog.logAction({
        userId,
        userRole,
        action: 'form_create',
        resource: 'forms_data',
        resourceId: formData._id,
        resourceModel: 'FormsData',
        details: {
          formTitle: formData.formTitle,
          serviceType: formData.serviceType,
          status: formData.status,
          formData: formData.formData
        },
        ipAddress,
        userAgent,
        success: true
      });
    } catch (error) {
      logger.error('Failed to log form creation:', error);
    }
  }

  // Log form update
  static async logFormUpdate(userId, userRole, formId, oldData, newData, ipAddress, userAgent) {
    try {
      const changes = this.getChanges(oldData, newData);
      
      await AuditLog.logAction({
        userId,
        userRole,
        action: 'form_update',
        resource: 'forms_data',
        resourceId: formId,
        resourceModel: 'FormsData',
        details: {
          changes,
          oldStatus: oldData.status,
          newStatus: newData.status,
          formTitle: newData.formTitle,
          serviceType: newData.serviceType
        },
        ipAddress,
        userAgent,
        success: true
      });
    } catch (error) {
      logger.error('Failed to log form update:', error);
    }
  }

  // Log form submission
  static async logFormSubmit(userId, userRole, formId, formData, ipAddress, userAgent) {
    try {
      await AuditLog.logAction({
        userId,
        userRole,
        action: 'form_submit',
        resource: 'forms_data',
        resourceId: formId,
        resourceModel: 'FormsData',
        details: {
          formTitle: formData.formTitle,
          serviceType: formData.serviceType,
          status: formData.status,
          submittedData: formData.formData
        },
        ipAddress,
        userAgent,
        success: true
      });
    } catch (error) {
      logger.error('Failed to log form submission:', error);
    }
  }

  // Log form assignment
  static async logFormAssign(userId, userRole, formId, assignedToStaff, formData, ipAddress, userAgent) {
    try {
      await AuditLog.logAction({
        userId,
        userRole,
        action: 'form_assign',
        resource: 'forms_data',
        resourceId: formId,
        resourceModel: 'FormsData',
        details: {
          formTitle: formData.formTitle,
          serviceType: formData.serviceType,
          assignedToStaff: {
            id: assignedToStaff._id,
            name: assignedToStaff.name,
            email: assignedToStaff.email,
            role: assignedToStaff.role
          },
          previousStatus: formData.status,
          newStatus: 'submitted'
        },
        ipAddress,
        userAgent,
        success: true
      });
    } catch (error) {
      logger.error('Failed to log form assignment:', error);
    }
  }

  // Log form verification
  static async logFormVerify(userId, userRole, formId, formData, notes, ipAddress, userAgent) {
    try {
      await AuditLog.logAction({
        userId,
        userRole,
        action: 'form_verify',
        resource: 'forms_data',
        resourceId: formId,
        resourceModel: 'FormsData',
        details: {
          formTitle: formData.formTitle,
          serviceType: formData.serviceType,
          previousStatus: formData.status,
          newStatus: 'verified',
          verificationNotes: notes,
          verifiedAt: new Date()
        },
        ipAddress,
        userAgent,
        success: true
      });
    } catch (error) {
      logger.error('Failed to log form verification:', error);
    }
  }

  // Log form approval
  static async logFormApprove(userId, userRole, formId, formData, approved, reason, ipAddress, userAgent) {
    try {
      await AuditLog.logAction({
        userId,
        userRole,
        action: approved ? 'form_approve' : 'form_reject',
        resource: 'forms_data',
        resourceId: formId,
        resourceModel: 'FormsData',
        details: {
          formTitle: formData.formTitle,
          serviceType: formData.serviceType,
          previousStatus: formData.status,
          newStatus: approved ? 'completed' : 'rejected',
          reason: reason,
          approvedAt: new Date()
        },
        ipAddress,
        userAgent,
        success: true
      });
    } catch (error) {
      logger.error('Failed to log form approval/rejection:', error);
    }
  }

  // Log form status change
  static async logFormStatusChange(userId, userRole, formId, oldStatus, newStatus, reason, ipAddress, userAgent) {
    try {
      await AuditLog.logAction({
        userId,
        userRole,
        action: 'form_status_change',
        resource: 'forms_data',
        resourceId: formId,
        resourceModel: 'FormsData',
        details: {
          previousStatus: oldStatus,
          newStatus: newStatus,
          reason: reason,
          changedAt: new Date()
        },
        ipAddress,
        userAgent,
        success: true
      });
    } catch (error) {
      logger.error('Failed to log form status change:', error);
    }
  }

  // Log form data update
  static async logFormDataUpdate(userId, userRole, formId, fieldChanges, ipAddress, userAgent) {
    try {
      await AuditLog.logAction({
        userId,
        userRole,
        action: 'form_data_update',
        resource: 'forms_data',
        resourceId: formId,
        resourceModel: 'FormsData',
        details: {
          fieldChanges,
          updatedAt: new Date()
        },
        ipAddress,
        userAgent,
        success: true
      });
    } catch (error) {
      logger.error('Failed to log form data update:', error);
    }
  }

  // Log form view
  static async logFormView(userId, userRole, formId, formData, ipAddress, userAgent) {
    try {
      await AuditLog.logAction({
        userId,
        userRole,
        action: 'form_view',
        resource: 'forms_data',
        resourceId: formId,
        resourceModel: 'FormsData',
        details: {
          formTitle: formData.formTitle,
          serviceType: formData.serviceType,
          status: formData.status
        },
        ipAddress,
        userAgent,
        success: true
      });
    } catch (error) {
      logger.error('Failed to log form view:', error);
    }
  }

  // Log form edit
  static async logFormEdit(userId, userRole, formId, formData, ipAddress, userAgent) {
    try {
      await AuditLog.logAction({
        userId,
        userRole,
        action: 'form_edit',
        resource: 'forms_data',
        resourceId: formId,
        resourceModel: 'FormsData',
        details: {
          formTitle: formData.formTitle,
          serviceType: formData.serviceType,
          status: formData.status,
          editedFields: Object.keys(formData.formData || {})
        },
        ipAddress,
        userAgent,
        success: true
      });
    } catch (error) {
      logger.error('Failed to log form edit:', error);
    }
  }

  // Log unauthorized access attempt
  static async logUnauthorizedAccess(userId, userRole, action, resource, resourceId, details, ipAddress, userAgent) {
    try {
      await AuditLog.logAction({
        userId,
        userRole,
        action: `unauthorized_${action}`,
        resource: resource,
        resourceId: resourceId,
        resourceModel: resource === 'forms_data' ? 'FormsData' : 'Form',
        details: {
          attemptedAction: action,
          ...details
        },
        ipAddress,
        userAgent,
        success: false,
        errorMessage: 'Insufficient permissions'
      });
    } catch (error) {
      logger.error('Failed to log unauthorized access:', error);
    }
  }

  // Get changes between old and new data
  static getChanges(oldData, newData) {
    const changes = {};
    
    // Compare form data
    if (oldData.formData && newData.formData) {
      const oldFormData = oldData.formData;
      const newFormData = newData.formData;
      
      Object.keys(newFormData).forEach(key => {
        if (oldFormData[key] !== newFormData[key]) {
          changes[key] = {
            old: oldFormData[key],
            new: newFormData[key]
          };
        }
      });
    }
    
    // Compare other fields
    const fieldsToCompare = ['formTitle', 'formDescription', 'status', 'serviceType'];
    fieldsToCompare.forEach(field => {
      if (oldData[field] !== newData[field]) {
        changes[field] = {
          old: oldData[field],
          new: newData[field]
        };
      }
    });
    
    return changes;
  }

  // Get form audit trail
  static async getFormAuditTrail(formId, limit = 100) {
    try {
      return await AuditLog.getFormChangeHistory(formId, limit);
    } catch (error) {
      logger.error('Failed to get form audit trail:', error);
      return [];
    }
  }

  // Get staff form activity
  static async getStaffFormActivity(staffId, limit = 100) {
    try {
      return await AuditLog.getStaffFormActivity(staffId, limit);
    } catch (error) {
      logger.error('Failed to get staff form activity:', error);
      return [];
    }
  }

  // Get unauthorized access attempts
  static async getUnauthorizedAttempts(limit = 100) {
    try {
      return await AuditLog.getUnauthorizedAttempts(limit);
    } catch (error) {
      logger.error('Failed to get unauthorized access attempts:', error);
      return [];
    }
  }

  // Get form workflow logs
  static async getFormWorkflowLogs(formId, limit = 30) {
    try {
      return await AuditLog.getFormWorkflowLogs(formId, limit);
    } catch (error) {
      logger.error('Failed to get form workflow logs:', error);
      return [];
    }
  }
}

export default AuditService;
