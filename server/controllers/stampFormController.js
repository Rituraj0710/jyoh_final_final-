import StampForm from '../models/StampForm.js';
import FormsData from '../models/FormsData.js';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import logger from '../config/logger.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

class StampFormController {
  // GET /api/stampForms - Get all stamp forms (with filters)
  static async getAllStampForms(req, res) {
    try {
      const { status, serviceType, page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;
      
      const query = {};
      if (status) query.status = status;
      if (serviceType) query.serviceType = serviceType;
      
      const stampForms = await StampForm.find(query)
        .populate('userId', 'name email')
        .populate('linkedUserFormId', 'serviceType status')
        .populate('assignedToStaff2', 'name email')
        .populate('verifiedBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));
      
      const total = await StampForm.countDocuments(query);
      
      return successResponse(res, 'Stamp forms retrieved successfully', {
        stampForms,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Error getting stamp forms:', error);
      return errorResponse(res, 'Error retrieving stamp forms', error.message, 500);
    }
  }

  // GET /api/stampForms/:formId - Get single stamp form with prefilled data
  static async getStampForm(req, res) {
    try {
      const { formId } = req.params;
      
      const stampForm = await StampForm.findById(formId)
        .populate('userId', 'name email phone')
        .populate('linkedUserFormId')
        .populate('assignedToStaff2', 'name email')
        .populate('verifiedBy', 'name email');
      
      if (!stampForm) {
        return errorResponse(res, 'Stamp form not found', null, 404);
      }
      
      // If linked form exists, get additional data for prefilling
      let userFormData = null;
      if (stampForm.linkedUserFormId) {
        userFormData = await FormsData.findById(stampForm.linkedUserFormId)
          .populate('userId', 'name email phone');
      }
      
      return successResponse(res, 'Stamp form retrieved successfully', {
        stampForm,
        userFormData
      });
    } catch (error) {
      logger.error('Error getting stamp form:', error);
      return errorResponse(res, 'Error retrieving stamp form', error.message, 500);
    }
  }

  // POST /api/stampForms - Create new stamp form
  static async createStampForm(req, res) {
    try {
      const userId = req.user.id;
      const stampFormData = req.body;
      
      // Add creator and assignment info
      stampFormData.lastActivityBy = userId;
      stampFormData.assignedToStaff2 = userId; // Staff 2 creates and manages
      
      const stampForm = new StampForm(stampFormData);
      await stampForm.save();
      
      // Populate the created form
      await stampForm.populate([
        { path: 'userId', select: 'name email' },
        { path: 'linkedUserFormId', select: 'serviceType status' },
        { path: 'assignedToStaff2', select: 'name email' }
      ]);
      
      logger.info(`Stamp form created by user ${userId}:`, stampForm._id);
      
      return res.status(201).json(successResponse(res, 'Stamp form created successfully', {
        stampForm
      }));
    } catch (error) {
      logger.error('Error creating stamp form:', error);
      return errorResponse(res, 'Error creating stamp form', error.message, 500);
    }
  }

  // PUT /api/stampForms/:formId - Update stamp form
  static async updateStampForm(req, res) {
    try {
      const { formId } = req.params;
      const userId = req.user.id;
      const updateData = req.body;
      
      const stampForm = await StampForm.findById(formId);
      if (!stampForm) {
        return errorResponse(res, 'Stamp form not found', null, 404);
      }
      
      // Update form data
      Object.assign(stampForm, updateData);
      stampForm.lastActivityBy = userId;
      stampForm.lastActivityAt = new Date();
      
      await stampForm.save();
      
      // Populate the updated form
      await stampForm.populate([
        { path: 'userId', select: 'name email' },
        { path: 'linkedUserFormId', select: 'serviceType status' },
        { path: 'assignedToStaff2', select: 'name email' },
        { path: 'verifiedBy', select: 'name email' }
      ]);
      
      logger.info(`Stamp form updated by user ${userId}:`, formId);
      
      return successResponse(res, 'Stamp form updated successfully', {
        stampForm
      });
    } catch (error) {
      logger.error('Error updating stamp form:', error);
      return errorResponse(res, 'Error updating stamp form', error.message, 500);
    }
  }

  // DELETE /api/stampForms/:formId - Delete stamp form
  static async deleteStampForm(req, res) {
    try {
      const { formId } = req.params;
      const userId = req.user.id;
      
      const stampForm = await StampForm.findById(formId);
      if (!stampForm) {
        return errorResponse(res, 'Stamp form not found', null, 404);
      }
      
      // Check if user has permission to delete
      if (stampForm.assignedToStaff2.toString() !== userId && req.user.role !== 'admin') {
        return errorResponse(res, 'Unauthorized to delete this stamp form', null, 403);
      }
      
      await StampForm.findByIdAndDelete(formId);
      
      logger.info(`Stamp form deleted by user ${userId}:`, formId);
      
      return successResponse(res, 'Stamp form deleted successfully', {
        deletedId: formId
      });
    } catch (error) {
      logger.error('Error deleting stamp form:', error);
      return errorResponse(res, 'Error deleting stamp form', error.message, 500);
    }
  }

  // GET /api/stampForms/:formId/pdf - Generate PDF for stamp form
  static async generatePDF(req, res) {
    try {
      const { formId } = req.params;
      
      const stampForm = await StampForm.findById(formId)
        .populate('userId', 'name email')
        .populate('verifiedBy', 'name email');
      
      if (!stampForm) {
        return errorResponse(res, 'Stamp form not found', null, 404);
      }
      
      // Create PDF document
      const doc = new PDFDocument({ margin: 50 });
      
      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="stamp-form-${formId}.pdf"`);
      
      // Pipe PDF to response
      doc.pipe(res);
      
      // Add content to PDF
      doc.fontSize(20).text('e-Stamp Application Form', { align: 'center' });
      doc.moveDown(2);
      
      // Article section
      doc.fontSize(14).text('Article:', { continued: true });
      doc.fontSize(12).text(stampForm.article, { align: 'left' });
      doc.moveDown();
      
      // Property section
      doc.fontSize(14).text('Property:', { continued: true });
      doc.fontSize(12).text(stampForm.property, { align: 'left' });
      doc.moveDown();
      
      // Price section
      doc.fontSize(14).text('Considered Price: Rs.', { continued: true });
      doc.fontSize(12).text(stampForm.consideredPrice.toLocaleString(), { align: 'left' });
      doc.moveDown();
      
      // Amount section
      doc.fontSize(14).text('Amount: Rs.', { continued: true });
      doc.fontSize(12).text(stampForm.amount.toLocaleString(), { align: 'left' });
      doc.moveDown();
      
      // Amount in words
      doc.fontSize(14).text('Amount in Words:', { continued: true });
      doc.fontSize(12).text(stampForm.amountWords, { align: 'left' });
      doc.moveDown(2);
      
      // First Party section
      doc.fontSize(14).text('First Party:', { underline: true });
      doc.fontSize(12).text(`Name: ${stampForm.firstParty.name}`);
      doc.text(`Address: ${stampForm.firstParty.address}`);
      doc.moveDown();
      
      // Second Party section
      doc.fontSize(14).text('Second Party:', { underline: true });
      doc.fontSize(12).text(`Name: ${stampForm.secondParty.name}`);
      doc.text(`Address: ${stampForm.secondParty.address}`);
      doc.moveDown();
      
      // Payment details
      doc.fontSize(14).text('Paid By:', { continued: true });
      doc.fontSize(12).text(stampForm.paidBy);
      doc.moveDown();
      
      doc.fontSize(14).text('Purchased By:', { continued: true });
      doc.fontSize(12).text(stampForm.purchasedBy);
      doc.moveDown(2);
      
      // Footer with verification info
      doc.fontSize(10).text(`Status: ${stampForm.status.toUpperCase()}`, { align: 'left' });
      if (stampForm.verifiedBy) {
        doc.text(`Verified by: ${stampForm.verifiedBy.name}`);
        doc.text(`Verified at: ${stampForm.verifiedAt.toLocaleDateString()}`);
      }
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'right' });
      
      // Update PDF generation tracking
      stampForm.pdfGenerated = true;
      stampForm.pdfGeneratedAt = new Date();
      await stampForm.save();
      
      // Finalize PDF
      doc.end();
      
      logger.info(`PDF generated for stamp form: ${formId}`);
      
    } catch (error) {
      logger.error('Error generating PDF:', error);
      return errorResponse(res, 'Error generating PDF', error.message, 500);
    }
  }

  // POST /api/stampForms/:formId/verify - Verify stamp form
  static async verifyStampForm(req, res) {
    try {
      const { formId } = req.params;
      const userId = req.user.id;
      const { notes } = req.body;
      
      const stampForm = await StampForm.findById(formId);
      if (!stampForm) {
        return errorResponse(res, 'Stamp form not found', null, 404);
      }
      
      // Update status to verified
      await stampForm.updateStatus('verified', userId, notes);
      
      // Populate the updated form
      await stampForm.populate([
        { path: 'userId', select: 'name email' },
        { path: 'linkedUserFormId', select: 'serviceType status' },
        { path: 'assignedToStaff2', select: 'name email' },
        { path: 'verifiedBy', select: 'name email' }
      ]);
      
      logger.info(`Stamp form verified by user ${userId}:`, formId);
      
      return successResponse(res, 'Stamp form verified successfully', {
        stampForm
      });
    } catch (error) {
      logger.error('Error verifying stamp form:', error);
      return errorResponse(res, 'Error verifying stamp form', error.message, 500);
    }
  }

  // GET /api/stampForms/user/:userId - Get stamp forms for a specific user
  static async getUserStampForms(req, res) {
    try {
      const { userId } = req.params;
      const { status, page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;
      
      const query = { userId };
      if (status) query.status = status;
      
      const stampForms = await StampForm.find(query)
        .populate('linkedUserFormId', 'serviceType status')
        .populate('assignedToStaff2', 'name email')
        .populate('verifiedBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));
      
      const total = await StampForm.countDocuments(query);
      
      return successResponse(res, 'User stamp forms retrieved successfully', {
        stampForms,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Error getting user stamp forms:', error);
      return errorResponse(res, 'Error retrieving user stamp forms', error.message, 500);
    }
  }

  // POST /api/stampForms/auto-create/:userFormId - Auto-create stamp form from user form
  static async autoCreateFromUserForm(req, res) {
    try {
      const { userFormId } = req.params;
      const userId = req.user.id;
      
      // Get the user form data
      const userForm = await FormsData.findById(userFormId)
        .populate('userId', 'name email');
      
      if (!userForm) {
        return errorResponse(res, 'User form not found', null, 404);
      }
      
      // Check if stamp form already exists for this user form
      const existingStampForm = await StampForm.findOne({ linkedUserFormId: userFormId });
      if (existingStampForm) {
        return successResponse(res, 'Stamp form already exists', {
          stampForm: existingStampForm
        });
      }
      
      // Create stamp form from user form data
      const stampForm = await StampForm.createFromUserForm(userForm);
      
      // Assign to current staff member
      stampForm.assignedToStaff2 = userId;
      stampForm.lastActivityBy = userId;
      await stampForm.save();
      
      // Populate the created form
      await stampForm.populate([
        { path: 'userId', select: 'name email' },
        { path: 'linkedUserFormId', select: 'serviceType status' },
        { path: 'assignedToStaff2', select: 'name email' }
      ]);
      
      logger.info(`Auto-created stamp form from user form ${userFormId} by user ${userId}`);
      
      return res.status(201).json(successResponse(res, 'Stamp form auto-created successfully', {
        stampForm
      }));
    } catch (error) {
      logger.error('Error auto-creating stamp form:', error);
      return errorResponse(res, 'Error auto-creating stamp form', error.message, 500);
    }
  }
}

export default StampFormController;
