const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const { USERS:User, USERDETAILS:userDetails, COACH:Coach, COACHTEAM:CoachTeam, ORGANIZATIONS:Organization, SPORTSLIST:SportsList, 
  JOINEDTEAMDATA:JoinedTeamData } = require("../models"); // Updated imports
const { Op } = require('sequelize'); // Add this line to import Sequelize operators
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
        where: organizationId ? {
          organizationId: organizationId,
          status: 'active'
        } : undefined,
        include: [
          {
            model: Coach,
            attributes: ['id', 'type']
          },
          {
            model: Organization,
            attributes: ['id', 'name']
          }
        ]
      }],
      order: [['createdAt', 'DESC']]
    };

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
          organization: userData.userDetails.ORGANIZATIONS ? {
            id: userData.userDetails.ORGANIZATIONS.id,
            name: userData.userDetails.ORGANIZATIONS.name
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


const joinTeam = async (req, res) => {
  try {
    // Extract token from the authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: true, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: true, message: "Token missing from header" });
    }

    // Verify and decode the JWT token to get userId
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET); // Use your JWT secret here
    const userId = decodedToken.id;

    // Extract teamCode from the request body
    const { teamCode } = req.body; // Get teamCode from the request body

    // Check if teamCode is provided
    if (!teamCode) {
      return res.status(400).json({ error: true, message: "Team code is required" });
    }

    // Find the CoachTeam record with the given teamCode
    const team = await CoachTeam.findOne({ where: { teamCode } });
    if (!team) {
      return res.status(404).json({ error: true, message: "Team not found" });
    }

    // Check if the user already has an entry with the same teamId
    const existingEntry = await JoinedTeamData.findOne({
      where: { userId, teamId: team.id }
    });

    if (existingEntry) {
      // If userId and teamId both exist, update status to active
      existingEntry.status = 'active';
      await existingEntry.save(); // Save the active status

      // Update other entries for the same userId to inactive
      await JoinedTeamData.update(
        { status: 'inactive' },
        { where: { userId, teamId: { [Op.ne]: team.id } } } // Update only if teamId is different
      );

      return res.status(200).json({
        error: false,
        message: "Successfully updated team entry to active, other entries are now inactive",
        data: existingEntry
      });
    }

    // If the user already exists with a different teamId
    const differentTeamEntry = await JoinedTeamData.findOne({
      where: { userId, teamId: { [Op.ne]: team.id } } // Check for any different teamId
    });

    if (differentTeamEntry) {
      // Update the status of the existing entry to inactive
      differentTeamEntry.status = 'inactive';
      await differentTeamEntry.save(); // Save the inactive status
      
      // Now, insert a new record for the userId with the new teamId
      const newJoinedTeam = await JoinedTeamData.create({
        userId,
        teamId: team.id,
        status: 'active' // New entry status
      });

      // Return success response for new entry
      return res.status(201).json({
        error: false,
        message: "User was already in a different team; joined new team successfully",
        data: newJoinedTeam
      });
    }

    // Insert new record in joinedTeamData if no previous entries exist
    const joinedTeam = await JoinedTeamData.create({
      userId,
      teamId: team.id,
      status: 'active' // Default status for new entry
    });

    // Return success response for new record
    res.status(201).json({
      error: false,
      message: "Successfully joined team",
      data: joinedTeam
    });
  } catch (error) {
    console.error("Error joining team:", error);
    res.status(500).json({ error: true, message: "Server error" });
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
  getUserList,
  joinTeam
};