import MapForm from '../models/MapForm.js';
import FormsData from '../models/FormsData.js';
import User from '../models/User.js';
import { generateResponse } from '../utils/responseHelper.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Get all map forms with pagination and filtering
export const getAllMapForms = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      serviceType,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    // Status filter
    if (status && status !== '') {
      filter.status = status;
    }

    // Search filter
    if (search && search !== '') {
      filter.$or = [
        { propertyAddress: { $regex: search, $options: 'i' } },
        { formId: { $regex: search, $options: 'i' } }
      ];
    }

    // Service type filter (through linked user form)
    if (serviceType && serviceType !== '') {
      const linkedForms = await FormsData.find({ serviceType }).select('_id');
      filter.linkedUserFormId = { $in: linkedForms.map(form => form._id) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [mapForms, total] = await Promise.all([
      MapForm.find(filter)
        .populate('linkedUserFormId', 'serviceType status userId')
        .populate('linkedUserFormId.userId', 'name email')
        .populate('verifiedBy', 'name email')
        .populate('assignedToStaff3', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      MapForm.countDocuments(filter)
    ]);

    const pages = Math.ceil(total / parseInt(limit));

    res.status(200).json(generateResponse(true, 'Map forms retrieved successfully', {
      mapForms,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages
      }
    }));
  } catch (error) {
    console.error('Error fetching map forms:', error);
    res.status(500).json(generateResponse(false, 'Error fetching map forms', null, error.message));
  }
};

// Get single map form by ID
export const getMapFormById = async (req, res) => {
  try {
    const { formId } = req.params;

    const mapForm = await MapForm.findOne({ _id: formId })
      .populate('linkedUserFormId', 'serviceType status userId')
      .populate('linkedUserFormId.userId', 'name email')
      .populate('verifiedBy', 'name email')
      .populate('assignedToStaff3', 'name email');

    if (!mapForm) {
      return res.status(404).json(generateResponse(false, 'Map form not found'));
    }

    res.status(200).json(generateResponse(true, 'Map form retrieved successfully', {
      mapForm
    }));
  } catch (error) {
    console.error('Error fetching map form:', error);
    res.status(500).json(generateResponse(false, 'Error fetching map form', null, error.message));
  }
};

