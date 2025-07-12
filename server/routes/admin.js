// routes/admin.js
const express = require('express');
const {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  getAllSwapRequests,
  exportData
} = require('../controllers/adminController');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', adminAuth, getDashboardStats);
router.get('/users', adminAuth, getAllUsers);
router.put('/users/:id/status', adminAuth, toggleUserStatus);
router.get('/swaps', adminAuth, getAllSwapRequests);
router.get('/export', adminAuth, exportData);

module.exports = router;