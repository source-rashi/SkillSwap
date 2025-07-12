const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  location: {
    type: String,
    trim: true,
    maxlength: 100
  },
  skillsOffered: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  skillsWanted: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  availability: {
    type: String,
    enum: ['weekdays', 'weekends', 'evenings', 'flexible'],
    default: 'flexible'
  },
  profileImage: {
    type: String,
    trim: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  profileViews: {
    type: Number,
    default: 0
  }, 
  isBanned: { type: Boolean, default: false },
  banReason: { type: String },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
