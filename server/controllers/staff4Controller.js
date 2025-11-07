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

      // Total forms verified by this Staff4 user (all time, not just today)
      const formsVerified = await FormsData.countDocuments({
        'approvals.staff4.approved': true,
        'approvals.staff4.verifiedBy': userId
      });
      
      // Forms verified today (for separate tracking if needed)
      const formsVerifiedToday = await FormsData.countDocuments({
        'approvals.staff4.approved': true,
        'approvals.staff4.verifiedBy': userId,
        'approvals.staff4.verifiedAt': { $gte: today, $lt: tomorrow }
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
      
      // Build query for Staff4 forms
      // Handle different status queries: 'cross_verified' for verified forms, default for pending
      let query = {};

      // If status is 'cross_verified', show forms that Staff4 has verified
      if (status === 'cross_verified') {
        query = {
          'approvals.staff1.approved': true,
          'approvals.staff2.approved': true,
          'approvals.staff3.approved': true,
          'approvals.staff4.approved': true,  // Staff4 has verified
          'approvals.staff4.verifiedBy': userId  // Verified by current Staff4 user
        };
        query.status = 'cross_verified';  // Also match the status field
      } else {
        // Default: Show forms ready for Staff4 cross-verification (all staff approved, Staff4 not yet)
        query = {
          'approvals.staff1.approved': true,
          'approvals.staff2.approved': true,
          'approvals.staff3.approved': true,
          'approvals.staff4.approved': false  // Not yet cross-verified by Staff4
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
        } else if (verificationStage === 'staff3_complete' || verificationStage === 'all') {
          // Default behavior: forms ready for Staff4 (all three staff approved, Staff4 not yet)
          query = {
            'approvals.staff1.approved': true,
            'approvals.staff2.approved': true,
            'approvals.staff3.approved': true,
            'approvals.staff4.approved': false
          };
        } else if (verificationStage === 'all_complete') {
          // Show all forms that have passed all staff levels (including Staff4)
          query = {
            'approvals.staff1.approved': true,
            'approvals.staff2.approved': true,
            'approvals.staff3.approved': true
            // Don't restrict Staff4 - show both verified and unverified
          };
        }

        // Add other status filters (if not already set above)
        if (status) {
          query.status = status;
        } else if (!verificationStage || verificationStage === 'all' || verificationStage === 'staff3_complete') {
          // Default status filter for ready-to-verify forms
          query.status = { $in: ['under_review', 'submitted'] };
        }
      }

      // Fix: FormsData uses 'serviceType', not 'formType'
      if (formType) {
        // Map formType to serviceType
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
        } else {
          // Try direct match in case formType is already serviceType
          query.serviceType = formType;
        }
      }

      // Enhanced search filter - include sale-deed specific fields
      if (search) {
        const searchRegex = { $regex: search, $options: 'i' };
        query.$or = [
          { _id: searchRegex },
          { serviceType: searchRegex },
          { 'data.applicantName': searchRegex },
          { 'data.name': searchRegex },
          { 'data.testatorName': searchRegex },
          { 'data.trusteeName': searchRegex },
          { 'data.agentName': searchRegex },
          { 'data.landOwner': searchRegex },
          { 'data.plotNumber': searchRegex },
          { 'data.plotNo': searchRegex },
          { 'data.khasraNo': searchRegex },
          { 'data.state': searchRegex },
          { 'data.district': searchRegex },
          { 'data.village': searchRegex },
          { 'data.colonyName': searchRegex },
          { 'sellers.name': searchRegex },
          { 'buyers.name': searchRegex },
          { 'data.sellers': { $elemMatch: { name: searchRegex } } },
          { 'data.buyers': { $elemMatch: { name: searchRegex } } }
        ];
      }

      // Log the query for debugging
      logger.info('Staff4 getForms query:', JSON.stringify(query, null, 2));
      logger.info('Staff4 getForms params:', { page, limit, status, formType, search, verificationStage });

      const skip = (page - 1) * limit;
      
      // For verified forms, sort by verification date; otherwise sort by creation date
      const sortOrder = status === 'cross_verified' 
        ? { 'approvals.staff4.verifiedAt': -1 } 
        : { createdAt: -1 };
      
      const forms = await FormsData.find(query)
        .populate('userId', 'name email')
        .populate('assignedTo', 'name email role')
        .sort(sortOrder)
        .skip(skip)
        .limit(parseInt(limit));

      const total = await FormsData.countDocuments(query);
      
      logger.info(`Staff4 getForms results: ${forms.length} forms found out of ${total} total`);

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
   * Organizes data by what each staff member verified
   */
  static async getFormById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      logger.info(`Staff4 getFormById called for form: ${id} by user: ${userId}`);

      // Get FormsData document
      const formsDataDoc = await FormsData.findById(id)
        .populate('userId', 'name email')
        .populate('assignedTo', 'name email role')
        .populate('verifiedBy', 'name email role');

      if (!formsDataDoc) {
        logger.warn(`Staff4 getFormById: Form ${id} not found`);
        return res.status(404).json({
          status: 'failed',
          message: 'Form not found'
        });
      }

      logger.info(`Staff4 getFormById: Form found. Approvals - Staff1: ${formsDataDoc.approvals?.staff1?.approved}, Staff2: ${formsDataDoc.approvals?.staff2?.approved}, Staff3: ${formsDataDoc.approvals?.staff3?.approved}`);

      // Check if form is ready for Staff4 cross-verification
      // Allow Staff4 to view even if not all staff have approved (for review purposes)
      // But show a warning if not all approvals are complete
      const allStaffApproved = formsDataDoc.approvals?.staff1?.approved && 
                               formsDataDoc.approvals?.staff2?.approved && 
                               formsDataDoc.approvals?.staff3?.approved;
      
      if (!allStaffApproved) {
        logger.warn(`Staff4 getFormById: Form ${id} is not fully approved by all staff. Staff1: ${formsDataDoc.approvals?.staff1?.approved}, Staff2: ${formsDataDoc.approvals?.staff2?.approved}, Staff3: ${formsDataDoc.approvals?.staff3?.approved}`);
        // Instead of blocking, allow access but show warning
        // return res.status(403).json({
        //   status: 'failed',
        //   message: 'Form is not ready for Staff4 cross-verification. All previous staff levels must be complete.'
        // });
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
        logger.warn('Error fetching original form data for Staff4:', originalError);
        // Continue without original form data
      }

      // Merge all form data - originalFormData takes highest priority
      const allFormData = {
        ...formsDataDoc.fields,
        ...formsDataDoc.data,
        ...(originalFormData ? originalFormData.toObject() : {})
      };

      logger.info(`Staff4 getFormById: Merged form data. Fields count: ${Object.keys(allFormData).length}`);
      if (originalFormData) {
        logger.info(`Staff4 getFormById: Original form data found with ${Object.keys(originalFormData.toObject()).length} fields`);
      } else {
        logger.warn(`Staff4 getFormById: No original form data found. formId: ${formsDataDoc.formId}, serviceType: ${formsDataDoc.serviceType}`);
      }

      // Log available data for sale-deed
      if (formsDataDoc.serviceType === 'sale-deed') {
        logger.info(`Staff4 getFormById: Sale-deed data available - sellers: ${Array.isArray(allFormData.sellers) ? allFormData.sellers.length : 'N/A'}, buyers: ${Array.isArray(allFormData.buyers) ? allFormData.buyers.length : 'N/A'}, khasraNo: ${allFormData.khasraNo || 'N/A'}, plotNo: ${allFormData.plotNo || 'N/A'}`);
      }

      // Organize data by staff sections based on form type
      // Use Staff4Controller explicitly since these are static methods
      const staff1Data = Staff4Controller.extractStaff1Data(allFormData, formsDataDoc.serviceType);
      const staff2Data = Staff4Controller.extractStaff2Data(allFormData, formsDataDoc.serviceType, formsDataDoc);
      const staff3Data = Staff4Controller.extractStaff3Data(allFormData, formsDataDoc.serviceType);
      
      logger.info(`Staff4 getFormById: Extracted sections - Staff1: ${Object.keys(staff1Data).length} fields, Staff2: ${Object.keys(staff2Data).length} fields, Staff3: ${Object.keys(staff3Data).length} fields`);

      // Build processed form with organized sections
      const processedForm = {
        ...formsDataDoc.toObject(),
        data: allFormData,
        originalFormData: originalFormData ? originalFormData.toObject() : null,
        // Organized by staff sections for cross-verification
        staffSections: {
          staff1: staff1Data,
          staff2: staff2Data,
          staff3: staff3Data
        }
      };

      logger.info(`Staff4 getFormById: Successfully processed form ${id}. Staff sections - Staff1 fields: ${Object.keys(staff1Data).length}, Staff2 fields: ${Object.keys(staff2Data).length}, Staff3 fields: ${Object.keys(staff3Data).length}`);

      // Log the action
      await AuditLog.logAction({
        userId: req.user.id,
        userRole: req.user.role,
        action: 'form_view',
        resource: 'staff4_form',
        resourceId: formsDataDoc._id,
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
      logger.error('Error stack:', error.stack);
      res.status(500).json({
        status: 'failed',
        message: error.message || 'Error retrieving form',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Extract Staff1 verified data (Primary Details)
   */
  static extractStaff1Data(allFormData, serviceType) {
    if (serviceType === 'sale-deed') {
      // Handle sellers - could be array or object
      let sellers = [];
      if (Array.isArray(allFormData.sellers)) {
        sellers = allFormData.sellers;
      } else if (allFormData.sellers && typeof allFormData.sellers === 'object') {
        // Convert object to array
        sellers = Object.values(allFormData.sellers).filter(s => s && typeof s === 'object');
      }
      
      // Handle buyers
      let buyers = [];
      if (Array.isArray(allFormData.buyers)) {
        buyers = allFormData.buyers;
      } else if (allFormData.buyers && typeof allFormData.buyers === 'object') {
        buyers = Object.values(allFormData.buyers).filter(b => b && typeof b === 'object');
      }
      
      // Handle witnesses
      let witnesses = [];
      if (Array.isArray(allFormData.witnesses)) {
        witnesses = allFormData.witnesses;
      } else if (allFormData.witnesses && typeof allFormData.witnesses === 'object') {
        witnesses = Object.values(allFormData.witnesses).filter(w => w && typeof w === 'object');
      }

      return {
        documentType: allFormData.documentType || '',
        propertyType: allFormData.propertyType || '',
        plotType: allFormData.plotType || '',
        salePrice: allFormData.salePrice || 0,
        circleRateAmount: allFormData.circleRateAmount || 0,
        // Basic seller, buyer, witness info (without ID verification)
        sellers: sellers.map(s => ({
          name: s?.name || '',
          relation: s?.relation || '',
          address: s?.address || '',
          mobile: s?.mobile || ''
        })),
        buyers: buyers.map(b => ({
          name: b?.name || '',
          relation: b?.relation || '',
          address: b?.address || '',
          mobile: b?.mobile || ''
        })),
        witnesses: witnesses.map(w => ({
          name: w?.name || '',
          relation: w?.relation || '',
          address: w?.address || '',
          mobile: w?.mobile || ''
        })),
        // Basic property area info
        area: allFormData.area || 0,
        areaUnit: allFormData.areaUnit || 'sq_meters',
        areaInputType: allFormData.areaInputType || 'total'
      };
    }
    
    // For other form types, return basic application info
    return {
      applicantName: allFormData.applicantName || allFormData.name || allFormData.testatorName || 'N/A',
      applicantEmail: allFormData.applicantEmail || allFormData.email || 'N/A',
      phoneNumber: allFormData.phoneNumber || allFormData.mobile || allFormData.phone || 'N/A',
      serviceType: serviceType,
      ...allFormData
    };
  }

  /**
   * Extract Staff2 verified data (Trustee/Payment Details)
   */
  static extractStaff2Data(allFormData, serviceType, formsDataDoc) {
    if (serviceType === 'sale-deed') {
      // Handle sellers - could be array or object
      let sellers = [];
      if (Array.isArray(allFormData.sellers)) {
        sellers = allFormData.sellers;
      } else if (allFormData.sellers && typeof allFormData.sellers === 'object') {
        sellers = Object.values(allFormData.sellers).filter(s => s && typeof s === 'object');
      }
      
      // Handle buyers
      let buyers = [];
      if (Array.isArray(allFormData.buyers)) {
        buyers = allFormData.buyers;
      } else if (allFormData.buyers && typeof allFormData.buyers === 'object') {
        buyers = Object.values(allFormData.buyers).filter(b => b && typeof b === 'object');
      }
      
      // Handle witnesses
      let witnesses = [];
      if (Array.isArray(allFormData.witnesses)) {
        witnesses = allFormData.witnesses;
      } else if (allFormData.witnesses && typeof allFormData.witnesses === 'object') {
        witnesses = Object.values(allFormData.witnesses).filter(w => w && typeof w === 'object');
      }

      return {
        // Detailed seller verification with ID
        sellers: sellers.map(s => ({
          name: s?.name || '',
          relation: s?.relation || '',
          address: s?.address || '',
          mobile: s?.mobile || '',
          idType: s?.idType || '',
          idNo: s?.idNo || ''
        })),
        // Detailed buyer verification with ID
        buyers: buyers.map(b => ({
          name: b?.name || '',
          relation: b?.relation || '',
          address: b?.address || '',
          mobile: b?.mobile || '',
          idType: b?.idType || '',
          idNo: b?.idNo || ''
        })),
        // Detailed witness verification
        witnesses: witnesses.map(w => ({
          name: w?.name || '',
          relation: w?.relation || '',
          address: w?.address || '',
          mobile: w?.mobile || ''
        })),
        // Payment/stamp information
        salePrice: allFormData.salePrice || 0,
        circleRateAmount: allFormData.circleRateAmount || 0,
        stampDuty: formsDataDoc?.paymentInfo?.calculations?.stampDuty || allFormData?.calculations?.stampDuty || allFormData?.stampDuty || 0,
        registrationCharge: formsDataDoc?.paymentInfo?.calculations?.registrationCharge || allFormData?.calculations?.registrationCharge || allFormData?.registrationCharge || 0,
        courtFee: formsDataDoc?.paymentInfo?.calculations?.courtFee || allFormData?.calculations?.courtFee || allFormData?.courtFee || 0,
        totalPayable: formsDataDoc?.paymentInfo?.calculations?.totalPayable || allFormData?.calculations?.totalPayable || allFormData?.totalPayable || 0,
        paymentStatus: formsDataDoc?.paymentInfo?.paymentStatus || allFormData?.paymentStatus || 'pending'
      };
    }
    
    // For other form types, extract trustee or equivalent party details
    return {
      trusteeName: allFormData.trusteeName || allFormData.agentName || 'N/A',
      trusteeAddress: allFormData.trusteeAddress || allFormData.agentAddress || 'N/A',
      trusteePhone: allFormData.trusteePhone || allFormData.agentPhone || allFormData.agentMobile || 'N/A',
      trusteeIdNumber: allFormData.trusteeIdNumber || allFormData.agentIdNumber || allFormData.agentIdNo || 'N/A'
    };
  }

  /**
   * Extract Staff3 verified data (Land/Plot Details)
   */
  static extractStaff3Data(allFormData, serviceType) {
    if (serviceType === 'sale-deed') {
      return {
        // Property Description
        state: allFormData.state || '',
        district: allFormData.district || '',
        tehsil: allFormData.tehsil || '',
        village: allFormData.village || '',
        khasraNo: allFormData.khasraNo || '',
        plotNo: allFormData.plotNo || '',
        colonyName: allFormData.colonyName || '',
        wardNo: allFormData.wardNo || '',
        streetNo: allFormData.streetNo || '',
        roadSize: allFormData.roadSize || 0,
        roadUnit: allFormData.roadUnit || 'meter',
        doubleSideRoad: allFormData.doubleSideRoad || false,
        // Property Directions
        directionNorth: allFormData.directionNorth || '',
        directionEast: allFormData.directionEast || '',
        directionSouth: allFormData.directionSouth || '',
        directionWest: allFormData.directionWest || ''
      };
    }
    
    // For other form types, return empty or minimal land data
    return {
      landOwner: allFormData.landOwner || 'N/A',
      plotNumber: allFormData.plotNumber || allFormData.plotNo || 'N/A',
      landLocation: allFormData.landLocation || allFormData.propertyLocation || 'N/A',
      surveyNumber: allFormData.surveyNumber || allFormData.khasraNo || 'N/A'
    };
  }

  /**
   * Cross-verify form by Staff4
   */
  static async crossVerifyForm(req, res) {
    try {
      const { id } = req.params;
      const { approved, verificationNotes, updatedFields, corrections } = req.body;
      const userId = req.user?.id;

      logger.info(`Staff4 crossVerifyForm called for form: ${id} by user: ${userId}`);
      logger.info(`Staff4 crossVerifyForm params:`, { approved, hasNotes: !!verificationNotes, hasUpdatedFields: !!updatedFields, correctionsCount: corrections?.length || 0 });

      if (!userId) {
        logger.error('Staff4 crossVerifyForm: User ID not found in request');
        return res.status(401).json({
          status: 'failed',
          message: 'Authentication required'
        });
      }

      const form = await FormsData.findById(id);
      if (!form) {
        logger.warn(`Staff4 crossVerifyForm: Form ${id} not found`);
        return res.status(404).json({
          status: 'failed',
          message: 'Form not found'
        });
      }

      logger.info(`Staff4 crossVerifyForm: Form found. Current approvals - Staff1: ${form.approvals?.staff1?.approved}, Staff2: ${form.approvals?.staff2?.approved}, Staff3: ${form.approvals?.staff3?.approved}`);

      // Check if form is ready for Staff4 cross-verification
      if (!form.approvals?.staff1?.approved || !form.approvals?.staff2?.approved || !form.approvals?.staff3?.approved) {
        logger.warn(`Staff4 crossVerifyForm: Form ${id} is not ready for cross-verification. Missing approvals.`);
        return res.status(403).json({
          status: 'failed',
          message: 'Form is not ready for Staff4 cross-verification. All previous staff levels must be complete.'
        });
      }

      // Update form with Staff4 cross-verification using $set operator for nested fields
      const $set = {};
      
      // Update Staff4 approval fields
      $set['approvals.staff4.approved'] = approved;
      $set['approvals.staff4.verifiedBy'] = userId;
      $set['approvals.staff4.verifiedAt'] = new Date();
      if (verificationNotes) {
        $set['approvals.staff4.notes'] = verificationNotes;
      }
      if (corrections && corrections.length > 0) {
        $set['approvals.staff4.correctionsMade'] = corrections;
      }
      
      // Update form status
      if (approved) {
        $set.status = 'cross_verified';
        $set['approvals.staff4.status'] = 'verified';
      } else {
        $set.status = 'needs_correction';
        $set['approvals.staff4.status'] = 'needs_correction';
      }
      
      // If approved and there are corrections/updates, update form data
      if (approved && updatedFields) {
        $set.data = { ...form.data, ...updatedFields };
        if (corrections && corrections.length > 0) {
          $set['approvals.staff4.correctionsMade'] = corrections;
        }
      }

      // Also update last activity fields
      $set.lastActivityBy = userId;
      $set.lastActivityAt = new Date();

      logger.info(`Staff4 crossVerifyForm: Updating form ${id} with $set data:`, JSON.stringify($set, null, 2));

      const updatedForm = await FormsData.findByIdAndUpdate(
        id,
        { $set },
        { new: true, runValidators: false }
      );

      if (!updatedForm) {
        logger.error(`Staff4 crossVerifyForm: Form ${id} not found after update`);
        return res.status(404).json({
          status: 'failed',
          message: 'Form not found'
        });
      }

      // Mark nested fields as modified to ensure they're saved
      updatedForm.markModified('approvals.staff4');
      await updatedForm.save();

      logger.info(`Staff4 crossVerifyForm: Successfully updated form ${id}. Approved: ${approved}, Status: ${updatedForm.status}`);

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
      logger.error('Error stack:', error.stack);
      res.status(500).json({
        status: 'failed',
        message: error.message || 'Error processing cross-verification',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
   * Submit Staff4 work report
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

      // Create a comprehensive work report entry (same format as Staff1/Staff2/Staff3)
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
        details: `Staff4 submitted work report with ${pendingReports.length} processed forms`,
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
      logger.error('Error submitting Staff4 work report:', error);
      res.status(500).json({
        status: 'failed',
        message: error.message || 'Error submitting work report'
      });
    }
  }

  /**
   * Submit cross-verification report
   */
  static async submitCrossVerificationReport(req, res) {
    try {
      const {
        date,
        formsCrossVerified = [],
        formsCorrected = [],
        formsRejected = [],
        totalFormsProcessed = 0,
        correctionsMade = [],
        verificationNotes = '',
        recommendations = ''
      } = req.body;

      const userId = req.user.id;

      logger.info(`Staff4 submitCrossVerificationReport called by user: ${userId}`);
      logger.info(`Report data:`, {
        date,
        formsCrossVerified: formsCrossVerified.length,
        formsCorrected: formsCorrected.length,
        formsRejected: formsRejected.length,
        totalFormsProcessed
      });

      // Validate that at least one form is processed
      if (formsCrossVerified.length === 0 && formsCorrected.length === 0 && formsRejected.length === 0) {
        return res.status(400).json({
          status: 'failed',
          message: 'Please select at least one form that was processed today.'
        });
      }

      // Mark all pending reports for these forms as submitted
      const allFormIds = [...formsCrossVerified, ...formsCorrected, ...formsRejected];
      if (allFormIds.length > 0) {
        await StaffReport.updateMany(
          {
            staffId: userId,
            formId: { $in: allFormIds },
            isSubmitted: false
          },
          {
            isSubmitted: true,
            submittedAt: new Date()
          }
        );
      }

      // Create a comprehensive cross-verification report entry
      const reportData = {
        staffId: userId,
        formId: null, // This is a general work report, not tied to a specific form
        formType: 'cross-verification-report',
        verificationStatus: 'submitted',
        remarks: verificationNotes || 'Cross-verification report submitted',
        verificationNotes: `
          Cross-Verification Report - ${date}
          
          Forms Cross-Verified: ${formsCrossVerified.length}
          ${formsCrossVerified.map(id => `  - ${id}`).join('\n')}
          
          Forms Corrected: ${formsCorrected.length}
          ${formsCorrected.map(id => `  - ${id}`).join('\n')}
          
          Forms Rejected: ${formsRejected.length}
          ${formsRejected.map(id => `  - ${id}`).join('\n')}
          
          Total Forms Processed: ${totalFormsProcessed || allFormIds.length}
          
          Verification Notes: ${verificationNotes || 'No notes provided'}
          
          Recommendations: ${recommendations || 'No recommendations provided'}
          
          Corrections Made: ${correctionsMade.length > 0 ? correctionsMade.join(', ') : 'None'}
        `,
        isSubmitted: true,
        submittedAt: new Date(),
        // Store additional metadata
        metadata: {
          formsCrossVerified,
          formsCorrected,
          formsRejected,
          totalFormsProcessed,
          correctionsMade,
          recommendations,
          reportDate: date
        }
      };

      const workReport = new StaffReport(reportData);
      await workReport.save();

      logger.info(`Staff4 cross-verification report submitted successfully. Report ID: ${workReport._id}`);

      // Log the action
      await AuditLog.logAction({
        userId: userId,
        userRole: req.user.role,
        action: 'cross_verification_report_submission',
        resource: 'staff_reports',
        resourceId: workReport._id,
        details: `Staff4 submitted cross-verification report with ${formsCrossVerified.length} verified, ${formsCorrected.length} corrected, ${formsRejected.length} rejected`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        status: 'success',
        message: 'Cross-verification report submitted successfully',
        data: {
          workReport,
          formsCrossVerified: formsCrossVerified.length,
          formsCorrected: formsCorrected.length,
          formsRejected: formsRejected.length,
          totalFormsProcessed: totalFormsProcessed || allFormIds.length
        }
      });

    } catch (error) {
      logger.error('Error submitting Staff4 cross-verification report:', error);
      logger.error('Error stack:', error.stack);
      res.status(500).json({
        status: 'failed',
        message: error.message || 'Error submitting cross-verification report',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Get Staff4's work reports
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
      logger.error('Error getting Staff4 work reports:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error retrieving work reports'
      });
    }
  }
}

export default Staff4Controller;
