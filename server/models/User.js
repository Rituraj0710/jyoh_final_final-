import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: function() {
      return this.role !== 'user1' && this.role !== 'user2';
    },
    unique: true,
    sparse: true,
    trim: true
  },
  is_verified: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    default: 'user1'
  },
  department: {
    type: String,
    required: function() {
      return this.role !== 'user1' && this.role !== 'user2';
    },
    trim: true
  },
  employeeId: {
    type: String,
    required: function() {
      return this.role !== 'user1' && this.role !== 'user2';
    },
    unique: true,
    sparse: true, // Allows multiple null values
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  permissions: [{
    type: String,
    enum: ['read', 'write', 'approve', 'lock', 'audit']
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // OTP fields for email verification
  otp: {
    type: String,
    default: null
  },
  otpExpiry: {
    type: Date,
    default: null
  },
  // Status field for agent approval flow
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: function() {
      // Normal users are approved by default, agents need approval
      return this.role === 'user2' ? 'pending' : 'approved';
    }
  },
  // Account status field for user management (active/blocked)
  accountStatus: {
    type: String,
    enum: ['active', 'blocked'],
    default: 'active'
  },
  // Work tracking fields for agents
  transactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }],
  formsHandled: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form'
  }],
  commissionEarned: {
    type: Number,
    default: 0
  },
  // Additional agent-specific fields
  totalTransactions: {
    type: Number,
    default: 0
  },
  totalFormsHandled: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Unique ID for OTP authentication
  uniqueId: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes are already defined in the schema fields

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get user permissions
userSchema.methods.getPermissions = async function() {
  // If user has custom permissions, return them
  if (this.permissions && this.permissions.length > 0) {
    return this.permissions;
  }
  
  // Otherwise, get permissions from role
  try {
    const Role = mongoose.model('Role');
    const role = await Role.findOne({ name: this.role, isActive: true });
    if (role) {
      return role.permissions || [];
    }
  } catch (error) {
    console.error('Error fetching role permissions:', error);
  }
  
  // Fallback to default permissions for system roles
  const defaultRolePermissions = {
    user1: ['read', 'write', 'submit'],
    user2: ['read', 'write', 'submit', 'assist'],
    admin: ['read', 'write', 'approve', 'lock', 'audit', 'manage_staff']
  };
  
  return defaultRolePermissions[this.role] || [];
};

// Static method to find users by role
userSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true });
};

// Static method to get role descriptions
userSchema.statics.getRoleDescriptions = function() {
  return {
    user1: 'Normal User - Fills forms and uploads documents',
    user2: 'Agent - Works on behalf of users, assists and verifies data',
    staff1: 'Form Review & Stamp Calculation',
    staff2: 'Trustee Details Validation', 
    staff3: 'Land/Plot Details Verification',
    staff4: 'Approval & Review',
    admin: 'System Administrator - Full control'
  };
};

// Static method to get staff hierarchy
userSchema.statics.getStaffHierarchy = function() {
  return {
    staff1: 'Form Review & Stamp Calculation',
    staff2: 'Trustee Details Validation', 
    staff3: 'Land/Plot Details Verification',
    staff4: 'Approval & Review'
  };
};

export default mongoose.model('User', userSchema);