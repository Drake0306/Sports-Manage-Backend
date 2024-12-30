const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');
const { getStudentData, getStudentProfile,updateStudentProfile, createStudentTeam, fetchCoachEvents, saveEventResponse, listAnnouncement } = require('../controllers/student.controller');
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
  
// Route accessible by 'Student' role
router.get('/data', authenticateToken, authorizeRole('student'), getStudentData);
router.get('/profile', authenticateToken, authorizeRole('student'), getStudentProfile);
router.post('/profile/update', authenticateToken, authorizeRole('student'), upload.single('userImage'), updateStudentProfile);
router.post('/team', authenticateToken, authorizeRole('student'), upload.single('teamLogo'), createStudentTeam); // Use createStudentTeam
router.get('/announcement/listing',authenticateToken, authorizeRole('student'),listAnnouncement);
router.post('/list/events', authenticateToken, authorizeRole('student'), fetchCoachEvents); // Use createStudentTeam
router.post('/event/response', authenticateToken, authorizeRole('student'), saveEventResponse); // Use createStudentTeam
 

module.exports = router;
