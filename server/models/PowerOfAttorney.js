import mongoose from 'mongoose';

const partySchema = new mongoose.Schema({
  prefix: { type: String, required: true, enum: ['Shri', 'Smt'] },
  name: { type: String, required: true, trim: true },
  fatherName: { type: String, required: true, trim: true },
  age: { type: Number, required: false },
  occupation: { 
    type: String, 
    required: true, 
    enum: ['Service', 'Business', 'Farmer', 'Homemaker'] 
  },
  idType: { 
    type: String, 
    required: true, 
    enum: ['Aadhaar', 'Voter ID', 'PAN Card'] 
  },
  idNo: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  idPhoto: {
    filename: String,
    contentType: String,
    size: Number,
    path: String
  },
  photo: {
    filename: String,
    contentType: String,
    size: Number,
    path: String
  }
}, { _id: true });

const propertySchema = new mongoose.Schema({
  mainPropertyType: { 
    type: String, 
    required: true, 
    enum: ['Immovable', 'Movable', 'Both'] 
  },
  propertyAddress: { type: String, required: false, trim: true },
  propertyType: { 
    type: String, 
    required: false, 
    enum: ['Residential', 'Agricultural', 'Commercial', 'Industrial', 'Other'] 
  },
  totalPlotArea: { type: Number, required: false },
  totalPlotUnit: { 
    type: String, 
    required: false, 
    enum: ['sqft', 'sqm', 'acre', 'bigha'],
    default: 'sqft'
  },
  builtUpArea: { type: Number, required: false },
  builtUpUnit: { 
    type: String, 
    required: false, 
    enum: ['sqft', 'sqm'],
    default: 'sqft'
  },
  acquisitionMethod: { 
    type: String, 
    required: false, 
    enum: ['Sale Deed', 'Gift Deed', 'Will', 'Partition Deed', 'Exchange Deed', 'Other'] 
  },
  acquisitionDocNo: { type: String, required: false, trim: true },
  pageNo: { type: String, required: false, trim: true },
  bookVolumeNo: { type: String, required: false, trim: true },
  registrationDate: { type: Date, required: false },
  subRegistrarDetails: { type: String, required: false, trim: true },
  movablePropertyDetails: { type: String, required: false, trim: true }
}, { _id: true });

const powerOfAttorneySchema = new mongoose.Schema({
  // Document Details
  executionDate: { type: Date, required: true },
  state: { type: String, required: true, trim: true },
  district: { type: String, required: true, trim: true },
  tehsil: { type: String, required: true, trim: true },
  subRegistrarOffice: { type: String, required: true, trim: true },
  
  // Parties
  kartaParties: [partySchema],
  agentParties: [partySchema],
  witnessParties: [partySchema],
  
  // Powers
  powers: [{ type: String, required: true }],
  otherPowersText: { type: String, required: false, trim: true },
  generalPowerCheckbox: { type: Boolean, default: false },
  
  // Properties
  properties: [propertySchema],
  
  // File uploads
  files: [{
    field: { type: String, required: true },
    filename: { type: String, required: true },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true }
  }],
  
  // Status and metadata
  status: { 
    type: String, 
    enum: ['draft', 'submitted', 'approved', 'rejected'], 
    default: 'submitted' 
  },
  amount: { type: Number, default: 1200 }, // Base amount for Power of Attorney
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  meta: {
    status: {
      type: String,
      enum: ['draft', 'submitted', 'approved', 'rejected'],
      default: 'submitted'
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
  collection: 'power_of_attorneys',
  timestamps: true 
});

// Update the updatedAt field before saving
powerOfAttorneySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
powerOfAttorneySchema.index({ createdBy: 1, status: 1 });
powerOfAttorneySchema.index({ createdAt: -1 });
powerOfAttorneySchema.index({ state: 1, district: 1, tehsil: 1 });

const PowerOfAttorney = mongoose.model('PowerOfAttorney', powerOfAttorneySchema);

export default PowerOfAttorney;
