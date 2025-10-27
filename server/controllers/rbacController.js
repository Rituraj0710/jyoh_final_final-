import User from '../models/User.js';
import Form from '../models/Form.js';
import AuditLog from '../models/AuditLog.js';
import logger from '../config/logger.js';

/**
 * Get forms filtered by user role
 */
export const getFormsForRole = async (req, res) => {
  try {
    const { role } = req.user;
    const { page = 1, limit = 10, status, formType } = req.query;
    
    // Build query based on role
    let query = {};
    
    switch (role) {
      case 'staff1':
        query = {
          'approvals.staff1.approved': false,
          status: { $in: ['submitted', 'under_review'] }
        };
        break;
      case 'staff2':
        query = {
          'approvals.staff1.approved': true,
          'approvals.staff2.approved': false,
          status: 'under_review'
        };
        break;
      case 'staff3':
        query = {
          'approvals.staff1.approved': true,
          'approvals.staff3.approved': false,
          status: 'under_review'
        };
        break;
      case 'staff4':
        query = {
          'approvals.staff1.approved': true,
          'approvals.staff2.approved': true,
          'approvals.staff3.approved': true,
          'approvals.staff4.approved': false,
          status: 'under_review'
        };
        break;
      case 'staff5':
        query = {
          'approvals.staff4.approved': true,
          'approvals.staff5.approved': false,
          status: 'under_review'
        };
        break;
      default:
        return res.status(403).json({
          success: false,
          message: 'Invalid role for form access'
        });
    }
    
    // Add additional filters
    if (status) query.status = status;
    if (formType) query.formType = formType;
    
    const skip = (page - 1) * limit;
    
    const forms = await Form.find(query)
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Form.countDocuments(query);
    
    // Filter form data based on role
    const filteredForms = forms.map(form => {
      const filteredData = filterFormDataByRole(form.data, role);
      return {
        ...form.toObject(),
        data: filteredData
      };
    });
    
    // Log the action
    await AuditLog.logAction({
      userId: req.user.id,
      userRole: req.user.role,
      action: 'form_view',
      resource: 'form',
      details: `Viewed forms for role ${role}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json({
      success: true,
      data: {
        forms: filteredForms,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
    
  } catch (error) {
    logger.error('Error getting forms for role:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving forms'
    });
  }
};

/**
 * Get specific form with role-based field filtering
 */
export const getFormById = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.user;
    
    const form = await Form.findById(id)
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email role');
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }
    
    // Check if user can access this form
    if (!canUserAccessForm(form, role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You cannot view this form at this stage.'
      });
    }
    
    // Filter form data based on role
    const filteredData = filterFormDataByRole(form.data, role);
    
    // Log the action
    await AuditLog.logAction({
      userId: req.user.id,
      userRole: req.user.role,
      action: 'form_view',
      resource: 'form',
      resourceId: form._id,
      details: `Viewed form ${id} with role ${role}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json({
      success: true,
      data: {
        ...form.toObject(),
        data: filteredData
      }
    });
    
  } catch (error) {
    logger.error('Error getting form by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving form'
    });
  }
};

/**
 * Approve form by staff role
 */
export const approveForm = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.user;
    const { comments, validationData } = req.body;
    
    const form = await Form.findById(id);
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }
    
    // Check if user can approve this form
    if (!canUserApproveForm(form, role)) {
      return res.status(403).json({
        success: false,
        message: 'You cannot approve this form at this stage'
      });
    }
    
    // Approve the form
    await form.approveByStaff(role, req.user.id, comments);
    
    // Add role-specific validation data
    if (validationData) {
      form.approvals[role] = {
        ...form.approvals[role],
        ...validationData
      };
      await form.save();
    }
    
    // Log the action
    await AuditLog.logAction({
      userId: req.user.id,
      userRole: req.user.role,
      action: 'form_approve',
      resource: 'form',
      resourceId: form._id,
      details: `Approved form by ${role}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json({
      success: true,
      message: `Form approved by ${role}`,
      data: {
        formId: form._id,
        approvedBy: role,
        approvedAt: new Date(),
        nextApprover: form.nextApprover
      }
    });
    
  } catch (error) {
    logger.error('Error approving form:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving form'
    });
  }
};

/**
 * Lock form (staff5 only)
 */
export const lockForm = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.user;
    const { comments } = req.body;
    
    if (role !== 'staff5') {
      return res.status(403).json({
        success: false,
        message: 'Only staff5 can lock forms'
      });
    }
    
    const form = await Form.findById(id);
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }
    
    // Check if all approvals are complete
    const approvals = form.approvals;
    if (!approvals.staff1.approved || !approvals.staff2.approved || 
        !approvals.staff3.approved || !approvals.staff4.approved) {
      return res.status(400).json({
        success: false,
        message: 'Cannot lock form. All approvals must be complete.'
      });
    }
    
    // Lock the form
    await form.lockForm(req.user.id, comments);
    
    // Log the action
    await AuditLog.logAction({
      userId: req.user.id,
      userRole: req.user.role,
      action: 'form_lock',
      resource: 'form',
      resourceId: form._id,
      details: 'Form locked - no further edits allowed',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      severity: 'high'
    });
    
    res.json({
      success: true,
      message: 'Form locked successfully',
      data: {
        formId: form._id,
        lockedAt: form.lockedAt,
        lockedBy: req.user.id
      }
    });
    
  } catch (error) {
    logger.error('Error locking form:', error);
    res.status(500).json({
      success: false,
      message: 'Error locking form'
    });
  }
};

/**
 * Get dashboard data for role
 */
export const getDashboardData = async (req, res) => {
  try {
    const { role } = req.user;
    
    const dashboardData = await getRoleDashboardData(role);
    
    res.json({
      success: true,
      data: dashboardData
    });
    
  } catch (error) {
    logger.error('Error getting dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving dashboard data'
    });
  }
};

/**
 * Helper function to filter form data by role
 */
function filterFormDataByRole(formData, role) {
  const roleFields = {
    staff1: [
      'formSummary', 'stampPaperAmount', 'totalValue', 'formType', 'submissionDate',
      'userDetails', 'contactInfo'
    ],
    staff2: [
      'trusteeDetails', 'trusteeName', 'trusteeAddress', 'moneyAmount', 'position',
      'trusteeContact', 'trusteeDocuments'
    ],
    staff3: [
      'landDetails', 'plotSize', 'plotMap', 'landDocuments', 'propertyAddress',
      'surveyNumber', 'propertyType'
    ],
    staff4: [
      'approvals', 'staff1Approval', 'staff2Approval', 'staff3Approval',
      'overallStatus', 'reviewNotes'
    ],
    staff5: Object.keys(formData) // Can see everything
  };
  
  if (role === 'staff5') {
    return formData;
  }
  
  const allowedFields = roleFields[role] || [];
  const filteredData = {};
  
  allowedFields.forEach(field => {
    if (formData[field] !== undefined) {
      filteredData[field] = formData[field];
    }
  });
  
  return filteredData;
}

/**
 * Helper function to check if user can access form
 */
function canUserAccessForm(form, role) {
  const approvals = form.approvals;
  
  switch (role) {
    case 'staff1':
      return !approvals.staff1.approved;
    case 'staff2':
      return approvals.staff1.approved && !approvals.staff2.approved;
    case 'staff3':
      return approvals.staff1.approved && !approvals.staff3.approved;
    case 'staff4':
      return approvals.staff1.approved && approvals.staff2.approved && 
             approvals.staff3.approved && !approvals.staff4.approved;
    case 'staff5':
      return approvals.staff4.approved && !approvals.staff5.approved;
    default:
      return false;
  }
}

/**
 * Helper function to check if user can approve form
 */
function canUserApproveForm(form, role) {
  return canUserAccessForm(form, role);
}

/**
 * Helper function to get dashboard data for role
 */
async function getRoleDashboardData(role) {
  const baseQuery = {};
  
  switch (role) {
    case 'staff1':
      baseQuery['approvals.staff1.approved'] = false;
      break;
    case 'staff2':
      baseQuery['approvals.staff1.approved'] = true;
      baseQuery['approvals.staff2.approved'] = false;
      break;
    case 'staff3':
      baseQuery['approvals.staff1.approved'] = true;
      baseQuery['approvals.staff3.approved'] = false;
      break;
    case 'staff4':
      baseQuery['approvals.staff1.approved'] = true;
      baseQuery['approvals.staff2.approved'] = true;
      baseQuery['approvals.staff3.approved'] = true;
      baseQuery['approvals.staff4.approved'] = false;
      break;
    case 'staff5':
      baseQuery['approvals.staff4.approved'] = true;
      baseQuery['approvals.staff5.approved'] = false;
      break;
  }
  
  const [
    pendingForms,
    approvedToday,
    totalApproved,
    recentActivity
  ] = await Promise.all([
    Form.countDocuments(baseQuery),
    Form.countDocuments({
      ...baseQuery,
      [`approvals.${role}.approvedAt`]: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    }),
    Form.countDocuments({
      [`approvals.${role}.approved`]: true
    }),
    AuditLog.find({
      userRole: role,
      action: { $in: ['form_approve', 'form_view'] }
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('userId', 'name email')
  ]);
  
  return {
    role,
    stats: {
      pendingForms,
      approvedToday,
      totalApproved
    },
    recentActivity
  };
}
