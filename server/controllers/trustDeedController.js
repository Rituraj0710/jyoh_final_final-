import TrustDeed from "../models/TrustDeed.js";
import logger from "../config/logger.js";
import DOMPurify from 'isomorphic-dompurify';
import crypto from 'crypto';

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

class TrustDeedController {
  static create = async (req, res) => {
    try {
      // Sanitize all input data
      const sanitizedData = sanitizeInput(req.body);
      
      const {
        trustName,
        trustAddress,
        startingAmount_number,
        startingAmount_words,
        startingAmount,
        trustees = [],
        functionalDomains = [],
        purposes = [],
        otherPurposes = [],
        terms = [],
        otherTerms = [],
        witnesses = []
      } = sanitizedData;

      // Parse trustees from FormData format if needed
      let parsedTrustees = trustees;
      if (!Array.isArray(trustees) || trustees.length === 0) {
        parsedTrustees = [];
        let trusteeIndex = 1;
        while (sanitizedData[`trusteeName_${trusteeIndex}`]) {
          const trustee = {
            salutation: sanitizedData[`trusteeSalutation_${trusteeIndex}`] || 'श्री',
            position: sanitizedData[`trusteePosition_${trusteeIndex}`] || 'सदस्य',
            name: sanitizedData[`trusteeName_${trusteeIndex}`],
            relation: sanitizedData[`trusteeRelation_${trusteeIndex}`],
            address: sanitizedData[`trusteeAddress_${trusteeIndex}`],
            mobile: sanitizedData[`trusteeMobile_${trusteeIndex}`],
            idType: sanitizedData[`trusteeIdType_${trusteeIndex}`] || 'आधार कार्ड',
            idNumber: sanitizedData[`trusteeIdNumber_${trusteeIndex}`],
            idCard: req.files?.[`trusteeIdCard_${trusteeIndex}`]?.[0]?.filename || null,
            photo: req.files?.[`trusteePhoto_${trusteeIndex}`]?.[0]?.filename || null
          };
          parsedTrustees.push(trustee);
          trusteeIndex++;
        }
      }

      // Parse functional domains if needed
      let parsedDomains = functionalDomains;
      if (!Array.isArray(functionalDomains) || functionalDomains.length === 0) {
        parsedDomains = [];
        let domainIndex = 1;
        while (sanitizedData[`functionalDomain_${domainIndex}`]) {
          if (sanitizedData[`functionalDomain_${domainIndex}`].trim()) {
            parsedDomains.push(sanitizedData[`functionalDomain_${domainIndex}`]);
          }
          domainIndex++;
        }
      }

      // Parse purposes
      let parsedPurposes = Array.isArray(purposes) ? purposes : 
                          (purposes ? [purposes] : []);
      
      let parsedOtherPurposes = otherPurposes;
      if (!Array.isArray(otherPurposes) || otherPurposes.length === 0) {
        parsedOtherPurposes = [];
        let purposeIndex = 1;
        while (sanitizedData[`otherPurpose_${purposeIndex}`]) {
          if (sanitizedData[`otherPurpose_${purposeIndex}`].trim()) {
            parsedOtherPurposes.push(sanitizedData[`otherPurpose_${purposeIndex}`]);
          }
          purposeIndex++;
        }
      }

      // Parse terms
      let parsedTerms = Array.isArray(terms) ? terms : 
                       (terms ? [terms] : []);
      
      let parsedOtherTerms = otherTerms;
      if (!Array.isArray(otherTerms) || otherTerms.length === 0) {
        parsedOtherTerms = [];
        let termIndex = 1;
        while (sanitizedData[`otherTerm_${termIndex}`]) {
          if (sanitizedData[`otherTerm_${termIndex}`].trim()) {
            parsedOtherTerms.push(sanitizedData[`otherTerm_${termIndex}`]);
          }
          termIndex++;
        }
      }

      // Parse witnesses if needed
      let parsedWitnesses = witnesses;
      if (!Array.isArray(witnesses) || witnesses.length === 0) {
        parsedWitnesses = [];
        let witnessIndex = 1;
        while (sanitizedData[`witnessName_${witnessIndex}`]) {
          const witness = {
            name: sanitizedData[`witnessName_${witnessIndex}`],
            relation: sanitizedData[`witnessRelation_${witnessIndex}`],
            address: sanitizedData[`witnessAddress_${witnessIndex}`],
            mobile: sanitizedData[`witnessMobile_${witnessIndex}`],
            idType: sanitizedData[`witnessIdType_${witnessIndex}`] || 'आधार कार्ड',
            idNumber: sanitizedData[`witnessIdNumber_${witnessIndex}`],
            idCard: req.files?.[`witnessIdCard_${witnessIndex}`]?.[0]?.filename || null,
            photo: req.files?.[`witnessPhoto_${witnessIndex}`]?.[0]?.filename || null
          };
          parsedWitnesses.push(witness);
          witnessIndex++;
        }
      }

      // Handle starting amount in both formats
      let finalStartingAmount = startingAmount;
      if (startingAmount_number && startingAmount_words) {
        finalStartingAmount = {
          number: startingAmount_number,
          words: startingAmount_words
        };
      }

      // Validation
      if (!trustName || !trustAddress) {
        logger.warn('Trust deed creation failed: Missing required fields', { 
          userId: req.user?.id,
          ip: req.ip
        });
        return res.status(400).json({
          success: false,
          message: "Missing required fields: trustName, trustAddress"
        });
      }

      if (!finalStartingAmount || (!finalStartingAmount.number && !startingAmount_number) || (!finalStartingAmount.words && !startingAmount_words)) {
        logger.warn('Trust deed creation failed: Missing starting amount', { 
          userId: req.user?.id,
          ip: req.ip
        });
        return res.status(400).json({
          success: false,
          message: "Starting amount (both number and words) is required"
        });
      }

      // Validate trustees
      if (!parsedTrustees || parsedTrustees.length === 0) {
        logger.warn('Trust deed creation failed: No trustees provided', { 
          userId: req.user?.id,
          ip: req.ip
        });
        return res.status(400).json({
          success: false,
          message: "At least one trustee is required"
        });
      }

      // Validate each trustee
      for (const trustee of parsedTrustees) {
        if (!trustee.name || !trustee.address || !trustee.mobile) {
          logger.warn('Trust deed creation failed: Invalid trustee data', { 
            userId: req.user?.id,
            trustee: trustee
          });
          return res.status(400).json({
            success: false,
            message: "Each trustee must have name, address, and mobile number"
          });
        }
      }

      // Create trust deed - matching exact dummy data structure
      const trustDeedData = {
        trustName,
        trustAddress,
        startingAmount: finalStartingAmount,
        trustees: parsedTrustees,
        functionalDomains: parsedDomains,
        purposes: parsedPurposes,
        otherPurposes: parsedOtherPurposes,
        terms: parsedTerms,
        otherTerms: parsedOtherTerms,
        witnesses: parsedWitnesses,
        createdBy: req.user?.id || null,
        meta: {
          status: 'submitted', // Changed to match dummy data
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      const trustDeed = new TrustDeed(trustDeedData);
      await trustDeed.save();

      logger.info('Trust deed created successfully', { 
        trustDeedId: trustDeed._id,
        userId: req.user?.id,
        trustName
      });

      res.status(201).json({
        success: true,
        message: "Trust deed created successfully",
        data: {
          id: trustDeed._id,
          trustName: trustDeed.trustName,
          status: trustDeed.meta.status,
          createdAt: trustDeed.meta.createdAt
        }
      });

    } catch (error) {
      logger.error('Trust deed creation error', { 
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
        filter['meta.status'] = status;
      }
      
      const trustDeeds = await TrustDeed.find(filter)
        .populate('createdBy', 'name email')
        .sort({ 'meta.createdAt': -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await TrustDeed.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: {
          trustDeeds,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          total
        }
      });

    } catch (error) {
      logger.error('Get all trust deeds error', { 
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
      
      const trustDeed = await TrustDeed.findOne(filter)
        .populate('createdBy', 'name email');

      if (!trustDeed) {
        return res.status(404).json({
          success: false,
          message: "Trust deed not found"
        });
      }

      res.status(200).json({
        success: true,
        data: { trustDeed }
      });

    } catch (error) {
      logger.error('Get trust deed by ID error', { 
        error: error.message,
        trustDeedId: req.params.id,
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

      const trustDeed = await TrustDeed.findOneAndUpdate(
        filter,
        { 'meta.status': status },
        { new: true }
      );

      if (!trustDeed) {
        return res.status(404).json({
          success: false,
          message: "Trust deed not found"
        });
      }

      logger.info('Trust deed status updated', { 
        trustDeedId: id,
        newStatus: status,
        userId: req.user?.id
      });

      res.status(200).json({
        success: true,
        message: "Trust deed status updated successfully",
        data: { trustDeed }
      });

    } catch (error) {
      logger.error('Update trust deed status error', { 
        error: error.message,
        trustDeedId: req.params.id,
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
      
      const trustDeed = await TrustDeed.findOneAndDelete(filter);

      if (!trustDeed) {
        return res.status(404).json({
          success: false,
          message: "Trust deed not found"
        });
      }

      logger.info('Trust deed deleted', { 
        trustDeedId: id,
        userId: req.user?.id
      });

      res.status(200).json({
        success: true,
        message: "Trust deed deleted successfully"
      });

    } catch (error) {
      logger.error('Delete trust deed error', { 
        error: error.message,
        trustDeedId: req.params.id,
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
      
      const stats = await TrustDeed.aggregate([
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
      logger.error('Get trust deed stats error', { 
        error: error.message,
        userId: req.user?.id
      });
      
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  };

  // Payment initialization endpoint
  static initializePayment = async (req, res) => {
    try {
      const {
        formType,
        formData,
        amount,
        userInfo
      } = req.body;

      // Validate required fields
      if (!formType || !formData || !amount) {
        return res.status(400).json({
          success: false,
          message: 'Missing required payment information'
        });
      }

      // Generate transaction ID
      const txnid = `TXN${Date.now()}${Math.random().toString(36).substr(2, 5)}`;

      // PayU configuration
      const payuConfig = {
        key: 'gtKFFx',
        salt: 'eCwWELxi',
        txnid: txnid,
        amount: amount,
        productinfo: `${formType} Form Submission`,
        firstname: userInfo?.name || formData?.name || formData?.trustName || 'User',
        email: userInfo?.email || 'bonehookadvt01@gmail.com',
        phone: userInfo?.phone || formData?.phone || formData?.mobile || '9999999999',
        surl: `${process.env.FRONTEND_HOST || 'http://localhost:3000'}/payment/success`,
        furl: `${process.env.FRONTEND_HOST || 'http://localhost:3000'}/payment/failure`
      };

      // Generate hash
      const hashString = `${payuConfig.key}|${payuConfig.txnid}|${payuConfig.amount}|${payuConfig.productinfo}|${payuConfig.firstname}|${payuConfig.email}|||||||||||${payuConfig.salt}`;
      const hash = crypto.createHash('sha512').update(hashString).digest('hex');

      // Return payment data with hash
      res.status(200).json({
        success: true,
        message: 'Payment initialized successfully',
        data: {
          ...payuConfig,
          hash: hash,
          paymentUrl: 'https://test.payu.in/_payment',
          formData: formData,
          formType: formType
        }
      });

      logger.info('Payment initialized successfully', { 
        txnid, 
        amount, 
        formType,
        userId: req.user?.id 
      });

    } catch (error) {
      logger.error('Error initializing payment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to initialize payment',
        error: error.message
      });
    }
  };
}

export const createTrustDeed = TrustDeedController.create;
export const getAllTrustDeeds = TrustDeedController.getAll;
export const getTrustDeedById = TrustDeedController.getById;
export const updateTrustDeedStatus = TrustDeedController.updateStatus;
export const deleteTrustDeed = TrustDeedController.delete;
export const getTrustDeedStats = TrustDeedController.getStats;
export default TrustDeedController;