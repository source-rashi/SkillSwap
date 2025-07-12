const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  photo: {
    type: String,
    default: null
  },
  skillsOffered: [{
    type: String,
    trim: true,
    maxlength: [50, 'Skill name cannot exceed 50 characters']
  }],
  skillsWanted: [{
    type: String,
    trim: true,
    maxlength: [50, 'Skill name cannot exceed 50 characters']
  }],
  availability: [{
    type: String,
    enum: [
      'Weekday Mornings',
      'Weekday Afternoons', 
      'Weekday Evenings',
      'Weekend Mornings',
      'Weekend Afternoons',
      'Weekend Evenings'
    ]
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  totalSwaps: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for search functionality
userSchema.index({ 
  name: 'text', 
  skillsOffered: 'text', 
  location: 'text' 
});

userSchema.index({ email: 1 });
userSchema.index({ skillsOffered: 1 });
userSchema.index({ isPublic: 1, isActive: 1 });

// Virtual for user's full profile URL
userSchema.virtual('profileUrl').get(function() {
  return `/api/users/${this._id}`;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash password if it's been modified
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update lastLogin on successful authentication
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update user rating
userSchema.methods.updateRating = function(newRating) {
  const totalRating = (this.rating.average * this.rating.count) + newRating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
  return this.save();
};

// Get public profile (exclude sensitive data)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

// Static method to find users by skill
userSchema.statics.findBySkill = function(skill) {
  return this.find({
    skillsOffered: { $regex: skill, $options: 'i' },
    isPublic: true,
    isActive: true
  });
};

// Static method for search
userSchema.statics.searchUsers = function(query) {
  return this.find({
    $and: [
      { isPublic: true },
      { isActive: true },
      {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { skillsOffered: { $regex: query, $options: 'i' } },
          { location: { $regex: query, $options: 'i' } }
        ]
      }
    ]
  });
};

module.exports = mongoose.model('User', userSchema);