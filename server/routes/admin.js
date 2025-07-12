const express = require('express');
const { getDashboardStats, getAllUsers, toggleUserStatus, rejectSkill, sendPlatformMessage, getPlatformMessages, getAllSwapRequests, exportData } = require('../controllers/adminController');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', adminAuth, getDashboardStats);
router.get('/users', adminAuth, getAllUsers);
router.put('/users/:id/status', adminAuth, toggleUserStatus);
router.post('/users/skills/reject', adminAuth, rejectSkill);
router.post('/messages', adminAuth, sendPlatformMessage);
router.get('/messages', getPlatformMessages); // No adminAuth for public access
router.get('/swaps', adminAuth, getAllSwapRequests);
router.get('/export', adminAuth, exportData);

module.exports = router;