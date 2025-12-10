import mongoose from 'mongoose';
import FormsData from '../models/FormsData.js';
import Form from '../models/Form.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import Ledger from '../models/Ledger.js';
import logger from '../config/logger.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import AuditService from '../services/auditService.js';

class FormsDataController {
  // Helper function to clean empty fields (convert empty strings to null)
  static cleanFields(fields) {
    const cleaned = {};
    for (const [key, value] of Object.entries(fields)) {
      // Convert empty strings to null for optional fields
      cleaned[key] = (value === '' || value === undefined) ? null : value;
    }
    return cleaned;
  }

  // Helper function to store calculation results
  static async storeCalculations(formId, calculations) {
    try {
      const formData = await FormsData.findById(formId);
      if (formData && calculations) {
        formData.paymentInfo = formData.paymentInfo || {};
        formData.paymentInfo.calculations = {
          ...formData.paymentInfo.calculations,
          ...calculations,
          calculatedAt: new Date()
        };
        await formData.save();
      }
    } catch (error) {
      logger.error('Error storing calculations:', error);
    }
  }

  // Save form as draft or update existing
  static async saveForm(req, res) {
    try {
      const { formId, serviceType, fields, formTitle, formDescription } = req.body;
      const userId = req.user.id;

      // Validate required fields
      if (!serviceType || !fields) {
        return errorResponse(res, 'Service type and fields are required', null, 400);
      }

      // Clean fields (convert empty strings to null)
      const cleanedFields = FormsDataController.cleanFields(fields);

      // Process uploaded files to Cloudinary if any
      const { processMultipleFiles } = await import('../utils/fileUploadHelper.js');
      const processedFiles = req.files ? await processMultipleFiles(Object.values(req.files).flat(), 'forms-data') : [];
      const uploadedFiles = processedFiles.map(file => ({
        fieldName: file.fieldname || 'unknown',
        fileName: file.filename,
        filePath: file.cloudinaryUrl,
        fileSize: file.size,
        mimeType: file.contentType,
        uploadedAt: new Date(),
        publicId: file.publicId,
        cloudinaryUrl: file.cloudinaryUrl
      }));

      // Check if form already exists
      let formData = await FormsData.findOne({ 
        formId: formId || new mongoose.Types.ObjectId(),
        userId,
        serviceType 
      });

      if (formData) {
        // Update existing form
        formData.fields = { ...formData.fields, ...cleanedFields };
        formData.data = { ...formData.data, ...cleanedFields }; // Also update data field for staff compatibility
        
        // Add uploaded files if any
        if (uploadedFiles.length > 0) {
          formData.uploadedFiles = [...(formData.uploadedFiles || []), ...uploadedFiles];
        }
        
        formData.lastActivityBy = userId;
        formData.lastActivityAt = new Date();
        
        // Update progress based on filled fields
        const filledFields = Object.keys(fields).length;
        const totalFields = Object.keys(fields).length; // This should be calculated based on form structure
        formData.updateProgress(filledFields, totalFields);
        
        await formData.save();
        
        // Log comprehensive audit trail
        await AuditService.logFormUpdate(
          userId, 
          req.user.role, 
          formData._id, 
          formData.toObject(), 
          formData.toObject(), 
          req.ip, 
          req.get('User-Agent')
        );
        
        return successResponse(res, 'Form saved successfully', {
          formData,
          message: 'Form updated successfully'
        });
      } else {
        // Create new form
        formData = new FormsData({
          formId: formId || new mongoose.Types.ObjectId(),
          serviceType,
          userId,
          fields: cleanedFields,
          data: cleanedFields, // Also populate data field for staff compatibility
          formTitle,
          formDescription,
          status: 'draft',
          lastActivityBy: userId,
          uploadedFiles: uploadedFiles // Store uploaded files
        });

        await formData.save();
        
        // Log comprehensive audit trail
        await AuditService.logFormCreate(
          userId, 
          req.user.role, 
          formData, 
          req.ip, 
          req.get('User-Agent')
        );
        
        return successResponse(res, 'Form created successfully', {
          formData,
          message: 'Form created and saved as draft'
        });
      }
    } catch (error) {
      logger.error('Error saving form:', error);
        await FormsDataController.logActivity('Form Save Error', req.user.id, null, 'Failure', error.message);
      return errorResponse(res, 'Error saving form', error.message, 500);
    }
  }

