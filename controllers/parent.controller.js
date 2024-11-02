const jwt = require('jsonwebtoken');
const { User, StudentGuardian } = require('../models'); // Adjust the path to your models as necessary
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


  module.exports = {
    getParentData,
    getParentChildrens
  };
  