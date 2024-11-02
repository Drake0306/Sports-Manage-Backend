const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');
const { getParentData, getParentChildrens } = require('../controllers/parent.controller');

const router = express.Router();

// Route accessible by 'parent' role
router.get('/data', authenticateToken, authorizeRole('parent'), getParentData);
router.get('/fetch/childrens',authenticateToken, authorizeRole('parent'), getParentChildrens);
module.exports = router;
