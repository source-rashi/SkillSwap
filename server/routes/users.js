const express = require('express');
const {
  updateProfile,
  getUsers,
  getUserById,
  getLocationSuggestions
} = require('../controllers/userController');
const { validateProfile } = require('../middleware/validation');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.put('/profile', auth, validateProfile, updateProfile);
router.get('/', auth, getUsers);
router.get('/locations', auth, getLocationSuggestions);
router.get('/:id', auth, getUserById);

module.exports = router;
