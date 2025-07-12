const SwapRequest = require('../models/SwapRequest');
const Feedback = require('../models/Feedback');
const User = require('../models/User');

const createSwapRequest = async (req, res) => {
  try {
    console.log('📨 Creating swap request with data:', req.body);
    console.log('👤 User making request:', req.user._id);
    
    const { recipient, skillOffered, skillRequested, message, scheduledDate } = req.body;

    // Check if recipient exists and is active
    const recipientUser = await User.findById(recipient);
    if (!recipientUser || !recipientUser.isActive) {
      console.log('❌ Recipient not found or inactive:', recipient);
      return res.status(404).json({ error: 'Recipient not found' });
    }

    // Prevent self-requests
    if (req.user._id.toString() === recipient) {
      console.log('❌ Self-request attempt');
      return res.status(400).json({ error: 'Cannot send swap request to yourself' });
    }

    // Check for existing pending request
    const existingRequest = await SwapRequest.findOne({
      requester: req.user._id,
      recipient,
      skillRequested,
      status: 'pending'
    });

    if (existingRequest) {
      console.log('❌ Existing pending request found');
      return res.status(400).json({ error: 'Pending request already exists for this skill' });
    }

    const swapRequest = new SwapRequest({
      requester: req.user._id,
      recipient,
      skillOffered,
      skillRequested,
      message,
      scheduledDate
    });

    await swapRequest.save();
    console.log('✅ Swap request saved successfully');
    
    await swapRequest.populate([
      { path: 'requester', select: 'name email skillsOffered skillsWanted' },
      { path: 'recipient', select: 'name email skillsOffered skillsWanted' }
    ]);
    console.log('✅ Swap request populated successfully');

    res.status(201).json({
      message: 'Swap request sent successfully',
      swapRequest
    });
    console.log('✅ Response sent successfully');
  } catch (error) {
    console.error('💥 Error in createSwapRequest:', error);
    res.status(500).json({ error: 'Failed to create swap request' });
  }
};

const getSwapRequests = async (req, res) => {
  try {
    const { type = 'all', status, page = 1, limit = 10 } = req.query;

    let query = {};

    // Filter by type (sent, received, all)
    if (type === 'sent') {
      query.requester = req.user._id;
    } else if (type === 'received') {
      query.recipient = req.user._id;
    } else {
      query.$or = [
        { requester: req.user._id },
        { recipient: req.user._id }
      ];
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    const swapRequests = await SwapRequest.find(query)
      .populate('requester', 'name email skillsOffered skillsWanted')
      .populate('recipient', 'name email skillsOffered skillsWanted')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await SwapRequest.countDocuments(query);

    res.json({
      swapRequests,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch swap requests' });
  }
};

const updateSwapRequest = async (req, res) => {
  try {
    console.log('🔄 UpdateSwapRequest called with:', {
      requestId: req.params.id,
      userId: req.user._id,
      body: req.body
    });

    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const swapRequest = await SwapRequest.findById(id);
    if (!swapRequest) {
      console.log('❌ Swap request not found:', id);
      return res.status(404).json({ error: 'Swap request not found' });
    }

    console.log('📋 Found swap request:', {
      id: swapRequest._id,
      currentStatus: swapRequest.status,
      recipient: swapRequest.recipient,
      requester: swapRequest.requester
    });

    // Only recipient can accept/reject
    if (swapRequest.recipient.toString() !== req.user._id.toString()) {
      console.log('❌ Not authorized - User:', req.user._id, 'Recipient:', swapRequest.recipient);
      return res.status(403).json({ error: 'Not authorized to update this request' });
    }

    // Update status
    swapRequest.status = status;
    if (status === 'rejected') {
      swapRequest.rejectedAt = new Date();
      swapRequest.rejectionReason = rejectionReason;
    }

    await swapRequest.save();
    console.log('✅ Swap request updated successfully to status:', status);
    
    await swapRequest.populate([
      { path: 'requester', select: 'name email skillsOffered skillsWanted' },
      { path: 'recipient', select: 'name email skillsOffered skillsWanted' }
    ]);

    const response = {
      message: `Swap request ${status} successfully`,
      swapRequest
    };
    
    console.log('📤 Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('💥 Error in updateSwapRequest:', error);
    res.status(500).json({ error: 'Failed to update swap request' });
  }
};

const deleteSwapRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const swapRequest = await SwapRequest.findById(id);
    if (!swapRequest) {
      return res.status(404).json({ error: 'Swap request not found' });
    }

    // Only requester can delete, and only if pending
    if (swapRequest.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this request' });
    }

    if (swapRequest.status !== 'pending') {
      return res.status(400).json({ error: 'Can only delete pending requests' });
    }

    await SwapRequest.findByIdAndDelete(id);

    res.json({ message: 'Swap request deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete swap request' });
  }
};

const markSwapCompleted = async (req, res) => {
  try {
    const { id } = req.params;

    const swapRequest = await SwapRequest.findById(id);
    if (!swapRequest) {
      return res.status(404).json({ error: 'Swap request not found' });
    }

    // Both parties can mark as completed
    if (
      swapRequest.requester.toString() !== req.user._id.toString() &&
      swapRequest.recipient.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ error: 'Not authorized to update this request' });
    }

    if (swapRequest.status !== 'accepted') {
      return res.status(400).json({ error: 'Can only complete accepted requests' });
    }

    swapRequest.status = 'completed';
    swapRequest.completedAt = new Date();
    await swapRequest.save();

    res.json({
      message: 'Swap marked as completed',
      swapRequest
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark swap as completed' });
  }
};

const submitFeedback = async (req, res) => {
  try {
    const { swapRequestId, rating, comment } = req.body;

    const swapRequest = await SwapRequest.findById(swapRequestId);
    if (!swapRequest || swapRequest.status !== 'completed') {
      return res.status(400).json({ error: 'Invalid or incomplete swap request' });
    }

    // Determine reviewee
    const reviewee = swapRequest.requester.toString() === req.user._id.toString()
      ? swapRequest.recipient
      : swapRequest.requester;

    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({
      swapRequest: swapRequestId,
      reviewer: req.user._id
    });

    if (existingFeedback) {
      return res.status(400).json({ error: 'Feedback already submitted for this swap' });
    }

    const feedback = new Feedback({
      swapRequest: swapRequestId,
      reviewer: req.user._id,
      reviewee,
      rating,
      comment
    });

    await feedback.save();

    // Update user's average rating
    const userFeedbacks = await Feedback.find({ reviewee });
    const avgRating = userFeedbacks.reduce((sum, f) => sum + f.rating, 0) / userFeedbacks.length;

    await User.findByIdAndUpdate(reviewee, {
      'rating.average': avgRating,
      'rating.count': userFeedbacks.length
    });

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};

module.exports = {
  createSwapRequest,
  getSwapRequests,
  updateSwapRequest,
  deleteSwapRequest,
  markSwapCompleted,
  submitFeedback
};
