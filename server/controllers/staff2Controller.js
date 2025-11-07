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
      // Staff2 verifies: Seller Details, Buyer Details, Witness Details, Payment/Stamp Amount
      let query = {
        'approvals.staff1.approved': true,
        'approvals.staff2.approved': false,
        status: 'under_review'
      };

      // Add other filters
      if (status) query.status = status;
      if (formType) {
        // Map formType to serviceType (FormsData uses serviceType, not formType)
        const serviceTypeMap = {
          'sale-deed': 'sale-deed',
          'will-deed': 'will-deed',
          'trust-deed': 'trust-deed',
          'property-registration': 'property-registration',
          'property-sale-certificate': 'property-sale-certificate',
          'power-of-attorney': 'power-of-attorney',
          'adoption-deed': 'adoption-deed'
        };
        if (serviceTypeMap[formType]) {
          query.serviceType = serviceTypeMap[formType];
        }
      }
      
      // Search filter - search across multiple fields
      if (search) {
        query.$or = [
          { _id: { $regex: search, $options: 'i' } },
          { serviceType: { $regex: search, $options: 'i' } },
          { 'userId.name': { $regex: search, $options: 'i' } },
          { 'userId.email': { $regex: search, $options: 'i' } }
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

      // Return all forms - no filtering needed, detail page will show sellers/buyers/witnesses/payment
      const formsList = forms.map(form => form.toObject());

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
          forms: formsList,
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
   * Fetches complete form data from both FormsData and the original collection
   */
  static async getFormById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Get FormsData document
      const formsDataDoc = await FormsData.findById(id)
        .populate('userId', 'name email role phone')
        .populate('assignedTo', 'name email role')
        .populate('verifiedBy', 'name email role')
        .populate('lastActivityBy', 'name email role');

      if (!formsDataDoc) {
        return res.status(404).json({
          status: 'failed',
          message: 'Form not found'
        });
      }

      // Check if form is ready for Staff2 verification
      if (!formsDataDoc.approvals?.staff1?.approved) {
        return res.status(403).json({
          status: 'failed',
          message: 'Form is not ready for Staff2 verification. Staff1 must verify first.'
        });
      }

      // Check if Staff2 has already verified
      if (formsDataDoc.approvals?.staff2?.approved) {
        return res.status(403).json({
          status: 'failed',
          message: 'Form already verified by Staff2'
        });
      }

      // Fetch original form data from the dedicated collection
      let originalFormData = null;
      try {
        const formId = formsDataDoc.formId;
        const serviceType = formsDataDoc.serviceType;

        if (formId && serviceType) {
          // Map service type to model
          const modelMap = {
            'will-deed': (await import('../models/WillDeed.js')).default,
            'sale-deed': (await import('../models/SaleDeed.js')).default,
            'trust-deed': (await import('../models/TrustDeed.js')).default,
            'power-of-attorney': (await import('../models/PowerOfAttorney.js')).default,
            'adoption-deed': (await import('../models/AdoptionDeed.js')).default,
            'property-registration': (await import('../models/PropertyRegistration.js')).default,
            'property-sale-certificate': (await import('../models/PropertySaleCertificate.js')).default
          };

          const Model = modelMap[serviceType];
          if (Model) {
            originalFormData = await Model.findById(formId);
          }
        }
      } catch (originalError) {
        logger.warn('Error fetching original form data for Staff2:', originalError);
        // Continue without original form data
      }

      // Extract seller, buyer, witness details from original form or FormsData
      const allFormData = {
        ...formsDataDoc.fields,
        ...formsDataDoc.data,
        ...(originalFormData ? originalFormData.toObject() : {})
      };

      // Extract relevant data for Staff2 verification
      const sellerData = allFormData.sellers || [];
      const buyerData = allFormData.buyers || [];
      const witnessData = allFormData.witnesses || [];
      
      // Extract payment/stamp information
      const paymentInfo = {
        salePrice: allFormData.salePrice || allFormData.amount || 0,
        circleRateAmount: allFormData.circleRateAmount || 0,
        stampDuty: formsDataDoc.paymentInfo?.calculations?.stampDuty || allFormData.stampDuty || allFormData.calculations?.stampDuty || 0,
        registrationCharge: formsDataDoc.paymentInfo?.calculations?.registrationCharge || allFormData.registrationCharge || allFormData.calculations?.registrationCharge || 0,
        courtFee: formsDataDoc.paymentInfo?.calculations?.courtFee || allFormData.courtFee || allFormData.calculations?.courtFee || 0,
        totalPayable: formsDataDoc.paymentInfo?.calculations?.totalPayable || allFormData.totalPayable || allFormData.calculations?.totalPayable || 0,
        paymentStatus: formsDataDoc.paymentInfo?.paymentStatus || 'pending',
        paymentAmount: formsDataDoc.paymentInfo?.paymentAmount || 0,
        paymentTransactionId: formsDataDoc.paymentInfo?.paymentTransactionId || null
      };

      // Merge all data into a unified object
      const completeFormData = {
        ...formsDataDoc.toObject(),
        originalFormData: originalFormData ? originalFormData.toObject() : null,
        allFields: allFormData,
        // Staff2 specific verification data
        verificationData: {
          sellers: sellerData,
          buyers: buyerData,
          witnesses: witnessData,
          paymentInfo: paymentInfo
        }
      };

      // Log the action
      await AuditLog.logAction({
        userId: req.user.id,
        userRole: req.user.role,
        action: 'form_view',
        resource: 'staff2_form',
        resourceId: formsDataDoc._id,
        details: `Staff2 viewed form ${formsDataDoc.serviceType} for verification`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        status: 'success',
        data: {
          form: completeFormData
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

      // Check if already verified by Staff2
      if (form.approvals?.staff2?.approved) {
        return res.status(400).json({
          status: 'failed',
          message: 'Form already verified by Staff2'
        });
      }

      // Check if Staff1 has verified
      if (!form.approvals?.staff1?.approved) {
        return res.status(403).json({
          status: 'failed',
          message: 'Form must be verified by Staff1 before Staff2 verification'
        });
      }

      // Build $set update object for MongoDB
      // Note: verificationType enum is ['trustee', 'amount'] - use 'amount' for sale-deed seller/buyer/witness/payment verification
      const validVerificationType = verificationType && ['trustee', 'amount'].includes(verificationType) 
        ? verificationType 
        : (form.serviceType === 'sale-deed' ? 'amount' : 'trustee');
      
      const $set = {
        'approvals.staff2.approved': approved,
        'approvals.staff2.verifiedBy': userId,
        'approvals.staff2.verifiedAt': new Date(),
        'approvals.staff2.notes': verificationNotes || (approved ? 'Verified by Staff2' : 'Rejected by Staff2'),
        'approvals.staff2.verificationType': validVerificationType,
        'approvals.staff2.lastUpdatedBy': userId,
        'approvals.staff2.lastUpdatedAt': new Date(),
        lastActivityBy: userId,
        lastActivityAt: new Date()
      };

      // Update form status based on approval
      if (approved) {
        $set.status = 'under_review'; // Move to Staff3 (next stage)
        $set['approvals.staff2.status'] = 'verified';
      } else {
        $set.status = 'needs_correction';
        $set['approvals.staff2.status'] = 'needs_correction';
      }

      // If approved, update form data with any corrections
      // Also update original form collection if formId exists
      if (approved && updatedFields) {
        // Merge updatedFields with existing form.data
        const updatedData = { ...form.data, ...updatedFields };
        $set.data = updatedData;
        
        // Update original form collection with seller/buyer/witness/payment changes
        if (form.formId && form.serviceType) {
          try {
            const modelMap = {
              'will-deed': (await import('../models/WillDeed.js')).default,
              'sale-deed': (await import('../models/SaleDeed.js')).default,
              'trust-deed': (await import('../models/TrustDeed.js')).default,
              'power-of-attorney': (await import('../models/PowerOfAttorney.js')).default,
              'adoption-deed': (await import('../models/AdoptionDeed.js')).default,
              'property-registration': (await import('../models/PropertyRegistration.js')).default,
              'property-sale-certificate': (await import('../models/PropertySaleCertificate.js')).default
            };

            const OriginalModel = modelMap[form.serviceType];
            if (OriginalModel) {
              const originalUpdate = {};
              
              // Update sellers if provided
              if (updatedFields.sellers) {
                originalUpdate.sellers = updatedFields.sellers;
              }
              
              // Update buyers if provided
              if (updatedFields.buyers) {
                originalUpdate.buyers = updatedFields.buyers;
              }
              
              // Update witnesses if provided
              if (updatedFields.witnesses) {
                originalUpdate.witnesses = updatedFields.witnesses;
              }
              
              // Update payment/stamp info if provided
              if (updatedFields.paymentInfo) {
                Object.keys(updatedFields.paymentInfo).forEach(key => {
                  if (key === 'stampDuty') originalUpdate.stampDuty = updatedFields.paymentInfo[key];
                  else if (key === 'salePrice') originalUpdate.salePrice = updatedFields.paymentInfo[key];
                  else if (key === 'circleRateAmount') originalUpdate.circleRateAmount = updatedFields.paymentInfo[key];
                  else if (key === 'registrationCharge') originalUpdate.registrationCharge = updatedFields.paymentInfo[key];
                  else if (key === 'totalPayable') originalUpdate.totalPayable = updatedFields.paymentInfo[key];
                });
              }

              if (Object.keys(originalUpdate).length > 0) {
                await OriginalModel.findByIdAndUpdate(
                  form.formId,
                  { $set: originalUpdate },
                  { runValidators: false, new: true }
                );
                logger.info(`Updated original ${form.serviceType} form ${form.formId} with Staff2 corrections`);
              }
            }
          } catch (originalUpdateError) {
            logger.warn('Error updating original form collection:', originalUpdateError);
            // Continue even if original update fails - FormsData is the source of truth
          }
        }
      }

      // Update form using $set operator for nested fields
      const updatedForm = await FormsData.findByIdAndUpdate(
        id,
        { $set },
        { new: true, runValidators: false }
      );

      if (!updatedForm) {
        return res.status(404).json({
          status: 'failed',
          message: 'Form not found after update'
        });
      }

      // Add admin note about Staff2 verification
      if (!updatedForm.adminNotes) updatedForm.adminNotes = [];
      updatedForm.adminNotes.push({
        note: `Staff2 ${approved ? 'Verification' : 'Rejection'}: ${verificationNotes || (approved ? 'Form verified by Staff2' : 'Form requires correction')}`,
        addedBy: userId,
        addedAt: new Date()
      });

      // Mark adminNotes as modified and save
      updatedForm.markModified('adminNotes');
      await updatedForm.save();

      // Log the action
      await AuditLog.logAction({
        userId: req.user.id,
        userRole: req.user.role,
        action: 'form_verify',
        resource: 'staff2_form',
        resourceId: form._id,
        details: `Staff2 ${approved ? 'verified' : 'rejected'} form ${form.serviceType}. Status: ${approved ? 'Moving to Staff3' : 'Needs Correction'}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        status: 'success',
        message: `Form ${approved ? 'verified by Staff2 successfully' : 'marked for correction by Staff2'}. ${approved ? 'Form will proceed to Staff3.' : ''}`,
        data: { 
          form: updatedForm,
          nextStage: approved ? 'staff3' : null
        }
      });

    } catch (error) {
      logger.error('Error verifying Staff2 form:', error);
      logger.error('Error stack:', error.stack);
      logger.error('Request details:', {
        formId: req.params.id,
        userId: req.user?.id,
        approved: req.body?.approved,
        errorMessage: error.message
      });
      res.status(500).json({
        status: 'failed',
        message: error.message || 'Error processing verification',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
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

      // Validate verificationType enum: ['trustee', 'amount']
      const validVerificationType = verificationType && ['trustee', 'amount'].includes(verificationType) 
        ? verificationType 
        : (form.serviceType === 'sale-deed' ? 'amount' : 'trustee');
      
      // Update form data with Staff2 corrections
      const updateData = {
        data: { ...form.data, ...updatedFields },
        'approvals.staff2.lastUpdatedBy': userId,
        'approvals.staff2.lastUpdatedAt': new Date(),
        'approvals.staff2.updateNotes': updateNotes,
        'approvals.staff2.verificationType': validVerificationType
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
      const { 
        completedTasks,
        workSummary,
        issuesEncountered,
        recommendations,
        formsProcessed 
      } = req.body;

      // Get all staff reports for this staff member that are not yet submitted
      const pendingReports = await StaffReport.find({
        staffId: req.user.id,
        isSubmitted: false
      }).populate('formId', 'serviceType formTitle status');

      // Mark all pending reports as submitted
      await StaffReport.updateMany(
        { staffId: req.user.id, isSubmitted: false },
        { 
          isSubmitted: true,
          submittedAt: new Date(),
          reviewNotes: workSummary
        }
      );

      // Create a comprehensive work report entry (same format as Staff1)
      const workReportData = {
        staffId: req.user.id,
        formId: null, // This is a general work report, not tied to specific form
        formType: 'work-report',
        verificationStatus: 'pending',
        remarks: workSummary,
        verificationNotes: `
          Completed Tasks: ${completedTasks?.join(', ') || 'None specified'}
          
          Work Summary: ${workSummary || 'No summary provided'}
          
          Issues Encountered: ${issuesEncountered || 'None reported'}
          
          Recommendations: ${recommendations || 'None provided'}
          
          Forms Processed: ${formsProcessed || pendingReports.length}
          
          Report Details:
          ${pendingReports.map(report => 
            `- ${report.formId?.serviceType || 'Unknown'}: ${report.verificationStatus || 'processed'}`
          ).join('\n')}
        `,
        isSubmitted: true,
        submittedAt: new Date()
      };

      // Create work report entry
      const workReport = new StaffReport(workReportData);
      await workReport.save();

      // Log activity
      await AuditLog.logAction({
        userId: req.user.id,
        userRole: req.user.role,
        action: 'work_report_submission',
        resource: 'staff_reports',
        resourceId: workReport._id,
        details: `Staff2 submitted work report with ${pendingReports.length} processed forms`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        status: 'success',
        message: 'Work report submitted successfully',
        data: {
          workReport,
          processedForms: pendingReports.length,
          submittedReports: pendingReports
        }
      });

    } catch (error) {
      logger.error('Error submitting Staff2 work report:', error);
      res.status(500).json({
        status: 'failed',
        message: error.message || 'Error submitting work report'
      });
    }
  }

  /**
   * Get Staff2's work reports
   */
  static async getWorkReports(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const skip = (page - 1) * limit;

      const query = { staffId: req.user.id };
      if (status) query.verificationStatus = status;

      const reports = await StaffReport.find(query)
        .populate('formId', 'serviceType formTitle status fields')
        .populate('reviewedBy', 'name email role')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));

      const total = await StaffReport.countDocuments(query);

      res.json({
        status: 'success',
        data: {
          reports,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      logger.error('Error getting Staff2 work reports:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error retrieving work reports'
      });
    }
  }
}

export default Staff2Controller;
