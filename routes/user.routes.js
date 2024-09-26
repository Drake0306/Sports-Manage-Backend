const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');
const { getUserProfile, updateUserProfile } = require('../controllers/user.controller');
const {verifyOtp } = require('../controllers/auth.controller');

const router = express.Router();

// Route accessible by 'user' role
router.get('/profile', authenticateToken, authorizeRole('user'), getUserProfile);
router.put('/profile', authenticateToken, authorizeRole('user'), updateUserProfile);
router.post('/verify-otp',authenticateToken,verifyOtp);

module.exports = router;
