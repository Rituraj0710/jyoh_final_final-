import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Role name cannot exceed 50 characters']
  },
  displayName: {
    type: String,
    required: [true, 'Display name is required'],
    trim: true,
    maxlength: [100, 'Display name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  permissions: [{
    type: String,
    enum: ['read', 'write', 'approve', 'lock', 'audit', 'manage_staff', 'verify_stamp', 'verify_trustee', 'verify_land', 'submit', 'assist'],
    required: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isSystemRole: {
    type: Boolean,
    default: false // System roles cannot be deleted
  },
  level: {
    type: Number,
    required: [true, 'Role level is required'],
    min: [1, 'Role level must be at least 1'],
    max: [10, 'Role level cannot exceed 10']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
roleSchema.index({ isActive: 1 });
roleSchema.index({ level: 1 });

// Virtual for staff count
roleSchema.virtual('staffCount', {
  ref: 'User',
  localField: 'name',
  foreignField: 'role',
  count: true,
  match: { isActive: true }
});

// Pre-save middleware to ensure unique name
roleSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.name = this.name.toLowerCase().replace(/\s+/g, '_');
  }
  next();
});

// Static method to get active roles
roleSchema.statics.getActiveRoles = function() {
  return this.find({ isActive: true }).sort({ level: 1, name: 1 });
};

// Static method to get role by name
roleSchema.statics.getRoleByName = function(name) {
  return this.findOne({ name: name.toLowerCase(), isActive: true });
};

// Static method to check if role can be deleted
roleSchema.methods.canBeDeleted = async function() {
  if (this.isSystemRole) return false;
  
  // Check if any users are assigned to this role
  const User = mongoose.model('User');
  const userCount = await User.countDocuments({ role: this.name, isActive: true });
  return userCount === 0;
};

// Instance method to get permissions as array
roleSchema.methods.getPermissionsArray = function() {
  return this.permissions || [];
};

// Instance method to has permission
roleSchema.methods.hasPermission = function(permission) {
  return this.permissions && this.permissions.includes(permission);
};

export default mongoose.model('Role', roleSchema);