  // Submit form (mark as completed)
  static async submitForm(req, res) {
    try {
      const { formId, serviceType, fields } = req.body;
      const userId = req.user.id;

      // Validate required fields
      if (!serviceType || !fields) {
        return errorResponse(res, 'Service type and fields are required', null, 400);
      }

      // Clean fields (convert empty strings to null)
      const cleanedFields = FormsDataController.cleanFields(fields);

      // Process uploaded files to Cloudinary if any
      const { processMultipleFiles } = await import('../utils/fileUploadHelper.js');
      const processedFiles = req.files ? await processMultipleFiles(Object.values(req.files).flat(), 'forms-data') : [];
      const uploadedFiles = processedFiles.map(file => ({
        fieldName: file.fieldname || 'unknown',
        fileName: file.filename,
        filePath: file.cloudinaryUrl,
        fileSize: file.size,
        mimeType: file.contentType,
        uploadedAt: new Date(),
        publicId: file.publicId,
        cloudinaryUrl: file.cloudinaryUrl
      }));

      // Find existing form or create new one
      let formData = await FormsData.findOne({ 
        formId: formId || new mongoose.Types.ObjectId(),
        userId,
        serviceType 
      });

      if (formData) {
        // Update and submit existing form
        await formData.submitForm(cleanedFields, userId);
        
        // Log comprehensive audit trail
        await AuditService.logFormSubmit(
          userId, 
          req.user.role, 
          formData._id, 
          formData, 
          req.ip, 
          req.get('User-Agent')
        );
        
        return successResponse(res, 'Form submitted successfully', {
          formData,
          message: 'Form submitted and marked as completed'
        });
      } else {
        // Create and submit new form
        formData = new FormsData({
          formId: formId || new mongoose.Types.ObjectId(),
          serviceType,
          userId,
          fields: cleanedFields,
          data: cleanedFields, // Also populate data field for staff compatibility
          uploadedFiles: uploadedFiles, // Store uploaded files
          status: 'completed',
          submittedAt: new Date(),
          completedAt: new Date(),
          lastActivityBy: userId,
          progressPercentage: 100
        });

        await formData.save();
        
        // Log activity
        await FormsDataController.logActivity('Form Submitted', userId, formData._id, 'Success');
        
        return res.status(201).json(successResponse(res, 'Form submitted successfully', {
          formData,
          message: 'Form created and submitted'
        }));
      }
    } catch (error) {
      logger.error('Error submitting form:', error);
        await FormsDataController.logActivity('Form Submit Error', req.user.id, null, 'Failure', error.message);
      return errorResponse(res, 'Error submitting form', error.message, 500);
    }
  }

