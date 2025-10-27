import FormsData from '../models/FormsData.js';
import StaffReport from '../models/StaffReport.js';
import AuditLog from '../models/AuditLog.js';
import logger from '../config/logger.js';

class Staff3Controller {
  /**
   * Get Staff3 dashboard statistics
   */
  static async getDashboardStats(req, res) {
    try {
      const userId = req.user.id;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get forms that need Staff3 verification (land and plot details)
      const pendingLandVerification = await FormsData.countDocuments({
        'approvals.staff1.approved': true,
        'approvals.staff2.approved': true,
        'approvals.staff3.approved': false,
        status: 'under_review',
        $or: [
          { 'data.landOwner': { $exists: true } },
          { 'data.landLocation': { $exists: true } },
          { 'data.surveyNumber': { $exists: true } },
          { 'data.landType': { $exists: true } }
        ]
      });

      const pendingPlotVerification = await FormsData.countDocuments({
        'approvals.staff1.approved': true,
        'approvals.staff2.approved': true,
        'approvals.staff3.approved': false,
        status: 'under_review',
        $or: [
          { 'data.plotNumber': { $exists: true } },
          { 'data.plotSize': { $exists: true } },
          { 'data.plotLength': { $exists: true } },
          { 'data.plotWidth': { $exists: true } },
          { 'data.plotArea': { $exists: true } }
        ]
      });

      const completedVerifications = await FormsData.countDocuments({
        'approvals.staff3.approved': true,
        'approvals.staff3.verifiedBy': userId,
        updatedAt: { $gte: today, $lt: tomorrow }
      });

      const formsCorrected = await FormsData.countDocuments({
        'approvals.staff3.approved': false,
        'approvals.staff3.verifiedBy': userId,
        'approvals.staff3.status': 'needs_correction',
        updatedAt: { $gte: today, $lt: tomorrow }
      });

      const workReportsSubmitted = await StaffReport.countDocuments({
        staffId: userId,
        role: 'staff3',
        date: { $gte: today, $lt: tomorrow }
      });

      const todayTasks = pendingLandVerification + pendingPlotVerification;

      // Calculate weekly progress (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const weeklyCompleted = await FormsData.countDocuments({
        'approvals.staff3.approved': true,
        'approvals.staff3.verifiedBy': userId,
        updatedAt: { $gte: weekAgo }
      });

      const stats = {
        pendingLandVerification,
        pendingPlotVerification,
        completedVerifications,
        formsCorrected,
        workReportsSubmitted,
        todayTasks,
        weeklyProgress: weeklyCompleted
      };

