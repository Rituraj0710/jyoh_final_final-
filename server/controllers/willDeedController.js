import WillDeed from "../models/WillDeed.js";
import logger from "../config/logger.js";
import DOMPurify from 'isomorphic-dompurify';

// Input sanitization function
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return DOMPurify.sanitize(input.trim());
  }
  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item));
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  return input;
};

class WillDeedController {
  static create = async (req, res) => {
    try {
      // Sanitize all input data
      const sanitizedData = sanitizeInput(req.body);
      
      // Handle both FormWorkflow and legacy form data
      let formData = sanitizedData;
      
      // If data is wrapped in 'data' field (from FormData), extract it
      if (sanitizedData.data) {
        try {
          formData = JSON.parse(sanitizedData.data);
        } catch (e) {
          formData = sanitizedData;
        }
      }

      const {
        testator,
        testatorName,
        testatorAge,
        testatorAddress,
        testatorMobile,
        testatorIdType,
        testatorIdNumber,
        propertyDetails,
        beneficiaries = [],
        executors = [],
        witnesses = [],
        immovables = [],
        movables = [],
        rules = [],
        conditions = [],
        meta = {}
      } = formData;

      // Handle both legacy and new testator formats
      let finalTestator = testator;
      if (testatorName) {
        finalTestator = {
          prefix: 'श्री',
          name: testatorName,
          fh: '',
          mobile: testatorMobile || '',
          address: testatorAddress || '',
          idType: testatorIdType || 'आधार कार्ड',
          idNo: testatorIdNumber || ''
        };
      }

      // Validation
      if (!finalTestator || !finalTestator.name) {
        logger.warn('Will deed creation failed: Missing testator information', { 
          userId: req.user?.id,
          ip: req.ip
        });
        return res.status(400).json({
          success: false,
          message: "Testator information is required"
        });
      }

      // Validate beneficiaries
      if (!beneficiaries || beneficiaries.length === 0) {
        logger.warn('Will deed creation failed: No beneficiaries provided', { 
          userId: req.user?.id,
          ip: req.ip
        });
        return res.status(400).json({
          success: false,
          message: "At least one beneficiary is required"
        });
      }

      // Validate witnesses (minimum 2 required)
      if (!witnesses || witnesses.length < 2) {
        logger.warn('Will deed creation failed: Insufficient witnesses', { 
          userId: req.user?.id,
          ip: req.ip
        });
        return res.status(400).json({
          success: false,
          message: "At least two witnesses are required"
        });
      }

      // Create will deed
      const willDeedData = {
        testatorName: finalTestator.name,
        testatorAge: testatorAge || 0,
        testatorAddress: finalTestator.address,
        testatorMobile: finalTestator.mobile,
        testatorIdType: finalTestator.idType,
        testatorIdNumber: finalTestator.idNo,
        propertyDetails: propertyDetails || '',
        beneficiaries: beneficiaries,
        executors: executors,
        witnesses: witnesses,
        immovables: immovables,
        movables: movables,
        rules: rules,
        conditions: conditions,
        createdBy: req.user?.id || null,
        status: 'submitted',
        meta: {
          status: 'submitted',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      const willDeed = new WillDeed(willDeedData);
      await willDeed.save();

      logger.info('Will deed created successfully', { 
        willDeedId: willDeed._id,
        userId: req.user?.id,
        testatorName: finalTestator.name
      });

      res.status(201).json({
        success: true,
        message: "Will deed created successfully",
        data: {
          id: willDeed._id,
          testatorName: willDeed.testatorName,
          status: willDeed.meta.status,
          createdAt: willDeed.meta.createdAt
        }
      });

    } catch (error) {
      logger.error('Will deed creation error', { 
        error: error.message,
        stack: error.stack,
        userId: req.user?.id,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  };

  static submit = async (req, res) => {
    try {
      const jsonPart = req.body?.data ? JSON.parse(req.body.data) : req.body;
      if (!jsonPart) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing form data' 
        });
      }

      const sanitizedData = sanitizeInput(jsonPart);

      const willDeedData = {
        meta: sanitizedData.meta || { status: 'submitted' },
        testator: sanitizedData.testator || {},
        beneficiaries: sanitizedData.beneficiaries || [],
        executors: sanitizedData.executors || [],
        witnesses: sanitizedData.witnesses || [],
        immovables: sanitizedData.immovables || [],
        movables: sanitizedData.movables || [],
        rules: sanitizedData.rules || [],
        conditions: sanitizedData.conditions || [],
        createdBy: req.user?._id || null
      };

      // Handle file uploads to Cloudinary
      const { findAndProcessFile, processMultipleFiles } = await import('../utils/fileUploadHelper.js');
      const uploads = { testatorId: '', testatorPhoto: '', personIds: [], personPhotos: [] };
      
      if (req.files && req.files.length > 0) {
        const testatorIdFile = req.files.find(f => f.fieldname === 'testator_id');
        const testatorPhotoFile = req.files.find(f => f.fieldname === 'testator_photo');
        const personIdFiles = req.files.filter(f => f.fieldname.startsWith('person_id_'));
        const personPhotoFiles = req.files.filter(f => f.fieldname.startsWith('person_photo_'));
        
        if (testatorIdFile) {
          const processed = await findAndProcessFile([testatorIdFile], 'testator_id', 'will-deeds/testator');
          if (processed) uploads.testatorId = processed.cloudinaryUrl;
        }
        if (testatorPhotoFile) {
          const processed = await findAndProcessFile([testatorPhotoFile], 'testator_photo', 'will-deeds/testator');
          if (processed) uploads.testatorPhoto = processed.cloudinaryUrl;
        }
        if (personIdFiles.length > 0) {
          const processed = await processMultipleFiles(personIdFiles, 'will-deeds/persons');
          uploads.personIds = processed.map(f => f.cloudinaryUrl);
        }
        if (personPhotoFiles.length > 0) {
          const processed = await processMultipleFiles(personPhotoFiles, 'will-deeds/persons');
          uploads.personPhotos = processed.map(f => f.cloudinaryUrl);
        }
      }
      willDeedData.uploads = uploads;

      const willDeed = new WillDeed(willDeedData);
      await willDeed.save();

      logger.info('Will deed submitted successfully', { 
        willDeedId: willDeed._id,
        userId: req.user?._id
      });

      return res.status(201).json({ 
        success: true, 
        message: 'Will deed submitted successfully', 
        data: { id: willDeed._id } 
      });
    } catch (error) {
      logger.error('Will deed submit error', { 
        error: error.message, 
        stack: error.stack, 
        userId: req.user?._id
      });
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  };

  static getAll = async (req, res) => {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const filter = {};
      
      if (req.user?._id) {
        filter.createdBy = req.user._id;
      }
      if (status && status !== '') {
        filter['meta.status'] = status;
      }
      
      const willDeeds = await WillDeed.find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await WillDeed.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: {
          willDeeds,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          total
        }
      });

    } catch (error) {
      logger.error('Get all will deeds error', { 
        error: error.message,
        userId: req.user?.id
      });
      
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  };

  static getById = async (req, res) => {
    try {
      const { id } = req.params;
      
      const filter = { _id: id };
      if (req.user?._id) {
        filter.createdBy = req.user._id;
      }
      
      const willDeed = await WillDeed.findOne(filter)
        .populate('createdBy', 'name email');

      if (!willDeed) {
        return res.status(404).json({
          success: false,
          message: "Will deed not found"
        });
      }

      res.status(200).json({
        success: true,
        data: { willDeed }
      });

    } catch (error) {
      logger.error('Get will deed by ID error', { 
        error: error.message,
        willDeedId: req.params.id,
        userId: req.user?.id
      });
      
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  };

  static updateStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ['draft', 'submitted', 'approved', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status. Must be one of: draft, submitted, approved, rejected"
        });
      }

