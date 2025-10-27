import mongoose from 'mongoose';

const propertySaleCertificateSchema = new mongoose.Schema({
  // Bank Information
  bank_name: {
    type: String,
    required: [true, 'बैंक का नाम आवश्यक है।'],
    trim: true,
    maxlength: [200, 'बैंक का नाम 200 अक्षरों से अधिक नहीं हो सकता।']
  },
  bank_pan: {
    type: String,
    required: [true, 'बैंक का PAN नंबर आवश्यक है।'],
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'PAN नंबर सही प्रारूप में होना चाहिए।'],
    trim: true
  },
  bank_reg_office: {
    type: String,
    required: [true, 'बैंक का पंजीकरण कार्यालय आवश्यक है।'],
    trim: true,
    maxlength: [500, 'पंजीकरण कार्यालय 500 अक्षरों से अधिक नहीं हो सकता।']
  },
  bank_head_office: {
    type: String,
    required: [true, 'बैंक का मुख्य कार्यालय आवश्यक है।'],
    trim: true,
    maxlength: [500, 'मुख्य कार्यालय 500 अक्षरों से अधिक नहीं हो सकता।']
  },

  // Bank Representative Information
  bank_rep_title: {
    type: String,
    required: [true, 'बैंक प्रतिनिधि का शीर्षक आवश्यक है।'],
    enum: ['श्री', 'श्रीमती', 'सुश्री'],
    default: 'श्री'
  },
  bank_rep_name: {
    type: String,
    required: [true, 'बैंक प्रतिनिधि का नाम आवश्यक है।'],
    trim: true,
    maxlength: [100, 'नाम 100 अक्षरों से अधिक नहीं हो सकता।']
  },
  bank_rep_relation: {
    type: String,
    required: [true, 'बैंक प्रतिनिधि का संबंध आवश्यक है।'],
    enum: ['पुत्र', 'पत्नी', 'पुत्री', 'पुत्र/पुत्री', 'पत्नी/पति', 'अन्य'],
    default: 'पुत्र'
  },
  bank_rep_father_name: {
    type: String,
    required: [true, 'बैंक प्रतिनिधि के पिता का नाम आवश्यक है।'],
    trim: true,
    maxlength: [100, 'पिता का नाम 100 अक्षरों से अधिक नहीं हो सकता।']
  },
  bank_rep_occupation: {
    type: String,
    trim: true,
    maxlength: [100, 'व्यवसाय 100 अक्षरों से अधिक नहीं हो सकता।']
  },
  bank_rep_mobile: {
    type: String,
    required: [true, 'बैंक प्रतिनिधि का मोबाइल नंबर आवश्यक है।'],
    match: [/^[0-9]{10}$/, 'मोबाइल नंबर 10 अंकों का होना चाहिए।']
  },
  bank_rep_email: {
    type: String,
    required: [true, 'बैंक प्रतिनिधि का ईमेल आवश्यक है।'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'सही ईमेल पता दर्ज करें।']
  },
  bank_rep_address: {
    type: String,
    required: [true, 'बैंक प्रतिनिधि का पता आवश्यक है।'],
    trim: true,
    maxlength: [500, 'पता 500 अक्षरों से अधिक नहीं हो सकता।']
  },

  // Property Information
  property_address: {
    type: String,
    required: [true, 'संपत्ति का पता आवश्यक है।'],
    trim: true,
    maxlength: [500, 'संपत्ति का पता 500 अक्षरों से अधिक नहीं हो सकता।']
  },
  property_type: {
    type: String,
    required: [true, 'संपत्ति का प्रकार आवश्यक है।'],
    enum: ['आवासीय', 'व्यावसायिक', 'कृषि', 'औद्योगिक'],
    trim: true
  },
  property_area: {
    type: Number,
    required: [true, 'संपत्ति का क्षेत्रफल आवश्यक है।'],
    min: [0, 'क्षेत्रफल सकारात्मक होना चाहिए।']
  },
  property_unit: {
    type: String,
    required: [true, 'संपत्ति की इकाई आवश्यक है।'],
    enum: ['sq_meters', 'sq_feet', 'sq_yards', 'acre', 'hectare'],
    default: 'sq_meters'
  },
  property_value: {
    type: Number,
    required: [true, 'संपत्ति का मूल्य आवश्यक है।'],
    min: [0, 'मूल्य सकारात्मक होना चाहिए।']
  },

  // Sale Information
  sale_amount: {
    type: Number,
    required: [true, 'बिक्री राशि आवश्यक है।'],
    min: [0, 'बिक्री राशि सकारात्मक होना चाहिए।']
  },
  sale_amount_words: {
    type: String,
    required: [true, 'बिक्री राशि शब्दों में आवश्यक है।'],
    trim: true,
    maxlength: [500, 'बिक्री राशि शब्दों में 500 अक्षरों से अधिक नहीं हो सकती।']
  },
  sale_date: {
    type: Date,
    required: [true, 'बिक्री तिथि आवश्यक है।'],
    max: [Date.now, 'बिक्री तिथि भविष्य में नहीं हो सकती।']
  },
  sale_mode: {
    type: String,
    required: [true, 'बिक्री का तरीका आवश्यक है।'],
    enum: ['नकद', 'चेक', 'बैंक ट्रांसफर', 'अन्य'],
    trim: true
  },

  // Purchaser Information
  purchaser_name: {
    type: String,
    required: [true, 'खरीदार का नाम आवश्यक है।'],
    trim: true,
    maxlength: [100, 'खरीदार का नाम 100 अक्षरों से अधिक नहीं हो सकता।']
  },
  purchaser_father_name: {
    type: String,
    required: [true, 'खरीदार के पिता का नाम आवश्यक है।'],
    trim: true,
    maxlength: [100, 'पिता का नाम 100 अक्षरों से अधिक नहीं हो सकता।']
  },
  purchaser_address: {
    type: String,
    required: [true, 'खरीदार का पता आवश्यक है।'],
    trim: true,
    maxlength: [500, 'पता 500 अक्षरों से अधिक नहीं हो सकता।']
  },
  purchaser_mobile: {
    type: String,
    required: [true, 'खरीदार का मोबाइल नंबर आवश्यक है।'],
    match: [/^[0-9]{10}$/, 'मोबाइल नंबर 10 अंकों का होना चाहिए।']
  },
  purchaser_aadhaar: {
    type: String,
    required: [true, 'खरीदार का आधार नंबर आवश्यक है।'],
    match: [/^[0-9]{12}$/, 'आधार नंबर 12 अंकों का होना चाहिए।'],
    trim: true
  },
  purchaser_pan: {
    type: String,
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'PAN नंबर सही प्रारूप में होना चाहिए।'],
    trim: true
  },

  // Witness Information
  witness1_name: {
    type: String,
    required: [true, 'पहले गवाह का नाम आवश्यक है।'],
    trim: true,
    maxlength: [100, 'गवाह का नाम 100 अक्षरों से अधिक नहीं हो सकता।']
  },
  witness1_father_name: {
    type: String,
    required: [true, 'पहले गवाह के पिता का नाम आवश्यक है।'],
    trim: true,
    maxlength: [100, 'पिता का नाम 100 अक्षरों से अधिक नहीं हो सकता।']
  },
  witness1_address: {
    type: String,
    required: [true, 'पहले गवाह का पता आवश्यक है।'],
    trim: true,
    maxlength: [500, 'पता 500 अक्षरों से अधिक नहीं हो सकता।']
  },
  witness1_mobile: {
    type: String,
    required: [true, 'पहले गवाह का मोबाइल नंबर आवश्यक है।'],
    match: [/^[0-9]{10}$/, 'मोबाइल नंबर 10 अंकों का होना चाहिए।']
  },
  witness2_name: {
    type: String,
    required: [true, 'दूसरे गवाह का नाम आवश्यक है।'],
    trim: true,
    maxlength: [100, 'गवाह का नाम 100 अक्षरों से अधिक नहीं हो सकता।']
  },
  witness2_father_name: {
    type: String,
    required: [true, 'दूसरे गवाह के पिता का नाम आवश्यक है।'],
    trim: true,
    maxlength: [100, 'पिता का नाम 100 अक्षरों से अधिक नहीं हो सकता।']
  },
  witness2_address: {
    type: String,
    required: [true, 'दूसरे गवाह का पता आवश्यक है।'],
    trim: true,
    maxlength: [500, 'पता 500 अक्षरों से अधिक नहीं हो सकता।']
  },
  witness2_mobile: {
    type: String,
    required: [true, 'दूसरे गवाह का मोबाइल नंबर आवश्यक है।'],
    match: [/^[0-9]{10}$/, 'मोबाइल नंबर 10 अंकों का होना चाहिए।']
  },

  // File uploads
  files: [{
    field: { type: String, required: true },
    filename: { type: String, required: true },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true }
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
  amount: {
    type: Number,
    default: 2000
  },
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
  collection: 'property_sale_certificates',
  timestamps: true 
});

