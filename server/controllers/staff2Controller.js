import FormsData from '../models/FormsData.js';
import StaffReport from '../models/StaffReport.js';
import AuditLog from '../models/AuditLog.js';
import logger from '../config/logger.js';

class Staff2Controller {
  /**
   * Get Staff2 dashboard statistics
   */
  static async getDashboardStats(req, res) {
    try {
      const userId = req.user.id;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get forms that need Staff2 verification (trustee details and amounts)
      const pendingTrusteeVerification = await FormsData.countDocuments({
        'approvals.staff1.approved': true,
        'approvals.staff2.approved': false,
        status: 'under_review',
        'data.trusteeName': { $exists: true }
      });

      const pendingAmountVerification = await FormsData.countDocuments({
        'approvals.staff1.approved': true,
        'approvals.staff2.approved': false,
        status: 'under_review',
        $or: [
          { 'data.propertyValue': { $exists: true } },
          { 'data.stampDuty': { $exists: true } },
          { 'data.registrationFee': { $exists: true } }
        ]
      });

      const completedVerifications = await FormsData.countDocuments({
        'approvals.staff2.approved': true,
        'approvals.staff2.verifiedBy': userId,
        updatedAt: { $gte: today, $lt: tomorrow }
      });

      const formsCorrected = await FormsData.countDocuments({
        'approvals.staff2.approved': false,
        'approvals.staff2.verifiedBy': userId,
        'approvals.staff2.status': 'needs_correction',
        updatedAt: { $gte: today, $lt: tomorrow }
      });

      const workReportsSubmitted = await StaffReport.countDocuments({
        staffId: userId,
        role: 'staff2',
        date: { $gte: today, $lt: tomorrow }
      });

      const todayTasks = pendingTrusteeVerification + pendingAmountVerification;

      // Calculate weekly progress (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const weeklyCompleted = await FormsData.countDocuments({
        'approvals.staff2.approved': true,
        'approvals.staff2.verifiedBy': userId,
        updatedAt: { $gte: weekAgo }
      });

