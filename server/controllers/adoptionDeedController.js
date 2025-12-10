import AdoptionDeed from "../models/AdoptionDeed.js";
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

class AdoptionDeedController {
  static create = async (req, res) => {
    try {
      // Sanitize all input data
      const sanitizedData = sanitizeInput(req.body);
      
      const {
        country,
        state,
        district,
        tehsil,
        subRegistrarOffice,
        childName,
        childDOB,
        childGender,
        childBloodGroup,
        childEducation,
        childCurrentAddress,
        childBirthCertNo,
        childBirthCertIssueDate,
        childBirthCertIssuePlace,
        isOrphanageAdoption,
        orphanageName,
        orphanageAddress,
        firstParties = [],
        secondParties = [],
        witnesses = [],
        gifts = [],
        stampAmount,
        stampNo,
        stampDate
      } = sanitizedData;

      // Validation
      if (!state || !district || !tehsil || !subRegistrarOffice) {
        logger.warn('Adoption deed creation failed: Missing registration details', { 
          userId: req.user?.id,
          ip: req.ip
        });
        return res.status(400).json({
          success: false,
          message: "Registration details are required: state, district, tehsil, subRegistrarOffice"
        });
      }

      if (!childName || !childDOB || !childGender || !childBloodGroup) {
        logger.warn('Adoption deed creation failed: Missing child details', { 
          userId: req.user?.id,
          ip: req.ip
        });
        return res.status(400).json({
          success: false,
          message: "Child details are required: childName, childDOB, childGender, childBloodGroup"
        });
      }

      if (!firstParties || firstParties.length === 0) {
        logger.warn('Adoption deed creation failed: No adopting parties provided', { 
          userId: req.user?.id,
          ip: req.ip
        });
        return res.status(400).json({
          success: false,
          message: "At least one adopting party (First Party) is required"
        });
      }

      if (!isOrphanageAdoption && (!secondParties || secondParties.length === 0)) {
        logger.warn('Adoption deed creation failed: No biological parents for non-orphanage adoption', { 
          userId: req.user?.id,
          ip: req.ip
        });
        return res.status(400).json({
          success: false,
          message: "At least one natural parent (Second Party) is required for non-orphanage adoptions"
        });
      }

      if (!witnesses || witnesses.length === 0) {
        logger.warn('Adoption deed creation failed: No witnesses provided', { 
          userId: req.user?.id,
          ip: req.ip
        });
        return res.status(400).json({
          success: false,
          message: "At least one witness is required"
        });
      }

      if (!stampAmount || !stampNo || !stampDate) {
        logger.warn('Adoption deed creation failed: Missing stamp details', { 
          userId: req.user?.id,
          ip: req.ip
        });
        return res.status(400).json({
          success: false,
          message: "Stamp details are required: stampAmount, stampNo, stampDate"
        });
      }

      // Validate age difference for adopting parties
      const childAge = new Date().getFullYear() - new Date(childDOB).getFullYear();
      
      for (const party of firstParties) {
        if (party.dob) {
          const partyAge = new Date().getFullYear() - new Date(party.dob).getFullYear();
          const ageDifference = partyAge - childAge;
          
          if (ageDifference < 21) {
            return res.status(400).json({
              success: false,
              message: `Adopting party ${party.name} must be at least 21 years older than the child`
            });
          }
        }

        // Validate spouse consent for married parties
        if (party.maritalStatus === 'विवाहित' && !party.spouseConsent) {
          return res.status(400).json({
            success: false,
            message: `Spouse consent is required for married adopting party ${party.name}`
          });
        }
      }

      // Create new adoption deed
      const adoptionDeedData = {
        country: country || 'भारत',
        state,
        district,
        tehsil,
        subRegistrarOffice,
        childName,
        childDOB: new Date(childDOB),
        childGender,
        childBloodGroup,
        childEducation,
        childCurrentAddress,
        childBirthCertNo,
        childBirthCertIssueDate: childBirthCertIssueDate ? new Date(childBirthCertIssueDate) : null,
        childBirthCertIssuePlace,
        isOrphanageAdoption: isOrphanageAdoption === true || isOrphanageAdoption === 'true',
        orphanageName: isOrphanageAdoption ? orphanageName : undefined,
        orphanageAddress: isOrphanageAdoption ? orphanageAddress : undefined,
        firstParties,
        secondParties: isOrphanageAdoption ? [] : secondParties,
        witnesses,
        gifts: gifts || [],
        stampAmount: parseFloat(stampAmount) || 0,
        stampNo,
        stampDate: new Date(stampDate),
        createdBy: req.user?.id || null
      };

      // Handle file uploads to Cloudinary
      const { processFilesByFields, findAndProcessFile } = await import('../utils/fileUploadHelper.js');
      
      if (req.files) {
        // Process child documents
        const childPhoto = await findAndProcessFile(req.files.childPhoto, 'childPhoto', 'adoption-deeds/child');
        const childBirthCert = await findAndProcessFile(req.files.childBirthCert, 'childBirthCert', 'adoption-deeds/child');
        const childID = await findAndProcessFile(req.files.childID, 'childID', 'adoption-deeds/child');
        
        if (childPhoto) adoptionDeedData.childPhoto = childPhoto.cloudinaryUrl;
        if (childBirthCert) adoptionDeedData.childBirthCert = childBirthCert.cloudinaryUrl;
        if (childID) adoptionDeedData.childID = childID.cloudinaryUrl;

        // Handle party photos
        if (req.files.firstPartyPhoto) {
          for (let index = 0; index < req.files.firstPartyPhoto.length; index++) {
            const file = req.files.firstPartyPhoto[index];
            const processed = await findAndProcessFile([file], file.fieldname, 'adoption-deeds/first-party');
            if (processed && adoptionDeedData.firstParties[index]) {
              adoptionDeedData.firstParties[index].photo = processed.cloudinaryUrl;
            }
          }
        }

        if (req.files.secondPartyPhoto) {
          for (let index = 0; index < req.files.secondPartyPhoto.length; index++) {
            const file = req.files.secondPartyPhoto[index];
            const processed = await findAndProcessFile([file], file.fieldname, 'adoption-deeds/second-party');
            if (processed && adoptionDeedData.secondParties[index]) {
              adoptionDeedData.secondParties[index].photo = processed.cloudinaryUrl;
            }
          }
        }

        if (req.files.witnessPhoto) {
          for (let index = 0; index < req.files.witnessPhoto.length; index++) {
            const file = req.files.witnessPhoto[index];
            const processed = await findAndProcessFile([file], file.fieldname, 'adoption-deeds/witnesses');
            if (processed && adoptionDeedData.witnesses[index]) {
              adoptionDeedData.witnesses[index].photo = processed.cloudinaryUrl;
            }
          }
        }
      }

      const adoptionDeed = new AdoptionDeed(adoptionDeedData);
      await adoptionDeed.save();

      logger.info('Adoption deed created successfully', {
        adoptionDeedId: adoptionDeed._id,
        childName,
        createdBy: req.user?.id || 'anonymous'
      });

      res.status(201).json({
        success: true,
        message: "Adoption deed created successfully",
        data: {
          id: adoptionDeed._id,
          childName: adoptionDeed.childName,
          status: adoptionDeed.meta.status,
          createdAt: adoptionDeed.meta.createdAt
        }
      });

    } catch (error) {
      logger.error('Error creating adoption deed:', error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  };

  static getAll = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const filter = {};
      
      // Add user filter if not admin
      if (req.user && req.user.role !== 'admin') {
        filter.createdBy = req.user.id;
      }

      // Add search filter
      if (req.query.search) {
        filter.$or = [
          { childName: { $regex: req.query.search, $options: 'i' } },
          { state: { $regex: req.query.search, $options: 'i' } },
          { district: { $regex: req.query.search, $options: 'i' } }
        ];
      }

      // Add status filter
      if (req.query.status) {
        filter['meta.status'] = req.query.status;
      }

      const adoptionDeeds = await AdoptionDeed.find(filter)
        .populate('createdBy', 'name email')
        .sort({ 'meta.createdAt': -1 })
        .skip(skip)
        .limit(limit)
        .select('-firstParties -secondParties -witnesses -gifts');

      const total = await AdoptionDeed.countDocuments(filter);

      res.json({
        success: true,
        data: adoptionDeeds,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      });

    } catch (error) {
      logger.error('Error fetching adoption deeds:', error);
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
      
      const adoptionDeed = await AdoptionDeed.findOne(filter)
        .populate('createdBy', 'name email');

      if (!adoptionDeed) {
        return res.status(404).json({
          success: false,
          message: "Adoption deed not found"
        });
      }

      res.json({
        success: true,
        data: adoptionDeed
      });

    } catch (error) {
      logger.error('Error fetching adoption deed:', error);
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

      if (!['draft', 'submitted', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status"
        });
      }

      const filter = { _id: id };
      if (req.user?.id) {
        filter.createdBy = req.user.id;
      }

      const adoptionDeed = await AdoptionDeed.findOneAndUpdate(
        filter,
        { 'meta.status': status },
        { new: true }
      );

      if (!adoptionDeed) {
        return res.status(404).json({
          success: false,
          message: "Adoption deed not found"
        });
      }

      logger.info(`Adoption deed status updated: ${id} to ${status}`, {
        updatedBy: req.user?.id || 'system'
      });

      res.json({
        success: true,
        message: "Status updated successfully",
        data: { status: adoptionDeed.meta.status }
      });

    } catch (error) {
      logger.error('Error updating adoption deed status:', error);
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
      
      const adoptionDeed = await AdoptionDeed.findOneAndDelete(filter);

      if (!adoptionDeed) {
        return res.status(404).json({
          success: false,
          message: "Adoption deed not found"
        });
      }

      logger.info(`Adoption deed deleted: ${id}`, {
        deletedBy: req.user?.id || 'system'
      });

      res.json({
        success: true,
        message: "Adoption deed deleted successfully"
      });

    } catch (error) {
      logger.error('Error deleting adoption deed:', error);
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
      
      const stats = await AdoptionDeed.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: '$meta.status',
            count: { $sum: 1 }
          }
        }
      ]);

      const total = await AdoptionDeed.countDocuments(matchFilter);
      
      const statusStats = {
        total,
        draft: 0,
        submitted: 0,
        approved: 0,
        rejected: 0
      };

      stats.forEach(stat => {
        statusStats[stat._id] = stat.count;
      });

      res.json({
        success: true,
        data: statusStats
      });

    } catch (error) {
      logger.error('Error fetching adoption deed stats:', error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  };

  static getUserAdoptionDeeds = async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required"
        });
      }

      const adoptionDeeds = await AdoptionDeed.find({ createdBy: req.user.id })
        .sort({ 'meta.createdAt': -1 })
        .select('-firstParties -secondParties -witnesses -gifts');

      res.json({
        success: true,
        data: adoptionDeeds
      });

    } catch (error) {
      logger.error('Error fetching user adoption deeds:', error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  };
}

export default AdoptionDeedController;