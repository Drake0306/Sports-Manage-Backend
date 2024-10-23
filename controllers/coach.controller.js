const { User, userDetails } = require("../models");
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

const getCoachData = (req, res) => {
  // Retrieve and send coach-specific data
  res.send("Coach data");
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
          model: userDetails, // This is fine
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
    console.error(error);
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


module.exports = {
  getCoachData,
  getCoachProfile,
  updateCoachProfile,
  upload 
};
