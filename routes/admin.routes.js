const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');
const { getAdminDashboard } = require('../controllers/admin.controller');

const router = express.Router();

// Route accessible by 'admin' role
router.get('/dashboard', authenticateToken, authorizeRole('admin'), getAdminDashboard);

module.exports = router;