  // Get user's forms
  static async getUserForms(req, res) {
    try {
      const userId = req.user.id;
      const { serviceType, status, page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      const options = {
        serviceType,
        status,
        limit: parseInt(limit),
        skip: parseInt(skip)
      };

      const forms = await FormsData.getUserForms(userId, options);
      const total = await FormsData.countDocuments({ userId });

      return successResponse(res, 'User forms retrieved successfully', {
        forms,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Error getting user forms:', error);
      return errorResponse(res, 'Error retrieving user forms', error.message, 500);
    }
  }

  // Get forms by user or agent ID (supports query parameter agentId)
  static async getFormsByUserOrAgent(req, res) {
    try {
      const { agentId, serviceType, status, page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;
      const userId = req.user.id;
      const userRole = req.user.role;

      // If agentId is provided in query, use it; otherwise use current user's ID
      const targetUserId = agentId || userId;

      // Only allow agents (user2) to query by agentId, or admins/staff
      if (agentId && userRole === 'user1') {
        return errorResponse(res, 'Access denied', null, 403);
      }

      const query = { userId: targetUserId };
      if (serviceType) query.serviceType = serviceType;
      if (status) query.status = status;

      const forms = await FormsData.find(query)
        .populate('userId', 'name email role')
        .populate('assignedTo', 'name email role')
        .populate('lastActivityBy', 'name email role')
        .sort({ lastActivityAt: -1 })
        .limit(parseInt(limit))
        .skip(skip);

      const total = await FormsData.countDocuments(query);

      return successResponse(res, 'Forms retrieved successfully', {
        forms,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Error getting forms by user/agent:', error);
      return errorResponse(res, 'Error retrieving forms', error.message, 500);
    }
  }

  // Get single form by ID
  static async getFormById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      const formData = await FormsData.findById(id)
        .populate('userId', 'name email role')
        .populate('assignedTo', 'name email role')
        .populate('lastActivityBy', 'name email role');

      if (!formData) {
        return errorResponse(res, 'Form not found', null, 404);
      }

      // Check permissions
      if (userRole !== 'admin' && userRole !== 'staff1' && userRole !== 'staff2' && 
          userRole !== 'staff3' && userRole !== 'staff4' && userRole !== 'staff5') {
        if (formData.userId._id.toString() !== userId) {
          return errorResponse(res, 'Access denied', null, 403);
        }
      }

      return successResponse(res, 'Form retrieved successfully', { formData });
    } catch (error) {
      logger.error('Error getting form by ID:', error);
      return errorResponse(res, 'Error retrieving form', error.message, 500);
    }
  }

  // Admin: Get all forms with filters
  static async getAdminForms(req, res) {
    try {
      const { 
        serviceType, 
        status, 
        userId, 
        assignedTo,
        search, 
        page = 1, 
        limit = 50,
        sortBy = 'lastActivityAt',
        sortOrder = 'desc'
      } = req.query;

      const filters = {
        serviceType,
        status,
        userId,
        assignedTo,
        search,
        limit: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit)
      };

      // Remove undefined filters
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined || filters[key] === '') {
          delete filters[key];
        }
      });

      // Apply role-based filters if available
      if (req.roleFilters) {
        filters.roleFilters = req.roleFilters;
      }

      const forms = await FormsData.getAdminForms(filters);
      const total = await FormsData.countDocuments(filters.roleFilters || {});

      // Log activity
      await FormsDataController.logActivity('Admin Forms List', req.user.id, null, 'Success');

      return successResponse(res, 'Admin forms retrieved successfully', {
        forms,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Error getting admin forms:', error);
      return errorResponse(res, 'Error retrieving admin forms', error.message, 500);
    }
  }

  // Staff: Get assigned forms
  static async getStaffForms(req, res) {
    try {
      const staffId = req.user.id;
      const { 
        serviceType, 
        status, 
        search, 
        page = 1, 
        limit = 50
      } = req.query;

      const filters = {
        serviceType,
        status,
        search,
        limit: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit)
      };

      // Remove undefined filters
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined || filters[key] === '') {
          delete filters[key];
        }
      });

      // Apply role-based filters if available
      if (req.roleFilters) {
        filters.roleFilters = req.roleFilters;
      }

      const forms = await FormsData.getStaffForms(staffId, filters);
      const total = await FormsData.countDocuments(filters.roleFilters || { assignedTo: staffId });

      // Log activity
      await FormsDataController.logActivity('Staff Forms List', staffId, null, 'Success');

      return successResponse(res, 'Staff forms retrieved successfully', {
        forms,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Error getting staff forms:', error);
      return errorResponse(res, 'Error retrieving staff forms', error.message, 500);
    }
  }

  // Admin: Update form
  static async updateForm(req, res) {
    try {
      const { id } = req.params;
      const { fields, status, adminNotes } = req.body;
      const userId = req.user.id;

      const formData = await FormsData.findById(id);
      if (!formData) {
        return errorResponse(res, 'Form not found', null, 404);
      }

      // Save current version to history
      formData.previousVersions.push({
        fields: formData.fields,
        status: formData.status,
        savedAt: new Date(),
        savedBy: formData.lastActivityBy
      });

      // Update form
      if (fields) formData.fields = { ...formData.fields, ...fields };
      if (status) formData.status = status;
      if (adminNotes) {
        formData.adminNotes.push({
          note: adminNotes,
          addedBy: userId,
          addedAt: new Date()
        });
      }

      formData.lastActivityBy = userId;
      formData.lastActivityAt = new Date();
      formData.version += 1;

      await formData.save();

      // Log activity
      await FormsDataController.logActivity('Form Edited', userId, formData._id, 'Success');

      return successResponse(res, 'Form updated successfully', { formData });
    } catch (error) {
      logger.error('Error updating form:', error);
      await FormsDataController.logActivity('Form Update Error', req.user.id, id, 'Failure', error.message);
      return errorResponse(res, 'Error updating form', error.message, 500);
    }
  }

