import mongoose from "mongoose";

const partySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxLength: 100 },
  gender: { type: String, required: true, enum: ["पुरुष", "महिला"] },
  prefix: { type: String, required: true, enum: ["श्री", "कुमार", "श्रीमती", "कुमारी"] },
  dob: { type: Date, required: true },
  maritalStatus: { type: String, enum: ["अविवाहित", "विवाहित", "तलाकशुदा", "विधवा/विधुर"] },
  spouseConsent: { type: Boolean, default: false },
  sonOf: { type: String, required: true, trim: true, maxLength: 100 },
  mobile: { type: String, required: true, match: /^[6-9]\d{9}$/ },
  occupation: { type: String, required: true, enum: ["सरकारी कर्मचारी", "निजी क्षेत्र", "व्यवसाय", "अन्य"] },
  idType: { type: String, required: true, enum: ["आधार कार्ड", "पैन कार्ड", "पासपोर्ट", "मतदाता पहचान पत्र"] },
  idNo: { type: String, required: true, trim: true, maxLength: 20 },
  address: { type: String, required: true, trim: true, maxLength: 500 },
  photo: { type: String }, // Filename for photo upload
});

const witnessSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxLength: 100 },
  gender: { type: String, required: true, enum: ["पुरुष", "महिला"] },
  prefix: { type: String, required: true, enum: ["श्री", "कुमार", "श्रीमती", "कुमारी"] },
  sonOf: { type: String, required: true, trim: true, maxLength: 100 },
  mobile: { type: String, required: true, match: /^[6-9]\d{9}$/ },
  occupation: { type: String, required: true, enum: ["सरकारी कर्मचारी", "निजी क्षेत्र", "व्यवसाय", "अन्य"] },
  idType: { type: String, required: true, enum: ["आधार कार्ड", "पैन कार्ड", "पासपोर्ट", "मतदाता पहचान पत्र"] },
  idNo: { type: String, required: true, trim: true, maxLength: 20 },
  address: { type: String, required: true, trim: true, maxLength: 500 },
  photo: { type: String }, // Filename for photo upload
});

const giftSchema = new mongoose.Schema({
  description: { type: String, required: true, trim: true, maxLength: 200 },
});

const adoptionDeedSchema = new mongoose.Schema({
  // Registration Details
  country: { type: String, required: true, default: "भारत" },
  state: { type: String, required: true, trim: true },
  district: { type: String, required: true, trim: true },
  tehsil: { type: String, required: true, trim: true },
  subRegistrarOffice: { type: String, required: true, trim: true },
  
  // Child Details
  childName: { type: String, required: true, trim: true, maxLength: 100 },
  childDOB: { type: Date, required: true },
  childGender: { type: String, required: true, enum: ["पुरुष", "महिला", "अन्य"] },
  childBloodGroup: { type: String, required: true, enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] },
  childEducation: { type: String, required: true, trim: true, maxLength: 200 },
  childCurrentAddress: { type: String, required: true, trim: true, maxLength: 500 },
  childBirthCertNo: { type: String, required: true, trim: true, maxLength: 50 },
  childBirthCertIssueDate: { type: Date, required: true },
  childBirthCertIssuePlace: { type: String, required: true, trim: true, maxLength: 200 },
  childPhoto: { type: String }, // Filename for child photo
  childBirthCert: { type: String }, // Filename for birth certificate
  childID: { type: String }, // Filename for child ID document
  
  // Orphanage Details (if applicable)
  isOrphanageAdoption: { type: Boolean, default: false },
  orphanageName: { type: String, trim: true, maxLength: 200 },
  orphanageAddress: { type: String, trim: true, maxLength: 500 },
  
  // Parties
  firstParties: { type: [partySchema], required: true, validate: [v => v.length >= 1, "At least one adopting party is required"] },
  secondParties: { type: [partySchema], default: [] },
  witnesses: { type: [witnessSchema], required: true, validate: [v => v.length >= 1, "At least one witness is required"] },
  
  // Gifts
  gifts: { type: [giftSchema], default: [] },
  
  // Stamp Details
  stampAmount: { type: Number, required: true, min: 0 },
  stampNo: { type: String, required: true, trim: true, maxLength: 50 },
  stampDate: { type: Date, required: true },
  
  // Metadata
  meta: {
    status: { type: String, enum: ["draft", "submitted", "approved", "rejected"], default: "submitted" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  
  // User reference
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { collection: 'adoption_deeds' });

// Update the updatedAt field before saving
adoptionDeedSchema.pre('save', function(next) {
  this.meta.updatedAt = Date.now();
  next();
});

// Indexes for better query performance
adoptionDeedSchema.index({ childName: 1 });
adoptionDeedSchema.index({ createdBy: 1 });
adoptionDeedSchema.index({ 'meta.createdAt': -1 });
adoptionDeedSchema.index({ state: 1, district: 1 });

const AdoptionDeed = mongoose.model("AdoptionDeed", adoptionDeedSchema);

export default AdoptionDeed;
