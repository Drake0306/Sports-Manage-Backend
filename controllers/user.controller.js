const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const { SportsList } = require("../models"); // Adjust the path as necessary

const ACTIVE_STATUS = 'active'; // Set to string as per your model definition

const getUserProfile = (req, res) => {
  // Retrieve and send user profile data
  res.send('User profile data');
};

const updateUserProfile = (req, res) => {
  // Update user profile data
  res.send('User profile updated');
};

const sportsList = async (req, res) => {
  try {
    // Fetch active sports with specified fields
    const sports = await SportsList.findAll({
      attributes: ["id", "sportName", "sportIcon"], // Use correct attribute names
      where: { status: ACTIVE_STATUS }, // Use 'active' status
    });

    // Send response with sports list
    res.status(200).json({
      error: false,
      sports, // List of active sports with icons
    });
  } catch (error) {
    console.error("Error fetching sports:", error);
    res.status(500).json({ error: true, message: "Server error" });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  sportsList
};