      const filter = { _id: id };
      if (req.user?._id) {
        filter.createdBy = req.user._id;
      }
      
      const willDeed = await WillDeed.findOneAndUpdate(
        filter,
        { 'meta.status': status },
        { new: true }
      );

      if (!willDeed) {
        return res.status(404).json({
          success: false,
          message: "Will deed not found"
        });
      }

      logger.info('Will deed status updated', { 
        willDeedId: id,
        newStatus: status,
        userId: req.user?.id
      });

      res.status(200).json({
        success: true,
        message: "Will deed status updated successfully",
        data: { willDeed }
      });

    } catch (error) {
      logger.error('Update will deed status error', { 
        error: error.message,
        willDeedId: req.params.id,
        userId: req.user?.id
      });
      
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  };

  static delete = async (req, res) => {
    try {
      const { id } = req.params;
      
      const filter = { _id: id };
      if (req.user?._id) {
        filter.createdBy = req.user._id;
      }
      
      const willDeed = await WillDeed.findOneAndDelete(filter);

      if (!willDeed) {
        return res.status(404).json({
          success: false,
          message: "Will deed not found"
        });
      }

      logger.info('Will deed deleted', { 
        willDeedId: id,
        userId: req.user?.id
      });

      res.status(200).json({
        success: true,
        message: "Will deed deleted successfully"
      });

    } catch (error) {
      logger.error('Delete will deed error', { 
        error: error.message,
        willDeedId: req.params.id,
        userId: req.user?.id
      });
      
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  };

  static getStats = async (req, res) => {
    try {
      const matchFilter = {};
      if (req.user?._id) {
        matchFilter.createdBy = req.user._id;
      }
      
      const stats = await WillDeed.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: '$meta.status',
            count: { $sum: 1 }
          }
        }
      ]);

      const formattedStats = {
        total: 0,
        draft: 0,
        submitted: 0,
        approved: 0,
        rejected: 0
      };

      stats.forEach(stat => {
        formattedStats[stat._id] = stat.count;
        formattedStats.total += stat.count;
      });

      res.status(200).json({
        success: true,
        data: { stats: formattedStats }
      });

    } catch (error) {
      logger.error('Get will deed stats error', { 
        error: error.message,
        userId: req.user?.id
      });
      
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  };
}

export default WillDeedController;