const express = require('express');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  searchUsersBySkill,
  getUserStats,
  getUserFeedback
} = require('../controllers/userController');

const { protect, optionalAuth } = require('../middleware/auth');
const {
  validateUserUpdate,
  validateObjectId,
  validatePagination,
  validateSearch
} = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', validatePagination, validateSearch, getUsers);
router.get('/search/skills', validatePagination, validateSearch, searchUsersBySkill);
router.get('/:id', validateObjectId, optionalAuth, getUser);
router.get('/:id/feedback', validateObjectId, validatePagination, getUserFeedback);

// Protected routes
router.put('/:id', protect, validateObjectId, validateUserUpdate, updateUser);
router.delete('/:id', protect, validateObjectId, deleteUser);
router.get('/:id/stats', protect, validateObjectId, getUserStats);

module.exports = router;