const jwt = require('jsonwebtoken');
const { USERS:User, STUDENTGUARDIAN:StudentGuardian } = require('../models'); // Adjust the path to your models as necessary
const secret = process.env.JWT_SECRET; // Ensure to define your secret in environment variables



const getParentData = (req, res) => {
    // Retrieve and send parent-specific data
    res.send('Parent data');
  };
  
  
  const getParentChildrens = async (req, res) => {
    try {
      const token = req.headers.authorization.split(" ")[1];
      if (!token) {
        return res.status(401).json({ error: true, message: "No token provided" });
      }
  
      const decodedToken = jwt.verify(token, secret);
      
      if (decodedToken.role !== "parent") {
        return res.status(403).json({ error: true, message: "Access denied" });
      }
  
      const userEmail = decodedToken.email; // Assuming the email is stored in the token
  
      const guardians = await StudentGuardian.findAll({
        where: { parentEmail: userEmail }, // Match the parentEmail with the decoded email
        attributes: ['userId'], // Fetch only userIds
      });
  
      if (guardians.length === 0) {
        return res.status(404).json({ error: false, message: "No guardians found for this email" });
      }
  
      const userIds = guardians.map(guardian => guardian.userId);
  
      const users = await User.findAll({
        where: {
          id: userIds,
        },
        attributes: { exclude: ['password'] }, // Exclude sensitive information
      });
  
      if (users.length === 0) {
        return res.status(404).json({ error: false, message: "No users found for this guardian email" });
      }
  
      res.json({ error: false, users });
  
    } catch (error) {
      console.error("Error fetching users by guardian email:", error);
      res.status(500).json({ error: true, message: "Server error" });
    }
  }

  const getParentProfile = async (req, res) => {
    try {
      const token = req.headers.authorization.split(" ")[1];
      if (!token) {
        return res.status(401).json({ error: true, message: "No token provided" });
      }
  
      const decodedToken = jwt.verify(token, secret);
      
      if (decodedToken.role !== "parent") {
        return res.status(403).json({ error: true, message: "Access denied, not a parent" });
      }
  
      const coach = await User.findOne({
        where: { id: decodedToken.id },
      });
  
  
      if (!coach) {
        return res.status(404).json({ error: true, message: "Parent not found" });
      }
      
      const profile = {
        ...coach.dataValues,
      };
      
      res.json({ error: false, profile });
  
    } catch (error) {
      console.error("Error fetching coach profile:", error);
      res.status(500).json({ error: true, message: "Server error" });
    }
  };
  
  const updateParentProfile = async (req, res) => {
    try {
      const token = req.headers.authorization.split(" ")[1];
      if (!token) {
        return res.status(401).json({ error: true, message: "No token provided" });
      }
  
      const decodedToken = jwt.verify(token, secret);
      
      if (decodedToken.role !== "parent") {
        return res.status(403).json({ error: true, message: "Access denied, not a coach" });
      }
  
      const coachId = decodedToken.id;
  
      // Extract the incoming data from the request body
      const { firstname, lastname, username, email, phoneNumber } = req.body;
  
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
        return res.status(200).json({ error: true, message: "User not found or no changes made" });
      }
  
      // Optionally, update additional user details if needed
      // await userDetails.update(
      //   {
      //     coachTypeId,
      //     status: "active",
      //   },
      //   {
      //     where: { userId: coachId },
      //   }
      // );
  
      // Fetch updated profile to send back to client
  
      const updatedStudent = await User.findOne({
        where: { id: coachId },
        include: [
          {
            model: StudentGuardian,
            required: false,
          },
        ],
      });
  
      const profile = {
        ...updatedStudent.dataValues,
        coachTypeId: 0,
        userImage: updatedStudent.userImage, // Include the updated image path in the response
      };
  
      res.json({ error: false, message: "Profile updated successfully", profile });
    } catch (error) {
      console.error("Error updating coach profile:", error);
      res.status(500).json({ error: true, message: "Server error" });
    }
  };


  module.exports = {
    getParentData,
    getParentChildrens,
    updateParentProfile,
    getParentProfile
  };
  