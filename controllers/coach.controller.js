const { CoachTeam, User, userDetails, CoachAnnouncement } = require("../models");
const jwt = require("jsonwebtoken");
const { secret } = require("../config/jwt.config");
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // The directory where the images will be saved
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Append file extension
  },
});

// Create the multer instance
const upload = multer({ storage });

const getCoachData = async (req, res) => {
  try {
    // Retrieve and send coach-specific data
    res.send("Coach data");
  } catch (error) {
    console.error("Error fetching coach data:", error);
    res.status(500).json({ error: true, message: "Server error" });
  }
};

const getCoachProfile = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: true, message: "No token provided" });
    }

    const decodedToken = jwt.verify(token, secret);
    
    if (decodedToken.role !== "coach") {
      return res.status(403).json({ error: true, message: "Access denied, not a coach" });
    }

    const coach = await User.findOne({
      where: { id: decodedToken.id },
      include: [
        {
          model: userDetails,
          required: true // Ensure userDetails are found
        }
      ]
    });

    if (!coach) {
      return res.status(404).json({ error: true, message: "Coach not found" });
    }

    if (!coach.userDetail) {
      return res.status(404).json({ error: true, message: "User details not found" });
    }
    
    const profile = {
      ...coach.dataValues,
      coachTypeId: coach.userDetail.coachTypeId, // Access coachTypeId
      coachstatus: coach.userDetail.status // Access status
    };
    
    res.json({ error: false, profile });

  } catch (error) {
    console.error("Error fetching coach profile:", error);
    res.status(500).json({ error: true, message: "Server error" });
  }
};

const updateCoachProfile = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: true, message: "No token provided" });
    }

    const decodedToken = jwt.verify(token, secret);
    
    if (decodedToken.role !== "coach") {
      return res.status(403).json({ error: true, message: "Access denied, not a coach" });
    }

    const coachId = decodedToken.id;

    // Extract the incoming data from the request body
    const { firstname, lastname, username, email, phoneNumber, coachTypeId } = req.body;

    // Handle the uploaded userImage
    let userImage = req.file ? req.file.path : null; // Save the image path if available

    // Update the User model
    const updatedUser = await User.update(
      {
        firstname,
        lastname,
        username,
        email,
        phoneNumber,
        userImage, // Save the image path in the user model
      },
      {
        where: { id: coachId },
      }
    );

    if (!updatedUser[0]) {
      return res.status(404).json({ error: true, message: "User not found or no changes made" });
    }

    // Optionally, update additional user details if needed
    await userDetails.update(
      {
        coachTypeId,
        status: "active",
      },
      {
        where: { userId: coachId },
      }
    );

    // Fetch updated profile to send back to client
    const updatedCoach = await User.findOne({
      where: { id: coachId },
      include: [
        {
          model: userDetails,
          required: true,
        },
      ],
    });

    const profile = {
      ...updatedCoach.dataValues,
      coachTypeId: updatedCoach.userDetail.coachTypeId,
      coachstatus: updatedCoach.userDetail.status,
      userImage: updatedCoach.userImage, // Include the updated image path in the response
    };

    res.json({ error: false, message: "Profile updated successfully", profile });
  } catch (error) {
    console.error("Error updating coach profile:", error);
    res.status(500).json({ error: true, message: "Server error" });
  }
};

const createCoachTeam = async (req, res) => {


  console.log(req.body)
  try {
    // Extract token and decode it
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: true, message: "No token provided" });
    }

    const decodedToken = jwt.verify(token, secret);
    if (decodedToken.role !== "coach") {
      return res.status(403).json({ error: true, message: "Access denied, not a coach" });
    }

    // Fetch coachId from the decoded token
    const coachId = decodedToken.id; // Assuming your token contains the user ID

    // Extract the incoming data from the request body
    const { teamName, teamCode, status, sport, teamColor } = req.body; // Include sport and teamColor
    const teamLogo = req.file ? req.file.path : null; // Save team logo path if available

    // Insert data into coachTeam table
    const newTeam = await CoachTeam.create({
      teamName,
      teamCode,
      teamLogo, // Save logo path to the teamLogo column
      status,
      sport, // Include sport ID from the request body
      teamColor, // Include team color from the request body
      coachId, // Include coachId from the token
    });

    res.json({
      error: false,
      message: "Team created successfully",
      team: newTeam
    });
  } catch (error) {
    console.error("Error creating coach team:", error);
    res.status(500).json({ error: true, message: "Server error" });
  }
};

const createAnnouncement = async (req, res) => {

  try {
    // Extract token from the authorization header
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: true, message: "No token provided" });
    }

    // Verify the token and decode it
    const decodedToken = jwt.verify(token, secret);
    
    // Check if the user is a coach
    if (decodedToken.role !== "coach") {
      return res.status(403).json({ error: true, message: "Access denied, not a coach" });
    }

    // Extract the incoming data from the request body
    const { announcement, status } = req.body;
    const coachId = decodedToken.id; // Assuming the coachId is stored in the token

    // Create the announcement in the database
    const newAnnouncement = await CoachAnnouncement.create({
      coachId,       // Map coachId from the decoded token
      announcement,  // Announcement text
      status         // Status (active/inactive)
    });

    // Respond with success message and the created announcement
    res.status(201).json({
      error: false,
      message: "Announcement created successfully",
      announcement: newAnnouncement
    });
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({ error: true, message: "Server error" });
  }
};

const listAnnouncement = async (req, res) => {
  try {
    // Extract token from the authorization header
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: true, message: "No token provided" });
    }

    // Verify the token and decode it
    const decodedToken = jwt.verify(token, secret);
    
    // Check if the user is a coach
    if (decodedToken.role !== "coach") {
      return res.status(403).json({ error: true, message: "Access denied, not a coach" });
    }

    // Extract coachId from the decoded token
    const coachId = decodedToken.id; // Assuming the coachId is stored in the token

    // Fetch announcements for the specific coach from the database
    const announcements = await CoachAnnouncement.findAll({
      // where: { coachId }, // Filter announcements by coachId
      order: [['createdAt', 'DESC']], // Optional: Order by creation date
      include: [
        {
          model: User,
          as: 'coach', // This should match the alias defined in the association
          attributes: ['username','role'] // Only fetch the username field
        }
      ]
    });

    // Map the results to include the coach's username
    const formattedAnnouncements = announcements.map(announcement => ({
      id: announcement.id,
      coachId: announcement.coachId,
      username: announcement.coach.username,
      role:announcement.coach.role, // Get the username from the included User
      announcement: announcement.announcement,
      createdAt: announcement.createdAt // Include any other fields as needed
    }));

    // Respond with the list of announcements
    res.status(200).json({
      error: false,
      announcements: formattedAnnouncements // Return the formatted announcements
    });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({ error: true, message: "Server error" });
  }
};




module.exports = {
  getCoachData,
  getCoachProfile,
  updateCoachProfile,
  upload,
  createAnnouncement,
  listAnnouncement,
  createCoachTeam
};