// Update the updatedAt field before saving
propertySaleCertificateSchema.pre('save', function(next) {
  this.meta.updatedAt = Date.now();
  next();
});

// Indexes for better query performance
propertySaleCertificateSchema.index({ bank_rep_mobile: 1 });
propertySaleCertificateSchema.index({ property_address: 1 });
propertySaleCertificateSchema.index({ property_type: 1 });
propertySaleCertificateSchema.index({ createdBy: 1 });
propertySaleCertificateSchema.index({ status: 1 });
propertySaleCertificateSchema.index({ createdAt: -1 });

// Virtual for purchaser name
propertySaleCertificateSchema.virtual('purchaserFullName').get(function() {
  return `${this.purchaser_name} (${this.purchaser_father_name} का पुत्र/पुत्री)`;
});

// Virtual for property value formatted
propertySaleCertificateSchema.virtual('formattedPropertyValue').get(function() {
  return this.property_value ? `₹${this.property_value.toLocaleString('en-IN')}` : '';
});

// Ensure virtual fields are serialized
propertySaleCertificateSchema.set('toJSON', { virtuals: true });
propertySaleCertificateSchema.set('toObject', { virtuals: true });

const PropertySaleCertificate = mongoose.model('PropertySaleCertificate', propertySaleCertificateSchema);

export default PropertySaleCertificate;