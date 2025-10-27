import FormsData from '../models/FormsData.js';
import AuditLog from '../models/AuditLog.js';

// Middleware to check if user can access forms data
export const canAccessFormsData = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Define role-based access levels
    const roleAccess = {
      'admin': {
        canViewAll: true,
        canEditAll: true,
        canAssign: true,
        canApprove: true,
        canReject: true,
        canVerify: true
      },
      'user1': {
        canViewAll: false,
        canEditAll: false,
        canAssign: false,
        canApprove: false,
        canReject: false,
        canVerify: false,
        canEditOwn: true,
        canSubmitOwn: true,
        allowedServiceTypes: ['sale-deed', 'will-deed', 'trust-deed', 'property-registration', 'power-of-attorney', 'adoption-deed']
      },
      'user2': {
        canViewAll: false,
        canEditAll: false,
        canAssign: false,
        canApprove: false,
        canReject: false,
        canVerify: false,
        canEditOwn: true,
        canSubmitOwn: true,
        allowedServiceTypes: ['sale-deed', 'will-deed', 'trust-deed', 'property-registration', 'power-of-attorney', 'adoption-deed']
      },
      'staff1': {
        canViewAll: false,
        canEditAll: false,
        canAssign: false,
        canApprove: false,
        canReject: false,
        canVerify: true,
        canEditAssigned: true,
        allowedServiceTypes: ['property_registration', 'property_transfer']
      },
      'staff2': {
        canViewAll: false,
        canEditAll: false,
        canAssign: false,
        canApprove: false,
        canReject: false,
        canVerify: true,
        canEditAssigned: true,
        allowedServiceTypes: ['property_registration', 'property_sale', 'property_transfer', 'will_deed', 'trust_deed', 'property_mortgage', 'property_lease']
      },
      'staff3': {
        canViewAll: false,
        canEditAll: false,
        canAssign: false,
        canApprove: false,
        canReject: false,
        canVerify: true,
        canEditAssigned: true,
        allowedServiceTypes: ['property_registration', 'property_sale', 'property_transfer', 'will_deed', 'trust_deed', 'property_mortgage', 'property_lease', 'property_gift']
      },
      'staff4': {
        canViewAll: true,
        canEditAll: true,
        canAssign: false,
        canApprove: true,
        canReject: true,
        canVerify: true,
        canEditAssigned: true,
        allowedServiceTypes: ['property_registration', 'property_sale', 'property_transfer', 'will_deed', 'trust_deed', 'property_mortgage', 'property_lease', 'property_gift', 'property_inheritance', 'property_partition']
      },
      'staff5': {
        canViewAll: true,
        canEditAll: false,
        canAssign: false,
        canApprove: true,
        canReject: true,
        canVerify: true,
        canEditAssigned: false,
        canLock: true,
        allowedServiceTypes: ['property_registration', 'property_sale', 'property_transfer', 'will_deed', 'trust_deed', 'property_mortgage', 'property_lease', 'property_gift', 'property_inheritance', 'property_partition', 'property_survey', 'property_valuation']
      }
    };

    const userAccess = roleAccess[user.role];
    if (!userAccess) {
      return res.status(403).json({
        success: false,
        message: 'Invalid user role'
      });
    }

    // Add access information to request
    req.formsAccess = userAccess;
    next();
  } catch (error) {
    console.error('Forms RBAC middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Middleware to check if user can view specific form
export const canViewForm = async (req, res, next) => {
  try {
    const user = req.user;
    const formId = req.params.id;
    const formsAccess = req.formsAccess;

    if (!formId) {
      return res.status(400).json({
        success: false,
        message: 'Form ID is required'
      });
    }

    const form = await FormsData.findById(formId);
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    let canView = false;

    // Admin can view all forms
    if (formsAccess.canViewAll) {
      canView = true;
    }
    // Staff can view forms assigned to them
    else if (form.assignedTo && form.assignedTo.toString() === user._id.toString()) {
      canView = true;
    }
    // Staff can view forms in their service type
    else if (formsAccess.allowedServiceTypes && formsAccess.allowedServiceTypes.includes(form.serviceType)) {
      canView = true;
    }

    if (!canView) {
      // Log unauthorized access attempt
      await AuditLog.logAction({
        userId: user._id,
        userRole: user.role,
        action: 'unauthorized_form_view',
        resource: 'forms_data',
        resourceId: formId,
        details: {
          formServiceType: form.serviceType,
          formStatus: form.status,
          assignedTo: form.assignedTo
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: false,
        errorMessage: 'Insufficient permissions to view this form'
      });

      return res.status(403).json({
        success: false,
        message: 'Access denied. You cannot view this form.'
      });
    }

    // Add form to request object
    req.form = form;
    next();
  } catch (error) {
    console.error('Form view middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Middleware to check if user can edit specific form
export const canEditForm = async (req, res, next) => {
  try {
    const user = req.user;
    const form = req.form;
    const formsAccess = req.formsAccess;

    if (!form) {
      return res.status(400).json({
        success: false,
        message: 'Form not found in request'
      });
    }

    let canEdit = false;

    // Admin can edit all forms
    if (formsAccess.canEditAll) {
      canEdit = true;
    }
    // Staff can edit forms assigned to them
    else if (formsAccess.canEditAssigned && form.assignedTo && form.assignedTo.toString() === user._id.toString()) {
      canEdit = true;
    }
    // Staff can edit forms in their service type if not assigned to someone else
    else if (formsAccess.allowedServiceTypes && 
             formsAccess.allowedServiceTypes.includes(form.serviceType) && 
             (!form.assignedTo || form.assignedTo.toString() === user._id.toString())) {
      canEdit = true;
    }

    // Check if form is in editable status
    if (canEdit && !['draft', 'submitted', 'verified'].includes(form.status)) {
      canEdit = false;
    }

    if (!canEdit) {
      // Log unauthorized edit attempt
      await AuditLog.logAction({
        userId: user._id,
        userRole: user.role,
        action: 'unauthorized_form_edit',
        resource: 'forms_data',
        resourceId: form._id,
        details: {
          formServiceType: form.serviceType,
          formStatus: form.status,
          assignedTo: form.assignedTo
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: false,
        errorMessage: 'Insufficient permissions to edit this form'
      });

      return res.status(403).json({
        success: false,
        message: 'Access denied. You cannot edit this form.'
      });
    }

    next();
  } catch (error) {
    console.error('Form edit middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Middleware to check if user can verify specific form
export const canVerifyForm = async (req, res, next) => {
  try {
    const user = req.user;
    const form = req.form;
    const formsAccess = req.formsAccess;

    if (!form) {
      return res.status(400).json({
        success: false,
        message: 'Form not found in request'
      });
    }

    let canVerify = false;

    // Check if user can verify forms
    if (formsAccess.canVerify) {
      // Admin can verify any form
      if (formsAccess.canViewAll) {
        canVerify = true;
      }
      // Staff can verify forms assigned to them
      else if (form.assignedTo && form.assignedTo.toString() === user._id.toString()) {
        canVerify = true;
      }
      // Staff can verify forms in their service type
      else if (formsAccess.allowedServiceTypes && formsAccess.allowedServiceTypes.includes(form.serviceType)) {
        canVerify = true;
      }
    }

    // Check if form is in verifiable status
    if (canVerify && form.status !== 'submitted') {
      canVerify = false;
    }

    if (!canVerify) {
      // Log unauthorized verify attempt
      await AuditLog.logAction({
        userId: user._id,
        userRole: user.role,
        action: 'unauthorized_form_verify',
        resource: 'forms_data',
        resourceId: form._id,
        details: {
          formServiceType: form.serviceType,
          formStatus: form.status,
          assignedTo: form.assignedTo
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: false,
        errorMessage: 'Insufficient permissions to verify this form'
      });

      return res.status(403).json({
        success: false,
        message: 'Access denied. You cannot verify this form.'
      });
    }

    next();
  } catch (error) {
    console.error('Form verify middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Middleware to check if user can approve/reject specific form
export const canApproveForm = async (req, res, next) => {
  try {
    const user = req.user;
    const form = req.form;
    const formsAccess = req.formsAccess;

    if (!form) {
      return res.status(400).json({
        success: false,
        message: 'Form not found in request'
      });
    }

    let canApprove = false;

    // Check if user can approve forms
    if (formsAccess.canApprove) {
      // Admin can approve any form
      if (formsAccess.canViewAll) {
        canApprove = true;
      }
      // Staff can approve forms in their service type
      else if (formsAccess.allowedServiceTypes && formsAccess.allowedServiceTypes.includes(form.serviceType)) {
        canApprove = true;
      }
    }

    // Check if form is in approvable status
    if (canApprove && !['verified', 'submitted'].includes(form.status)) {
      canApprove = false;
    }

    if (!canApprove) {
      // Log unauthorized approve attempt
      await AuditLog.logAction({
        userId: user._id,
        userRole: user.role,
        action: 'unauthorized_form_approve',
        resource: 'forms_data',
        resourceId: form._id,
        details: {
          formServiceType: form.serviceType,
          formStatus: form.status,
          assignedTo: form.assignedTo
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: false,
        errorMessage: 'Insufficient permissions to approve this form'
      });

      return res.status(403).json({
        success: false,
        message: 'Access denied. You cannot approve this form.'
      });
    }

    next();
  } catch (error) {
    console.error('Form approve middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Middleware to check if user can assign forms
export const canAssignForm = async (req, res, next) => {
  try {
    const user = req.user;
    const formsAccess = req.formsAccess;

    if (!formsAccess.canAssign) {
      // Log unauthorized assign attempt
      await AuditLog.logAction({
        userId: user._id,
        userRole: user.role,
        action: 'unauthorized_form_assign',
        resource: 'forms_data',
        details: {
          attemptedRoute: req.originalUrl,
          method: req.method
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: false,
        errorMessage: 'Insufficient permissions to assign forms'
      });

      return res.status(403).json({
        success: false,
        message: 'Access denied. You cannot assign forms.'
      });
    }

    next();
  } catch (error) {
    console.error('Form assign middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Middleware to filter forms based on user role
export const filterFormsByRole = (req, res, next) => {
  try {
    const user = req.user;
    const formsAccess = req.formsAccess;

    // Add role-based filters to request
    req.roleFilters = {};

    // If user can't view all forms, add filters
    if (!formsAccess.canViewAll) {
      // Staff can only see forms assigned to them or in their service type
      if (formsAccess.allowedServiceTypes) {
        req.roleFilters.$or = [
          { assignedTo: user._id },
          { serviceType: { $in: formsAccess.allowedServiceTypes } }
        ];
      } else {
        req.roleFilters.assignedTo = user._id;
      }
    }

    next();
  } catch (error) {
    console.error('Form filter middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Middleware to check if user can lock forms
export const canLockForm = async (req, res, next) => {
  try {
    const user = req.user;
    const formsAccess = req.formsAccess;

    if (!formsAccess.canLock) {
      // Log unauthorized lock attempt
      await AuditLog.logAction({
        userId: user._id,
        userRole: user.role,
        action: 'unauthorized_form_lock',
        resource: 'forms_data',
        details: {
          attemptedRoute: req.originalUrl,
          method: req.method
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: false,
        errorMessage: 'Insufficient permissions to lock forms'
      });

      return res.status(403).json({
        success: false,
        message: 'Access denied. You cannot lock forms.'
      });
    }

    next();
  } catch (error) {
    console.error('Form lock middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
