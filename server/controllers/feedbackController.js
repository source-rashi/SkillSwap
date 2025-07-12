const Feedback = require('../models/Feedback');
const SwapRequest = require('../models/SwapRequest');
const User = require('../models/User');

// @desc    Create feedback for a swap
// @route   POST /api/feedback
// @access  Private
const createFeedback = async (req, res, next) => {
  try {
    const {
      swapRequest: swapRequestId,
      rating,
      comment,
      skillRating,
      wouldRecommend,
      tags
    } = req.body;

    // Check if swap request exists and is completed
    const swapRequest = await SwapRequest.findById(swapRequestId);
    
    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    if (swapRequest.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only leave feedback for completed swaps'
      });
    }

    // Check if user was involved in this swap
    const userId = req.user.id;
    if (swapRequest.requester.toString() !== userId && 
        swapRequest.target.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to leave feedback for this swap'
      });
    }

    // Determine reviewee (the other person in the swap)
    const revieweeId = swapRequest.requester.toString() === userId 
      ? swapRequest.target 
      : swapRequest.requester;

    // Check if feedback already exists
    const existingFeedback = await Feedback.feedbackExists(swapRequestId, userId);
    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: 'Feedback already exists for this swap'
      });
    }

    // Create feedback
    const feedback = await Feedback.create({
      swapRequest: swapRequestId,
      reviewer: userId,
      reviewee: revieweeId,
      rating,
      comment,
      skillRating,
      wouldRecommend,
      tags
    });

    // Populate the feedback
    await feedback.populate([
      { path: 'reviewer', select: 'name photo' },
      { path: 'reviewee', select: 'name photo' },
      { path: 'swapRequest', select: 'skillRequested skillOffered' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Feedback created successfully',
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get feedback for a user
// @route   GET /api/feedback/user/:userId
// @access  Public
const getUserFeedback = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, publicOnly = true } = req.query;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const feedback = await Feedback.getUserFeedback(userId, {
      limit: parseInt(limit),
      skip: (page - 1) * limit,
      publicOnly: publicOnly === 'true'
    });

    const total = await Feedback.countDocuments({
      reviewee: userId,
      ...(publicOnly === 'true' && { isPublic: true })
    });

    res.status(200).json({
      success: true,
      count: feedback.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get feedback statistics for a user
// @route   GET /api/feedback/user/:userId/stats
// @access  Public
const getUserFeedbackStats = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const stats = await Feedback.getFeedbackStats(userId);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single feedback
// @route   GET /api/feedback/:id
// @access  Public
const getFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('reviewer', 'name photo')
      .populate('reviewee', 'name photo')
      .populate('swapRequest', 'skillRequested skillOffered');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Check if feedback is public or if user is involved
    if (!feedback.isPublic && req.user) {
      const userId = req.user.id;
      if (feedback.reviewer._id.toString() !== userId && 
          feedback.reviewee._id.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'This feedback is private'
        });
      }
    } else if (!feedback.isPublic && !req.user) {
      return res.status(403).json({
        success: false,
        message: 'This feedback is private'
      });
    }

    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update feedback
// @route   PUT /api/feedback/:id
// @access  Private (reviewer only)
const updateFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Check if user is the reviewer
    if (feedback.reviewer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the reviewer can update this feedback'
      });
    }

    const {
      rating,
      comment,
      skillRating,
      wouldRecommend,
      tags,
      isPublic
    } = req.body;

    // Update fields
    if (rating !== undefined) feedback.rating = rating;
    if (comment !== undefined) feedback.comment = comment;
    if (skillRating !== undefined) feedback.skillRating = skillRating;
    if (wouldRecommend !== undefined) feedback.wouldRecommend = wouldRecommend;
    if (tags !== undefined) feedback.tags = tags;
    if (isPublic !== undefined) feedback.isPublic = isPublic;

    await feedback.save();

    // Populate the updated feedback
    await feedback.populate([
      { path: 'reviewer', select: 'name photo' },
      { path: 'reviewee', select: 'name photo' },
      { path: 'swapRequest', select: 'skillRequested skillOffered' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Feedback updated successfully',
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private (reviewer only)
const deleteFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Check if user is the reviewer
    if (feedback.reviewer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the reviewer can delete this feedback'
      });
    }

    await Feedback.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get feedback for a specific swap
// @route   GET /api/feedback/swap/:swapId
// @access  Private (participants only)
const getSwapFeedback = async (req, res, next) => {
  try {
    const { swapId } = req.params;

    // Check if swap exists and user is involved
    const swapRequest = await SwapRequest.findById(swapId);
    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    const userId = req.user.id;
    if (swapRequest.requester.toString() !== userId && 
        swapRequest.target.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view feedback for this swap'
      });
    }

    const feedback = await Feedback.find({ swapRequest: swapId })
      .populate('reviewer', 'name photo')
      .populate('reviewee', 'name photo');

    res.status(200).json({
      success: true,
      count: feedback.length,
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if user can leave feedback for a swap
// @route   GET /api/feedback/can-review/:swapId
// @access  Private
const canLeaveFeedback = async (req, res, next) => {
  try {
    const { swapId } = req.params;
    const userId = req.user.id;

    // Check if swap exists and is completed
    const swapRequest = await SwapRequest.findById(swapId);
    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    if (swapRequest.status !== 'completed') {
      return res.status(200).json({
        success: true,
        canReview: false,
        reason: 'Swap is not completed yet'
      });
    }

    // Check if user was involved
    if (swapRequest.requester.toString() !== userId && 
        swapRequest.target.toString() !== userId) {
      return res.status(200).json({
        success: true,
        canReview: false,
        reason: 'Not involved in this swap'
      });
    }

    // Check if feedback already exists
    const existingFeedback = await Feedback.feedbackExists(swapId, userId);
    if (existingFeedback) {
      return res.status(200).json({
        success: true,
        canReview: false,
        reason: 'Feedback already submitted'
      });
    }

    res.status(200).json({
      success: true,
      canReview: true
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFeedback,
  getUserFeedback,
  getUserFeedbackStats,
  getFeedback,
  updateFeedback,
  deleteFeedback,
  getSwapFeedback,
  canLeaveFeedback
};