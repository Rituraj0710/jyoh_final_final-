import FormsData from '../models/FormsData.js';
import StaffReport from '../models/StaffReport.js';
import AuditLog from '../models/AuditLog.js';
import logger from '../config/logger.js';

class Staff4Controller {
  /**
   * Get Staff4 dashboard statistics
   */
  static async getDashboardStats(req, res) {
    try {
      const userId = req.user.id;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get forms that need Staff4 cross-verification (all staff levels complete)
      const pendingCrossVerification = await FormsData.countDocuments({
        'approvals.staff1.approved': true,
        'approvals.staff2.approved': true,
        'approvals.staff3.approved': true,
        'approvals.staff4.approved': false,
        status: 'under_review'
      });

      const formsVerified = await FormsData.countDocuments({
        'approvals.staff4.approved': true,
        'approvals.staff4.verifiedBy': userId,
        updatedAt: { $gte: today, $lt: tomorrow }
      });

      const formsCorrected = await FormsData.countDocuments({
        'approvals.staff4.correctionsMade': { $exists: true, $ne: [] },
        'approvals.staff4.verifiedBy': userId,
        updatedAt: { $gte: today, $lt: tomorrow }
      });

      const formsRejected = await FormsData.countDocuments({
        'approvals.staff4.approved': false,
        'approvals.staff4.status': 'needs_correction',
        'approvals.staff4.verifiedBy': userId,
        updatedAt: { $gte: today, $lt: tomorrow }
      });

      const workReportsSubmitted = await StaffReport.countDocuments({
        staffId: userId,
        role: 'staff4',
        date: { $gte: today, $lt: tomorrow }
      });

      const todayTasks = pendingCrossVerification;

      // Calculate weekly progress (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const weeklyCompleted = await FormsData.countDocuments({
        'approvals.staff4.approved': true,
        'approvals.staff4.verifiedBy': userId,
        updatedAt: { $gte: weekAgo }
      });

      const stats = {
        pendingCrossVerification,
        formsVerified,
        formsCorrected,
        formsRejected,
        workReportsSubmitted,
        todayTasks,
        weeklyProgress: weeklyCompleted
      };

