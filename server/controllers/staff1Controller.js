import FormsData from '../models/FormsData.js';
import StaffReport from '../models/StaffReport.js';
import AuditLog from '../models/AuditLog.js';
import logger from '../config/logger.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

class Staff1Controller {
  
  /**
   * Get forms for Staff1 review
   */
  static getFormsForReview = async (req, res) => {
    try {
      const { page = 1, limit = 10, status, serviceType, search } = req.query;
      const skip = (page - 1) * limit;

      // Staff1 can see all submitted forms (by users or filled by Staff1 itself)
      // Include forms from both FormsData and legacy collections
      let query = {
        $or: [
          { status: { $in: ['submitted', 'in-progress', 'under_review', 'completed'] } },
          { status: { $exists: false } }, // For legacy forms without status
          // Include forms filled by Staff1 regardless of status
          { filledByStaff1: true }
        ]
      };

      // Staff1 can review and edit all forms - no restriction on approval status
      // This allows Staff1 to see forms submitted by users and forms it filled itself

      if (status) {
        query.status = status;
      }
      if (serviceType) {
        query.serviceType = serviceType;
      }
      if (search) {
        query.$or = [
          { formTitle: { $regex: search, $options: 'i' } },
          { formDescription: { $regex: search, $options: 'i' } },
          { 'fields.testatorName': { $regex: search, $options: 'i' } },
          { 'fields.sellerName': { $regex: search, $options: 'i' } },
          { 'fields.buyerName': { $regex: search, $options: 'i' } }
        ];
      }

      // Get forms from FormsData collection
      const formsDataResults = await FormsData.find(query)
        .populate('userId', 'name email role')
        .populate('assignedTo', 'name email role')
        .populate('lastActivityBy', 'name email role')
        .sort({ lastActivityAt: -1, createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));

      // Also get forms from legacy collections and convert them to FormsData format
      const legacyForms = await this.getLegacyForms(query, parseInt(limit), parseInt(skip));
      
      // Combine and format all forms
      let allForms = [...formsDataResults];
      
      // Add legacy forms if we have space
      if (allForms.length < parseInt(limit)) {
        const remainingLimit = parseInt(limit) - allForms.length;
        allForms = [...allForms, ...legacyForms.slice(0, remainingLimit)];
      }

      // Get total count from both sources
      const formsDataTotal = await FormsData.countDocuments(query);
      const legacyTotal = await this.getLegacyFormsCount(query);
      const total = formsDataTotal + legacyTotal;

      // Log activity
      await AuditLog.logAction({
        userId: req.user.id,
        userRole: req.user.role,
        action: 'forms_list_view',
        resource: 'forms',
        details: `Staff1 viewed forms list - ${allForms.length} forms (${formsDataResults.length} from FormsData, ${legacyForms.length} legacy)`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      return successResponse(res, 'Forms retrieved successfully', {
        forms: allForms,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Error getting forms for Staff1 review:', error);
      return errorResponse(res, 'Error retrieving forms', error.message, 500);
    }
  };

  /**
   * Get forms from legacy collections (WillDeed, SaleDeed, etc.)
   */
  static async getLegacyForms(query, limit, skip) {
    try {
      const legacyForms = [];
      
      // Import legacy models dynamically
      const WillDeed = (await import('../models/WillDeed.js')).default;
      const SaleDeed = (await import('../models/SaleDeed.js')).default;
      const TrustDeed = (await import('../models/TrustDeed.js')).default;
      const PowerOfAttorney = (await import('../models/PowerOfAttorney.js')).default;
      const AdoptionDeed = (await import('../models/AdoptionDeed.js')).default;
      const PropertyRegistration = (await import('../models/PropertyRegistration.js')).default;

      const legacyCollections = [
        { model: WillDeed, serviceType: 'will-deed' },
        { model: SaleDeed, serviceType: 'sale-deed' },
        { model: TrustDeed, serviceType: 'trust-deed' },
        { model: PowerOfAttorney, serviceType: 'power-of-attorney' },
        { model: AdoptionDeed, serviceType: 'adoption-deed' },
        { model: PropertyRegistration, serviceType: 'property-registration' }
      ];

      for (const { model, serviceType } of legacyCollections) {
        try {
          // Skip if serviceType filter doesn't match
          if (query.serviceType && query.serviceType !== serviceType) {
            continue;
          }

          const legacyQuery = {
            $or: [
              { processedByStaff1: { $exists: false } },
              { processedByStaff1: false }
            ]
          };

          const results = await model.find(legacyQuery)
            .sort({ createdAt: -1 })
            .limit(Math.min(limit, 10)) // Limit legacy forms per collection
            .lean();

          // Convert legacy forms to FormsData format
          for (const legacyForm of results) {
            const convertedForm = {
              _id: legacyForm._id,
              serviceType: serviceType,
              formTitle: `${serviceType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} - ${legacyForm._id.toString().substring(0, 8)}`,
              formDescription: `Legacy ${serviceType} form`,
              status: legacyForm.status || 'submitted',
              fields: legacyForm,
              userId: legacyForm.userId || null,
              createdAt: legacyForm.createdAt,
              updatedAt: legacyForm.updatedAt,
              lastActivityAt: legacyForm.updatedAt || legacyForm.createdAt,
              isLegacyForm: true,
              originalCollection: serviceType
            };

            legacyForms.push(convertedForm);
          }
        } catch (modelError) {
          console.warn(`Error fetching from ${serviceType} collection:`, modelError.message);
        }
      }

      return legacyForms.slice(skip, skip + limit);
    } catch (error) {
      logger.error('Error getting legacy forms:', error);
      return [];
    }
  }

  /**
   * Get count of legacy forms
   */
  static async getLegacyFormsCount(query) {
    try {
      let total = 0;
      
      // Import legacy models dynamically
      const WillDeed = (await import('../models/WillDeed.js')).default;
      const SaleDeed = (await import('../models/SaleDeed.js')).default;
      const TrustDeed = (await import('../models/TrustDeed.js')).default;
      const PowerOfAttorney = (await import('../models/PowerOfAttorney.js')).default;
      const AdoptionDeed = (await import('../models/AdoptionDeed.js')).default;
      const PropertyRegistration = (await import('../models/PropertyRegistration.js')).default;

      const legacyCollections = [
        { model: WillDeed, serviceType: 'will-deed' },
        { model: SaleDeed, serviceType: 'sale-deed' },
        { model: TrustDeed, serviceType: 'trust-deed' },
        { model: PowerOfAttorney, serviceType: 'power-of-attorney' },
        { model: AdoptionDeed, serviceType: 'adoption-deed' },
        { model: PropertyRegistration, serviceType: 'property-registration' }
      ];

      for (const { model, serviceType } of legacyCollections) {
        try {
          // Skip if serviceType filter doesn't match
          if (query.serviceType && query.serviceType !== serviceType) {
            continue;
          }

          const legacyQuery = {
            $or: [
              { processedByStaff1: { $exists: false } },
              { processedByStaff1: false }
            ]
          };

          const count = await model.countDocuments(legacyQuery);
          total += count;
        } catch (modelError) {
          console.warn(`Error counting ${serviceType} collection:`, modelError.message);
        }
      }

      return total;
    } catch (error) {
      logger.error('Error getting legacy forms count:', error);
      return 0;
    }
  }

  /**
   * Get specific form details for Staff1
   * Fetches complete form data from both FormsData and the original collection
   */
  static getFormById = async (req, res) => {
    try {
      const { id } = req.params;

      // Get FormsData document
      const formsDataDoc = await FormsData.findById(id)
        .populate('userId', 'name email role phone')
        .populate('assignedTo', 'name email role')
        .populate('verifiedBy', 'name email role')
        .populate('lastActivityBy', 'name email role');

      if (!formsDataDoc) {
        return errorResponse(res, 'Form not found', null, 404);
      }

      // Staff1 can access all forms for review and editing, including:
      // - Forms submitted by users
      // - Forms filled by Staff1 itself
      // - Forms already verified by Staff1 (for review/editing purposes)

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
        logger.warn('Error fetching original form data:', originalError);
        // Continue without original form data
      }

      // Merge all form data into a unified object
      const completeFormData = {
        ...formsDataDoc.toObject(),
        // Original form data takes precedence for fields
        originalFormData: originalFormData ? originalFormData.toObject() : null,
        // Create a merged fields object combining FormsData.fields, FormsData.data, and original form
        allFields: {
          ...formsDataDoc.fields,
          ...formsDataDoc.data,
          ...(originalFormData ? originalFormData.toObject() : {})
        }
      };

      // Log activity
      await AuditLog.logAction({
        userId: req.user.id,
        userRole: req.user.role,
        action: 'form_view',
        resource: 'forms',
        resourceId: formsDataDoc._id,
        details: `Staff1 viewed form ${formsDataDoc.serviceType}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      return successResponse(res, 'Form retrieved successfully', { 
        form: completeFormData 
      });
    } catch (error) {
      logger.error('Error getting form by ID for Staff1:', error);
      return errorResponse(res, 'Error retrieving form', error.message, 500);
    }
  };

  /**
   * Edit/Correct form data
   */
  static correctForm = async (req, res) => {
    try {
      const { id } = req.params;
      const { fields, correctionNotes, isLegacyForm, originalCollection } = req.body;

      let form;
      let originalFields;
      let isLegacy = false;

      // Check if this is a legacy form
      if (isLegacyForm && originalCollection) {
        isLegacy = true;
        // Handle legacy form correction
        const result = await this.correctLegacyForm(id, fields, correctionNotes, originalCollection, req.user.id);
        if (result.error) {
          return errorResponse(res, result.error, null, result.status || 500);
        }
        form = result.form;
        originalFields = result.originalFields;
      } else {
        // Handle FormsData correction
        form = await FormsData.findById(id);
        if (!form) {
          return errorResponse(res, 'Form not found', null, 404);
        }

        // Staff1 can edit all forms it can see - both user-submitted and Staff1-filled forms
        // No restrictions on editing - Staff1 has full access to review and edit all forms

        // Store original data for audit trail
        originalFields = { ...form.fields, ...form.data };

        // Update form fields and data in FormsData
        form.fields = { ...form.fields, ...fields };
        form.data = { ...form.data, ...fields };
        form.lastActivityBy = req.user.id;
        form.lastActivityAt = new Date();

        // Add correction note
        if (correctionNotes) {
          if (!form.adminNotes) form.adminNotes = [];
          form.adminNotes.push({
            note: `Staff1 Correction: ${correctionNotes}`,
            addedBy: req.user.id,
            addedAt: new Date()
          });
        }

        await form.save();

        // Also update the original form collection if formId exists
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
              // Update the original form with corrected fields
              await OriginalModel.findByIdAndUpdate(
                form.formId,
                { $set: fields },
                { runValidators: false, new: true }
              );
              logger.info(`Updated original ${form.serviceType} form ${form.formId} with corrections`);
            }
          } catch (originalUpdateError) {
            logger.warn('Error updating original form collection:', originalUpdateError);
            // Continue even if original update fails - FormsData is the source of truth
          }
        }
      }

      // Create or update staff report
      let staffReport = await StaffReport.findOne({
        staffId: req.user.id,
        formId: form._id
      });

      if (!staffReport) {
        staffReport = new StaffReport({
          staffId: req.user.id,
          formId: form._id,
          formType: form.serviceType || originalCollection,
          originalData: originalFields,
          editedData: isLegacy ? fields : form.fields
        });
      } else {
        staffReport.editedData = isLegacy ? fields : form.fields;
      }

      // Calculate changes
      staffReport.calculateChanges(originalFields, isLegacy ? fields : form.fields);
      if (correctionNotes) {
        staffReport.remarks = correctionNotes;
      }

      await staffReport.save();

      // Log activity
      await AuditLog.logAction({
        userId: req.user.id,
        userRole: req.user.role,
        action: 'form_correction',
        resource: 'forms',
        resourceId: form._id,
        details: `Staff1 corrected ${isLegacy ? 'legacy' : ''} form ${form.serviceType || originalCollection}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      return successResponse(res, 'Form corrected successfully', { 
        form,
        staffReport,
        isLegacyForm: isLegacy
      });
    } catch (error) {
      logger.error('Error correcting form:', error);
      return errorResponse(res, 'Error correcting form', error.message, 500);
    }
  };

  /**
   * Correct legacy form data
   */
  static async correctLegacyForm(id, fields, correctionNotes, originalCollection, staffId) {
    try {
      // Import the appropriate legacy model
      let Model;
      switch (originalCollection) {
        case 'will-deed':
          Model = (await import('../models/WillDeed.js')).default;
          break;
        case 'sale-deed':
          Model = (await import('../models/SaleDeed.js')).default;
          break;
        case 'trust-deed':
          Model = (await import('../models/TrustDeed.js')).default;
          break;
        case 'power-of-attorney':
          Model = (await import('../models/PowerOfAttorney.js')).default;
          break;
        case 'adoption-deed':
          Model = (await import('../models/AdoptionDeed.js')).default;
          break;
        case 'property-registration':
          Model = (await import('../models/PropertyRegistration.js')).default;
          break;
        default:
          return { error: 'Invalid legacy form type', status: 400 };
      }

      const legacyForm = await Model.findById(id);
      if (!legacyForm) {
        return { error: 'Legacy form not found', status: 404 };
      }

      // Store original data
      const originalFields = legacyForm.toObject();

      // Update fields
      Object.assign(legacyForm, fields);
      
      // Mark as processed by Staff1
      legacyForm.processedByStaff1 = true;
      legacyForm.staff1ProcessedAt = new Date();
      legacyForm.staff1ProcessedBy = staffId;
      
      if (correctionNotes) {
        if (!legacyForm.staff1Notes) {
          legacyForm.staff1Notes = [];
        }
        legacyForm.staff1Notes.push({
          note: correctionNotes,
          addedBy: staffId,
          addedAt: new Date()
        });
      }

      await legacyForm.save();

      // Convert back to standard format
      const convertedForm = {
        _id: legacyForm._id,
        serviceType: originalCollection,
        formTitle: `${originalCollection.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} - ${legacyForm._id.toString().substring(0, 8)}`,
        fields: legacyForm.toObject(),
        isLegacyForm: true,
        originalCollection: originalCollection
      };

      return {
        form: convertedForm,
        originalFields: originalFields
      };
    } catch (error) {
      logger.error('Error correcting legacy form:', error);
      return { error: 'Error correcting legacy form', status: 500 };
    }
  }

  /**
   * Verify form
   */
  static verifyForm = async (req, res) => {
    try {
      const { id } = req.params;
      const { verificationNotes, approved = true } = req.body;

      const form = await FormsData.findById(id);
      if (!form) {
        return errorResponse(res, 'Form not found', null, 404);
      }

      // Check if already verified by Staff1 specifically
      if (form.approvals.staff1.approved) {
        return errorResponse(res, 'Form already verified by Staff1', null, 400);
      }

      if (approved) {
        // Mark as verified by Staff1
        form.verifiedBy = req.user.id;
        form.verifiedAt = new Date();
        form.status = 'under_review';
        
        // Update approvals object for Staff 1
        form.approvals.staff1.approved = true;
        form.approvals.staff1.verifiedBy = req.user.id;
        form.approvals.staff1.verifiedAt = new Date();
        form.approvals.staff1.status = 'approved';
        form.approvals.staff1.notes = verificationNotes || 'Verified by Staff 1';
        form.approvals.staff1.lastUpdatedBy = req.user.id;
        form.approvals.staff1.lastUpdatedAt = new Date();
      } else {
        form.status = 'rejected';
        if (verificationNotes) {
          form.rejectionReason = verificationNotes;
        }
        
        // Update approvals object for Staff 1 rejection
        form.approvals.staff1.approved = false;
        form.approvals.staff1.verifiedBy = req.user.id;
        form.approvals.staff1.verifiedAt = new Date();
        form.approvals.staff1.status = 'rejected';
        form.approvals.staff1.notes = verificationNotes || 'Rejected by Staff 1';
        form.approvals.staff1.lastUpdatedBy = req.user.id;
        form.approvals.staff1.lastUpdatedAt = new Date();
      }

      form.lastActivityBy = req.user.id;
      form.lastActivityAt = new Date();

      // Add verification note
      form.adminNotes.push({
        note: `Staff1 ${approved ? 'Verification' : 'Rejection'}: ${verificationNotes || 'No notes provided'}`,
        addedBy: req.user.id,
        addedAt: new Date()
      });

      // Mark approvals as modified to ensure Mongoose saves nested objects
      form.markModified('approvals');

      // Alternative approach: Use updateOne with $set operator
      await FormsData.updateOne(
        { _id: form._id },
        { 
          $set: {
            'approvals.staff1.approved': approved,
            'approvals.staff1.verifiedBy': req.user.id,
            'approvals.staff1.verifiedAt': new Date(),
            'approvals.staff1.status': approved ? 'approved' : 'rejected',
            'approvals.staff1.notes': verificationNotes || (approved ? 'Verified by Staff 1' : 'Rejected by Staff 1'),
            'approvals.staff1.lastUpdatedBy': req.user.id,
            'approvals.staff1.lastUpdatedAt': new Date(),
            status: approved ? 'under_review' : 'rejected',
            verifiedBy: req.user.id,
            verifiedAt: new Date(),
            lastActivityBy: req.user.id,
            lastActivityAt: new Date()
          }
        }
      );

      // Also save the form to update other fields
      await form.save();

      // Update staff report
      let staffReport = await StaffReport.findOne({
        staffId: req.user.id,
        formId: form._id
      });

      if (!staffReport) {
        staffReport = new StaffReport({
          staffId: req.user.id,
          formId: form._id,
          formType: form.serviceType,
          originalData: form.fields,
          editedData: form.fields
        });
      }

      staffReport.verificationStatus = approved ? 'verified' : 'rejected';
      staffReport.verificationNotes = verificationNotes;
      await staffReport.save();

      // Log activity
      await AuditLog.logAction({
        userId: req.user.id,
        userRole: req.user.role,
        action: approved ? 'form_verification' : 'form_rejection',
        resource: 'forms',
        resourceId: form._id,
        details: `Staff1 ${approved ? 'verified' : 'rejected'} form ${form.serviceType}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      return successResponse(res, `Form ${approved ? 'verified' : 'rejected'} successfully`, { 
        form,
        staffReport 
      });
    } catch (error) {
      logger.error('Error verifying form:', error);
      return errorResponse(res, 'Error verifying form', error.message, 500);
    }
  };

  /**
   * Calculate stamp duty
   */
  static calculateStampDuty = async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        propertyValue, 
        propertyType, 
        location, 
        calculationMethod,
        applicableRules,
        notes 
      } = req.body;

      const form = await FormsData.findById(id);
      if (!form) {
        return errorResponse(res, 'Form not found', null, 404);
      }

      // Basic stamp duty calculation logic
      let stampDuty = 0;
      let calculationDetails = {};

      switch (form.serviceType) {
        case 'sale-deed':
          // Sale deed: typically 5-7% of property value
          stampDuty = propertyValue * 0.06; // 6% as default
          calculationDetails = {
            baseRate: '6%',
            propertyValue,
            calculation: `${propertyValue} × 6% = ${stampDuty}`
          };
          break;
        
        case 'will-deed':
          // Will deed: fixed amount or percentage
          stampDuty = Math.max(500, propertyValue * 0.001); // Minimum ₹500 or 0.1%
          calculationDetails = {
            baseRate: '0.1% (min ₹500)',
            propertyValue,
            calculation: `Max(₹500, ${propertyValue} × 0.1%) = ${stampDuty}`
          };
          break;
        
        case 'trust-deed':
          // Trust deed: percentage based
          stampDuty = propertyValue * 0.03; // 3%
          calculationDetails = {
            baseRate: '3%',
            propertyValue,
            calculation: `${propertyValue} × 3% = ${stampDuty}`
          };
          break;
        
        case 'property-registration':
          // Registration: 1% of property value
          stampDuty = propertyValue * 0.01;
          calculationDetails = {
            baseRate: '1%',
            propertyValue,
            calculation: `${propertyValue} × 1% = ${stampDuty}`
          };
          break;
        
        case 'power-of-attorney':
          // Power of attorney: fixed amount
          stampDuty = 100;
          calculationDetails = {
            baseRate: 'Fixed ₹100',
            calculation: 'Fixed amount for Power of Attorney'
          };
          break;
        
        case 'adoption-deed':
          // Adoption deed: fixed amount
          stampDuty = 50;
          calculationDetails = {
            baseRate: 'Fixed ₹50',
            calculation: 'Fixed amount for Adoption Deed'
          };
          break;
        
        default:
          stampDuty = 0;
          calculationDetails = {
            baseRate: 'Not applicable',
            calculation: 'Stamp duty calculation not available for this service type'
          };
      }

      // Round to 2 decimal places
      stampDuty = Math.round(stampDuty * 100) / 100;

      // Update or create staff report with stamp calculation
      let staffReport = await StaffReport.findOne({
        staffId: req.user.id,
        formId: form._id
      });

      if (!staffReport) {
        staffReport = new StaffReport({
          staffId: req.user.id,
          formId: form._id,
          formType: form.serviceType,
          originalData: form.fields,
          editedData: form.fields
        });
      }

      staffReport.stampCalculation = {
        calculatedAmount: stampDuty,
        calculationMethod: calculationMethod || 'Standard Rate',
        applicableRules: applicableRules || [calculationDetails.baseRate],
        notes: notes || calculationDetails.calculation,
        propertyValue,
        propertyType,
        location,
        calculationDetails
      };

      await staffReport.save();

      // Log activity
      await AuditLog.logAction({
        userId: req.user.id,
        userRole: req.user.role,
        action: 'stamp_calculation',
        resource: 'forms',
        resourceId: form._id,
        details: `Staff1 calculated stamp duty: ₹${stampDuty} for ${form.serviceType}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      return successResponse(res, 'Stamp duty calculated successfully', {
        stampDuty,
        calculationDetails,
        staffReport
      });
    } catch (error) {
      logger.error('Error calculating stamp duty:', error);
      return errorResponse(res, 'Error calculating stamp duty', error.message, 500);
    }
  };

  /**
   * Submit work report
   */
  static submitWorkReport = async (req, res) => {
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

      // Create a comprehensive work report entry
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
            `- ${report.formId?.serviceType || 'Unknown'}: ${report.verificationStatus}`
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
        details: `Staff1 submitted work report with ${pendingReports.length} processed forms`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      return successResponse(res, 'Work report submitted successfully', {
        workReport,
        processedForms: pendingReports.length,
        submittedReports: pendingReports
      });
    } catch (error) {
      logger.error('Error submitting work report:', error);
      return errorResponse(res, 'Error submitting work report', error.message, 500);
    }
  };

  /**
   * Get Staff1's work reports
   */
  static getWorkReports = async (req, res) => {
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

      return successResponse(res, 'Work reports retrieved successfully', {
        reports,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Error getting work reports:', error);
      return errorResponse(res, 'Error retrieving work reports', error.message, 500);
    }
  };

  /**
   * Get Staff1 dashboard statistics
   */
  static getDashboardStats = async (req, res) => {
    try {
      const staffId = req.user.id;

      // Get forms statistics
      const totalFormsAssigned = await FormsData.countDocuments({
        $or: [
          { assignedTo: staffId },
          { verifiedBy: staffId }
        ]
      });

      const formsVerified = await FormsData.countDocuments({
        verifiedBy: staffId
      });

      const formsPending = await FormsData.countDocuments({
        status: { $in: ['submitted', 'in-progress'] },
        $or: [
          { verifiedBy: null },
          { verifiedBy: { $exists: false } }
        ]
      });

      // Get reports statistics
      const totalReports = await StaffReport.countDocuments({
        staffId: staffId
      });

      const reportsSubmitted = await StaffReport.countDocuments({
        staffId: staffId,
        isSubmitted: true
      });

      // Get recent activity
      const recentForms = await FormsData.find({
        $or: [
          { assignedTo: staffId },
          { verifiedBy: staffId },
          { lastActivityBy: staffId }
        ]
      })
      .populate('userId', 'name email')
      .sort({ lastActivityAt: -1 })
      .limit(5);

      const stats = {
        formsStats: {
          totalAssigned: totalFormsAssigned,
          verified: formsVerified,
          pending: formsPending,
          verificationRate: totalFormsAssigned > 0 ? 
            Math.round((formsVerified / totalFormsAssigned) * 100) : 0
        },
        reportsStats: {
          total: totalReports,
          submitted: reportsSubmitted,
          pending: totalReports - reportsSubmitted
        },
        recentActivity: recentForms
      };

      return successResponse(res, 'Dashboard statistics retrieved successfully', stats);
    } catch (error) {
      logger.error('Error getting dashboard stats:', error);
      return errorResponse(res, 'Error retrieving dashboard statistics', error.message, 500);
    }
  };

  /**
   * Submit form on behalf of user (for offline users)
   * Staff 1 can fill forms on behalf of users when they come offline
   */
  static submitFormOnBehalf = async (req, res) => {
    try {
      const { formId, serviceType, fields, formTitle, formDescription, onBehalfOfUserId } = req.body;
      const staff1Id = req.user.id;

      // Validate required fields
      if (!serviceType || !fields) {
        return errorResponse(res, 'Service type and fields are required', null, 400);
      }

      // Import FormsDataController to use its submitForm logic
      const FormsDataController = (await import('./formsDataController.js')).default;
      
      // Create a modified request object to pass to submitForm
      const modifiedReq = {
        ...req,
        body: {
          formId,
          serviceType,
          fields,
          formTitle,
          formDescription,
          onBehalfOfUserId: onBehalfOfUserId || null // null for offline users
        },
        files: req.files
      };

      // Call the submitForm method
      return await FormsDataController.submitForm(modifiedReq, res);
    } catch (error) {
      logger.error('Error submitting form on behalf of user:', error);
      return errorResponse(res, 'Error submitting form on behalf of user', error.message, 500);
    }
  };
}

export default Staff1Controller;
