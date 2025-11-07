import StaffReport from '../models/StaffReport.js';
import FormsData from '../models/FormsData.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import logger from '../config/logger.js';

class StaffReportController {
  // Create a new staff report
  static createReport = async (req, res) => {
    try {
      const { formId, verificationStatus, editedData, remarks, stampCalculation, verificationNotes } = req.body;
      const staffId = req.user._id;

      // Validate required fields
      if (!formId || !verificationStatus) {
        return res.status(400).json({
          status: 'failed',
          message: 'Form ID and verification status are required'
        });
      }

      // Check if form exists and is assigned to this staff
      const form = await FormsData.findById(formId);
      if (!form) {
        return res.status(404).json({
          status: 'failed',
          message: 'Form not found'
        });
      }

      // Check if staff has permission to work on this form
      if (form.assignedTo && form.assignedTo.toString() !== staffId.toString()) {
        return res.status(403).json({
          status: 'failed',
          message: 'You are not assigned to this form'
        });
      }

      // Get original form data
      const originalData = { ...form.fields };

      // Create staff report
      const reportData = {
        staffId,
        formId,
        formType: form.serviceType,
        verificationStatus,
        editedData: editedData || {},
        originalData,
        remarks,
        stampCalculation: stampCalculation || {},
        verificationNotes
      };

      const report = new StaffReport(reportData);
      
      // Calculate changes if edited data is provided
      if (editedData) {
        report.calculateChanges(originalData, editedData);
      }

      await report.save();

      // Update form status based on verification
      if (verificationStatus === 'verified') {
        form.status = 'verified';
        form.verifiedBy = staffId;
        form.verifiedAt = new Date();
        form.lastActivityBy = staffId;
        await form.save();
      }

      // Log the action
      await AuditLog.logAction({
        userId: staffId,
        userRole: req.user.role,
        action: 'staff_report_create',
        resource: 'staff_report',
        resourceId: report._id,
        details: {
          formId,
          formType: form.serviceType,
          verificationStatus,
          changesCount: report.changes.length
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json({
        status: 'success',
        message: 'Staff report created successfully',
        report: {
          id: report._id,
          formId: report.formId,
          verificationStatus: report.verificationStatus,
          changesCount: report.changes.length,
          createdAt: report.createdAt
        }
      });

    } catch (error) {
      logger.error('Create staff report error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to create staff report, please try again later'
      });
    }
  };

  // Submit a staff report
  static submitReport = async (req, res) => {
    try {
      const { reportId } = req.params;
      const { finalRemarks } = req.body;
      const staffId = req.user._id;

      const report = await StaffReport.findById(reportId);
      if (!report) {
        return res.status(404).json({
          status: 'failed',
          message: 'Report not found'
        });
      }

      // Check if staff owns this report
      if (report.staffId.toString() !== staffId.toString()) {
        return res.status(403).json({
          status: 'failed',
          message: 'You can only submit your own reports'
        });
      }

      // Update report
      report.isSubmitted = true;
      report.submittedAt = new Date();
      if (finalRemarks) {
        report.remarks = finalRemarks;
      }

      await report.save();

      // Log the action
      await AuditLog.logAction({
        userId: staffId,
        userRole: req.user.role,
        action: 'staff_report_submit',
        resource: 'staff_report',
        resourceId: report._id,
        details: {
          formId: report.formId,
          formType: report.formType,
          verificationStatus: report.verificationStatus
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(200).json({
        status: 'success',
        message: 'Report submitted successfully',
        report: {
          id: report._id,
          submittedAt: report.submittedAt,
          isSubmitted: report.isSubmitted
        }
      });

    } catch (error) {
      logger.error('Submit staff report error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to submit report, please try again later'
      });
    }
  };

  // Get reports by staff
  static getStaffReports = async (req, res) => {
    try {
      const staffId = req.user._id;
      const { 
        verificationStatus, 
        formType, 
        isSubmitted, 
        dateFrom, 
        dateTo, 
        page = 1, 
        limit = 20 
      } = req.query;

      const filters = {
        verificationStatus,
        formType,
        isSubmitted: isSubmitted === 'true' ? true : isSubmitted === 'false' ? false : undefined,
        dateFrom,
        dateTo,
        limit: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit)
      };

      const reports = await StaffReport.getReportsByStaff(staffId, filters);
      const totalReports = await StaffReport.countDocuments({ staffId });

      res.status(200).json({
        status: 'success',
        data: {
          reports,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalReports / parseInt(limit)),
            totalReports,
            hasNext: parseInt(page) < Math.ceil(totalReports / parseInt(limit)),
            hasPrev: parseInt(page) > 1
          }
        }
      });

    } catch (error) {
      logger.error('Get staff reports error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to fetch reports, please try again later'
      });
    }
  };

