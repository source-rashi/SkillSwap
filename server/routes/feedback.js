const express = require('express');
const {
  createFeedback,
  getUserFeedback,
  getUserFeedbackStats,
  getFeedback,
  updateFeedback,
  deleteFeedback,
  getSwapFeedback,
  canLeaveFeedback
} = require('../controllers/feedbackController');

const { protect, optionalAuth } = require('../middleware/auth');
const {
  validateFeedback,
  validateObjectId,
  validatePagination
} = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/user/:userId', validateObjectId, validatePagination, getUserFeedback);
router.get('/user/:userId/stats', validateObjectId, getUserFeedbackStats);
router.get('/:id', validateObjectId, optionalAuth, getFeedback);

// Protected routes
router.use(protect);

router.post('/', validateFeedback, createFeedback);
router.put('/:id', validateObjectId, updateFeedback);
router.delete('/:id', validateObjectId, deleteFeedback);
router.get('/swap/:swapId', validateObjectId, getSwapFeedback);
router.get('/can-review/:swapId', validateObjectId, canLeaveFeedback);

module.exports = router;