// Create new map form
export const createMapForm = async (req, res) => {
  try {
    const {
      linkedUserFormId,
      propertyType,
      propertySubType,
      propertyAddress,
      plotLength,
      plotWidth,
      lengthUnit,
      widthUnit,
      vicinityRadius,
      entryDirection,
      builtUpUnit,
      builtUpAreas,
      neighbourDetails,
      notes
    } = req.body;

    // Check if map form already exists for this user form
    const existingMapForm = await MapForm.findOne({ linkedUserFormId });
    if (existingMapForm) {
      return res.status(400).json(generateResponse(false, 'Map form already exists for this user form'));
    }

    // Generate unique form ID
    const formId = `MAP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Assign to Staff 3 (you can modify this logic based on your assignment strategy)
    const staff3User = await User.findOne({ role: 'staff3' }).select('_id');
    const assignedToStaff3 = staff3User ? staff3User._id : req.user.id;

    const mapForm = new MapForm({
      linkedUserFormId,
      formId,
      propertyType,
      propertySubType,
      propertyAddress,
      plotLength,
      plotWidth,
      lengthUnit,
      widthUnit,
      vicinityRadius,
      entryDirection,
      builtUpUnit,
      builtUpAreas,
      neighbourDetails,
      notes,
      assignedToStaff3,
      status: 'draft'
    });

    await mapForm.save();

    // Populate the response
    await mapForm.populate([
      { path: 'linkedUserFormId', select: 'serviceType status userId', populate: { path: 'userId', select: 'name email' } },
      { path: 'verifiedBy', select: 'name email' },
      { path: 'assignedToStaff3', select: 'name email' }
    ]);

    res.status(201).json(generateResponse(true, 'Map form created successfully', {
      mapForm
    }));
  } catch (error) {
    console.error('Error creating map form:', error);
    res.status(500).json(generateResponse(false, 'Error creating map form', null, error.message));
  }
};

// Update map form
export const updateMapForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.linkedUserFormId;
    delete updateData.formId;
    delete updateData.createdAt;

    const mapForm = await MapForm.findOneAndUpdate(
      { _id: formId },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate([
      { path: 'linkedUserFormId', select: 'serviceType status userId', populate: { path: 'userId', select: 'name email' } },
      { path: 'verifiedBy', select: 'name email' },
      { path: 'assignedToStaff3', select: 'name email' }
    ]);

    if (!mapForm) {
      return res.status(404).json(generateResponse(false, 'Map form not found'));
    }

    res.status(200).json(generateResponse(true, 'Map form updated successfully', {
      mapForm
    }));
  } catch (error) {
    console.error('Error updating map form:', error);
    res.status(500).json(generateResponse(false, 'Error updating map form', null, error.message));
  }
};

// Delete map form
export const deleteMapForm = async (req, res) => {
  try {
    const { formId } = req.params;

    const mapForm = await MapForm.findOneAndDelete({ _id: formId });

    if (!mapForm) {
      return res.status(404).json(generateResponse(false, 'Map form not found'));
    }

    res.status(200).json(generateResponse(true, 'Map form deleted successfully'));
  } catch (error) {
    console.error('Error deleting map form:', error);
    res.status(500).json(generateResponse(false, 'Error deleting map form', null, error.message));
  }
};

// Verify map form
export const verifyMapForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const { notes } = req.body;

    const mapForm = await MapForm.findOneAndUpdate(
      { _id: formId },
      {
        status: 'verified',
        verifiedBy: req.user.id,
        verifiedAt: new Date(),
        notes: notes || 'Form verified by Staff 3',
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate([
      { path: 'linkedUserFormId', select: 'serviceType status userId', populate: { path: 'userId', select: 'name email' } },
      { path: 'verifiedBy', select: 'name email' },
      { path: 'assignedToStaff3', select: 'name email' }
    ]);

    if (!mapForm) {
      return res.status(404).json(generateResponse(false, 'Map form not found'));
    }

    res.status(200).json(generateResponse(true, 'Map form verified successfully', {
      mapForm
    }));
  } catch (error) {
    console.error('Error verifying map form:', error);
    res.status(500).json(generateResponse(false, 'Error verifying map form', null, error.message));
  }
};

// Auto-create map form from user form
export const autoCreateMapForm = async (req, res) => {
  try {
    const { userFormId } = req.params;

    // Get user form data
    const userForm = await FormsData.findById(userFormId)
      .populate('userId', 'name email');

    if (!userForm) {
      return res.status(404).json(generateResponse(false, 'User form not found'));
    }

    // Check if map form already exists
    const existingMapForm = await MapForm.findOne({ linkedUserFormId: userFormId });
    if (existingMapForm) {
      return res.status(400).json(generateResponse(false, 'Map form already exists for this user form'));
    }

    // Extract property data from user form (you may need to adjust this based on your FormsData schema)
    const formData = userForm.data || userForm.fields || {};
    
    // Auto-fill map form with available data
    const autoFillData = {
      linkedUserFormId: userFormId,
      propertyType: formData.propertyType || 'Residential',
      propertySubType: formData.propertySubType || 'House',
      propertyAddress: formData.propertyAddress || formData.address || 'Address not specified',
      plotLength: formData.plotLength || formData.length || 50,
      plotWidth: formData.plotWidth || formData.width || 30,
      lengthUnit: 'feet',
      widthUnit: 'feet',
      vicinityRadius: 100,
      entryDirection: 'North',
      builtUpUnit: 'feet',
      builtUpAreas: [],
      neighbourDetails: {
        north: { type: 'Road', name: '', roadSize: 20 },
        south: { type: 'Plot', name: '', roadSize: 0 },
        east: { type: 'Road', name: '', roadSize: 15 },
        west: { type: 'Plot', name: '', roadSize: 0 }
      },
      status: 'draft'
    };

    // Assign to Staff 3
    const staff3User = await User.findOne({ role: 'staff3' }).select('_id');
    autoFillData.assignedToStaff3 = staff3User ? staff3User._id : req.user.id;

    const mapForm = new MapForm(autoFillData);
    await mapForm.save();

    // Populate the response
    await mapForm.populate([
      { path: 'linkedUserFormId', select: 'serviceType status userId', populate: { path: 'userId', select: 'name email' } },
      { path: 'verifiedBy', select: 'name email' },
      { path: 'assignedToStaff3', select: 'name email' }
    ]);

    res.status(201).json(generateResponse(true, 'Map form auto-created successfully', {
      mapForm
    }));
  } catch (error) {
    console.error('Error auto-creating map form:', error);
    res.status(500).json(generateResponse(false, 'Error auto-creating map form', null, error.message));
  }
};

// Generate PDF for map form
export const generateMapFormPDF = async (req, res) => {
  try {
    const { formId } = req.params;

    const mapForm = await MapForm.findById(formId)
      .populate('linkedUserFormId', 'serviceType status userId')
      .populate('linkedUserFormId.userId', 'name email')
      .populate('verifiedBy', 'name email');

    if (!mapForm) {
      return res.status(404).json(generateResponse(false, 'Map form not found'));
    }

    // Create PDF document
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="map-form-${mapForm.formId}.pdf"`);
    
    // Pipe PDF to response
    doc.pipe(res);

    // PDF Content
    doc.fontSize(20).text('संपत्ति का विस्तृत नक़्शा और बिल्ट-अप रिपोर्ट', { align: 'center' });
    doc.fontSize(12).text('Property Detailed Map & Built-up Report', { align: 'center' });
    doc.moveDown(2);

    // Property Summary
    doc.fontSize(16).text('प्रॉपर्टी सारांश (Property Summary)', { underline: true });
    doc.moveDown(0.5);
    
    doc.fontSize(12)
      .text(`Form ID: ${mapForm.formId}`)
      .text(`Property Type: ${mapForm.propertyType}`)
      .text(`Sub-Type: ${mapForm.propertySubType}`)
      .text(`Address: ${mapForm.propertyAddress}`)
      .text(`Plot Dimensions: ${mapForm.plotLength} ${mapForm.lengthUnit} x ${mapForm.plotWidth} ${mapForm.widthUnit}`)
      .text(`Entry Direction: ${mapForm.entryDirection}`)
      .text(`Vicinity Radius: ${mapForm.vicinityRadius} Sq. Meter`);
    
    doc.moveDown(1);

    // Area Calculations
    const areaData = mapForm.getFormattedArea();
    doc.fontSize(14).text('कुल प्लॉट एरिया (Total Plot Area)', { underline: true });
    doc.fontSize(12)
      .text(`${areaData.sqMeters} Sq. Meter`)
      .text(`${areaData.sqFeet} Sq. Feet`)
      .text(`${areaData.sqYards} Sq. Yards`);

    // Built-up Area
    if (mapForm.builtUpAreas && mapForm.builtUpAreas.length > 0) {
      doc.moveDown(1);
      const builtUpSummary = mapForm.getBuiltUpSummary();
      doc.fontSize(14).text('बिल्ट-अप एरिया (Built-up Area)', { underline: true });
      doc.fontSize(12)
        .text(`Total Built-up: ${builtUpSummary.sqMeters} Sq. Meter`)
        .text(`Total Built-up: ${builtUpSummary.sqFeet} Sq. Feet`)
        .text(`Built-up Percentage: ${builtUpSummary.percentage}%`);
      
      doc.moveDown(0.5);
      doc.text('Built-up Details:');
      mapForm.builtUpAreas.forEach((area, index) => {
        doc.text(`  ${index + 1}. ${area.label}: ${area.length} x ${area.width} ${area.unit}`);
      });
    }

    doc.moveDown(1);

    // Neighbour Details
    doc.fontSize(14).text('पड़ोसी विवरण (Neighbour Details)', { underline: true });
    doc.fontSize(12)
      .text(`North: ${mapForm.neighbourDetails.north.type} ${mapForm.neighbourDetails.north.roadSize ? `(${mapForm.neighbourDetails.north.roadSize} ft)` : ''}`)
      .text(`South: ${mapForm.neighbourDetails.south.type} ${mapForm.neighbourDetails.south.roadSize ? `(${mapForm.neighbourDetails.south.roadSize} ft)` : ''}`)
      .text(`East: ${mapForm.neighbourDetails.east.type} ${mapForm.neighbourDetails.east.roadSize ? `(${mapForm.neighbourDetails.east.roadSize} ft)` : ''}`)
      .text(`West: ${mapForm.neighbourDetails.west.type} ${mapForm.neighbourDetails.west.roadSize ? `(${mapForm.neighbourDetails.west.roadSize} ft)` : ''}`);

    doc.moveDown(2);

    // Status and Verification
    doc.fontSize(12)
      .text(`Status: ${mapForm.status.toUpperCase()}`)
      .text(`Created: ${mapForm.createdAt.toLocaleDateString()}`)
      .text(`Updated: ${mapForm.updatedAt.toLocaleDateString()}`);
    
    if (mapForm.verifiedBy) {
      doc.text(`Verified by: ${mapForm.verifiedBy.name} on ${mapForm.verifiedAt.toLocaleDateString()}`);
    }

    if (mapForm.notes) {
      doc.moveDown(1);
      doc.text(`Notes: ${mapForm.notes}`);
    }

    doc.moveDown(3);

    // Signature section
    doc.fontSize(12).text('Signatures:', { underline: true });
    doc.moveDown(2);
    
    const signatureY = doc.y;
    doc.text('Staff 3 Signature', { continued: true, align: 'left' })
      .text('', 300, signatureY, { align: 'right' })
      .text('Date: ___________');
    
    doc.moveDown(2);
    doc.text('Verified by Staff 3', { align: 'center' });

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json(generateResponse(false, 'Error generating PDF', null, error.message));
  }
};

// Get map forms assigned to current Staff 3
export const getMyMapForms = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search
    } = req.query;

    const filter = { assignedToStaff3: req.user.id };

    if (status && status !== '') {
      filter.status = status;
    }

    if (search && search !== '') {
      filter.$or = [
        { propertyAddress: { $regex: search, $options: 'i' } },
        { formId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [mapForms, total] = await Promise.all([
      MapForm.find(filter)
        .populate('linkedUserFormId', 'serviceType status userId')
        .populate('linkedUserFormId.userId', 'name email')
        .populate('verifiedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      MapForm.countDocuments(filter)
    ]);

    const pages = Math.ceil(total / parseInt(limit));

    res.status(200).json(generateResponse(true, 'Map forms retrieved successfully', {
      mapForms,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages
      }
    }));
  } catch (error) {
    console.error('Error fetching my map forms:', error);
    res.status(500).json(generateResponse(false, 'Error fetching map forms', null, error.message));
  }
};
