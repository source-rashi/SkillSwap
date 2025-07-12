const express = require('express');
const {
  createSwapRequest,
  getSwapRequests,
  updateSwapRequest,
  deleteSwapRequest,
  markSwapCompleted,
  submitFeedback
} = require('../controllers/swapController');
const { validateSwapRequest } = require('../middleware/validation');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, validateSwapRequest, createSwapRequest);
router.get('/', auth, getSwapRequests);
router.put('/:id', auth, updateSwapRequest);
router.delete('/:id', auth, deleteSwapRequest);
router.put('/:id/complete', auth, markSwapCompleted);
router.post('/feedback', auth, submitFeedback);

module.exports = router;
