import mongoose from "mongoose";

const trusteeSchema = new mongoose.Schema({
  salutation: { 
    type: String, 
    required: true, 
    enum: ["श्री", "श्रीमती"], 
    default: "श्री" 
  },
  position: { 
    type: String, 
    required: true, 
    enum: ["अध्यक्ष", "सचिव", "कोषाध्यक्ष", "सदस्य"], 
    default: "सदस्य" 
  },
  name: { 
    type: String, 
    required: true, 
    trim: true, 
    maxLength: 100 
  },
  relation: { 
    type: String, 
    required: true, 
    trim: true, 
    maxLength: 100 
  },
  address: { 
    type: String, 
    required: true, 
    trim: true, 
    maxLength: 500 
  },
  mobile: { 
    type: String, 
    required: true, 
    match: /^[6-9]\d{9}$/ 
  },
  idType: { 
    type: String, 
    required: true, 
    enum: ["आधार कार्ड", "पैन कार्ड"], 
    default: "आधार कार्ड" 
  },
  idNumber: { 
    type: String, 
    required: true, 
    trim: true, 
    maxLength: 20 
  },
  idCard: { type: String }, // Filename for ID card upload
  photo: { type: String }, // Filename for photo upload
}, { _id: true }); // Changed to true to match dummy data structure

const witnessSchema = new mongoose.Schema({
  name: { 
    type: String, 
    trim: true, 
    maxLength: 100 
  },
  relation: { 
    type: String, 
    trim: true, 
    maxLength: 100 
  },
  address: { 
    type: String, 
    trim: true, 
    maxLength: 500 
  },
  mobile: { 
    type: String, 
    match: /^[6-9]\d{9}$/ 
  },
  idType: { 
    type: String, 
    enum: ["आधार कार्ड", "पैन कार्ड"], 
    default: "आधार कार्ड" 
  },
  idNumber: { 
    type: String, 
    trim: true, 
    maxLength: 20 
  },
  idCard: { type: String }, // Filename for ID card upload
  photo: { type: String }, // Filename for photo upload
}, { _id: true }); // Changed to true to match dummy data structure

const trustDeedSchema = new mongoose.Schema({
  // Trust Basic Information
  trustName: { 
    type: String, 
    required: [true, 'Trust name is required'], 
    trim: true, 
    maxLength: 100 
  },
  trustAddress: { 
    type: String, 
    required: [true, 'Trust address is required'], 
    trim: true, 
    maxLength: 500 
  },
  
  // Starting Amount - Support both formats
  startingAmount: {
    number: { 
      type: String, 
      required: [true, 'Starting amount in numbers is required'], 
      match: /^\d+$/ 
    },
    words: { 
      type: String, 
      required: [true, 'Starting amount in words is required'],
      trim: true
    },
  },
  // Alternative field names for frontend compatibility
  startingAmount_number: { 
    type: String, 
    match: /^\d+$/ 
  },
  startingAmount_words: { 
    type: String,
    trim: true
  },
  
  // Trustees
  trustees: { 
    type: [trusteeSchema], 
    required: true, 
    validate: [v => v.length >= 1, "At least one trustee is required"] 
  },
  
  // Functional Areas
  functionalDomains: [{ 
    type: String, 
    trim: true, 
    maxLength: 200 
  }],
  
  // Purposes
  purposes: [{ 
    type: String, 
    trim: true, 
    maxLength: 200 
  }],
  otherPurposes: [{ 
    type: String, 
    trim: true, 
    maxLength: 200 
  }],
  
  // Terms and Conditions
  terms: [{ 
    type: String, 
    trim: true, 
    maxLength: 200 
  }],
  otherTerms: [{ 
    type: String, 
    trim: true, 
    maxLength: 200 
  }],
  
  // Witnesses
  witnesses: { 
    type: [witnessSchema], 
    default: [] 
  },
  
  // Metadata
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },
  meta: {
    status: { 
      type: String, 
      enum: ["draft", "submitted", "approved", "rejected"], 
      default: "draft" 
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    },
    updatedAt: { 
      type: Date, 
      default: Date.now 
    },
  },
}, { 
  collection: 'trust_deeds',
  timestamps: true 
});

// Update the meta.updatedAt field before saving
trustDeedSchema.pre('save', function(next) {
  this.meta.updatedAt = Date.now();
  next();
});

// Indexes for better query performance
trustDeedSchema.index({ trustName: 1 });
trustDeedSchema.index({ createdBy: 1 });
trustDeedSchema.index({ 'meta.status': 1 });
trustDeedSchema.index({ 'meta.createdAt': -1 });

// Virtual for trustee count
trustDeedSchema.virtual('trusteeCount').get(function() {
  return this.trustees ? this.trustees.length : 0;
});

// Virtual for witness count
trustDeedSchema.virtual('witnessCount').get(function() {
  return this.witnesses ? this.witnesses.length : 0;
});

// Ensure virtual fields are serialized
trustDeedSchema.set('toJSON', { virtuals: true });
trustDeedSchema.set('toObject', { virtuals: true });

const TrustDeed = mongoose.model("TrustDeed", trustDeedSchema);

export default TrustDeed;