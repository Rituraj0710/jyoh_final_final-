import PropertySaleCertificate from "../models/PropertySaleCertificate.js";
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

class PropertySaleCertificateController {
  static create = async (req, res) => {
    try {
      // Sanitize all input data
      const sanitizedData = sanitizeInput(req.body);
      
      const {
        // Bank Information
        bank_name,
        bank_pan,
        bank_reg_office,
        bank_head_office,
        
        // Bank Representative Information
        bank_rep_title,
        bank_rep_name,
        bank_rep_relation,
        bank_rep_father_name,
        bank_rep_occupation,
        bank_rep_mobile,
        bank_rep_email,
        bank_rep_address,
        
        // Property Information
        property_address,
        property_type,
        property_area,
        property_unit,
        property_value,
        
        // Sale Information
        sale_amount,
        sale_amount_words,
        sale_date,
        sale_mode,
        
        // Purchaser Information
        purchaser_name,
        purchaser_father_name,
        purchaser_address,
        purchaser_mobile,
        purchaser_aadhaar,
        purchaser_pan,
        
        // Witness Information
        witness1_name,
        witness1_father_name,
        witness1_address,
        witness1_mobile,
        witness2_name,
        witness2_father_name,
        witness2_address,
        witness2_mobile
      } = sanitizedData;

      // Validation
      if (!bank_name || !bank_rep_name || !property_address || !purchaser_name) {
        logger.warn('Property Sale Certificate creation failed: Missing required fields', { 
          userId: req.user?.id,
          ip: req.ip
        });
        return res.status(400).json({
          success: false,
          message: "Missing required fields: bank_name, bank_rep_name, property_address, purchaser_name"
        });
      }

      // Validate mobile numbers
      const mobileRegex = /^[0-9]{10}$/;
      if (bank_rep_mobile && !mobileRegex.test(bank_rep_mobile)) {
        return res.status(400).json({
          success: false,
          message: "Invalid bank representative mobile number. Must be 10 digits."
        });
      }
      if (purchaser_mobile && !mobileRegex.test(purchaser_mobile)) {
        return res.status(400).json({
          success: false,
          message: "Invalid purchaser mobile number. Must be 10 digits."
        });
      }
      if (witness1_mobile && !mobileRegex.test(witness1_mobile)) {
        return res.status(400).json({
          success: false,
          message: "Invalid witness 1 mobile number. Must be 10 digits."
        });
      }
      if (witness2_mobile && !mobileRegex.test(witness2_mobile)) {
        return res.status(400).json({
          success: false,
          message: "Invalid witness 2 mobile number. Must be 10 digits."
        });
      }

      // Validate Aadhaar numbers
      const aadhaarRegex = /^[0-9]{12}$/;
      if (purchaser_aadhaar && !aadhaarRegex.test(purchaser_aadhaar)) {
        return res.status(400).json({
          success: false,
          message: "Invalid purchaser Aadhaar number. Must be 12 digits."
        });
      }

      // Validate PAN numbers
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (bank_pan && !panRegex.test(bank_pan)) {
        return res.status(400).json({
          success: false,
          message: "Invalid bank PAN number format."
        });
      }
      if (purchaser_pan && !panRegex.test(purchaser_pan)) {
        return res.status(400).json({
          success: false,
          message: "Invalid purchaser PAN number format."
        });
      }

      // Handle file uploads
      const files = [];
      if (req.files) {
        Object.keys(req.files).forEach(fieldName => {
          const file = req.files[fieldName];
          if (Array.isArray(file)) {
            file.forEach(f => {
              files.push({
                field: fieldName,
                filename: f.filename,
                contentType: f.mimetype,
                size: f.size,
                path: f.path
              });
            });
          } else {
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

      // Create property sale certificate
      const propertySaleCertificateData = {
        // Bank Information
        bank_name,
        bank_pan,
        bank_reg_office,
        bank_head_office,
        
        // Bank Representative Information
        bank_rep_title: bank_rep_title || 'श्री',
        bank_rep_name,
        bank_rep_relation: bank_rep_relation || 'पुत्र',
        bank_rep_father_name,
        bank_rep_occupation,
        bank_rep_mobile,
        bank_rep_email,
        bank_rep_address,
        
        // Property Information
        property_address,
        property_type,
        property_area: property_area ? Number(property_area) : 0,
        property_unit: property_unit || 'sq_meters',
        property_value: property_value ? Number(property_value) : 0,
        
        // Sale Information
        sale_amount: sale_amount ? Number(sale_amount) : 0,
        sale_amount_words,
        sale_date: sale_date ? new Date(sale_date) : new Date(),
        sale_mode: sale_mode || 'नकद',
        
        // Purchaser Information
        purchaser_name,
        purchaser_father_name,
        purchaser_address,
        purchaser_mobile,
        purchaser_aadhaar,
        purchaser_pan,
        
        // Witness Information
        witness1_name,
        witness1_father_name,
        witness1_address,
        witness1_mobile,
        witness2_name,
        witness2_father_name,
        witness2_address,
        witness2_mobile,
        
        // Files
        files,
        
        // Metadata
        createdBy: req.user?.id || null,
        status: 'submitted',
        amount: 2000,
        meta: {
          status: 'submitted',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      const propertySaleCertificate = new PropertySaleCertificate(propertySaleCertificateData);
      await propertySaleCertificate.save();

      logger.info('Property Sale Certificate created successfully', { 
        certificateId: propertySaleCertificate._id,
        userId: req.user?.id,
        ip: req.ip
      });

      res.status(201).json({
        success: true,
        message: "Property Sale Certificate created successfully",
        data: {
          id: propertySaleCertificate._id,
          bankName: propertySaleCertificate.bank_name,
          purchaserName: propertySaleCertificate.purchaser_name,
          propertyAddress: propertySaleCertificate.property_address,
          status: propertySaleCertificate.meta.status,
          createdAt: propertySaleCertificate.meta.createdAt
        }
      });

    } catch (error) {
      logger.error('Property Sale Certificate creation error', { 
        error: error.message,
        userId: req.user?.id,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  };

  static getAll = async (req, res) => {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const filter = {};
      
      // Only filter by user if not admin
      if (req.user?.id && req.user?.role !== 'admin') {
        filter.createdBy = req.user.id;
      }
      if (status) {
        filter.status = status;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const certificates = await PropertySaleCertificate.find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await PropertySaleCertificate.countDocuments(filter);

      res.json({
        success: true,
        data: {
          certificates,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalItems: total,
            itemsPerPage: parseInt(limit)
          }
        }
      });

    } catch (error) {
      logger.error('Error fetching property sale certificates', { 
        error: error.message,
        userId: req.user?.id
      });
      
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  };

  static getById = async (req, res) => {
    try {
      const { id } = req.params;
      
      const certificate = await PropertySaleCertificate.findById(id)
        .populate('createdBy', 'name email');

      if (!certificate) {
        return res.status(404).json({
          success: false,
          message: "Property Sale Certificate not found"
        });
      }

      // Check if user has access to this certificate
      if (req.user?.role !== 'admin' && certificate.createdBy?.toString() !== req.user?.id) {
        return res.status(403).json({
          success: false,
          message: "Access denied"
        });
      }

      res.json({
        success: true,
        data: {
          certificate
        }
      });

    } catch (error) {
      logger.error('Error fetching property sale certificate', { 
        error: error.message,
        certificateId: req.params.id,
        userId: req.user?.id
      });
      
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  };

  static updateStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['draft', 'submitted', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status. Must be one of: draft, submitted, approved, rejected"
        });
      }

      const certificate = await PropertySaleCertificate.findById(id);
      if (!certificate) {
        return res.status(404).json({
          success: false,
          message: "Property Sale Certificate not found"
        });
      }

      certificate.status = status;
      certificate.meta.status = status;
      certificate.meta.updatedAt = new Date();
      await certificate.save();

      logger.info('Property Sale Certificate status updated', { 
        certificateId: id,
        newStatus: status,
        userId: req.user?.id
      });

      res.json({
        success: true,
        message: "Status updated successfully",
        data: {
          id: certificate._id,
          status: certificate.status
        }
      });

    } catch (error) {
      logger.error('Error updating property sale certificate status', { 
        error: error.message,
        certificateId: req.params.id,
        userId: req.user?.id
      });
      
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  };

  static delete = async (req, res) => {
    try {
      const { id } = req.params;
      
      const certificate = await PropertySaleCertificate.findById(id);
      if (!certificate) {
        return res.status(404).json({
          success: false,
          message: "Property Sale Certificate not found"
        });
      }

      // Check if user has access to delete this certificate
      if (req.user?.role !== 'admin' && certificate.createdBy?.toString() !== req.user?.id) {
        return res.status(403).json({
          success: false,
          message: "Access denied"
        });
      }

      await PropertySaleCertificate.findByIdAndDelete(id);

      logger.info('Property Sale Certificate deleted', { 
        certificateId: id,
        userId: req.user?.id
      });

      res.json({
        success: true,
        message: "Property Sale Certificate deleted successfully"
      });

    } catch (error) {
      logger.error('Error deleting property sale certificate', { 
        error: error.message,
        certificateId: req.params.id,
        userId: req.user?.id
      });
      
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  };
}

export default PropertySaleCertificateController;