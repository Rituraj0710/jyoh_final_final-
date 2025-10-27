import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['technical', 'payment', 'general', 'complaint', 'feedback', 'account', 'form'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  subject: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed', 'cancelled'],
    default: 'open'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedAt: {
    type: Date,
    default: null
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  resolutionNotes: {
    type: String,
    maxlength: 1000,
    default: null
  },
  attachments: [{
    fileName: String,
    filePath: String,
    fileType: String,
    fileSize: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  responses: [{
    responseBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000
    },
    attachments: [{
      fileName: String,
      filePath: String,
      fileType: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  feedback: {
    type: String,
    maxlength: 500,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
supportTicketSchema.index({ userId: 1, createdAt: -1 });
supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ category: 1 });
supportTicketSchema.index({ priority: 1 });
supportTicketSchema.index({ assignedTo: 1 });
supportTicketSchema.index({ ticketNumber: 1 });
supportTicketSchema.index({ createdAt: -1 });

// Virtual for ticket age
supportTicketSchema.virtual('ticketAge').get(function() {
  if (this.resolvedAt) {
    return Math.floor((this.resolvedAt - this.createdAt) / (1000 * 60 * 60 * 24)); // days
  }
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24)); // days
});

// Static method to generate ticket number
supportTicketSchema.statics.generateTicketNumber = async function() {
  const prefix = 'TKT';
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  const ticketNumber = `${prefix}-${timestamp}-${randomStr}`;
  
  // Check if it exists
  const exists = await this.findOne({ ticketNumber });
  if (exists) {
    return this.generateTicketNumber(); // Recursive call if duplicate
  }
  
  return ticketNumber;
};

// Static method to get tickets by user
supportTicketSchema.statics.getUserTickets = function(userId, filters = {}) {
  const query = { userId };
  
  if (filters.status) query.status = filters.status;
  if (filters.category) query.category = filters.category;
  if (filters.priority) query.priority = filters.priority;
  
  return this.find(query)
    .populate('userId', 'name email role')
    .populate('assignedTo', 'name email role')
    .populate('resolvedBy', 'name email role')
    .populate('responses.responseBy', 'name email role')
    .sort({ createdAt: -1 })
    .limit(filters.limit || 50)
    .skip(filters.skip || 0);
};

// Static method to get tickets for admin/staff
supportTicketSchema.statics.getAdminTickets = function(filters = {}) {
  const query = {};
  
  if (filters.status) query.status = filters.status;
  if (filters.category) query.category = filters.category;
  if (filters.priority) query.priority = filters.priority;
  if (filters.assignedTo) query.assignedTo = filters.assignedTo;
  if (filters.userId) query.userId = filters.userId;
  
  return this.find(query)
    .populate('userId', 'name email role phone')
    .populate('assignedTo', 'name email role')
    .populate('resolvedBy', 'name email role')
    .populate('responses.responseBy', 'name email role')
    .sort({ createdAt: -1 })
    .limit(filters.limit || 100)
    .skip(filters.skip || 0);
};

// Instance method to add response
supportTicketSchema.methods.addResponse = function(responseBy, message, attachments = []) {
  this.responses.push({
    responseBy,
    message,
    attachments,
    createdAt: new Date()
  });
  
  if (this.status === 'open') {
    this.status = 'in_progress';
  }
  
  return this.save();
};

// Instance method to resolve ticket
supportTicketSchema.methods.resolveTicket = function(resolvedBy, resolutionNotes) {
  this.status = 'resolved';
  this.resolvedAt = new Date();
  this.resolvedBy = resolvedBy;
  this.resolutionNotes = resolutionNotes || '';
  
  return this.save();
};

export default mongoose.model('SupportTicket', supportTicketSchema);
