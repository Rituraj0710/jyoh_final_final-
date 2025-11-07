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
      const { page = 1, limit = 10, status, formType, search, verificationType, completed } = req.query;
      const userId = req.user.id;
      
      // Build query for Staff3 forms
      let query = {};
      
      // If completed=true, show forms verified by Staff3
      if (completed === 'true' || status === 'verified') {
        query = {
          'approvals.staff3.approved': true,
          'approvals.staff3.verifiedBy': userId  // Only show forms verified by this Staff3 user
        };
        // Don't restrict by status for completed forms - they can have various statuses
      } else {
        // Default: forms pending Staff3 verification (verified by Staff1 and Staff2, not yet by Staff3)
        query = {
          'approvals.staff1.approved': true,
          'approvals.staff2.approved': true,
          'approvals.staff3.approved': false,
          status: 'under_review'
        };
      }

      // Add other filters
      if (status && status !== 'verified') {
        query.status = status;
      }
      
      // Map formType to serviceType if provided
      if (formType) {
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
      
      // Search filter
      if (search) {
        const searchRegex = { $regex: search, $options: 'i' };
        query.$or = [
          { _id: searchRegex },
          { serviceType: searchRegex },
          { 'userId.name': searchRegex },
          { 'userId.email': searchRegex },
          { 'data.state': searchRegex },
          { 'data.district': searchRegex },
          { 'data.village': searchRegex },
          { 'data.colonyName': searchRegex },
          { 'data.khasraNo': searchRegex },
          { 'data.plotNo': searchRegex },
          { 'data.directionNorth': searchRegex },
          { 'data.directionEast': searchRegex },
          { 'data.directionSouth': searchRegex },
          { 'data.directionWest': searchRegex }
        ];
      }

      const skip = (page - 1) * limit;
      
      // Log query for debugging
      logger.info('Staff3 getForms request params:', {
        page, limit, status, formType, search, verificationType, completed, userId
      });
      logger.info('Staff3 getForms built query:', JSON.stringify(query, null, 2));
      
      // Sort by verification date for completed forms, or by creation date for pending forms
      const sortOrder = completed === 'true' || status === 'verified' 
        ? { 'approvals.staff3.verifiedAt': -1 }  // Most recently verified first
        : { createdAt: -1 };  // Most recently created first
      
      const forms = await FormsData.find(query)
        .populate('userId', 'name email')
        .populate('assignedTo', 'name email role')
        .sort(sortOrder)
        .skip(skip)
        .limit(parseInt(limit));

      const total = await FormsData.countDocuments(query);
      
      // Log results for debugging
      logger.info(`Staff3 getForms results: Found ${forms.length} forms (total: ${total})`);
      if (forms.length > 0) {
        logger.info('Sample form IDs:', forms.map(f => f._id.toString()));
        logger.info('Sample form service types:', forms.map(f => f.serviceType));
      } else {
        // Debug: Check what forms exist that match partially
        const partialQuery = {
          'approvals.staff1.approved': true,
          'approvals.staff2.approved': true
        };
        if (query.serviceType) {
          partialQuery.serviceType = query.serviceType;
        }
        const partialMatches = await FormsData.find(partialQuery).select('_id serviceType status approvals.staff3.approved').limit(5);
        logger.info(`Forms with Staff1&2 approved (partial match): ${partialMatches.length}`);
        partialMatches.forEach(f => {
          logger.info(`  - ${f._id}: serviceType=${f.serviceType}, status=${f.status}, staff3.approved=${f.approvals?.staff3?.approved}`);
        });
      }

      // Return all forms with complete data - Staff3 needs to see all form details
      const filteredForms = forms.map(form => form.toObject());

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

      // Check if Staff3 can access this form
      if (!formsDataDoc.approvals?.staff1?.approved || !formsDataDoc.approvals?.staff2?.approved) {
        return res.status(403).json({
          status: 'failed',
          message: 'Form must be verified by Staff1 and Staff2 before Staff3 verification'
        });
      }

      if (formsDataDoc.approvals?.staff3?.approved) {
        return res.status(403).json({
          status: 'failed',
          message: 'Form already verified by Staff3'
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
            if (originalFormData) {
              logger.info(`Fetched original ${serviceType} form ${formId} for Staff3 view`);
            } else {
              logger.warn(`Original ${serviceType} form ${formId} not found`);
            }
          }
        }
      } catch (originalError) {
        logger.warn('Error fetching original form data:', originalError);
        logger.warn('Error details:', {
          message: originalError.message,
          formId: formsDataDoc.formId,
          serviceType: formsDataDoc.serviceType
        });
        // Continue without original form data
      }

      // Merge all form data into a unified object
      // Priority: originalFormData > formsDataDoc.data > formsDataDoc.fields
      const originalData = originalFormData ? originalFormData.toObject() : {};
      const formsDataFields = formsDataDoc.data || {};
      const formsDataMetadata = formsDataDoc.fields || {};
      
      // Merge with original form data taking highest priority
      const allFields = {
        ...formsDataMetadata,
        ...formsDataFields,
        ...originalData  // Original form data takes highest priority
      };
      
      logger.info(`Merged form data for Staff3`, {
        formId: formsDataDoc._id,
        serviceType: formsDataDoc.serviceType,
        originalFieldsCount: Object.keys(originalData).length,
        formsDataFieldsCount: Object.keys(formsDataFields).length,
        mergedFieldsCount: Object.keys(allFields).length,
        hasKhasraNo: !!allFields.khasraNo,
        hasPlotNo: !!allFields.plotNo,
        hasDirectionNorth: !!allFields.directionNorth
      });
      
      const completeFormData = {
        ...formsDataDoc.toObject(),
        // Original form data for reference
        originalFormData: originalFormData ? originalFormData.toObject() : null,
        // Merged fields - original form data takes precedence
        allFields: allFields
      };

      // Log activity
      await AuditLog.logAction({
        userId: req.user.id,
        userRole: req.user.role,
        action: 'form_view',
        resource: 'forms',
        resourceId: formsDataDoc._id,
        details: `Staff3 viewed form ${formsDataDoc.serviceType}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      return res.json({
        status: 'success',
        data: { 
          form: completeFormData 
        }
      });
    } catch (error) {
      logger.error('Error getting form by ID for Staff3:', error);
      return res.status(500).json({
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

      // Check if already verified by Staff3
      if (form.approvals?.staff3?.approved) {
        return res.status(400).json({
          status: 'failed',
          message: 'Form already verified by Staff3'
        });
      }

      // Check if Staff1 and Staff2 have verified
      if (!form.approvals?.staff1?.approved || !form.approvals?.staff2?.approved) {
        return res.status(403).json({
          status: 'failed',
          message: 'Form must be verified by Staff1 and Staff2 before Staff3 verification'
        });
      }

      // Build $set update object for MongoDB
      // Validate verificationType enum: ['land', 'plot']
      const validVerificationType = verificationType && ['land', 'plot'].includes(verificationType) 
        ? verificationType 
        : 'land';
      
      const $set = {
        'approvals.staff3.approved': approved,
        'approvals.staff3.verifiedBy': userId,
        'approvals.staff3.verifiedAt': new Date(),
        'approvals.staff3.notes': verificationNotes || (approved ? 'Verified by Staff3' : 'Rejected by Staff3'),
        'approvals.staff3.verificationType': validVerificationType,
        'approvals.staff3.lastUpdatedBy': userId,
        'approvals.staff3.lastUpdatedAt': new Date(),
        lastActivityBy: userId,
        lastActivityAt: new Date()
      };
      
      // IMPORTANT: Don't update staff2.verificationType - only update staff3 fields
      // Remove any accidental staff2 fields from $set

      // Update form status based on approval
      if (approved) {
        $set.status = 'under_review'; // Move to Staff4 (next stage)
        $set['approvals.staff3.status'] = 'verified';
      } else {
        $set.status = 'needs_correction';
        $set['approvals.staff3.status'] = 'needs_correction';
      }

      // If approved, update form data with any corrections
      // Also update original form collection if formId exists
      if (approved && updatedFields) {
        // Merge updatedFields with existing form.data
        const updatedData = { ...form.data, ...updatedFields };
        $set.data = updatedData;
        
        // Update original form collection with property description and directions
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
              
              // Property Description fields (for sale-deed and other forms)
              if (updatedFields.state) originalUpdate.state = updatedFields.state;
              if (updatedFields.district) originalUpdate.district = updatedFields.district;
              if (updatedFields.tehsil) originalUpdate.tehsil = updatedFields.tehsil;
              if (updatedFields.village) originalUpdate.village = updatedFields.village;
              if (updatedFields.khasraNo) originalUpdate.khasraNo = updatedFields.khasraNo;
              if (updatedFields.plotNo) originalUpdate.plotNo = updatedFields.plotNo;
              if (updatedFields.colonyName) originalUpdate.colonyName = updatedFields.colonyName;
              if (updatedFields.wardNo) originalUpdate.wardNo = updatedFields.wardNo;
              if (updatedFields.streetNo) originalUpdate.streetNo = updatedFields.streetNo;
              
              // Property Directions (for sale-deed)
              if (updatedFields.directionNorth) originalUpdate.directionNorth = updatedFields.directionNorth;
              if (updatedFields.directionEast) originalUpdate.directionEast = updatedFields.directionEast;
              if (updatedFields.directionSouth) originalUpdate.directionSouth = updatedFields.directionSouth;
              if (updatedFields.directionWest) originalUpdate.directionWest = updatedFields.directionWest;

              if (Object.keys(originalUpdate).length > 0) {
                await OriginalModel.findByIdAndUpdate(
                  form.formId,
                  { $set: originalUpdate },
                  { runValidators: false, new: true }
                );
                logger.info(`Updated original ${form.serviceType} form ${form.formId} with Staff3 corrections`);
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

      // Add admin note about Staff3 verification
      if (!updatedForm.adminNotes) updatedForm.adminNotes = [];
      updatedForm.adminNotes.push({
        note: `Staff3 ${approved ? 'Verification' : 'Rejection'}: ${verificationNotes || (approved ? 'Form verified by Staff3' : 'Form requires correction')}`,
        addedBy: userId,
        addedAt: new Date()
      });

      // Mark adminNotes as modified and save
      updatedForm.markModified('adminNotes');
      await updatedForm.save();

      // Log activity
      await AuditLog.logAction({
        userId: req.user.id,
        userRole: req.user.role,
        action: 'form_verify',
        resource: 'staff3_form',
        resourceId: form._id,
        details: `Staff3 ${approved ? 'verified' : 'rejected'} form ${form.serviceType}. Status: ${approved ? 'Moving to Staff4' : 'Needs Correction'}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        status: 'success',
        message: `Form ${approved ? 'verified by Staff3 successfully' : 'marked for correction by Staff3'}. ${approved ? 'Form will proceed to Staff4.' : ''}`,
        data: { 
          form: updatedForm,
          nextStage: approved ? 'staff4' : null
        }
      });

    } catch (error) {
      logger.error('Error verifying Staff3 form:', error);
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

      // Validate verificationType enum: ['land', 'plot']
      const validVerificationType = verificationType && ['land', 'plot'].includes(verificationType) 
        ? verificationType 
        : 'land';
      
      // Update form data with Staff3 corrections
      const updateData = {
        data: { ...form.data, ...updatedFields },
        'approvals.staff3.lastUpdatedBy': userId,
        'approvals.staff3.lastUpdatedAt': new Date(),
        'approvals.staff3.updateNotes': updateNotes,
        'approvals.staff3.verificationType': validVerificationType
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

      // Create a comprehensive work report entry (same format as Staff1/Staff2)
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
        details: `Staff3 submitted work report with ${pendingReports.length} processed forms`,
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
      logger.error('Error submitting Staff3 work report:', error);
      res.status(500).json({
        status: 'failed',
        message: error.message || 'Error submitting work report'
      });
    }
  }

  /**
   * Get Staff3's work reports
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
      logger.error('Error getting Staff3 work reports:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error retrieving work reports'
      });
    }
  }
}

export default Staff3Controller;
