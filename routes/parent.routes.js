const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');
const { getParentData, getParentChildrens, getParentProfile, updateParentProfile  } = require('../controllers/parent.controller');
const multer = require('multer');

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Set the destination folder for uploaded files
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname); // Set the file name
    },
  });
  
  const upload = multer({ storage });

// Route accessible by 'parent' role
router.get('/data', authenticateToken, authorizeRole('parent'), getParentData);
router.get('/profile', authenticateToken, authorizeRole('parent'), getParentProfile);
router.post('/profile/update', authenticateToken, authorizeRole('parent'), upload.single('userImage'), updateParentProfile);
router.get('/fetch/childrens',authenticateToken, authorizeRole('parent'), getParentChildrens);
module.exports = router;
