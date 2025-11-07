import SaleDeed from "../models/SaleDeed.js";
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

class SaleDeedController {
  static create = async (req, res) => {
    try {
      // Sanitize all input data
      const sanitizedData = sanitizeInput(req.body);
      
      // Parse arrays from FormData format if needed
      let sellers = sanitizedData.sellers || [];
      let buyers = sanitizedData.buyers || [];
      let witnesses = sanitizedData.witnesses || [];
      
      // If sellers is not an array, parse from FormData format
      if (!Array.isArray(sellers) || sellers.length === 0) {
        sellers = [];
        let sellerIndex = 1;
        while (sanitizedData[`sellers_${sellerIndex}_name`]) {
          const seller = {
            name: sanitizedData[`sellers_${sellerIndex}_name`],
            relation: sanitizedData[`sellers_${sellerIndex}_relation`],
            address: sanitizedData[`sellers_${sellerIndex}_address`],
            mobile: sanitizedData[`sellers_${sellerIndex}_mobile`],
            idType: sanitizedData[`sellers_${sellerIndex}_idType`],
            idNo: sanitizedData[`sellers_${sellerIndex}_idNo`]
          };
          sellers.push(seller);
          sellerIndex++;
        }
      }
      
      // If buyers is not an array, parse from FormData format
      if (!Array.isArray(buyers) || buyers.length === 0) {
        buyers = [];
        let buyerIndex = 1;
        while (sanitizedData[`buyers_${buyerIndex}_name`]) {
          const buyer = {
            name: sanitizedData[`buyers_${buyerIndex}_name`],
            relation: sanitizedData[`buyers_${buyerIndex}_relation`],
            address: sanitizedData[`buyers_${buyerIndex}_address`],
            mobile: sanitizedData[`buyers_${buyerIndex}_mobile`],
            idType: sanitizedData[`buyers_${buyerIndex}_idType`],
            idNo: sanitizedData[`buyers_${buyerIndex}_idNo`]
          };
          buyers.push(buyer);
          buyerIndex++;
        }
      }
      
      // If witnesses is not an array, parse from FormData format
      if (!Array.isArray(witnesses) || witnesses.length === 0) {
        witnesses = [];
        let witnessIndex = 1;
        while (sanitizedData[`witnesses_${witnessIndex}_name`]) {
          const witness = {
            name: sanitizedData[`witnesses_${witnessIndex}_name`],
            relation: sanitizedData[`witnesses_${witnessIndex}_relation`],
            address: sanitizedData[`witnesses_${witnessIndex}_address`],
            mobile: sanitizedData[`witnesses_${witnessIndex}_mobile`]
          };
          witnesses.push(witness);
          witnessIndex++;
        }
      }
      
      const {
        documentType,
        propertyType,
        plotType,
        salePrice,
        circleRateAmount,
        area,
        areaUnit,
        propertyLength,
        propertyWidth,
        state,
        district,
        tehsil,
        village,
        khasraNo,
        plotNo,
        colonyName,
        wardNo,
        streetNo,
        roadSize,
        roadUnit,
        doubleSideRoad,
        directionNorth,
        directionEast,
        directionSouth,
        directionWest,
        coveredParkingCount,
        openParkingCount,
        deductionType,
        otherDeductionPercent,
        areaInputType,
        dimUnit,
        buildupType,
        numShops,
        numFloorsMall,
        numFloorsMulti,
        superAreaMulti,
        coveredAreaMulti,
        nalkoopCount,
        borewellCount,
        rooms = [],
        trees = [],
        shops = [],
        mallFloors = [],
        facilities = [],
        dynamicFacilities = [],
        calculations = {}
      } = sanitizedData;

      // Validation
      if (!documentType || !propertyType || !salePrice || !circleRateAmount) {
        logger.warn('Sale deed creation failed: Missing required fields', { 
          userId: req.user?.id,
          ip: req.ip
        });
        return res.status(400).json({
          success: false,
          message: "Missing required fields: documentType, propertyType, salePrice, circleRateAmount"
        });
      }

      // Validate sellers
      if (!sellers || sellers.length === 0) {
        logger.warn('Sale deed creation failed: No sellers provided', { 
          userId: req.user?.id,
          ip: req.ip
        });
        return res.status(400).json({
          success: false,
          message: "At least one seller is required"
        });
      }

      // Validate buyers
      if (!buyers || buyers.length === 0) {
        logger.warn('Sale deed creation failed: No buyers provided', { 
          userId: req.user?.id,
          ip: req.ip
        });
        return res.status(400).json({
          success: false,
          message: "At least one buyer is required"
        });
      }

      // Create sale deed
      const saleDeedData = {
        documentType,
        propertyType,
        plotType,
        salePrice: parseFloat(salePrice) || 0,
        circleRateAmount: parseFloat(circleRateAmount) || 0,
        areaInputType: areaInputType || 'total',
        area: parseFloat(area) || 0,
        areaUnit: areaUnit || 'sq_meters',
        propertyLength: parseFloat(propertyLength) || 0,
        propertyWidth: parseFloat(propertyWidth) || 0,
        dimUnit: dimUnit || 'meters',
        buildupType,
        numShops: parseInt(numShops) || 1,
        numFloorsMall: parseInt(numFloorsMall) || 1,
        numFloorsMulti: parseInt(numFloorsMulti) || 1,
        superAreaMulti: parseFloat(superAreaMulti) || 0,
        coveredAreaMulti: parseFloat(coveredAreaMulti) || 0,
        nalkoopCount: parseInt(nalkoopCount) || 0,
        borewellCount: parseInt(borewellCount) || 0,
        // Property Location
        state,
        district,
        tehsil,
        village,
        khasraNo,
        plotNo,
        colonyName,
        wardNo,
        streetNo,
        roadSize: parseFloat(roadSize) || 0,
        roadUnit: roadUnit || 'meter',
        doubleSideRoad: doubleSideRoad === true || doubleSideRoad === 'true',
        // Property Directions
        directionNorth,
        directionEast,
        directionSouth,
        directionWest,
        // Common Facilities
        coveredParkingCount: parseInt(coveredParkingCount) || 0,
        openParkingCount: parseInt(openParkingCount) || 0,
        // Deductions
        deductionType,
        otherDeductionPercent: parseFloat(otherDeductionPercent) || 0,
        // Parties
        sellers,
        buyers,
        witnesses,
        rooms,
        trees,
        shops,
        mallFloors,
        facilities,
        dynamicFacilities,
        calculations,
        createdBy: req.user?.id || null,
        status: 'submitted',
        meta: {
          status: 'submitted',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      const saleDeed = new SaleDeed(saleDeedData);
      await saleDeed.save();

      logger.info('Sale deed created successfully', { 
        saleDeedId: saleDeed._id,
        userId: req.user?.id,
        documentType,
        propertyType
      });

      res.status(201).json({
        success: true,
        message: "Sale deed created successfully",
        data: {
          id: saleDeed._id,
          documentType: saleDeed.documentType,
          propertyType: saleDeed.propertyType,
          status: saleDeed.status
        }
      });

    } catch (error) {
      logger.error('Sale deed creation error', { 
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
      
      // Only filter by user if not admin
      if (req.user?.id && req.user?.role !== 'admin') {
        filter.createdBy = req.user.id;
      }
      if (status) {
        filter.status = status;
      }
      
      const saleDeeds = await SaleDeed.find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await SaleDeed.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: {
          saleDeeds,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          total
        }
      });

    } catch (error) {
      logger.error('Get all sale deeds error', { 
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
      
      const saleDeed = await SaleDeed.findOne(filter)
        .populate('createdBy', 'name email');

      if (!saleDeed) {
        return res.status(404).json({
          success: false,
          message: "Sale deed not found"
        });
      }

      res.status(200).json({
        success: true,
        data: { saleDeed }
      });

    } catch (error) {
      logger.error('Get sale deed by ID error', { 
        error: error.message,
        saleDeedId: req.params.id,
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

      const saleDeed = await SaleDeed.findOneAndUpdate(
        filter,
        { status },
        { new: true }
      );

      if (!saleDeed) {
        return res.status(404).json({
          success: false,
          message: "Sale deed not found"
        });
      }

      logger.info('Sale deed status updated', { 
        saleDeedId: id,
        newStatus: status,
        userId: req.user?.id
      });

      res.status(200).json({
        success: true,
        message: "Sale deed status updated successfully",
        data: { saleDeed }
      });

    } catch (error) {
      logger.error('Update sale deed status error', { 
        error: error.message,
        saleDeedId: req.params.id,
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
      
      const saleDeed = await SaleDeed.findOneAndDelete(filter);

      if (!saleDeed) {
        return res.status(404).json({
          success: false,
          message: "Sale deed not found"
        });
      }

      logger.info('Sale deed deleted', { 
        saleDeedId: id,
        userId: req.user?.id
      });

      res.status(200).json({
        success: true,
        message: "Sale deed deleted successfully"
      });

    } catch (error) {
      logger.error('Delete sale deed error', { 
        error: error.message,
        saleDeedId: req.params.id,
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
      
      const stats = await SaleDeed.aggregate([
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
      logger.error('Get sale deed stats error', { 
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

export default SaleDeedController;