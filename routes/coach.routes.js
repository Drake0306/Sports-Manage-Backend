const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');
const { getCoachData } = require('../controllers/coach.controller');

const router = express.Router();

// Route accessible by 'coach' role
router.get('/data', authenticateToken, authorizeRole('coach'), getCoachData);

module.exports = router;
