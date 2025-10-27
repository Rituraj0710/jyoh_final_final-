import mongoose from "mongoose";

const witnessSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  relation: { 
    type: String, 
    trim: true 
  },
  address: { 
    type: String, 
    trim: true 
  },
  mobile: { 
    type: String, 
    trim: true 
  },
  idType: { 
    type: String, 
    enum: ["आधार कार्ड", "पैन कार्ड", "Aadhar Card", "PAN Card"], 
    default: "आधार कार्ड" 
  },
  idNumber: { 
    type: String, 
    trim: true 
  },
  idCard: { type: String }, // Filename for ID card upload
  photo: { type: String }, // Filename for photo upload
}, { _id: true }); // Match dummy data structure

const beneficiarySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  relation: { 
    type: String, 
    required: true, 
    trim: true 
  },
  address: { 
    type: String, 
    trim: true 
  },
  mobile: { 
    type: String, 
    trim: true 
  },
  share: { 
    type: String, 
    trim: true 
  },
  idType: { 
    type: String, 
    enum: ["आधार कार्ड", "पैन कार्ड", "Aadhar Card", "PAN Card"], 
    default: "आधार कार्ड" 
  },
  idNumber: { 
    type: String, 
    trim: true 
  }
}, { _id: true }); // Match dummy data structure

const willDeedSchema = new mongoose.Schema({
  // Testator Information
  testatorName: { 
    type: String, 
    required: [true, 'Testator name is required'], 
    trim: true 
  },
  testatorAge: { 
    type: Number, 
    required: [true, 'Testator age is required'], 
    min: 18 
  },
  testatorAddress: { 
    type: String, 
    required: [true, 'Testator address is required'], 
    trim: true 
  },
  testatorMobile: { 
    type: String, 
    required: [true, 'Testator mobile is required'], 
    match: /^[6-9]\d{9}$/ 
  },
  testatorIdType: { 
    type: String, 
    enum: ["आधार कार्ड", "पैन कार्ड", "Aadhar Card", "PAN Card"], 
    default: "आधार कार्ड" 
  },
  testatorIdNumber: { 
    type: String, 
    required: [true, 'Testator ID number is required'], 
    trim: true 
  },
  
  // Property Details
  propertyDetails: { 
    type: String, 
    required: [true, 'Property details are required'], 
    trim: true 
  },
  propertyAddress: { 
    type: String, 
    trim: true 
  },
  propertyValue: { 
    type: Number, 
    min: 0 
  },
  
  // Beneficiaries
  beneficiaries: { 
    type: [beneficiarySchema], 
    required: true, 
    validate: [v => v.length >= 1, "At least one beneficiary is required"] 
  },
  
  // Executors
  executors: [{ 
    type: String, 
    trim: true 
  }],
  
  // Witnesses
  witnesses: { 
    type: [witnessSchema], 
    default: [] 
  },
  
  // Will Terms and Conditions
  terms: [{ 
    type: String, 
    trim: true 
  }],
  conditions: [{ 
    type: String, 
    trim: true 
  }],
  
  // File Uploads
  files: [{
    fieldName: { type: String, trim: true },
    fileName: { type: String, trim: true },
    filePath: { type: String, trim: true },
    fileSize: { type: Number, min: 0 },
    mimeType: { type: String, trim: true }
  }],
  
  // Metadata
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },
  status: { 
    type: String, 
    enum: ['draft', 'submitted', 'approved', 'rejected'], 
    default: 'submitted' 
  },
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
  collection: 'will_deeds',
  timestamps: true 
});

// Indexes for better query performance
willDeedSchema.index({ createdBy: 1 });
willDeedSchema.index({ status: 1 });
willDeedSchema.index({ createdAt: -1 });
willDeedSchema.index({ testatorName: 1 });

// Update the meta.updatedAt field before saving
willDeedSchema.pre('save', function(next) {
  this.meta.updatedAt = Date.now();
  next();
});

// Virtual for beneficiary count
willDeedSchema.virtual('beneficiaryCount').get(function() {
  return this.beneficiaries ? this.beneficiaries.length : 0;
});

// Virtual for witness count
willDeedSchema.virtual('witnessCount').get(function() {
  return this.witnesses ? this.witnesses.length : 0;
});

// Ensure virtual fields are serialized
willDeedSchema.set('toJSON', { virtuals: true });
willDeedSchema.set('toObject', { virtuals: true });

const WillDeed = mongoose.model("WillDeed", willDeedSchema);

export default WillDeed;