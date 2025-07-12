const express = require('express');
const {
  createSwapRequest,
  getSwapRequests,
  getSwapRequest,
  updateSwapRequest,
  deleteSwapRequest,
  getPendingRequests,
  getSwapStats
} = require('../controllers/swapController');

const { protect } = require('../middleware/auth');
const {
  validateSwapRequest,
  validateSwapUpdate,
  validateObjectId,
  validatePagination
} = require('../middleware/validation');

const router = express.Router();

// All routes are protected
router.use(protect);

// Swap request routes
router.route('/')
  .get(validatePagination, getSwapRequests)
  .post(validateSwapRequest, createSwapRequest);

router.get('/pending', getPendingRequests);
router.get('/stats', getSwapStats);

router.route('/:id')
  .get(validateObjectId, getSwapRequest)
  .put(validateObjectId, validateSwapUpdate, updateSwapRequest)
  .delete(validateObjectId, deleteSwapRequest);

module.exports = router;