      // Log the action
      await AuditLog.logAction({
        userId: req.user.id,
        userRole: req.user.role,
        action: 'dashboard_view',
        resource: 'staff3_dashboard',
        details: 'Viewed Staff3 dashboard statistics',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        status: 'success',
        data: stats
      });

    } catch (error) {
      logger.error('Error getting Staff3 dashboard stats:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error retrieving dashboard statistics'
      });
    }
  }

  /**
   * Get forms for Staff3 verification
   */
  static async getForms(req, res) {
    try {
      const { page = 1, limit = 10, status, formType, search, verificationType } = req.query;
      const userId = req.user.id;
      
      // Build query for Staff3 forms
      let query = {
        'approvals.staff1.approved': true,
        'approvals.staff2.approved': true,
        'approvals.staff3.approved': false,
        status: 'under_review'
      };

      // Add verification type filter
      if (verificationType === 'land') {
        query.$or = [
          { 'data.landOwner': { $exists: true } },
          { 'data.landLocation': { $exists: true } },
          { 'data.surveyNumber': { $exists: true } },
          { 'data.landType': { $exists: true } }
        ];
      } else if (verificationType === 'plot') {
        query.$or = [
          { 'data.plotNumber': { $exists: true } },
          { 'data.plotSize': { $exists: true } },
          { 'data.plotLength': { $exists: true } },
          { 'data.plotWidth': { $exists: true } },
          { 'data.plotArea': { $exists: true } }
        ];
      }

      // Add other filters
      if (status) query.status = status;
      if (formType) query.formType = formType;
      if (search) {
        query.$or = [
          { _id: { $regex: search, $options: 'i' } },
          { 'data.landOwner': { $regex: search, $options: 'i' } },
          { 'data.plotNumber': { $regex: search, $options: 'i' } },
          { 'data.surveyNumber': { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (page - 1) * limit;
      
      const forms = await FormsData.find(query)
        .populate('userId', 'name email')
        .populate('assignedTo', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await FormsData.countDocuments(query);

      // Filter form data to show only relevant fields for Staff3
      const filteredForms = forms.map(form => {
        const filteredData = {};
        const formData = form.data || {};
        
        // Include land details
        if (formData.landOwner) filteredData.landOwner = formData.landOwner;
        if (formData.landLocation) filteredData.landLocation = formData.landLocation;
        if (formData.landType) filteredData.landType = formData.landType;
        if (formData.surveyNumber) filteredData.surveyNumber = formData.surveyNumber;
        if (formData.landArea) filteredData.landArea = formData.landArea;
        
        // Include plot details
        if (formData.plotNumber) filteredData.plotNumber = formData.plotNumber;
        if (formData.plotSize) filteredData.plotSize = formData.plotSize;
        if (formData.plotLength) filteredData.plotLength = formData.plotLength;
        if (formData.plotWidth) filteredData.plotWidth = formData.plotWidth;
        if (formData.plotArea) filteredData.plotArea = formData.plotArea;
        if (formData.plotBoundaries) filteredData.plotBoundaries = formData.plotBoundaries;

        return {
          ...form.toObject(),
          data: filteredData,
          verificationType: verificationType || 'land'
        };
      });

      // Log the action
      await AuditLog.logAction({
        userId: req.user.id,
        userRole: req.user.role,
        action: 'forms_view',
        resource: 'staff3_forms',
        details: `Viewed forms for Staff3 verification`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        status: 'success',
        data: {
          forms: filteredForms,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total,
            limit: parseInt(limit)
          }
        }
      });

    } catch (error) {
      logger.error('Error getting Staff3 forms:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error retrieving forms'
      });
    }
  }

  /**
   * Get specific form for Staff3 verification
   */
  static async getFormById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const form = await FormsData.findById(id)
        .populate('userId', 'name email')
        .populate('assignedTo', 'name email role');

      if (!form) {
        return res.status(404).json({
          status: 'failed',
          message: 'Form not found'
        });
      }

      // Check if form is ready for Staff3 verification
      if (!form.approvals?.staff1?.approved || !form.approvals?.staff2?.approved) {
        return res.status(403).json({
          status: 'failed',
          message: 'Form is not ready for Staff3 verification'
        });
      }

      // Filter form data to show only relevant fields for Staff3
      const filteredData = {};
      const formData = form.data || {};
      
      // Include land details
      if (formData.landOwner) filteredData.landOwner = formData.landOwner;
      if (formData.landLocation) filteredData.landLocation = formData.landLocation;
      if (formData.landType) filteredData.landType = formData.landType;
      if (formData.surveyNumber) filteredData.surveyNumber = formData.surveyNumber;
      if (formData.landArea) filteredData.landArea = formData.landArea;
      
      // Include plot details
      if (formData.plotNumber) filteredData.plotNumber = formData.plotNumber;
      if (formData.plotSize) filteredData.plotSize = formData.plotSize;
      if (formData.plotLength) filteredData.plotLength = formData.plotLength;
      if (formData.plotWidth) filteredData.plotWidth = formData.plotWidth;
      if (formData.plotArea) filteredData.plotArea = formData.plotArea;
      if (formData.plotBoundaries) filteredData.plotBoundaries = formData.plotBoundaries;

      // Log the action
      await AuditLog.logAction({
        userId: req.user.id,
        userRole: req.user.role,
        action: 'form_view',
        resource: 'staff3_form',
        resourceId: form._id,
        details: `Viewed form ${id} for Staff3 verification`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        status: 'success',
        data: {
          form: {
            ...form.toObject(),
            data: filteredData
          }
        }
      });

    } catch (error) {
      logger.error('Error getting Staff3 form by ID:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error retrieving form'
      });
    }
  }

  /**
   * Verify form by Staff3
   */
  static async verifyForm(req, res) {
    try {
      const { id } = req.params;
      const { approved, verificationNotes, verificationType, updatedFields } = req.body;
      const userId = req.user.id;

      const form = await FormsData.findById(id);
      if (!form) {
        return res.status(404).json({
          status: 'failed',
          message: 'Form not found'
        });
      }

      // Update form with Staff3 verification
      const updateData = {
        'approvals.staff3': {
          approved,
          verifiedBy: userId,
          verifiedAt: new Date(),
          notes: verificationNotes,
          verificationType: verificationType || 'land'
        }
      };

      // If approved, update form data with any corrections
      if (approved && updatedFields) {
        updateData.data = { ...form.data, ...updatedFields };
      }

      // Update form status
      if (approved) {
        updateData.status = 'under_review'; // Move to next stage
        updateData['approvals.staff3.status'] = 'verified';
      } else {
        updateData.status = 'needs_correction';
        updateData['approvals.staff3.status'] = 'needs_correction';
      }

      const updatedForm = await FormsData.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      // Log the action
      await AuditLog.logAction({
        userId: req.user.id,
        userRole: req.user.role,
        action: 'form_verify',
        resource: 'staff3_form',
        resourceId: form._id,
        details: `Staff3 ${approved ? 'approved' : 'rejected'} form verification`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        status: 'success',
        message: `Form ${approved ? 'verified' : 'marked for correction'} successfully`,
        data: { form: updatedForm }
      });

    } catch (error) {
      logger.error('Error verifying Staff3 form:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error processing verification'
      });
    }
  }

  /**
   * Update form fields by Staff3
   */
  static async updateForm(req, res) {
    try {
      const { id } = req.params;
      const { updatedFields, verificationType, updateNotes } = req.body;
      const userId = req.user.id;

      const form = await FormsData.findById(id);
      if (!form) {
        return res.status(404).json({
          status: 'failed',
          message: 'Form not found'
        });
      }

      // Update form data with Staff3 corrections
      const updateData = {
        data: { ...form.data, ...updatedFields },
        'approvals.staff3.lastUpdatedBy': userId,
        'approvals.staff3.lastUpdatedAt': new Date(),
        'approvals.staff3.updateNotes': updateNotes,
        'approvals.staff3.verificationType': verificationType
      };

      const updatedForm = await FormsData.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      // Log the action
      await AuditLog.logAction({
        userId: req.user.id,
        userRole: req.user.role,
        action: 'form_update',
        resource: 'staff3_form',
        resourceId: form._id,
        details: `Staff3 updated form fields`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        status: 'success',
        message: 'Form updated successfully',
        data: { form: updatedForm }
      });

    } catch (error) {
      logger.error('Error updating Staff3 form:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error updating form'
      });
    }
  }

  /**
   * Get work data for Staff3 report
   */
  static async getWorkData(req, res) {
    try {
      const { date } = req.query;
      const userId = req.user.id;
      
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Get forms processed by Staff3 on the given date
      const verifiedForms = await FormsData.find({
        'approvals.staff3.verifiedBy': userId,
        'approvals.staff3.approved': true,
        'approvals.staff3.verifiedAt': { $gte: startOfDay, $lte: endOfDay }
      }).select('_id');

      const correctedForms = await FormsData.find({
        'approvals.staff3.verifiedBy': userId,
        'approvals.staff3.approved': false,
        'approvals.staff3.status': 'needs_correction',
        'approvals.staff3.verifiedAt': { $gte: startOfDay, $lte: endOfDay }
      }).select('_id');

      const landVerifications = await FormsData.countDocuments({
        'approvals.staff3.verifiedBy': userId,
        'approvals.staff3.verificationType': 'land',
        'approvals.staff3.verifiedAt': { $gte: startOfDay, $lte: endOfDay }
      });

      const plotVerifications = await FormsData.countDocuments({
        'approvals.staff3.verifiedBy': userId,
        'approvals.staff3.verificationType': 'plot',
        'approvals.staff3.verifiedAt': { $gte: startOfDay, $lte: endOfDay }
      });

      const totalFormsProcessed = verifiedForms.length + correctedForms.length;

      res.json({
        status: 'success',
        data: {
          verifiedForms: verifiedForms.map(f => f._id),
          correctedForms: correctedForms.map(f => f._id),
          landVerifications,
          plotVerifications,
          totalFormsProcessed
        }
      });

    } catch (error) {
      logger.error('Error getting Staff3 work data:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error retrieving work data'
      });
    }
  }

  /**
   * Submit Staff3 work report
   */
  static async submitWorkReport(req, res) {
    try {
      const { date, verifiedForms, correctedForms, workNotes, challenges, recommendations } = req.body;
      const userId = req.user.id;

      // Create work report
      const workReport = new StaffReport({
        staffId: userId,
        role: 'staff3',
        date: new Date(date),
        verifiedForms,
        correctedForms,
        workNotes,
        challenges,
        recommendations,
        submittedAt: new Date()
      });

      await workReport.save();

      // Log the action
      await AuditLog.logAction({
        userId: req.user.id,
        userRole: req.user.role,
        action: 'work_report_submit',
        resource: 'staff3_report',
        details: `Submitted work report for ${date}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        status: 'success',
        message: 'Work report submitted successfully',
        data: { workReport }
      });

    } catch (error) {
      logger.error('Error submitting Staff3 work report:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error submitting work report'
      });
    }
  }
}

export default Staff3Controller;
