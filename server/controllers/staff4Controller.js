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
      const { page = 1, limit = 10, status, formType, search, verificationStage, serviceType } = req.query;
      const userId = req.user.id;
      
      // Build query for Staff4 forms
      // Staff 4 scans ALL documents: Staff 1 drafts, E-Stamp, Map Module, and all other forms
      let query = {};

      // If status is 'cross_verified', show forms that Staff4 has verified
      if (status === 'cross_verified') {
        query = {
          'approvals.staff4.approved': true,  // Staff4 has verified
          'approvals.staff4.verifiedBy': userId  // Verified by current Staff4 user
        };
        query.status = 'cross_verified';  // Also match the status field
      } else {
        // Handle verification stage filter first (if specified)
        if (verificationStage === 'staff1_drafts') {
          // Only Staff 1 drafts
          query = {
            $or: [
              { 'approvals.staff1.approved': { $ne: true } },
              { 'approvals.staff1.approved': { $exists: false } }
            ]
          };
        } else if (verificationStage === 'e_stamp') {
          // Only E-Stamp forms
          query = {
            serviceType: 'e-stamp'
          };
        } else if (verificationStage === 'map_module') {
          // Only Map Module forms
          query = {
            serviceType: 'map-module'
          };
        } else if (verificationStage === 'staff1_complete') {
          query = {
            'approvals.staff1.approved': true,
            'approvals.staff2.approved': { $ne: true }
          };
        } else if (verificationStage === 'staff2_complete') {
          query = {
            'approvals.staff1.approved': true,
            'approvals.staff2.approved': true,
            'approvals.staff3.approved': { $ne: true }
          };
        } else if (verificationStage === 'staff3_complete') {
          query = {
            'approvals.staff1.approved': true,
            'approvals.staff2.approved': true,
            'approvals.staff3.approved': true,
            'approvals.staff4.approved': { $ne: true }
          };
        } else if (verificationStage === 'all_complete') {
          // Show all forms that have passed all staff levels (including Staff4)
          query = {
            'approvals.staff1.approved': true,
            'approvals.staff2.approved': true,
            'approvals.staff3.approved': true
          };
        } else {
          // Default: Staff 4 can see ALL documents
          // Since Staff 4 scans all documents, we'll use an empty query to get everything
          // This is simpler and more reliable than complex $or conditions
          query = {};
        }

        // Add other status filters (if not already set above)
        if (status && status !== 'cross_verified') {
          if (query.$or && Array.isArray(query.$or)) {
            // If we have $or conditions, wrap them with $and to add status filter
            query = {
              $and: [
                { $or: query.$or },
                { status: status }
              ]
            };
          } else {
            query.status = status;
          }
        }
      }

      // Filter by serviceType if provided
      if (serviceType) {
        if (query.$or && Array.isArray(query.$or)) {
          // If we have $or conditions, wrap them with $and to add serviceType filter
          query = {
            $and: [
              { $or: query.$or },
              { serviceType: serviceType }
            ]
          };
        } else if (query.$and && Array.isArray(query.$and)) {
          // If we already have $and, add serviceType to it
          query.$and.push({ serviceType: serviceType });
        } else {
          query.serviceType = serviceType;
        }
      }

      // Fix: FormsData uses 'serviceType', not 'formType'
      if (formType && !serviceType) {
        // Map formType to serviceType
        const serviceTypeMap = {
          'sale-deed': 'sale-deed',
          'will-deed': 'will-deed',
          'trust-deed': 'trust-deed',
          'property-registration': 'property-registration',
          'property-sale-certificate': 'property-sale-certificate',
          'power-of-attorney': 'power-of-attorney',
          'adoption-deed': 'adoption-deed',
          'e-stamp': 'e-stamp',
          'map-module': 'map-module'
        };
        const mappedServiceType = serviceTypeMap[formType] || formType;
        
        if (query.$or && Array.isArray(query.$or)) {
          // Wrap $or with $and to add serviceType filter
          query = {
            $and: [
              { $or: query.$or },
              { serviceType: mappedServiceType }
            ]
          };
        } else if (query.$and && Array.isArray(query.$and)) {
          // If we already have $and, add serviceType to it
          query.$and.push({ serviceType: mappedServiceType });
        } else {
          query.serviceType = mappedServiceType;
        }
      }

      // Enhanced search filter - include all form types and E-Stamp/Map Module fields
      if (search) {
        const searchRegex = { $regex: search, $options: 'i' };
        const searchConditions = [
          { _id: searchRegex },
          { serviceType: searchRegex },
          { formTitle: searchRegex },
          { formDescription: searchRegex },
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
          { 'data.sellers': { $elemMatch: { name: searchRegex } } },
          { 'data.buyers': { $elemMatch: { name: searchRegex } } },
          // E-Stamp fields
          { 'data.f_name': searchRegex },
          { 'data.s_name': searchRegex },
          { 'data.property': searchRegex },
          { 'data.article': searchRegex },
          // Map Module fields
          { 'data.propertyType': searchRegex },
          { 'data.propertySubType': searchRegex },
          { 'data.propertyAddress': searchRegex }
        ];

        // If query already has $or or $and, combine with $and
        if (query.$or && Array.isArray(query.$or)) {
          if (query.$and && Array.isArray(query.$and)) {
            // Already has $and, add search to it
            query.$and.push({ $or: searchConditions });
          } else {
            // Convert $or to $and with search
            query = {
              $and: [
                { $or: query.$or },
                { $or: searchConditions }
              ]
            };
          }
        } else if (query.$and && Array.isArray(query.$and)) {
          // Already has $and, add search to it
          query.$and.push({ $or: searchConditions });
        } else {
          // No existing $or or $and, just use search
          query.$or = searchConditions;
        }
      }

      // Ensure query is not empty - if it is, return all forms
      if (Object.keys(query).length === 0) {
        query = {};
      }

      // Log the query for debugging
      logger.info('Staff4 getForms query:', JSON.stringify(query, null, 2));
      logger.info('Staff4 getForms params:', { page, limit, status, formType, search, verificationStage, serviceType });

      const skip = (page - 1) * limit;
      
      // For verified forms, sort by verification date; otherwise sort by creation date
      const sortOrder = status === 'cross_verified' 
        ? { 'approvals.staff4.verifiedAt': -1 } 
        : { createdAt: -1 };
      
      let forms, total;
      try {
        forms = await FormsData.find(query)
          .populate('userId', 'name email')
          .populate('assignedTo', 'name email role')
          .sort(sortOrder)
          .skip(skip)
          .limit(parseInt(limit));

        total = await FormsData.countDocuments(query);
      } catch (dbError) {
        logger.error('Database query error in Staff4 getForms:', dbError);
        logger.error('Query that failed:', JSON.stringify(query, null, 2));
        
        // Fallback: Try a simpler query if the complex one fails
        try {
          logger.warn('Attempting fallback query: all forms');
          const fallbackQuery = {};
          forms = await FormsData.find(fallbackQuery)
            .populate('userId', 'name email')
            .populate('assignedTo', 'name email role')
            .sort(sortOrder)
            .skip(skip)
            .limit(parseInt(limit));
          total = await FormsData.countDocuments(fallbackQuery);
          logger.info('Fallback query succeeded, returning all forms');
        } catch (fallbackError) {
          logger.error('Fallback query also failed:', fallbackError);
          throw new Error(`Database query failed: ${dbError.message}`);
        }
      }
      
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
      logger.error('Error stack:', error.stack);
      res.status(500).json({
        status: 'failed',
        message: error.message || 'Error retrieving forms',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
        // Mark form as ready for delivery
        $set['delivery.readyForDeliveryAt'] = new Date();
        $set['delivery.status'] = 'pending_user_selection';
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

  /**
   * Get forms ready for delivery management
   */
  static async getDeliveryForms(req, res) {
    try {
      const { page = 1, limit = 10, status, search } = req.query;
      const userId = req.user.id;

      // Find forms that are completed/cross-verified and ready for delivery
      let query = {
        $or: [
          { 'approvals.staff4.approved': true },
          { status: 'cross_verified' },
          { status: 'completed' }
        ],
        'delivery.status': { $ne: 'delivered' } // Exclude already delivered
      };

      // Filter by delivery status
      if (status) {
        query['delivery.status'] = status;
      }

      // Search filter
      if (search) {
        const searchRegex = { $regex: search, $options: 'i' };
        query.$or = [
          { _id: searchRegex },
          { serviceType: searchRegex },
          { 'data.applicantName': searchRegex },
          { 'data.name': searchRegex },
          { 'userId.name': searchRegex },
          { 'userId.email': searchRegex }
        ];
      }

      const skip = (page - 1) * limit;
      
      const forms = await FormsData.find(query)
        .populate('userId', 'name email phone')
        .populate('delivery.staff4Decision.decidedBy', 'name email')
        .sort({ 'delivery.readyForDeliveryAt': -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await FormsData.countDocuments(query);

      // Calculate which forms need Staff4 decision (1 week passed without user selection)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const processedForms = forms.map(form => {
        const formObj = form.toObject();
        const readyDate = form.delivery?.readyForDeliveryAt || form.updatedAt || form.createdAt;
        const needsStaff4Decision = 
          form.delivery?.status === 'pending_user_selection' && 
          readyDate < oneWeekAgo;
        
        formObj.needsStaff4Decision = needsStaff4Decision;
        formObj.daysSinceReady = Math.floor((new Date() - readyDate) / (1000 * 60 * 60 * 24));
        return formObj;
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
      logger.error('Error getting delivery forms:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error retrieving delivery forms'
      });
    }
  }

  /**
   * Set delivery method by Staff4
   */
  static async setDeliveryMethod(req, res) {
    try {
      const { id } = req.params;
      const { method, deliveryAddress, contactPhone, trackingNumber, notes } = req.body;
      const userId = req.user.id;

      if (!method || !['pickup', 'courier', 'email', 'postal'].includes(method)) {
        return res.status(400).json({
          status: 'failed',
          message: 'Valid delivery method is required'
        });
      }

      const form = await FormsData.findById(id);
      if (!form) {
        return res.status(404).json({
          status: 'failed',
          message: 'Form not found'
        });
      }

      // Update delivery information
      form.delivery = form.delivery || {};
      form.delivery.staff4Decision = {
        method,
        decidedAt: new Date(),
        decidedBy: userId,
        deliveryAddress: deliveryAddress || null,
        contactPhone: contactPhone || null,
        trackingNumber: trackingNumber || null,
        notes: notes || null
      };
      form.delivery.finalMethod = method;
      form.delivery.status = 'staff4_decided';

      // If readyForDeliveryAt is not set, set it now
      if (!form.delivery.readyForDeliveryAt) {
        form.delivery.readyForDeliveryAt = new Date();
      }

      await form.save();

      // Log the action
      await AuditLog.logAction({
        userId: req.user.id,
        userRole: req.user.role,
        action: 'delivery_method_set',
        resource: 'forms_data',
        resourceId: id,
        details: `Staff4 set delivery method: ${method}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        status: 'success',
        message: 'Delivery method set successfully',
        data: { form }
      });
    } catch (error) {
      logger.error('Error setting delivery method:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error setting delivery method'
      });
    }
  }

  /**
   * Mark form as dispatched
   */
  static async markDispatched(req, res) {
    try {
      const { id } = req.params;
      const { trackingNumber, notes } = req.body;
      const userId = req.user.id;

      const form = await FormsData.findById(id);
      if (!form) {
        return res.status(404).json({
          status: 'failed',
          message: 'Form not found'
        });
      }

      form.delivery = form.delivery || {};
      form.delivery.status = 'dispatched';
      form.delivery.dispatchedAt = new Date();
      if (trackingNumber) {
        form.delivery.staff4Decision = form.delivery.staff4Decision || {};
        form.delivery.staff4Decision.trackingNumber = trackingNumber;
      }
      if (notes) {
        form.delivery.staff4Decision = form.delivery.staff4Decision || {};
        form.delivery.staff4Decision.notes = notes;
      }

      await form.save();

      await AuditLog.logAction({
        userId: req.user.id,
        userRole: req.user.role,
        action: 'delivery_dispatched',
        resource: 'forms_data',
        resourceId: id,
        details: 'Form marked as dispatched',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        status: 'success',
        message: 'Form marked as dispatched',
        data: { form }
      });
    } catch (error) {
      logger.error('Error marking form as dispatched:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error marking form as dispatched'
      });
    }
  }

  /**
   * Mark form as delivered
   */
  static async markDelivered(req, res) {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const userId = req.user.id;

      const form = await FormsData.findById(id);
      if (!form) {
        return res.status(404).json({
          status: 'failed',
          message: 'Form not found'
        });
      }

      form.delivery = form.delivery || {};
      form.delivery.status = 'delivered';
      form.delivery.deliveredAt = new Date();
      if (notes) {
        form.delivery.staff4Decision = form.delivery.staff4Decision || {};
        form.delivery.staff4Decision.notes = (form.delivery.staff4Decision.notes || '') + '\n' + notes;
      }

      await form.save();

      await AuditLog.logAction({
        userId: req.user.id,
        userRole: req.user.role,
        action: 'delivery_completed',
        resource: 'forms_data',
        resourceId: id,
        details: 'Form marked as delivered',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        status: 'success',
        message: 'Form marked as delivered',
        data: { form }
      });
    } catch (error) {
      logger.error('Error marking form as delivered:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error marking form as delivered'
      });
    }
  }

  /**
   * Generate final document PDF for a verified form
   */
  static async generateFinalDocument(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Fetch the form
      const formsDataDoc = await FormsData.findById(id)
        .populate('userId', 'name email')
        .populate('approvals.staff1.verifiedBy', 'name')
        .populate('approvals.staff2.verifiedBy', 'name')
        .populate('approvals.staff3.verifiedBy', 'name')
        .populate('approvals.staff4.verifiedBy', 'name');

      if (!formsDataDoc) {
        return res.status(404).json({
          status: 'failed',
          message: 'Form not found'
        });
      }

      // Check if form is ready for final document (all approvals complete)
      const isReady = formsDataDoc.approvals?.staff1?.approved &&
                      formsDataDoc.approvals?.staff2?.approved &&
                      formsDataDoc.approvals?.staff3?.approved &&
                      formsDataDoc.approvals?.staff4?.approved;

      if (!isReady) {
        return res.status(400).json({
          status: 'failed',
          message: 'Form is not ready for final document generation. All staff approvals must be complete.'
        });
      }

      // Fetch original form data if available
      let originalFormData = null;
      if (formsDataDoc.formId && formsDataDoc.serviceType) {
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

          const Model = modelMap[formsDataDoc.serviceType];
          if (Model) {
            originalFormData = await Model.findById(formsDataDoc.formId);
          }
        } catch (error) {
          logger.warn('Error fetching original form data for final document:', error);
        }
      }

      // Merge all form data
      const allFormData = {
        ...formsDataDoc.fields,
        ...formsDataDoc.data,
        ...(originalFormData ? originalFormData.toObject() : {})
      };

      // Import PDFDocument
      const PDFDocument = (await import('pdfkit')).default;
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Final Document - ${formsDataDoc.serviceType?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
          Author: 'Property Registration System',
          Subject: 'Final Verified Document',
          Creator: 'Staff4 Final Document Generator'
        }
      });

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="final-document-${formsDataDoc._id}.pdf"`);

      // Pipe PDF to response
      doc.pipe(res);

      // Helper functions
      const formatFieldName = (key) => {
        return key
          .replace(/([A-Z])/g, ' $1')
          .replace(/[_-]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase())
          .trim();
      };

      const formatValue = (value) => {
        if (value === null || value === undefined) return 'N/A';
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
          return JSON.stringify(value, null, 2);
        }
        if (Array.isArray(value)) {
          return value.map(item => typeof item === 'object' ? JSON.stringify(item) : String(item)).join(', ');
        }
        return String(value);
      };

      let yPos = 50;

      // Header
      doc.fontSize(24).font('Helvetica-Bold').fillColor('black')
        .text('FINAL DOCUMENT', 50, yPos, { align: 'center' });
      yPos += 30;
      
      doc.fontSize(16).font('Helvetica')
        .text(formsDataDoc.serviceType?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Form', 50, yPos, { align: 'center' });
      yPos += 40;

      // Form Information Section
      doc.fontSize(14).font('Helvetica-Bold').text('Form Information', 50, yPos);
      yPos += 20;
      doc.moveTo(50, yPos).lineTo(545, yPos).stroke();
      yPos += 15;

      doc.fontSize(10).font('Helvetica');
      doc.text(`Form ID: ${formsDataDoc._id}`, 60, yPos);
      yPos += 15;
      doc.text(`Formatted ID: ${formsDataDoc.formattedFormId || 'N/A'}`, 60, yPos);
      yPos += 15;
      doc.text(`Service Type: ${formsDataDoc.serviceType?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`, 60, yPos);
      yPos += 15;
      doc.text(`Status: ${formsDataDoc.status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`, 60, yPos);
      yPos += 15;
      
      if (formsDataDoc.userId) {
        doc.text(`Submitted By: ${formsDataDoc.userId.name || 'N/A'}`, 60, yPos);
        yPos += 15;
        doc.text(`Email: ${formsDataDoc.userId.email || 'N/A'}`, 60, yPos);
        yPos += 15;
      }
      
      doc.text(`Created At: ${new Date(formsDataDoc.createdAt).toLocaleString()}`, 60, yPos);
      yPos += 20;

      // Verification Status Section
      doc.fontSize(14).font('Helvetica-Bold').text('Verification Status', 50, yPos);
      yPos += 20;
      doc.moveTo(50, yPos).lineTo(545, yPos).stroke();
      yPos += 15;

      doc.fontSize(10).font('Helvetica');
      const staffLevels = ['staff1', 'staff2', 'staff3', 'staff4'];
      staffLevels.forEach((staff, index) => {
        const approval = formsDataDoc.approvals?.[staff];
        if (approval) {
          const verifiedBy = approval.verifiedBy?.name || 'N/A';
          const verifiedAt = approval.verifiedAt ? new Date(approval.verifiedAt).toLocaleString() : 'N/A';
          const status = approval.approved ? '✓ Approved' : '✗ Pending';
          
          doc.text(`${staff.toUpperCase()}: ${status}`, 60, yPos);
          yPos += 12;
          doc.fontSize(9).text(`  Verified by: ${verifiedBy}`, 70, yPos);
          yPos += 12;
          doc.text(`  Verified at: ${verifiedAt}`, 70, yPos);
          yPos += 15;
          doc.fontSize(10);
        }
      });
      yPos += 10;

      // Form Data Section
      if (Object.keys(allFormData).length > 0) {
        if (yPos > 700) {
          doc.addPage();
          yPos = 50;
        }

        doc.fontSize(14).font('Helvetica-Bold').text('Form Data', 50, yPos);
        yPos += 20;
        doc.moveTo(50, yPos).lineTo(545, yPos).stroke();
        yPos += 15;

        doc.fontSize(10).font('Helvetica');
        const excludeFields = ['_id', '__v', 'createdAt', 'updatedAt', 'formId', 'serviceType', 'status', 'userId'];
        
        let fieldCount = 0;
        for (const [key, value] of Object.entries(allFormData)) {
          if (excludeFields.includes(key)) continue;
          if (value === null || value === undefined || value === '') continue;
          
          if (yPos > 750) {
            doc.addPage();
            yPos = 50;
          }

          fieldCount++;
          const fieldName = formatFieldName(key);
          const fieldValue = formatValue(value);
          
          doc.font('Helvetica-Bold').fontSize(9).text(`${fieldName}:`, 60, yPos, { width: 180 });
          doc.font('Helvetica').fontSize(9);
          
          const textHeight = doc.heightOfString(fieldValue, { width: 315 });
          doc.text(fieldValue, 250, yPos, { width: 315 });
          yPos += Math.max(textHeight, 14) + 5;

          if (fieldCount > 150) {
            doc.font('Helvetica-Italic').fontSize(9).text('... (Additional fields omitted for brevity)', 250, yPos);
            break;
          }
        }
      }

      // Footer
      doc.fontSize(8).fillColor('gray');
      const footerY = doc.page.height - 30;
      doc.text(
        `Final Document Generated on ${new Date().toLocaleString()} | Generated by Staff4`,
        50,
        footerY,
        { align: 'center' }
      );

      // Finalize PDF
      doc.end();

      // Log the action
      await AuditLog.logAction({
        userId: req.user.id,
        userRole: req.user.role,
        action: 'final_document_generated',
        resource: 'staff4_final_document',
        resourceId: formsDataDoc._id,
        details: `Generated final document for form ${id}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

    } catch (error) {
      logger.error('Error generating final document:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error generating final document',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

export default Staff4Controller;
