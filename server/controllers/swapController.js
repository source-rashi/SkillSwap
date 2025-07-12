const SwapRequest = require('../models/SwapRequest');
const User = require('../models/User');

// @desc    Create new swap request
// @route   POST /api/swaps
// @access  Private
const createSwapRequest = async (req, res, next) => {
  try {
    const {
      target,
      skillRequested,
      skillOffered,
      message,
      scheduledDate,
      duration,
      meetingType,
      location
    } = req.body;

    // Check if target user exists and is public
    const targetUser = await User.findById(target);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Target user not found'
      });
    }

    if (!targetUser.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Cannot send request to private profile'
      });
    }

    // Check if user is trying to request from themselves
    if (req.user.id === target) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create swap request with yourself'
      });
    }

    // Check if target user offers the requested skill
    const hasSkill = targetUser.skillsOffered.some(
      skill => skill.toLowerCase().includes(skillRequested.toLowerCase())
    );

    if (!hasSkill) {
      return res.status(400).json({
        success: false,
        message: 'Target user does not offer the requested skill'
      });
    }

    // Check for duplicate pending/accepted requests
    const existingRequest = await SwapRequest.findDuplicate(
      req.user.id,
      target,
      skillRequested
    );

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending or accepted request for this skill with this user'
      });
    }

    // Create swap request
    const swapRequest = await SwapRequest.create({
      requester: req.user.id,
      target,
      skillRequested,
      skillOffered,
      message,
      scheduledDate,
      duration,
      meetingType,
      location
    });

    // Populate the request with user details
    await swapRequest.populate([
      { path: 'requester', select: 'name email photo rating' },
      { path: 'target', select: 'name email photo rating' }
    ]);

    // Emit real-time notification
    if (req.io) {
      req.io.to(`user-${target}`).emit('new-swap-request', {
        swapRequest,
        message: `${req.user.name} wants to learn ${skillRequested} from you`
      });
    }

    res.status(201).json({
      success: true,
      message: 'Swap request created successfully',
      data: swapRequest
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all swap requests for user
// @route   GET /api/swaps
// @access  Private
const getSwapRequests = async (req, res, next) => {
  try {
    const {
      type = 'all', // 'sent', 'received', 'all'
      status,
      page = 1,
      limit = 10
    } = req.query;

    const userId = req.user.id;
    const skip = (page - 1) * limit;

    // Build query based on type
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

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const total = await SwapRequest.countDocuments(query);

    const swapRequests = await SwapRequest.find(query)
      .populate('requester', 'name email photo rating skillsOffered')
      .populate('target', 'name email photo rating skillsOffered')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: swapRequests.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      data: swapRequests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single swap request
// @route   GET /api/swaps/:id
// @access  Private
const getSwapRequest = async (req, res, next) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id)
      .populate('requester', 'name email photo rating skillsOffered')
      .populate('target', 'name email photo rating skillsOffered');

    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    // Check if user is involved in this swap request
    const userId = req.user.id;
    if (swapRequest.requester._id.toString() !== userId && 
        swapRequest.target._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this swap request'
      });
    }

    res.status(200).json({
      success: true,
      data: swapRequest
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update swap request status
// @route   PUT /api/swaps/:id
// @access  Private
const updateSwapRequest = async (req, res, next) => {
  try {
    const { status, scheduledDate, notes, cancellationReason } = req.body;
    const userId = req.user.id;

    const swapRequest = await SwapRequest.findById(req.params.id);

    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    // Check authorization based on action
    if (status === 'accepted' || status === 'rejected') {
      // Only target user can accept/reject
      if (swapRequest.target.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Only the target user can accept or reject requests'
        });
      }
    } else if (status === 'completed') {
      // Either user can mark as completed
      if (swapRequest.requester.toString() !== userId && 
          swapRequest.target.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this swap request'
        });
      }
    } else if (status === 'cancelled') {
      // Either user can cancel
      if (swapRequest.requester.toString() !== userId && 
          swapRequest.target.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to cancel this swap request'
        });
      }
    }

    // Update fields
    if (status) swapRequest.status = status;
    if (scheduledDate) swapRequest.scheduledDate = scheduledDate;
    if (notes) swapRequest.notes = notes;
    
    if (status === 'cancelled') {
      swapRequest.cancelledBy = userId;
      swapRequest.cancelledAt = new Date();
      if (cancellationReason) {
        swapRequest.cancellationReason = cancellationReason;
      }
    }

    if (status === 'completed') {
      swapRequest.completedAt = new Date();
      
      // Update total swaps count for both users
      await Promise.all([
        User.findByIdAndUpdate(swapRequest.requester, { $inc: { totalSwaps: 1 } }),
        User.findByIdAndUpdate(swapRequest.target, { $inc: { totalSwaps: 1 } })
      ]);
    }

    await swapRequest.save();

    // Populate the updated request
    await swapRequest.populate([
      { path: 'requester', select: 'name email photo rating' },
      { path: 'target', select: 'name email photo rating' }
    ]);

    // Emit real-time notification
    if (req.io) {
      const otherUserId = swapRequest.requester._id.toString() === userId 
        ? swapRequest.target._id.toString() 
        : swapRequest.requester._id.toString();

      req.io.to(`user-${otherUserId}`).emit('swap-status-updated', {
        swapRequest,
        status,
        updatedBy: req.user.name
      });
    }

    res.status(200).json({
      success: true,
      message: `Swap request ${status} successfully`,
      data: swapRequest
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete swap request
// @route   DELETE /api/swaps/:id
// @access  Private
const deleteSwapRequest = async (req, res, next) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id);

    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    // Only requester can delete their own request
    if (swapRequest.requester.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the requester can delete this swap request'
      });
    }

    // Can only delete pending or rejected requests
    if (!['pending', 'rejected'].includes(swapRequest.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete accepted or completed swap requests'
      });
    }

    await SwapRequest.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Swap request deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending requests for user
// @route   GET /api/swaps/pending
// @access  Private
const getPendingRequests = async (req, res, next) => {
  try {
    const pendingRequests = await SwapRequest.findPendingRequests(req.user.id);

    res.status(200).json({
      success: true,
      count: pendingRequests.length,
      data: pendingRequests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get swap request statistics
// @route   GET /api/swaps/stats
// @access  Private
const getSwapStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const stats = await SwapRequest.aggregate([
      {
        $match: {
          $or: [
            { requester: mongoose.Types.ObjectId(userId) },
            { target: mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format stats
    const formattedStats = {
      pending: 0,
      accepted: 0,
      rejected: 0,
      completed: 0,
      cancelled: 0,
      total: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
    });

    res.status(200).json({
      success: true,
      data: formattedStats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSwapRequest,
  getSwapRequests,
  getSwapRequest,
  updateSwapRequest,
  deleteSwapRequest,
  getPendingRequests,
  getSwapStats
};