      const stats = {
        pendingTrusteeVerification,
        pendingAmountVerification,
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
        resource: 'staff2_dashboard',
        details: 'Viewed Staff2 dashboard statistics',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        status: 'success',
        data: stats
      });

    } catch (error) {
      logger.error('Error getting Staff2 dashboard stats:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error retrieving dashboard statistics'
      });
    }
  }

  /**
   * Get forms for Staff2 verification
   */
  static async getForms(req, res) {
    try {
      const { page = 1, limit = 10, status, formType, search, verificationType } = req.query;
      const userId = req.user.id;
      
      // Build query for Staff2 forms
      let query = {
        'approvals.staff1.approved': true,
        'approvals.staff2.approved': false,
        status: 'under_review'
      };

      // Add verification type filter
      if (verificationType === 'trustee') {
        query['data.trusteeName'] = { $exists: true };
      } else if (verificationType === 'amount') {
        query.$or = [
          { 'data.propertyValue': { $exists: true } },
          { 'data.stampDuty': { $exists: true } },
          { 'data.registrationFee': { $exists: true } }
        ];
      }

      // Add other filters
      if (status) query.status = status;
      if (formType) query.formType = formType;
      if (search) {
        query.$or = [
          { _id: { $regex: search, $options: 'i' } },
          { 'data.trusteeName': { $regex: search, $options: 'i' } },
          { 'data.trusteePhone': { $regex: search, $options: 'i' } }
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

      // Filter form data to show only relevant fields for Staff2
      const filteredForms = forms.map(form => {
        const filteredData = {};
        const formData = form.data || {};
        
        // Include trustee details
        if (formData.trusteeName) filteredData.trusteeName = formData.trusteeName;
        if (formData.trusteePhone) filteredData.trusteePhone = formData.trusteePhone;
        if (formData.trusteeAddress) filteredData.trusteeAddress = formData.trusteeAddress;
        if (formData.trusteeIdType) filteredData.trusteeIdType = formData.trusteeIdType;
        if (formData.trusteeIdNumber) filteredData.trusteeIdNumber = formData.trusteeIdNumber;
        
        // Include amount details
        if (formData.propertyValue) filteredData.propertyValue = formData.propertyValue;
        if (formData.stampDuty) filteredData.stampDuty = formData.stampDuty;
        if (formData.registrationFee) filteredData.registrationFee = formData.registrationFee;
        if (formData.totalAmount) filteredData.totalAmount = formData.totalAmount;
        if (formData.amount) filteredData.amount = formData.amount;

        return {
          ...form.toObject(),
          data: filteredData,
          verificationType: verificationType || 'trustee'
        };
      });

      // Log the action
      await AuditLog.logAction({
        userId: req.user.id,
        userRole: req.user.role,
        action: 'forms_view',
        resource: 'staff2_forms',
        details: `Viewed forms for Staff2 verification`,
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
      logger.error('Error getting Staff2 forms:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error retrieving forms'
      });
    }
  }

  /**
   * Get specific form for Staff2 verification
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

      // Check if form is ready for Staff2 verification
      if (!form.approvals?.staff1?.approved) {
        return res.status(403).json({
          status: 'failed',
          message: 'Form is not ready for Staff2 verification'
        });
      }

      // Filter form data to show only relevant fields for Staff2
      const filteredData = {};
      const formData = form.data || {};
      
      // Include trustee details
      if (formData.trusteeName) filteredData.trusteeName = formData.trusteeName;
      if (formData.trusteePhone) filteredData.trusteePhone = formData.trusteePhone;
      if (formData.trusteeAddress) filteredData.trusteeAddress = formData.trusteeAddress;
      if (formData.trusteeIdType) filteredData.trusteeIdType = formData.trusteeIdType;
      if (formData.trusteeIdNumber) filteredData.trusteeIdNumber = formData.trusteeIdNumber;
      
      // Include amount details
      if (formData.propertyValue) filteredData.propertyValue = formData.propertyValue;
      if (formData.stampDuty) filteredData.stampDuty = formData.stampDuty;
      if (formData.registrationFee) filteredData.registrationFee = formData.registrationFee;
      if (formData.totalAmount) filteredData.totalAmount = formData.totalAmount;
      if (formData.amount) filteredData.amount = formData.amount;

      // Log the action
      await AuditLog.logAction({
        userId: req.user.id,
        userRole: req.user.role,
        action: 'form_view',
        resource: 'staff2_form',
        resourceId: form._id,
        details: `Viewed form ${id} for Staff2 verification`,
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
      logger.error('Error getting Staff2 form by ID:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error retrieving form'
      });
    }
  }

  /**
   * Verify form by Staff2
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

      // Update form with Staff2 verification
      const updateData = {
        'approvals.staff2': {
          approved,
          verifiedBy: userId,
          verifiedAt: new Date(),
          notes: verificationNotes,
          verificationType: verificationType || 'trustee'
        }
      };

      // If approved, update form data with any corrections
      if (approved && updatedFields) {
        updateData.data = { ...form.data, ...updatedFields };
      }

      // Update form status
      if (approved) {
        updateData.status = 'under_review'; // Move to next stage
        updateData['approvals.staff2.status'] = 'verified';
      } else {
        updateData.status = 'needs_correction';
        updateData['approvals.staff2.status'] = 'needs_correction';
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
        resource: 'staff2_form',
        resourceId: form._id,
        details: `Staff2 ${approved ? 'approved' : 'rejected'} form verification`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        status: 'success',
        message: `Form ${approved ? 'verified' : 'marked for correction'} successfully`,
        data: { form: updatedForm }
      });

    } catch (error) {
      logger.error('Error verifying Staff2 form:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error processing verification'
      });
    }
  }

  /**
   * Update form fields by Staff2
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

      // Update form data with Staff2 corrections
      const updateData = {
        data: { ...form.data, ...updatedFields },
        'approvals.staff2.lastUpdatedBy': userId,
        'approvals.staff2.lastUpdatedAt': new Date(),
        'approvals.staff2.updateNotes': updateNotes,
        'approvals.staff2.verificationType': verificationType
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
        resource: 'staff2_form',
        resourceId: form._id,
        details: `Staff2 updated form fields`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        status: 'success',
        message: 'Form updated successfully',
        data: { form: updatedForm }
      });

    } catch (error) {
      logger.error('Error updating Staff2 form:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error updating form'
      });
    }
  }

  /**
   * Get work data for Staff2 report
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

      // Get forms processed by Staff2 on the given date
      const verifiedForms = await FormsData.find({
        'approvals.staff2.verifiedBy': userId,
        'approvals.staff2.approved': true,
        'approvals.staff2.verifiedAt': { $gte: startOfDay, $lte: endOfDay }
      }).select('_id');

      const correctedForms = await FormsData.find({
        'approvals.staff2.verifiedBy': userId,
        'approvals.staff2.approved': false,
        'approvals.staff2.status': 'needs_correction',
        'approvals.staff2.verifiedAt': { $gte: startOfDay, $lte: endOfDay }
      }).select('_id');

      const trusteeVerifications = await FormsData.countDocuments({
        'approvals.staff2.verifiedBy': userId,
        'approvals.staff2.verificationType': 'trustee',
        'approvals.staff2.verifiedAt': { $gte: startOfDay, $lte: endOfDay }
      });

      const amountVerifications = await FormsData.countDocuments({
        'approvals.staff2.verifiedBy': userId,
        'approvals.staff2.verificationType': 'amount',
        'approvals.staff2.verifiedAt': { $gte: startOfDay, $lte: endOfDay }
      });

      const totalFormsProcessed = verifiedForms.length + correctedForms.length;

      res.json({
        status: 'success',
        data: {
          verifiedForms: verifiedForms.map(f => f._id),
          correctedForms: correctedForms.map(f => f._id),
          trusteeVerifications,
          amountVerifications,
          totalFormsProcessed
        }
      });

    } catch (error) {
      logger.error('Error getting Staff2 work data:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error retrieving work data'
      });
    }
  }

  /**
   * Submit Staff2 work report
   */
  static async submitWorkReport(req, res) {
    try {
      const { date, verifiedForms, correctedForms, workNotes, challenges, recommendations } = req.body;
      const userId = req.user.id;

      // Create work report
      const workReport = new StaffReport({
        staffId: userId,
        role: 'staff2',
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
        resource: 'staff2_report',
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
      logger.error('Error submitting Staff2 work report:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error submitting work report'
      });
    }
  }
}

export default Staff2Controller;