  // Admin: Delete form
  static async deleteForm(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const formData = await FormsData.findById(id);
      if (!formData) {
        return errorResponse(res, 'Form not found', null, 404);
      }

      await FormsData.findByIdAndDelete(id);

      // Log activity
      await FormsDataController.logActivity('Form Deleted', userId, id, 'Success');

      return successResponse(res, 'Form deleted successfully');
    } catch (error) {
      logger.error('Error deleting form:', error);
      await FormsDataController.logActivity('Form Delete Error', req.user.id, id, 'Failure', error.message);
      return errorResponse(res, 'Error deleting form', error.message, 500);
    }
  }

  // Admin: Assign form to staff
  static async assignFormToStaff(req, res) {
    try {
      const { id } = req.params;
      const { staffId } = req.body;
      const adminId = req.user.id;

      const formData = await FormsData.findById(id);
      if (!formData) {
        return errorResponse(res, 'Form not found', null, 404);
      }

      // Verify staff exists and is active
      const staff = await User.findById(staffId);
      if (!staff || !staff.isActive || !['staff1', 'staff2', 'staff3', 'staff4', 'staff5'].includes(staff.role)) {
        return errorResponse(res, 'Invalid staff member', null, 400);
      }

      await formData.assignToStaff(staffId, adminId);

      // Log comprehensive audit trail
      await AuditService.logFormAssign(
        adminId, 
        req.user.role, 
        formData._id, 
        staff, 
        formData, 
        req.ip, 
        req.get('User-Agent')
      );

      return successResponse(res, 'Form assigned to staff successfully', { formData });
    } catch (error) {
      logger.error('Error assigning form to staff:', error);
      return errorResponse(res, 'Error assigning form to staff', error.message, 500);
    }
  }

  // Staff: Verify form
  static async verifyForm(req, res) {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const staffId = req.user.id;

      const formData = await FormsData.findById(id);
      if (!formData) {
        return errorResponse(res, 'Form not found', null, 404);
      }

      // Check if form is assigned to this staff member
      if (formData.assignedTo.toString() !== staffId) {
        return errorResponse(res, 'Access denied. Form not assigned to you', null, 403);
      }

      await formData.verifyByStaff(staffId, notes);

      // Log comprehensive audit trail
      await AuditService.logFormVerify(
        staffId, 
        req.user.role, 
        formData._id, 
        formData, 
        notes, 
        req.ip, 
        req.get('User-Agent')
      );

      return successResponse(res, 'Form verified successfully', { formData });
    } catch (error) {
      logger.error('Error verifying form:', error);
      return errorResponse(res, 'Error verifying form', error.message, 500);
    }
  }

  // Admin: Approve/Reject form
  static async approveForm(req, res) {
    try {
      const { id } = req.params;
      const { approved, reason } = req.body;
      const adminId = req.user.id;

      const formData = await FormsData.findById(id);
      if (!formData) {
        return errorResponse(res, 'Form not found', null, 404);
      }

      await formData.approveByAdmin(adminId, approved, reason);

      // Log comprehensive audit trail
      await AuditService.logFormApprove(
        adminId, 
        req.user.role, 
        formData._id, 
        formData, 
        approved, 
        reason, 
        req.ip, 
        req.get('User-Agent')
      );

      return successResponse(res, 
        approved ? 'Form approved successfully' : 'Form rejected successfully', 
        { formData }
      );
    } catch (error) {
      logger.error('Error approving/rejecting form:', error);
      return errorResponse(res, 'Error processing form approval', error.message, 500);
    }
  }

  // Get form statistics
  static async getFormStats(req, res) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;

      let matchQuery = {};
      if (userRole !== 'admin' && userRole !== 'staff1' && userRole !== 'staff2' && 
          userRole !== 'staff3' && userRole !== 'staff4' && userRole !== 'staff5') {
        matchQuery.userId = userId;
      }

      const stats = await FormsData.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const serviceStats = await FormsData.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$serviceType',
            count: { $sum: 1 }
          }
        }
      ]);

      return successResponse(res, 'Form statistics retrieved successfully', {
        statusStats: stats,
        serviceStats: serviceStats
      });
    } catch (error) {
      logger.error('Error getting form stats:', error);
      return errorResponse(res, 'Error retrieving form statistics', error.message, 500);
    }
  }

  // Helper method to log activities
  static async logActivity(action, userId, formId, status, details = null) {
    try {
      const auditLog = new AuditLog({
        action,
        userId,
        resourceType: 'FormsData',
        resourceId: formId,
        status,
        details,
        timestamp: new Date()
      });
      await auditLog.save();
    } catch (error) {
      logger.error('Error logging activity:', error);
    }
  }

  // Submit calculations for review
  static async submitCalculations(req, res) {
    try {
      const { formId, calculations } = req.body;
      const userId = req.user.id;

      if (!formId || !calculations) {
        return errorResponse(res, 'Form ID and calculations are required', null, 400);
      }

      const formData = await FormsData.findById(formId);
      if (!formData) {
        return errorResponse(res, 'Form not found', null, 404);
      }

      // Store calculations
      formData.paymentInfo = formData.paymentInfo || {};
      formData.paymentInfo.calculations = {
        ...formData.paymentInfo.calculations,
        ...calculations,
        calculatedAt: new Date()
      };

      await formData.save();

      logger.info(`Calculations submitted for form ${formId}`, {
        userId,
        calculations,
        formId
      });

      return successResponse(res, 'Calculations submitted successfully', {
        formData,
        calculations: formData.paymentInfo.calculations
      });

    } catch (error) {
      logger.error('Error submitting calculations:', error);
      return errorResponse(res, 'Error submitting calculations', error.message, 500);
    }
  }

  // Update payment status
  static async updatePaymentStatus(req, res) {
    try {
      const { formId, paymentStatus, transactionId, paymentAmount, paymentMethod } = req.body;
      const userId = req.user.id;

      if (!formId || !paymentStatus) {
        return errorResponse(res, 'Form ID and payment status are required', null, 400);
      }

      const formData = await FormsData.findById(formId);
      if (!formData) {
        return errorResponse(res, 'Form not found', null, 404);
      }

      // Update payment info
      formData.paymentInfo = formData.paymentInfo || {};
      formData.paymentInfo.paymentStatus = paymentStatus;
      if (transactionId) formData.paymentInfo.paymentTransactionId = transactionId;
      if (paymentAmount) formData.paymentInfo.paymentAmount = paymentAmount;
      if (paymentMethod) formData.paymentInfo.paymentMethod = paymentMethod;
      
      if (paymentStatus === 'completed') {
        formData.paymentInfo.paymentDate = new Date();
        
        // Create ledger entry
        const ledgerEntry = new Ledger({
          transactionId: transactionId || `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          formId: formData._id,
          userId: formData.userId,
          transactionType: 'payment',
          amount: paymentAmount || formData.paymentInfo.calculations?.totalPayable || 0,
          stampDuty: formData.paymentInfo.calculations?.stampDuty || 0,
          registrationCharge: formData.paymentInfo.calculations?.registrationCharge || 0,
          paymentMethod: paymentMethod || 'upi',
          paymentStatus: 'completed',
          paymentDate: new Date(),
          paymentTransactionId: transactionId,
          debit: paymentAmount || formData.paymentInfo.calculations?.totalPayable || 0
        });
        
        await ledgerEntry.save();
        
        logger.info(`Ledger entry created for form ${formId}`, {
          ledgerId: ledgerEntry._id,
          transactionId: ledgerEntry.transactionId
        });
      }

      await formData.save();

      logger.info(`Payment status updated for form ${formId}`, {
        userId,
        paymentStatus,
        formId
      });

      return successResponse(res, 'Payment status updated successfully', {
        formData,
        paymentInfo: formData.paymentInfo
      });

    } catch (error) {
      logger.error('Error updating payment status:', error);
      return errorResponse(res, 'Error updating payment status', error.message, 500);
    }
  }

  // Verify payment (for admin/staff)
  static async verifyPayment(req, res) {
    try {
      const { formId, verified, paymentNotes } = req.body;
      const userId = req.user.id;

      if (!formId) {
        return errorResponse(res, 'Form ID is required', null, 400);
      }

      const formData = await FormsData.findById(formId);
      if (!formData) {
        return errorResponse(res, 'Form not found', null, 404);
      }

      // Update payment verification
      formData.paymentInfo = formData.paymentInfo || {};
      formData.paymentInfo.paymentVerified = verified !== false;
      if (paymentNotes) formData.paymentInfo.paymentNotes = paymentNotes;
      formData.paymentInfo.verifiedBy = userId;
      formData.paymentInfo.verifiedAt = new Date();

      // Update form status based on verification
      if (formData.paymentInfo.paymentVerified && formData.paymentInfo.paymentStatus === 'completed') {
        formData.status = 'approved';
        formData.approvedBy = userId;
        formData.approvedAt = new Date();
      }

      await formData.save();

      logger.info(`Payment verified for form ${formId}`, {
        userId,
        verified,
        formId
      });

      return successResponse(res, 'Payment verified successfully', {
        formData,
        paymentInfo: formData.paymentInfo
      });

    } catch (error) {
      logger.error('Error verifying payment:', error);
      return errorResponse(res, 'Error verifying payment', error.message, 500);
    }
  }
}

export default FormsDataController;
