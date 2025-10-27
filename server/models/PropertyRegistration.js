import mongoose from 'mongoose';

const propertyRegistrationSchema = new mongoose.Schema({
  // Seller Details
  seller_name: {
    type: String,
    required: [true, 'विक्रेता का नाम आवश्यक है।'],
    trim: true,
    maxlength: [100, 'विक्रेता का नाम 100 अक्षरों से अधिक नहीं हो सकता।']
  },
  seller_father_name: {
    type: String,
    required: [true, 'विक्रेता के पिता/पति का नाम आवश्यक है।'],
    trim: true,
    maxlength: [100, 'पिता/पति का नाम 100 अक्षरों से अधिक नहीं हो सकता।']
  },
  seller_address: {
    type: String,
    required: [true, 'विक्रेता का पता आवश्यक है।'],
    trim: true,
    maxlength: [500, 'पता 500 अक्षरों से अधिक नहीं हो सकता।']
  },
  seller_aadhaar: {
    type: String,
    required: [true, 'विक्रेता का आधार नंबर आवश्यक है।'],
    match: [/^[0-9]{12}$/, 'आधार नंबर 12 अंकों का होना चाहिए।']
  },
  seller_mobile: {
    type: String,
    required: [true, 'विक्रेता का मोबाइल नंबर आवश्यक है।'],
    match: [/^[0-9]{10}$/, 'मोबाइल नंबर 10 अंकों का होना चाहिए।']
  },

  // Buyer Details
  buyer_name: {
    type: String,
    required: [true, 'खरीदार का नाम आवश्यक है।'],
    trim: true,
    maxlength: [100, 'खरीदार का नाम 100 अक्षरों से अधिक नहीं हो सकता।']
  },
  buyer_father_name: {
    type: String,
    required: [true, 'खरीदार के पिता/पति का नाम आवश्यक है।'],
    trim: true,
    maxlength: [100, 'पिता/पति का नाम 100 अक्षरों से अधिक नहीं हो सकता।']
  },
  buyer_address: {
    type: String,
    required: [true, 'खरीदार का पता आवश्यक है।'],
    trim: true,
    maxlength: [500, 'पता 500 अक्षरों से अधिक नहीं हो सकता।']
  },
  buyer_aadhaar: {
    type: String,
    required: [true, 'खरीदार का आधार नंबर आवश्यक है।'],
    match: [/^[0-9]{12}$/, 'आधार नंबर 12 अंकों का होना चाहिए।']
  },
  buyer_mobile: {
    type: String,
    required: [true, 'खरीदार का मोबाइल नंबर आवश्यक है।'],
    match: [/^[0-9]{10}$/, 'मोबाइल नंबर 10 अंकों का होना चाहिए।']
  },

  // Property Details
  property_address: {
    type: String,
    required: [true, 'संपत्ति का पता आवश्यक है।'],
    trim: true,
    maxlength: [500, 'संपत्ति का पता 500 अक्षरों से अधिक नहीं हो सकता।']
  },
  property_type: {
    type: String,
    required: [true, 'संपत्ति का प्रकार आवश्यक है।'],
    enum: {
      values: ['आवासीय', 'व्यावसायिक', 'कृषि', 'Residential', 'Commercial', 'Agricultural'],
      message: 'संपत्ति का प्रकार आवासीय, व्यावसायिक, या कृषि होना चाहिए।'
    }
  },
  area_sqm: {
    type: Number,
    required: [true, 'क्षेत्रफल आवश्यक है।'],
    min: [0, 'क्षेत्रफल सकारात्मक होना चाहिए।']
  },
  sale_price: {
    type: Number,
    required: [true, 'बिक्री मूल्य आवश्यक है।'],
    min: [0, 'बिक्री मूल्य सकारात्मक होना चाहिए।']
  },
  registration_date: {
    type: Date,
    required: [true, 'पंजीकरण की तिथि आवश्यक है।']
  },

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
  collection: 'property_registrations',
  timestamps: true 
});

// Indexes for better query performance
propertyRegistrationSchema.index({ seller_aadhaar: 1 });
propertyRegistrationSchema.index({ buyer_aadhaar: 1 });
propertyRegistrationSchema.index({ registration_date: 1 });
propertyRegistrationSchema.index({ createdBy: 1 });
propertyRegistrationSchema.index({ status: 1 });
propertyRegistrationSchema.index({ createdAt: -1 });

// Virtual for formatted registration date
propertyRegistrationSchema.virtual('formatted_registration_date').get(function() {
  return this.registration_date ? this.registration_date.toLocaleDateString('hi-IN') : '';
});

// Ensure virtual fields are serialized
propertyRegistrationSchema.set('toJSON', { virtuals: true });
propertyRegistrationSchema.set('toObject', { virtuals: true });

const PropertyRegistration = mongoose.model("PropertyRegistration", propertyRegistrationSchema);

export default PropertyRegistration;