const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  deactivateAccount
} = require('../controllers/authController');

const { protect, authRateLimit } = require('../middleware/auth');
const {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate
} = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', authRateLimit, validateUserRegistration, register);
router.post('/login', authRateLimit, validateUserLogin, login);
router.post('/logout', logout);
router.post('/forgotpassword', authRateLimit, forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, validateUserUpdate, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.put('/deactivate', protect, deactivateAccount);

module.exports = router;