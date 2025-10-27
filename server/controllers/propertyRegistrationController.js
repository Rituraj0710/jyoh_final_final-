import PropertyRegistration from "../models/PropertyRegistration.js";
import logger from "../config/logger.js";
import DOMPurify from 'isomorphic-dompurify';

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

class PropertyRegistrationController {
  static create = async (req, res) => {
    try {
      const sanitizedData = sanitizeInput(req.body);
      
      const {
        seller_name, 
        seller_father_name, 
        seller_address, 
        seller_aadhaar, 
        seller_mobile,
        buyer_name, 
        buyer_father_name, 
        buyer_address, 
        buyer_aadhaar, 
        buyer_mobile,
        property_address, 
        property_type, 
        area_sqm, 
        sale_price, 
        registration_date
      } = sanitizedData;

      // Validation
      if (!seller_name || !buyer_name || !property_address || !property_type) {
        logger.warn('Property registration creation failed: Missing required fields', { 
          userId: req.user?.id,
          ip: req.ip
        });
        return res.status(400).json({
          success: false,
          message: "Missing required fields: seller_name, buyer_name, property_address, property_type"
        });
      }

      // Validate Aadhaar numbers
      const aadhaarRegex = /^[0-9]{12}$/;
      if (seller_aadhaar && !aadhaarRegex.test(seller_aadhaar)) {
        return res.status(400).json({
          success: false,
          message: "Invalid seller Aadhaar number. Must be 12 digits."
        });
      }

      if (buyer_aadhaar && !aadhaarRegex.test(buyer_aadhaar)) {
        return res.status(400).json({
          success: false,
          message: "Invalid buyer Aadhaar number. Must be 12 digits."
        });
      }

      // Validate mobile numbers
      const mobileRegex = /^[0-9]{10}$/;
      if (seller_mobile && !mobileRegex.test(seller_mobile)) {
        return res.status(400).json({
          success: false,
          message: "Invalid seller mobile number. Must be 10 digits."
        });
      }

      if (buyer_mobile && !mobileRegex.test(buyer_mobile)) {
        return res.status(400).json({
          success: false,
          message: "Invalid buyer mobile number. Must be 10 digits."
        });
      }

      const propertyRegistrationData = {
        seller_name,
        seller_father_name,
        seller_address,
        seller_aadhaar,
        seller_mobile,
        buyer_name,
        buyer_father_name,
        buyer_address,
        buyer_aadhaar,
        buyer_mobile,
        property_address,
        property_type,
        area_sqm,
        sale_price,
        registration_date: registration_date ? new Date(registration_date) : new Date(),
        createdBy: req.user?.id || null,
        status: 'submitted',
        meta: {
          status: 'submitted',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      const propertyRegistration = new PropertyRegistration(propertyRegistrationData);
      await propertyRegistration.save();

      logger.info('Property registration created successfully', { 
        propertyRegistrationId: propertyRegistration._id,
        userId: req.user?.id,
        seller_name,
        buyer_name
      });

      res.status(201).json({
        success: true,
        message: "Property registration created successfully",
        data: {
          id: propertyRegistration._id,
          seller_name: propertyRegistration.seller_name,
          buyer_name: propertyRegistration.buyer_name,
          property_type: propertyRegistration.property_type,
          createdAt: propertyRegistration.createdAt
        }
      });

    } catch (error) {
      logger.error('Property registration creation error', { 
        error: error.message, 
        userId: req.user?.id 
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
      
      const propertyRegistrations = await PropertyRegistration.find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await PropertyRegistration.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: { 
          propertyRegistrations, 
          totalPages: Math.ceil(total / limit), 
          currentPage: page, 
          total 
        }
      });

    } catch (error) {
      logger.error('Get all property registrations error', { 
        error: error.message 
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
      
      const propertyRegistration = await PropertyRegistration.findOne(filter)
        .populate('createdBy', 'name email');

      if (!propertyRegistration) {
        return res.status(404).json({ 
          success: false, 
          message: "Property registration not found" 
        });
      }

      res.status(200).json({ 
        success: true, 
        data: propertyRegistration 
      });

    } catch (error) {
      logger.error('Get property registration by ID error', { 
        error: error.message 
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

      const validStatuses = ['pending', 'approved', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid status. Must be one of: pending, approved, rejected" 
        });
      }

      const filter = { _id: id };
      if (req.user?.id) {
        filter.createdBy = req.user.id;
      }

      const propertyRegistration = await PropertyRegistration.findOneAndUpdate(
        filter,
        { status },
        { new: true }
      );

      if (!propertyRegistration) {
        return res.status(404).json({ 
          success: false, 
          message: "Property registration not found" 
        });
      }

      logger.info('Property registration status updated', { 
        propertyRegistrationId: id,
        newStatus: status,
        userId: req.user?.id
      });

      res.status(200).json({ 
        success: true, 
        message: "Status updated successfully", 
        data: { propertyRegistration } 
      });

    } catch (error) {
      logger.error('Update property registration status error', { 
        error: error.message 
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
      
      const propertyRegistration = await PropertyRegistration.findOneAndDelete(filter);

      if (!propertyRegistration) {
        return res.status(404).json({ 
          success: false, 
          message: "Property registration not found" 
        });
      }

      logger.info('Property registration deleted', { 
        propertyRegistrationId: id,
        userId: req.user?.id
      });

      res.status(200).json({ 
        success: true, 
        message: "Property registration deleted successfully" 
      });

    } catch (error) {
      logger.error('Delete property registration error', { 
        error: error.message 
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
      
      const stats = await PropertyRegistration.aggregate([
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
        pending: 0, 
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
      logger.error('Get property registration stats error', { 
        error: error.message 
      });
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  };
}

export default PropertyRegistrationController;