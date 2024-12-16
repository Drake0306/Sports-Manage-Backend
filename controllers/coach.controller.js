const { COACHTEAM:CoachTeam, FEATUREREQUEST:FeatureRequest, USERS:User, COACHRESOURCE:CoachResource, 
  USERDETAILS:userDetails, COACHANNOUNCEMENT:CoachAnnouncement, SPORTSLIST:SportsList, JOINEDTEAMDATA:JoinedTeamData } = require("../models");
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
        },
        {
          model: JoinedTeamData, // Include JoinedTeamData model
          as: 'joinedTeams', // Use the alias defined in the User model
          where: { status: 'active' }, // Filter for active joined teams
          required: false, // This allows for coaches without active teams
          include: [ // Include CoachTeam model based on the teamId in JoinedTeamData
            {
              model: CoachTeam,
              as: 'team', // This should match the alias defined in JoinedTeamData
              required: false // Allow for teams that might not exist
            }
          ]
        }
      ]
    });

    if (!coach) {
      return res.status(404).json({ error: true, message: "Coach not found" });
    }

    if (!coach.USERDETAIL) {
      console.log("coach.userDetail", coach);
      return res.status(404).json({ error: true, message: "User details not found" });
    }
    
    const profile = {
      ...coach.dataValues,
      coachTypeId: coach.USERDETAIL.coachTypeId, // Access coachTypeId
      coachStatus: coach.USERDETAIL.status, // Access status
      joinedTeams: coach.joinedTeams || [] // Add active joined teams to profile
    };
    
    // Map joined teams to include the team details
    profile.joinedTeams = profile.joinedTeams.map(joinedTeam => ({
      ...joinedTeam.dataValues,
      team: joinedTeam.team || null // Add team details if available
    }));
    
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
      coachTypeId: updatedCoach.USERDETAIL.coachTypeId,
      coachstatus: updatedCoach.USERDETAIL.status,
      userImage: updatedCoach.userImage, // Include the updated image path in the response
    };

    res.json({ error: false, message: "Profile updated successfully", profile });
  } catch (error) {
    console.error("Error updating coach profile:", error);
    res.status(500).json({ error: true, message: "Server error" });
  }
};

const createCoachTeam = async (req, res) => {
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

const featureBug = async (req, res) => {
  try {
    // Extract and verify the token
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: true, message: "No token provided" });
    }
    const decodedToken = jwt.verify(token, secret);

    // Check if user has permission (adjust role if necessary)
    if (decodedToken.role !== "coach") {
      return res.status(403).json({ error: true, message: "Access denied" });
    }

    // Extract parameters from req.body
    const { featureName, featureDesc, featurePriority, requestFor } = req.body; // Include requestFor
    const featureFile = req.file ? req.file.path : null; // Get file path if a file is uploaded

    // Create a new feature request
    const newFeatureRequest = await FeatureRequest.create({
      name: featureName,
      desc: featureDesc,
      file: featureFile,
      priority: featurePriority,
      status: 'active', // Default status for a new feature request
      requestFor, // Add requestFor to the request
      userId: decodedToken.id // Map userId from the decoded token
    });

    // Respond with the created feature request data
    res.status(201).json({
      error: false,
      message: "Feature request created successfully",
      featureRequest: newFeatureRequest
    });
  } catch (error) {
    console.error("Error creating feature request:", error);
    res.status(500).json({ error: true, message: "Server error" });
  }
};

const teamListing = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: true, message: "No token provided" });
    }

    const decodedToken = jwt.verify(token, secret);

    if (decodedToken.role !== "coach") {
      return res.status(403).json({ error: true, message: "Access denied, not a coach" });
    }

    // Fetch the teams for the coach based on coachId
    const teams = await CoachTeam.findAll({
      where: { coachId: decodedToken.id }, // Ensure you're using the correct ID from the token
      attributes: ['id','teamName', 'teamLogo', 'teamCode', 'teamColor'], // Only select the columns you need
      include: [
        {
          model: SportsList, // Join with the SportsList model
          as: 'sportDetails', // This should match the alias in your association
          attributes: [ 'sportName', 'sportIcon'], // Select the necessary fields from the SportsList
        },
      ],
    });

    // Check if any teams are found
    if (teams.length === 0) {
      return res.status(404).json({ error: false, message: "No teams found for this coach" });
    }

    // Respond with the list of teams including sport details
    res.json({ error: false, teams });

  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({ error: true, message: "Server error" });
  }
};


const teamUsers = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: true, message: "No token provided" });
    }

    const decodedToken = jwt.verify(token, secret);
    
    if (decodedToken.role !== "coach") {
      return res.status(403).json({ error: true, message: "Access denied, not a coach" });
    }

    const { teamCode } = req.body; // Assuming teamCode is part of the request body

    const team = await CoachTeam.findOne({
      where: { teamCode },
      attributes: ['id'], // Only get the ID for the next query
    });

    if (!team) {
      return res.status(200).json({ error: false, message: "Team not found" });
    }

    const joinedUsers = await JoinedTeamData.findAll({
      where: { teamId: team.id },
      attributes: ['userId'], // Get only userIds
    });

    if (joinedUsers.length === 0) {
      return res.status(200).json({ error: false, message: "No users found for this team" });
    }

    const userIds = joinedUsers.map(joinedUser => joinedUser.userId);

    const users = await User.findAll({
      where: {
        id: userIds,
        role:'student',
      },
      attributes: { exclude: ['password'] }, // Exclude sensitive information
    });

    res.json({ error: false, users });

  } catch (error) {
    console.error("Error fetching team users:", error);
    res.status(500).json({ error: true, message: "Server error" });
  }
};

const createResource = async (req, res) => {
  try {
    // Extract the token from the authorization header
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: true, message: "No token provided" });
    }

    // Verify the token
    const decodedToken = jwt.verify(token, secret);
    
    // Ensure the role is 'coach'
    if (decodedToken.role !== "coach") {
      return res.status(403).json({ error: true, message: "Access denied, not a coach" });
    }

    const coachId = decodedToken.id; // Get coachId from the decoded token

    // Extract the fields from the request body
    const { finalForms, spiritShop, tickets, Dragonfly } = req.body;

    // Create the resource in the coachresources table
    const resource = await CoachResource.create({
      finalForms, // Can be null
      spiritShop, // Can be null
      tickets,    // Can be null
      Dragonfly,  // Can be null
      status: 'active', // Default status
      coachId      // Coach ID derived from the JWT
    });
    // Return the created resource
    return res.status(201).json({ error: false, resource });
    
  } catch (error) {
    console.log("Error creating resource:", error);
    return res.status(500).json({ error: true, message: "Server error" });
  }
};


module.exports = {
  getCoachData,
  teamListing,
  getCoachProfile,
  updateCoachProfile,
  upload,
  featureBug,
  teamUsers,
  createAnnouncement,
  createResource,
  listAnnouncement,
  createCoachTeam
};