  // Get all reports (admin only)
  static getAllReports = async (req, res) => {
    try {
      const { 
        staffId, 
        formType, 
        verificationStatus, 
        isSubmitted, 
        dateFrom, 
        dateTo, 
        page = 1, 
        limit = 50 
      } = req.query;

      const filters = {
        staffId,
        formType,
        verificationStatus,
        isSubmitted: isSubmitted === 'true' ? true : isSubmitted === 'false' ? false : undefined,
        dateFrom,
        dateTo,
        limit: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit)
      };

      const reports = await StaffReport.getAllReports(filters);
      
      // Build query for countDocuments
      const countQuery = {};
      if (filters.staffId) countQuery.staffId = filters.staffId;
      if (filters.formType) countQuery.formType = filters.formType;
      if (filters.verificationStatus) countQuery.verificationStatus = filters.verificationStatus;
      if (filters.isSubmitted !== undefined) countQuery.isSubmitted = filters.isSubmitted;
      if (filters.dateFrom || filters.dateTo) {
        countQuery.createdAt = {};
        if (filters.dateFrom) countQuery.createdAt.$gte = new Date(filters.dateFrom);
        if (filters.dateTo) countQuery.createdAt.$lte = new Date(filters.dateTo);
      }
      const totalReports = await StaffReport.countDocuments(countQuery);

      res.status(200).json({
        status: 'success',
        data: {
          reports,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalReports / parseInt(limit)),
            totalReports,
            hasNext: parseInt(page) < Math.ceil(totalReports / parseInt(limit)),
            hasPrev: parseInt(page) > 1
          }
        }
      });

    } catch (error) {
      logger.error('Get all reports error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to fetch reports, please try again later'
      });
    }
  };

  // Get report by ID
  static getReportById = async (req, res) => {
    try {
      const { reportId } = req.params;
      const staffId = req.user._id;
      const userRole = req.user.role;

      const report = await StaffReport.findById(reportId)
        .populate('formId', 'formTitle formDescription status fields userId')
        .populate('staffId', 'name email role department employeeId')
        .populate('reviewedBy', 'name email role')
        .populate('formId.userId', 'name email');

      if (!report) {
        return res.status(404).json({
          status: 'failed',
          message: 'Report not found'
        });
      }

      // Check permissions
      if (userRole !== 'admin' && report.staffId._id.toString() !== staffId.toString()) {
        return res.status(403).json({
          status: 'failed',
          message: 'You can only view your own reports'
        });
      }

      res.status(200).json({
        status: 'success',
        data: { report }
      });

    } catch (error) {
      logger.error('Get report by ID error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to fetch report, please try again later'
      });
    }
  };

  // Update report (staff only)
  static updateReport = async (req, res) => {
    try {
      const { reportId } = req.params;
      const { verificationStatus, editedData, remarks, stampCalculation, verificationNotes } = req.body;
      const staffId = req.user._id;

      const report = await StaffReport.findById(reportId);
      if (!report) {
        return res.status(404).json({
          status: 'failed',
          message: 'Report not found'
        });
      }

      // Check if staff owns this report
      if (report.staffId.toString() !== staffId.toString()) {
        return res.status(403).json({
          status: 'failed',
          message: 'You can only update your own reports'
        });
      }

      // Check if report is already submitted
      if (report.isSubmitted) {
        return res.status(400).json({
          status: 'failed',
          message: 'Cannot update submitted report'
        });
      }

      // Update report fields
      if (verificationStatus) report.verificationStatus = verificationStatus;
      if (editedData) {
        report.editedData = editedData;
        report.calculateChanges(report.originalData, editedData);
      }
      if (remarks) report.remarks = remarks;
      if (stampCalculation) report.stampCalculation = stampCalculation;
      if (verificationNotes) report.verificationNotes = verificationNotes;

      await report.save();

      // Log the action
      await AuditLog.logAction({
        userId: staffId,
        userRole: req.user.role,
        action: 'staff_report_update',
        resource: 'staff_report',
        resourceId: report._id,
        details: {
          formId: report.formId,
          verificationStatus: report.verificationStatus,
          changesCount: report.changes.length
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(200).json({
        status: 'success',
        message: 'Report updated successfully',
        report: {
          id: report._id,
          verificationStatus: report.verificationStatus,
          changesCount: report.changes.length,
          updatedAt: report.updatedAt
        }
      });

    } catch (error) {
      logger.error('Update report error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to update report, please try again later'
      });
    }
  };

  // Admin: Verify or reject a staff report
  static reviewReport = async (req, res) => {
    try {
      const { reportId } = req.params;
      const { approved, reviewNotes } = req.body;
      const adminId = req.user._id;
      const userRole = req.user.role;

      // Only admin can review reports
      if (userRole !== 'admin') {
        return res.status(403).json({
          status: 'failed',
          message: 'Only admins can review staff reports'
        });
      }

      const report = await StaffReport.findById(reportId);
      if (!report) {
        return res.status(404).json({
          status: 'failed',
          message: 'Report not found'
        });
      }

      // Update report with admin review
      report.verificationStatus = approved ? 'verified' : 'rejected';
      report.reviewedBy = adminId;
      report.reviewedAt = new Date();
      if (reviewNotes) {
        report.reviewNotes = reviewNotes;
      }

      await report.save();

      // Log the action
      await AuditLog.logAction({
        userId: adminId,
        userRole: userRole,
        action: 'admin_review_report',
        resource: 'staff_report',
        resourceId: report._id,
        details: {
          reportType: report.formType,
          staffId: report.staffId,
          action: approved ? 'verified' : 'rejected',
          reviewNotes: reviewNotes
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(200).json({
        status: 'success',
        message: `Report ${approved ? 'verified' : 'rejected'} successfully`,
        data: { report }
      });

    } catch (error) {
      logger.error('Review report error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to review report, please try again later'
      });
    }
  };

  // Get forms assigned to staff
  static getAssignedForms = async (req, res) => {
    try {
      const staffId = req.user._id;
      const { 
        status, 
        formType, 
        page = 1, 
        limit = 20 
      } = req.query;

      const query = { assignedTo: staffId };
      if (status) query.status = status;
      if (formType) query.serviceType = formType;

      const forms = await FormsData.find(query)
        .populate('userId', 'name email')
        .populate('assignedTo', 'name email role')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      const totalForms = await FormsData.countDocuments(query);

      res.status(200).json({
        status: 'success',
        data: {
          forms,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalForms / parseInt(limit)),
            totalForms,
            hasNext: parseInt(page) < Math.ceil(totalForms / parseInt(limit)),
            hasPrev: parseInt(page) > 1
          }
        }
      });

    } catch (error) {
      logger.error('Get assigned forms error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to fetch assigned forms, please try again later'
      });
    }
  };
}

export default StaffReportController;

