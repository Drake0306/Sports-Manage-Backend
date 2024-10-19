const express = require('express');
const { login, register, forgotPassword, sendOtp, organizationWithCoaches } = require('../controllers/auth.controller');
const { authorizeRole } = require('../middleware/auth.middleware');

const router = express.Router();
router.post('/login', login);
router.post('/register', register);
router.post('/forget-password', forgotPassword);
router.post('/send-otp',sendOtp);
router.get('/organiz-coach',organizationWithCoaches);
module.exports = router;
    