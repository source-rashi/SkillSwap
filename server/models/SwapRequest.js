const mongoose = require('mongoose');

const swapRequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Requester is required']
  },
  target: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Target user is required']
  },
  skillRequested: {
    type: String,
    required: [true, 'Requested skill is required'],
    trim: true,
    maxlength: [100, 'Skill name cannot exceed 100 characters']
  },
  skillOffered: {
    type: String,
    required: [true, 'Offered skill is required'],
    trim: true,
    maxlength: [100, 'Skill name cannot exceed 100 characters']
  },
  message: {
    type: String,
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  scheduledDate: {
    type: Date
  },
  duration: {
    type: Number, // Duration in hours
    min: 0.5,
    max: 8
  },
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  meetingType: {
    type: String,
    enum: ['in-person', 'online', 'hybrid'],
    default: 'online'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  completedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: {
    type: String,
    trim: true,
    maxlength: [300, 'Cancellation reason cannot exceed 300 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
swapRequestSchema.index({ requester: 1, status: 1 });
swapRequestSchema.index({ target: 1, status: 1 });
swapRequestSchema.index({ status: 1, createdAt: -1 });
swapRequestSchema.index({ scheduledDate: 1 });

// Compound index for user's swap requests
swapRequestSchema.index({ 
  requester: 1, 
  target: 1, 
  status: 1 
});

// Virtual for swap duration in readable format
swapRequestSchema.virtual('durationFormatted').get(function() {
  if (!this.duration) return null;
  
  if (this.duration === 1) return '1 hour';
  if (this.duration < 1) return `${this.duration * 60} minutes`;
  return `${this.duration} hours`;
});

// Virtual to check if swap is active
swapRequestSchema.virtual('isActive').get(function() {
  return ['pending', 'accepted'].includes(this.status);
});

// Virtual to check if swap can be cancelled
swapRequestSchema.virtual('canBeCancelled').get(function() {
  return ['pending', 'accepted'].includes(this.status);
});

// Pre-save middleware to validate business rules
swapRequestSchema.pre('save', function(next) {
  // Prevent self-requests
  if (this.requester.toString() === this.target.toString()) {
    return next(new Error('Cannot create swap request with yourself'));
  }
  
  // Set completedAt when status changes to completed
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  // Set cancelledAt when status changes to cancelled
  if (this.status === 'cancelled' && !this.cancelledAt) {
    this.cancelledAt = new Date();
  }
  
  next();
});

// Static method to find user's requests
swapRequestSchema.statics.findUserRequests = function(userId, type = 'all') {
  let query = {};
  
  switch (type) {
    case 'sent':
      query.requester = userId;
      break;
    case 'received':
      query.target = userId;
      break;
    default:
      query = {
        $or: [
          { requester: userId },
          { target: userId }
        ]
      };
  }
  
  return this.find(query)
    .populate('requester', 'name email photo rating')
    .populate('target', 'name email photo rating')
    .sort({ createdAt: -1 });
};

// Static method to find pending requests for a user
swapRequestSchema.statics.findPendingRequests = function(userId) {
  return this.find({
    target: userId,
    status: 'pending'
  })
  .populate('requester', 'name email photo rating skillsOffered')
  .sort({ createdAt: -1 });
};

// Static method to check for duplicate requests
swapRequestSchema.statics.findDuplicate = function(requesterId, targetId, skillRequested) {
  return this.findOne({
    requester: requesterId,
    target: targetId,
    skillRequested: skillRequested,
    status: { $in: ['pending', 'accepted'] }
  });
};

// Instance method to accept request
swapRequestSchema.methods.accept = function() {
  this.status = 'accepted';
  return this.save();
};

// Instance method to reject request
swapRequestSchema.methods.reject = function() {
  this.status = 'rejected';
  return this.save();
};

// Instance method to complete request
swapRequestSchema.methods.complete = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Instance method to cancel request
swapRequestSchema.methods.cancel = function(cancelledBy, reason) {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.cancelledBy = cancelledBy;
  this.cancellationReason = reason;
  return this.save();
};

module.exports = mongoose.model('SwapRequest', swapRequestSchema);