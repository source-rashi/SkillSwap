const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  swapRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SwapRequest',
    required: [true, 'Swap request reference is required']
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reviewer is required']
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reviewee is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  skillRating: {
    teaching: {
      type: Number,
      min: 1,
      max: 5
    },
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    punctuality: {
      type: Number,
      min: 1,
      max: 5
    },
    helpfulness: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  wouldRecommend: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    enum: [
      'excellent-teacher',
      'patient',
      'knowledgeable',
      'punctual',
      'friendly',
      'well-prepared',
      'clear-explanations',
      'encouraging',
      'professional',
      'flexible'
    ]
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
feedbackSchema.index({ reviewee: 1, isPublic: 1 });
feedbackSchema.index({ reviewer: 1 });
feedbackSchema.index({ swapRequest: 1 });
feedbackSchema.index({ rating: -1 });
feedbackSchema.index({ createdAt: -1 });

// Compound index for preventing duplicate feedback
feedbackSchema.index({ 
  swapRequest: 1, 
  reviewer: 1 
}, { unique: true });

// Virtual for overall skill rating average
feedbackSchema.virtual('skillRatingAverage').get(function() {
  if (!this.skillRating) return null;
  
  const ratings = Object.values(this.skillRating).filter(rating => rating != null);
  if (ratings.length === 0) return null;
  
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10; // Round to 1 decimal
});

// Virtual for formatted date
feedbackSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Pre-save middleware for validation
feedbackSchema.pre('save', function(next) {
  // Prevent self-feedback
  if (this.reviewer.toString() === this.reviewee.toString()) {
    return next(new Error('Cannot leave feedback for yourself'));
  }
  
  // Verify skill ratings are within bounds
  if (this.skillRating) {
    const skillRatingKeys = Object.keys(this.skillRating);
    for (const key of skillRatingKeys) {
      const rating = this.skillRating[key];
      if (rating != null && (rating < 1 || rating > 5)) {
        return next(new Error(`Skill rating for ${key} must be between 1 and 5`));
      }
    }
  }
  
  next();
});

// Post-save middleware to update user rating
feedbackSchema.post('save', async function() {
  try {
    const User = mongoose.model('User');
    
    // Calculate new average rating for the reviewee
    const feedbacks = await this.constructor.find({
      reviewee: this.reviewee,
      isPublic: true
    });
    
    if (feedbacks.length > 0) {
      const totalRating = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
      const averageRating = totalRating / feedbacks.length;
      
      await User.findByIdAndUpdate(this.reviewee, {
        'rating.average': Math.round(averageRating * 10) / 10,
        'rating.count': feedbacks.length
      });
    }
  } catch (error) {
    console.error('Error updating user rating:', error);
  }
});

// Static method to get user's received feedback
feedbackSchema.statics.getUserFeedback = function(userId, options = {}) {
  const {
    limit = 10,
    skip = 0,
    publicOnly = true
  } = options;
  
  const query = { reviewee: userId };
  if (publicOnly) {
    query.isPublic = true;
  }
  
  return this.find(query)
    .populate('reviewer', 'name photo')
    .populate('swapRequest', 'skillRequested skillOffered')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get feedback statistics
feedbackSchema.statics.getFeedbackStats = async function(userId) {
  const stats = await this.aggregate([
    {
      $match: {
        reviewee: mongoose.Types.ObjectId(userId),
        isPublic: true
      }
    },
    {
      $group: {
        _id: null,
        totalFeedbacks: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        ratingDistribution: {
          $push: '$rating'
        },
        recommendationRate: {
          $avg: { $cond: ['$wouldRecommend', 1, 0] }
        }
      }
    }
  ]);
  
  if (stats.length === 0) {
    return {
      totalFeedbacks: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      recommendationRate: 0
    };
  }
  
  const result = stats[0];
  
  // Calculate rating distribution
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  result.ratingDistribution.forEach(rating => {
    distribution[rating] = (distribution[rating] || 0) + 1;
  });
  
  return {
    totalFeedbacks: result.totalFeedbacks,
    averageRating: Math.round(result.averageRating * 10) / 10,
    ratingDistribution: distribution,
    recommendationRate: Math.round(result.recommendationRate * 100)
  };
};

// Static method to check if feedback exists
feedbackSchema.statics.feedbackExists = function(swapRequestId, reviewerId) {
  return this.findOne({
    swapRequest: swapRequestId,
    reviewer: reviewerId
  });
};

module.exports = mongoose.model('Feedback', feedbackSchema);