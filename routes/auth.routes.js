const express = require('express');
const { login, register, sendOtp } = require('../controllers/auth.controller');
const { authorizeRole } = require('../middleware/auth.middleware');

const router = express.Router();
router.post('/login', login);
router.post('/register', register);
router.post('/send-otp',sendOtp);

module.exports = router;
