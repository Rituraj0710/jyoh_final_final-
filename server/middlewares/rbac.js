// Basic filterFieldsByRole middleware (placeholder)
export const filterFieldsByRole = (req, res, next) => {
  // You can implement field filtering logic based on req.user.role here
  // For now, just pass through
  next();
};
// Basic authenticate middleware (placeholder)
export const authenticate = (req, res, next) => {
  // If user is authenticated, req.user should be set by previous middleware (e.g., passport)
  if (req.user) {
    return next();
  }
  return res.status(401).json({ status: 'failed', message: 'Authentication required' });
};
import AuditLog from '../models/AuditLog.js';

// Role-based access control middleware
export const authorize = (allowedRoles) => {
  return (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          status: 'failed',
          message: 'Authentication required'
        });
      }

      // Check if user role is in allowed roles
      if (!allowedRoles.includes(user.role)) {
        // Log unauthorized access attempt
        AuditLog.logAction({
          userId: user._id,
          userRole: user.role,
          action: 'unauthorized_access',
          resource: 'system',
          details: {
            attemptedRoute: req.originalUrl,
            method: req.method,
            allowedRoles
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          success: false,
          errorMessage: 'Insufficient permissions'
        });

        return res.status(403).json({
          status: 'failed',
          message: 'Access denied. Insufficient permissions.'
        });
      }

      next();
    } catch (error) {
      console.error('RBAC middleware error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Internal server error'
      });
    }
  };
};

// Middleware to check if user can access a specific form
export const canAccessForm = async (req, res, next) => {
  try {
    const user = req.user;
    const formId = req.params.id || req.params.formId;
    
    if (!formId) {
      return res.status(400).json({
        status: 'failed',
        message: 'Form ID is required'
      });
    }

    const Form = (await import('../models/Form.js')).default;
    const form = await Form.findById(formId);
    
    if (!form) {
      return res.status(404).json({
        status: 'failed',
        message: 'Form not found'
      });
    }

    // Check access permissions
    let hasAccess = false;

    // Form owner can always access their form
    if (form.userId.toString() === user._id.toString()) {
      hasAccess = true;
    }
    
    // Staff can access forms based on their role and current stage
    if (['staff1', 'staff2', 'staff3', 'staff4', 'staff5'].includes(user.role)) {
      if (form.currentStage === user.role || user.role === 'admin') {
        hasAccess = true;
      }
    }
    
    // Admin has access to all forms
    if (user.role === 'admin') {
      hasAccess = true;
    }

    if (!hasAccess) {
      // Log unauthorized form access attempt
      AuditLog.logAction({
        userId: user._id,
        userRole: user.role,
        action: 'unauthorized_form_access',
        resource: 'form',
        resourceId: formId,
        details: {
          formType: form.formType,
          formStatus: form.status,
          currentStage: form.currentStage
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: false,
        errorMessage: 'Insufficient permissions to access this form'
      });

      return res.status(403).json({
        status: 'failed',
        message: 'Access denied. You cannot access this form.'
      });
    }

    // Add form to request object for use in route handlers
    req.form = form;
    next();
  } catch (error) {
    console.error('Form access middleware error:', error);
    res.status(500).json({
      status: 'failed',
      message: 'Internal server error'
    });
  }
};

// Middleware to check if form can be edited
export const canEditForm = (req, res, next) => {
  try {
    const user = req.user;
    const form = req.form;

    if (!form) {
      return res.status(400).json({
        status: 'failed',
        message: 'Form not found in request'
      });
    }

    // Check if form can be edited
    if (!form.canEdit(user.role)) {
      return res.status(403).json({
        status: 'failed',
        message: 'Form cannot be edited at this stage or is locked'
      });
    }

    next();
  } catch (error) {
    console.error('Form edit middleware error:', error);
    res.status(500).json({
      status: 'failed',
      message: 'Internal server error'
    });
  }
};

// Middleware to check if user can approve forms
export const canApproveForm = (req, res, next) => {
  try {
    const user = req.user;
    const form = req.form;

    if (!form) {
      return res.status(400).json({
        status: 'failed',
        message: 'Form not found in request'
      });
    }

    // Check if user can approve this form
    const canApprove = 
      user.role === 'admin' || 
      (['staff1', 'staff2', 'staff3', 'staff4', 'staff5'].includes(user.role) && 
       form.currentStage === user.role);

    if (!canApprove) {
      return res.status(403).json({
        status: 'failed',
        message: 'You cannot approve this form at this stage'
      });
    }

    next();
  } catch (error) {
    console.error('Form approval middleware error:', error);
    res.status(500).json({
      status: 'failed',
      message: 'Internal server error'
    });
  }
};

// Middleware to check if user can lock forms
export const canLockForm = (req, res, next) => {
  try {
    const user = req.user;

    // Only staff5 and admin can lock forms
    if (!['staff5', 'admin'].includes(user.role)) {
      return res.status(403).json({
        status: 'failed',
        message: 'Only final approvers can lock forms'
      });
    }

    next();
  } catch (error) {
    console.error('Form lock middleware error:', error);
    res.status(500).json({
      status: 'failed',
      message: 'Internal server error'
    });
  }
};

// Middleware to check if user can manage staff
export const canManageStaff = (req, res, next) => {
  try {
    const user = req.user;

    // Only admin can manage staff
    if (user.role !== 'admin') {
      return res.status(403).json({
        status: 'failed',
        message: 'Only administrators can manage staff'
      });
    }

    next();
  } catch (error) {
    console.error('Staff management middleware error:', error);
    res.status(500).json({
      status: 'failed',
      message: 'Internal server error'
    });
  }
};

// Middleware to log actions
export const logAction = (action, resource = 'system') => {
  return (req, res, next) => {
    // Store action info for logging after response
    req.auditAction = {
      action,
      resource,
      resourceId: req.params.id || req.params.formId || null
    };
    next();
  };
};

// Alias for compatibility with routes
export const auditLog = logAction;

// Middleware to log response
export const logResponse = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log the action after response is sent
    if (req.auditAction && req.user) {
      const success = res.statusCode < 400;
      
      AuditLog.logAction({
        userId: req.user._id,
        userRole: req.user.role,
        action: req.auditAction.action,
        resource: req.auditAction.resource,
        resourceId: req.auditAction.resourceId,
        details: {
          method: req.method,
          route: req.originalUrl,
          statusCode: res.statusCode
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success,
        errorMessage: success ? null : data
      });
    }
    
    originalSend.call(this, data);
  };
  
  next();
};