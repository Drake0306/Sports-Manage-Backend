const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const { User, userDetails, Coach, Organization, SportsList } = require("../models"); // Updated imports

const ACTIVE_STATUS = 'active';
const saltRounds = 10;

const getUserProfile = (req, res) => {
  res.send('User profile data');
};

const updateUserProfile = (req, res) => {
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
  }
  catch (error) {
      console.error("Error fetching sports:", error);
      res.status(500).json({ error: true, message: "Server error" });
    }
};

const getUserList = async (req, res) => {
  try {
    // Get query parameters for filtering
    const { role, status, organizationId } = req.query;

    // Base where clause
    const whereClause = {
      status: status || 'active' // Default to active if not specified
    };

    // Add role filter if provided
    if (role) {
      whereClause.role = role;
    }

    // Base query options
    const queryOptions = {
      attributes: [
        'id',
        'username',
        'email',
        'firstname',
        'lastname',
        'role',
        'contactNumber',
        'dateOfBirth',
        'status',
        'userImage',
        'createdAt'
      ],
      where: whereClause,
      include: [{
        model: userDetails,
        attributes: ['id', 'status'],
        include: [
          {
            model: Coach,
            attributes: ['id', 'type']
          },
          {
            model: Organization,
            attributes: ['id', 'name'] // Assuming Organization model has a 'name' field
          }
        ]
      }],
      order: [['createdAt', 'DESC']] // Sort by creation date, newest first
    };

    // Add organization filter if provided
    if (organizationId) {
      queryOptions.include[0].where = {
        organizationId: organizationId,
        status: 'active'
      };
    }

    // Fetch users with their details
    const users = await User.findAll(queryOptions);

    // Transform the data to a more friendly format
    const transformedUsers = users.map(user => {
      const userData = user.get({ plain: true });
      return {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        fullName: `${userData.firstname || ''} ${userData.lastname || ''}`.trim(),
        role: userData.role,
        contactNumber: userData.contactNumber,
        dateOfBirth: userData.dateOfBirth,
        status: userData.status,
        userImage: userData.userImage,
        createdAt: userData.createdAt,
        userDetails: userData.userDetails ? {
          id: userData.userDetails.id,
          status: userData.userDetails.status,
          coach: userData.userDetails.Coach ? {
            id: userData.userDetails.Coach.id,
            type: userData.userDetails.Coach.type
          } : null,
          organization: userData.userDetails.Organization ? {
            id: userData.userDetails.Organization.id,
            name: userData.userDetails.Organization.name
          } : null
        } : null
      };
    });

    // Send response with transformed users list
    res.status(200).json({
      error: false,
      message: "Users retrieved successfully",
      count: transformedUsers.length,
      users: transformedUsers
    });

  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ 
      error: true, 
      message: "An error occurred while fetching users",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const authHeader = req.headers.authorization;
  if (!authHeader || !oldPassword || !newPassword) {
    return res.status(400).json({
      error: true,
      message: "Authorization token, old password, and new password are required"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    // Find the user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    // Check if old password matches the current password
    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ error: true, message: "Old password is incorrect" });
    }

    // Hash the new password using bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user's password with the new hashed password
    user.password = hashedPassword;

    // Save the updated user record
    await user.save();

    res.json({ error: false, success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Error in changePassword:", error);
    res.status(500).json({ error: true, message: "Server error" });
  }
};



module.exports = {
  getUserProfile,
  changePassword,
  updateUserProfile,
  sportsList,
  getUserList
};