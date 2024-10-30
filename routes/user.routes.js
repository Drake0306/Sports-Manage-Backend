const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');
const { getUserProfile, updateUserProfile, sportsList, getUserList, changePassword } = require('../controllers/user.controller');
const {verifyOtp, logout } = require('../controllers/auth.controller');

const router = express.Router();

// Route accessible by 'user' role
router.get('/profile', authenticateToken, authorizeRole('user'), getUserProfile);
router.put('/profile', authenticateToken, authorizeRole('user'), updateUserProfile);
router.post('/verify-otp',authenticateToken,verifyOtp);
router.post('/logout',authenticateToken,logout);
router.get('/sports/listing',authenticateToken,sportsList);
router.get('/getUserList',authenticateToken,getUserList);
router.post('/change-password',authenticateToken,changePassword);

module.exports = router;
