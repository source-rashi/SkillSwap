const User = require('../models/User');
const SwapRequest = require('../models/SwapRequest');
const Feedback = require('../models/Feedback');

// @desc    Get all users (public profiles only)
// @route   GET /api/users
// @access  Public
const getUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      skill,
      location,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    let query = { isPublic: true, isActive: true };

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { skillsOffered: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by skill
    if (skill) {
      query.skillsOffered = { $regex: skill, $options: 'i' };
    }

    // Filter by location
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await User.countDocuments(query);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const users = await User.find(query)
      .select('-password -email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: users.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Public
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -email');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if profile is public or if it's the user's own profile
    if (!user.isPublic && (!req.user || req.user.id !== user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'This profile is private'
      });
    }

    // Get user's feedback statistics
    const feedbackStats = await Feedback.getFeedbackStats(user._id);

    res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        feedbackStats
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (own profile only)
const updateUser = async (req, res, next) => {
  try {
    // Check if user is updating their own profile
    if (req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    const fieldsToUpdate = {
      name: req.body.name,
      location: req.body.location,
      skillsOffered: req.body.skillsOffered,
      skillsWanted: req.body.skillsWanted,
      availability: req.body.availability,
      isPublic: req.body.isPublic
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => {
      if (fieldsToUpdate[key] === undefined) {
        delete fieldsToUpdate[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (own profile only)
const deleteUser = async (req, res, next) => {
  try {
    // Check if user is deleting their own profile
    if (req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this profile'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Soft delete - deactivate account instead of removing
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search users by skill
// @route   GET /api/users/search/skills
// @access  Public
const searchUsersBySkill = async (req, res, next) => {
  try {
    const { skill, page = 1, limit = 10 } = req.query;

    if (!skill) {
      return res.status(400).json({
        success: false,
        message: 'Skill parameter is required'
      });
    }

    const skip = (page - 1) * limit;

    const users = await User.find({
      skillsOffered: { $regex: skill, $options: 'i' },
      isPublic: true,
      isActive: true
    })
    .select('-password -email')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ 'rating.average': -1, totalSwaps: -1 });

    const total = await User.countDocuments({
      skillsOffered: { $regex: skill, $options: 'i' },
      isPublic: true,
      isActive: true
    });

    res.status(200).json({
      success: true,
      count: users.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's dashboard stats
// @route   GET /api/users/:id/stats
// @access  Private (own profile only)
const getUserStats = async (req, res, next) => {
  try {
    // Check if user is accessing their own stats
    if (req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these stats'
      });
    }

    const userId = req.params.id;

    // Get swap request statistics
    const [
      totalSwaps,
      pendingRequests,
      completedSwaps,
      sentRequests,
      receivedRequests
    ] = await Promise.all([
      SwapRequest.countDocuments({
        $or: [{ requester: userId }, { target: userId }],
        status: { $in: ['accepted', 'completed'] }
      }),
      SwapRequest.countDocuments({
        target: userId,
        status: 'pending'
      }),
      SwapRequest.countDocuments({
        $or: [{ requester: userId }, { target: userId }],
        status: 'completed'
      }),
      SwapRequest.countDocuments({
        requester: userId
      }),
      SwapRequest.countDocuments({
        target: userId
      })
    ]);

    // Get user's rating
    const user = await User.findById(userId).select('rating');

    // Get recent activity
    const recentSwaps = await SwapRequest.find({
      $or: [{ requester: userId }, { target: userId }]
    })
    .populate('requester', 'name')
    .populate('target', 'name')
    .sort({ updatedAt: -1 })
    .limit(5);

    const stats = {
      totalSwaps,
      pendingRequests,
      completedSwaps,
      sentRequests,
      receivedRequests,
      averageRating: user.rating.average,
      ratingCount: user.rating.count,
      recentActivity: recentSwaps
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's feedback
// @route   GET /api/users/:id/feedback
// @access  Public
const getUserFeedback = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.params.id;

    const feedback = await Feedback.getUserFeedback(userId, {
      limit: parseInt(limit),
      skip: (page - 1) * limit,
      publicOnly: true
    });

    const total = await Feedback.countDocuments({
      reviewee: userId,
      isPublic: true
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

module.exports = {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  searchUsersBySkill,
  getUserStats,
  getUserFeedback
};