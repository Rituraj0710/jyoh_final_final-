import mongoose from 'mongoose';

const sellerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  relation: { type: String, trim: true },
  address: { type: String, trim: true },
  mobile: { type: String, trim: true },
  idType: { type: String, trim: true },
  idNo: { type: String, trim: true }
}, { _id: true }); // Changed to true to match dummy data structure

const buyerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  relation: { type: String, trim: true },
  address: { type: String, trim: true },
  mobile: { type: String, trim: true },
  idType: { type: String, trim: true },
  idNo: { type: String, trim: true }
}, { _id: true }); // Changed to true to match dummy data structure

const witnessSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  relation: { type: String, trim: true },
  address: { type: String, trim: true },
  mobile: { type: String, trim: true }
}, { _id: true }); // Changed to true to match dummy data structure

const roomSchema = new mongoose.Schema({
  type: { type: String, trim: true },
  length: { type: Number, min: 0 },
  width: { type: Number, min: 0 }
}, { _id: true }); // Changed to true to match dummy data structure

const treeSchema = new mongoose.Schema({
  type: { type: String, trim: true },
  count: { type: Number, min: 0 }
}, { _id: true }); // Changed to true to match dummy data structure

const saleDeedSchema = new mongoose.Schema({
  // Basic Information
  documentType: { type: String, required: true, trim: true },
  propertyType: { type: String, required: true, trim: true },
  plotType: { type: String, trim: true },
  salePrice: { type: Number, required: true, min: 0 },
  circleRateAmount: { type: Number, required: true, min: 0 },
  
  // Property Area Information
  areaInputType: { type: String, default: 'total' },
  area: { type: Number, min: 0 },
  areaUnit: { type: String, default: 'sq_meters' },
  propertyLength: { type: Number, min: 0 },
  propertyWidth: { type: Number, min: 0 },
  dimUnit: { type: String, default: 'meters' },

  // Buildup Details
  buildupType: { type: String, trim: true },
  numShops: { type: Number, default: 1, min: 0 },
  numFloorsMall: { type: Number, default: 1, min: 0 },
  numFloorsMulti: { type: Number, default: 1, min: 0 },
  superAreaMulti: { type: Number, min: 0 },
  coveredAreaMulti: { type: Number, min: 0 },

  // Agriculture Details
  nalkoopCount: { type: Number, default: 0, min: 0 },
  borewellCount: { type: Number, default: 0, min: 0 },

  // Property Location
  state: { type: String, required: true, trim: true },
  district: { type: String, required: true, trim: true },
  tehsil: { type: String, required: true, trim: true },
  village: { type: String, required: true, trim: true },
  khasraNo: { type: String, trim: true },
  plotNo: { type: String, trim: true },
  colonyName: { type: String, trim: true },
  wardNo: { type: String, trim: true },
  streetNo: { type: String, trim: true },
  roadSize: { type: Number, min: 0 },
  roadUnit: { type: String, default: 'meter' },
  doubleSideRoad: { type: Boolean, default: false },

  // Property Directions
  directionNorth: { type: String, trim: true },
  directionEast: { type: String, trim: true },
  directionSouth: { type: String, trim: true },
  directionWest: { type: String, trim: true },

  // Common Facilities
  coveredParkingCount: { type: Number, default: 0, min: 0 },
  openParkingCount: { type: Number, default: 0, min: 0 },

  // Deductions
  deductionType: { type: String, trim: true },
  otherDeductionPercent: { type: Number, min: 0, max: 100 },

  // Parties and Details
  sellers: { type: [sellerSchema], required: true, validate: [v => v.length >= 1, "At least one seller is required"] },
  buyers: { type: [buyerSchema], required: true, validate: [v => v.length >= 1, "At least one buyer is required"] },
  witnesses: { type: [witnessSchema], default: [] },
  rooms: { type: [roomSchema], default: [] },
  trees: { type: [treeSchema], default: [] },
  shops: [{ type: Number, min: 0 }],
  mallFloors: [{ type: Number, min: 0 }],
  facilities: [{ type: String, trim: true }],
  dynamicFacilities: [{ type: String, trim: true }],

  // Calculation Results
  calculations: {
    salePrice: { type: Number, min: 0 },
    totalPlotAreaSqMeters: { type: Number, min: 0 },
    totalBuildupAreaSqMeters: { type: Number, min: 0 },
    baseCircleRateValue: { type: Number, min: 0 },
    finalCircleRateValue: { type: Number, min: 0 },
    stampDuty: { type: Number, min: 0 },
    registrationCharge: { type: Number, min: 0 },
    finalPayableAmount: { type: Number, min: 0 },
    deductionAmount: { type: Number, min: 0 },
    propertyType: { type: String, trim: true },
    plotType: { type: String, trim: true }
  },

  // File Uploads
  files: [{
    filename: { type: String, trim: true },
    contentType: { type: String, trim: true },
    size: { type: Number, min: 0 },
    path: { type: String, trim: true }
  }],

  // Metadata
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, enum: ['draft', 'submitted', 'approved', 'rejected'], default: 'draft' },
  meta: {
    status: { 
      type: String, 
      enum: ["draft", "submitted", "approved", "rejected"], 
      default: "submitted" 
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    },
    updatedAt: { 
      type: Date, 
      default: Date.now 
    }
  }
}, { 
  collection: 'sale_deeds',
  timestamps: true 
});

// Indexes for better query performance
saleDeedSchema.index({ createdBy: 1 });
saleDeedSchema.index({ status: 1 });
saleDeedSchema.index({ createdAt: -1 });
saleDeedSchema.index({ state: 1, district: 1, tehsil: 1 });
saleDeedSchema.index({ documentType: 1 });
saleDeedSchema.index({ propertyType: 1 });

// Virtual for total area calculation
saleDeedSchema.virtual('totalArea').get(function() {
  if (this.propertyLength && this.propertyWidth) {
    return this.propertyLength * this.propertyWidth;
  }
  return this.area || 0;
});

// Ensure virtual fields are serialized
saleDeedSchema.set('toJSON', { virtuals: true });
saleDeedSchema.set('toObject', { virtuals: true });

const SaleDeed = mongoose.model('SaleDeed', saleDeedSchema);

export default SaleDeed;