      // Log the action
      await AuditLog.logAction({
        userId: req.user.id,
        userRole: req.user.role,
        action: 'dashboard_view',
        resource: 'staff4_dashboard',
        details: 'Viewed Staff4 dashboard statistics',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        status: 'success',
        data: stats
      });

    } catch (error) {
      logger.error('Error getting Staff4 dashboard stats:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error retrieving dashboard statistics'
      });
    }
  }

  /**
   * Get forms for Staff4 cross-verification
   */
  static async getForms(req, res) {
    try {
      const { page = 1, limit = 10, status, formType, search, verificationStage } = req.query;
      const userId = req.user.id;
      
      // Build query for Staff4 forms - can see all forms that have passed Staff1-3
      let query = {
        'approvals.staff1.approved': true,
        'approvals.staff2.approved': true,
        'approvals.staff3.approved': true
      };

      // Add verification stage filter
      if (verificationStage === 'staff1_complete') {
        query = {
          'approvals.staff1.approved': true,
          'approvals.staff2.approved': false
        };
      } else if (verificationStage === 'staff2_complete') {
        query = {
          'approvals.staff1.approved': true,
          'approvals.staff2.approved': true,
          'approvals.staff3.approved': false
        };
      } else if (verificationStage === 'staff3_complete') {
        query = {
          'approvals.staff1.approved': true,
          'approvals.staff2.approved': true,
          'approvals.staff3.approved': true,
          'approvals.staff4.approved': false
        };
      } else if (verificationStage === 'all_complete') {
        query = {
          'approvals.staff1.approved': true,
          'approvals.staff2.approved': true,
          'approvals.staff3.approved': true
        };
      }

      // Add other filters
      if (status) query.status = status;
      if (formType) query.formType = formType;
      if (search) {
        query.$or = [
          { _id: { $regex: search, $options: 'i' } },
          { 'data.applicantName': { $regex: search, $options: 'i' } },
          { 'data.trusteeName': { $regex: search, $options: 'i' } },
          { 'data.landOwner': { $regex: search, $options: 'i' } },
          { 'data.plotNumber': { $regex: search, $options: 'i' } }
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

      // Staff4 can see ALL form data (no filtering)
      const processedForms = forms.map(form => ({
        ...form.toObject(),
        // Include all form data for Staff4 cross-verification
        data: form.data || {}
      }));

      // Log the action
      await AuditLog.logAction({
        userId: req.user.id,
        userRole: req.user.role,
        action: 'forms_view',
        resource: 'staff4_forms',
        details: `Viewed forms for Staff4 cross-verification`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        status: 'success',
        data: {
          forms: processedForms,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total,
            limit: parseInt(limit)
          }
        }
      });

    } catch (error) {
      logger.error('Error getting Staff4 forms:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error retrieving forms'
      });
    }
  }

  /**
   * Get specific form for Staff4 cross-verification
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

      // Check if form is ready for Staff4 cross-verification
      if (!form.approvals?.staff1?.approved || !form.approvals?.staff2?.approved || !form.approvals?.staff3?.approved) {
        return res.status(403).json({
          status: 'failed',
          message: 'Form is not ready for Staff4 cross-verification. All previous staff levels must be complete.'
        });
      }

      // Staff4 can see ALL form data (no filtering)
      const processedForm = {
        ...form.toObject(),
        data: form.data || {}
      };

      // Log the action
      await AuditLog.logAction({
        userId: req.user.id,
        userRole: req.user.role,
        action: 'form_view',
        resource: 'staff4_form',
        resourceId: form._id,
        details: `Viewed form ${id} for Staff4 cross-verification`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        status: 'success',
        data: {
          form: processedForm
        }
      });

    } catch (error) {
      logger.error('Error getting Staff4 form by ID:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error retrieving form'
      });
    }
  }

  /**
   * Cross-verify form by Staff4
   */
  static async crossVerifyForm(req, res) {
    try {
      const { id } = req.params;
      const { approved, verificationNotes, updatedFields, corrections } = req.body;
      const userId = req.user.id;

      const form = await FormsData.findById(id);
      if (!form) {
        return res.status(404).json({
          status: 'failed',
          message: 'Form not found'
        });
      }

      // Check if form is ready for Staff4 cross-verification
      if (!form.approvals?.staff1?.approved || !form.approvals?.staff2?.approved || !form.approvals?.staff3?.approved) {
        return res.status(403).json({
          status: 'failed',
          message: 'Form is not ready for Staff4 cross-verification'
        });
      }

      // Update form with Staff4 cross-verification
      const updateData = {
        'approvals.staff4': {
          approved,
          verifiedBy: userId,
          verifiedAt: new Date(),
          notes: verificationNotes,
          correctionsMade: corrections || []
        }
      };

      // If approved and there are corrections, update form data
      if (approved && updatedFields) {
        updateData.data = { ...form.data, ...updatedFields };
        updateData['approvals.staff4.correctionsMade'] = corrections || [];
      }

      // Update form status
      if (approved) {
        updateData.status = 'cross_verified';
        updateData['approvals.staff4.status'] = 'verified';
      } else {
        updateData.status = 'needs_correction';
        updateData['approvals.staff4.status'] = 'needs_correction';
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
        action: 'form_cross_verify',
        resource: 'staff4_form',
        resourceId: form._id,
        details: `Staff4 ${approved ? 'cross-verified' : 'rejected'} form with ${corrections?.length || 0} corrections`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        status: 'success',
        message: `Form ${approved ? 'cross-verified' : 'marked for correction'} successfully`,
        data: { form: updatedForm }
      });

    } catch (error) {
      logger.error('Error cross-verifying Staff4 form:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error processing cross-verification'
      });
    }
  }

  /**
   * Update form fields by Staff4
   */
  static async updateForm(req, res) {
    try {
      const { id } = req.params;
      const { updatedFields, updateNotes, corrections } = req.body;
      const userId = req.user.id;

      const form = await FormsData.findById(id);
      if (!form) {
        return res.status(404).json({
          status: 'failed',
          message: 'Form not found'
        });
      }

      // Update form data with Staff4 corrections
      const updateData = {
        data: { ...form.data, ...updatedFields },
        'approvals.staff4.lastUpdatedBy': userId,
        'approvals.staff4.lastUpdatedAt': new Date(),
        'approvals.staff4.updateNotes': updateNotes,
        'approvals.staff4.correctionsMade': corrections || []
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
        resource: 'staff4_form',
        resourceId: form._id,
        details: `Staff4 updated form fields with ${corrections?.length || 0} corrections`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        status: 'success',
        message: 'Form updated successfully',
        data: { form: updatedForm }
      });

    } catch (error) {
      logger.error('Error updating Staff4 form:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error updating form'
      });
    }
  }

  /**
   * Get work data for Staff4 report
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

      // Get forms processed by Staff4 on the given date
      const formsCrossVerified = await FormsData.find({
        'approvals.staff4.verifiedBy': userId,
        'approvals.staff4.approved': true,
        'approvals.staff4.verifiedAt': { $gte: startOfDay, $lte: endOfDay }
      }).select('_id');

      const formsCorrected = await FormsData.find({
        'approvals.staff4.verifiedBy': userId,
        'approvals.staff4.correctionsMade': { $exists: true, $ne: [] },
        'approvals.staff4.verifiedAt': { $gte: startOfDay, $lte: endOfDay }
      }).select('_id');

      const formsRejected = await FormsData.find({
        'approvals.staff4.verifiedBy': userId,
        'approvals.staff4.approved': false,
        'approvals.staff4.status': 'needs_correction',
        'approvals.staff4.verifiedAt': { $gte: startOfDay, $lte: endOfDay }
      }).select('_id');

      const totalFormsProcessed = formsCrossVerified.length + formsCorrected.length + formsRejected.length;

      // Get corrections made
      const correctionsMade = await FormsData.aggregate([
        {
          $match: {
            'approvals.staff4.verifiedBy': userId,
            'approvals.staff4.verifiedAt': { $gte: startOfDay, $lte: endOfDay }
          }
        },
        {
          $unwind: '$approvals.staff4.correctionsMade'
        },
        {
          $project: {
            formId: '$_id',
            corrections: '$approvals.staff4.correctionsMade'
          }
        }
      ]);

      res.json({
        status: 'success',
        data: {
          formsCrossVerified: formsCrossVerified.map(f => f._id),
          formsCorrected: formsCorrected.map(f => f._id),
          formsRejected: formsRejected.map(f => f._id),
          totalFormsProcessed,
          correctionsMade: correctionsMade.map(c => c.corrections)
        }
      });

    } catch (error) {
      logger.error('Error getting Staff4 work data:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error retrieving work data'
      });
    }
  }

  /**
   * Submit Staff4 cross-verification report
   */
  static async submitCrossVerificationReport(req, res) {
    try {
      const { 
        date, 
        formsCrossVerified, 
        formsCorrected, 
        formsRejected, 
        verificationNotes, 
        qualityScore, 
        recommendations 
      } = req.body;
      const userId = req.user.id;

      // Create cross-verification report
      const report = new StaffReport({
        staffId: userId,
        role: 'staff4',
        date: new Date(date),
        formsCrossVerified,
        formsCorrected,
        formsRejected,
        verificationNotes,
        qualityScore,
        recommendations,
        reportType: 'cross_verification',
        submittedAt: new Date()
      });

      await report.save();

      // Log the action
      await AuditLog.logAction({
        userId: req.user.id,
        userRole: req.user.role,
        action: 'cross_verification_report_submit',
        resource: 'staff4_report',
        details: `Submitted cross-verification report for ${date}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        status: 'success',
        message: 'Cross-verification report submitted successfully',
        data: { report }
      });

    } catch (error) {
      logger.error('Error submitting Staff4 cross-verification report:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error submitting cross-verification report'
      });
    }
  }
}

export default Staff4Controller;
