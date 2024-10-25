const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');
const { getCoachData, getCoachProfile,updateCoachProfile, createCoachTeam } = require('../controllers/coach.controller');
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
  
// Route accessible by 'coach' role
router.get('/data', authenticateToken, authorizeRole('coach'), getCoachData);
router.get('/profile', authenticateToken, authorizeRole('coach'), getCoachProfile);
router.post('/profile/update', authenticateToken, authorizeRole('coach'), upload.single('userImage'), updateCoachProfile);
router.post('/team', authenticateToken, authorizeRole('coach'), upload.single('teamLogo'), createCoachTeam); // Use createCoachTeam

module.exports = router;
