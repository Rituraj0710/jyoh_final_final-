import PowerOfAttorney from "../models/PowerOfAttorney.js";
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

class PowerOfAttorneyController {
  static create = async (req, res) => {
    try {
      // Sanitize all input data
      const sanitizedData = sanitizeInput(req.body);
      
      const {
        executionDate,
        state,
        district,
        tehsil,
        subRegistrarOffice,
        kartaParties = [],
        agentParties = [],
        witnessParties = [],
        powers = [],
        otherPowersText = '',
        generalPowerCheckbox = false,
        properties = []
      } = sanitizedData;

      // Validation
      if (!executionDate || !state || !district || !tehsil || !subRegistrarOffice) {
        logger.warn('Power of Attorney creation failed: Missing required fields', { 
          userId: req.user?.id,
          ip: req.ip
        });
        return res.status(400).json({
          success: false,
          message: "Missing required fields: executionDate, state, district, tehsil, subRegistrarOffice"
        });
      }

      // Validate parties
      if (!kartaParties || kartaParties.length === 0) {
        logger.warn('Power of Attorney creation failed: No principals provided', { 
          userId: req.user?.id,
          ip: req.ip
        });
        return res.status(400).json({
          success: false,
          message: "At least one principal (karta) is required"
        });
      }

      if (!agentParties || agentParties.length === 0) {
        logger.warn('Power of Attorney creation failed: No agents provided', { 
          userId: req.user?.id,
          ip: req.ip
        });
        return res.status(400).json({
          success: false,
          message: "At least one agent is required"
        });
      }

      if (!witnessParties || witnessParties.length === 0) {
        logger.warn('Power of Attorney creation failed: No witnesses provided', { 
          userId: req.user?.id,
          ip: req.ip
        });
        return res.status(400).json({
          success: false,
          message: "At least one witness is required"
        });
      }

      // Validate powers
      if (!powers || powers.length === 0) {
        logger.warn('Power of Attorney creation failed: No powers specified', { 
          userId: req.user?.id,
          ip: req.ip
        });
        return res.status(400).json({
          success: false,
          message: "At least one power must be granted"
        });
      }

      // Process file uploads
      const files = [];
      if (req.files) {
        Object.keys(req.files).forEach(fieldName => {
          const file = req.files[fieldName][0];
          if (file) {
            files.push({
              field: fieldName,
              filename: file.filename,
              contentType: file.mimetype,
              size: file.size,
              path: file.path
            });
          }
        });
      }

      // Create power of attorney
      const powerOfAttorneyData = {
        executionDate: new Date(executionDate),
        state,
        district,
        tehsil,
        subRegistrarOffice,
        kartaParties,
        agentParties,
        witnessParties,
        powers,
        otherPowersText,
        generalPowerCheckbox: generalPowerCheckbox === true || generalPowerCheckbox === 'true',
        properties,
        files,
        createdBy: req.user?.id || null,
        status: 'submitted',
        amount: 1200, // Base amount for Power of Attorney
        meta: {
          status: 'submitted',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      const powerOfAttorney = new PowerOfAttorney(powerOfAttorneyData);
      await powerOfAttorney.save();

      logger.info('Power of Attorney created successfully', { 
        powerOfAttorneyId: powerOfAttorney._id,
        userId: req.user?.id,
        state,
        district,
        principalsCount: kartaParties.length,
        agentsCount: agentParties.length,
        witnessesCount: witnessParties.length
      });

      res.status(201).json({
        success: true,
        message: "Power of Attorney created successfully",
        data: {
          id: powerOfAttorney._id,
          status: powerOfAttorney.status,
          amount: powerOfAttorney.amount,
          executionDate: powerOfAttorney.executionDate,
          state: powerOfAttorney.state,
          district: powerOfAttorney.district
        }
      });

    } catch (error) {
      logger.error('Power of Attorney creation error', { 
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

  static getAll = async (req, res) => {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const filter = {};
      
      if (req.user?.id) {
        filter.createdBy = req.user.id;
      }
      if (status) {
        filter.status = status;
      }
      
      const powerOfAttorneys = await PowerOfAttorney.find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await PowerOfAttorney.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: {
          powerOfAttorneys,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          total
        }
      });

    } catch (error) {
      logger.error('Get all Power of Attorneys error', { 
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
      if (req.user?.id) {
        filter.createdBy = req.user.id;
      }
      
      const powerOfAttorney = await PowerOfAttorney.findOne(filter)
        .populate('createdBy', 'name email');

      if (!powerOfAttorney) {
        return res.status(404).json({
          success: false,
          message: "Power of Attorney not found"
        });
      }

      res.status(200).json({
        success: true,
        data: { powerOfAttorney }
      });

    } catch (error) {
      logger.error('Get Power of Attorney by ID error', { 
        error: error.message,
        powerOfAttorneyId: req.params.id,
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
      if (req.user?.id) {
        filter.createdBy = req.user.id;
      }

      const powerOfAttorney = await PowerOfAttorney.findOneAndUpdate(
        filter,
        { status },
        { new: true }
      );

      if (!powerOfAttorney) {
        return res.status(404).json({
          success: false,
          message: "Power of Attorney not found"
        });
      }

      logger.info('Power of Attorney status updated', { 
        powerOfAttorneyId: id,
        newStatus: status,
        userId: req.user?.id
      });

      res.status(200).json({
        success: true,
        message: "Power of Attorney status updated successfully",
        data: { powerOfAttorney }
      });

    } catch (error) {
      logger.error('Update Power of Attorney status error', { 
        error: error.message,
        powerOfAttorneyId: req.params.id,
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
      if (req.user?.id) {
        filter.createdBy = req.user.id;
      }
      
      const powerOfAttorney = await PowerOfAttorney.findOneAndDelete(filter);

      if (!powerOfAttorney) {
        return res.status(404).json({
          success: false,
          message: "Power of Attorney not found"
        });
      }

      logger.info('Power of Attorney deleted', { 
        powerOfAttorneyId: id,
        userId: req.user?.id
      });

      res.status(200).json({
        success: true,
        message: "Power of Attorney deleted successfully"
      });

    } catch (error) {
      logger.error('Delete Power of Attorney error', { 
        error: error.message,
        powerOfAttorneyId: req.params.id,
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
      if (req.user?.id) {
        matchFilter.createdBy = req.user.id;
      }
      
      const stats = await PowerOfAttorney.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: '$status',
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
      logger.error('Get Power of Attorney stats error', { 
        error: error.message,
        userId: req.user?.id
      });
      
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  };

  static getUserPowerOfAttorneys = async (req, res) => {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const filter = { createdBy: req.user?.id };
      
      if (status) {
        filter.status = status;
      }
      
      const powerOfAttorneys = await PowerOfAttorney.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select('-files -kartaParties.idPhoto -kartaParties.photo -agentParties.idPhoto -agentParties.photo -witnessParties.idPhoto -witnessParties.photo');

      const total = await PowerOfAttorney.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: {
          powerOfAttorneys,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          total
        }
      });

    } catch (error) {
      logger.error('Get user Power of Attorneys error', { 
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

export default PowerOfAttorneyController;