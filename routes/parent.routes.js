const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');
const { getParentData, getParentChildrens, getParentProfile, updateParentProfile  } = require('../controllers/parent.controller');

const router = express.Router();

// Route accessible by 'parent' role
router.get('/data', authenticateToken, authorizeRole('parent'), getParentData);
router.get('/profile', authenticateToken, authorizeRole('parent'), getParentProfile);
// router.post('/profile/update', authenticateToken, authorizeRole('parent'), upload.single('userImage'), updateParentProfile);
router.get('/fetch/childrens',authenticateToken, authorizeRole('parent'), getParentChildrens);
module.exports = router;
