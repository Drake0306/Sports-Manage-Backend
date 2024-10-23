const { User, userDetails } = require("../models");
const jwt = require("jsonwebtoken");
const { secret } = require("../config/jwt.config");

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



module.exports = {
  getCoachData,
  getCoachProfile
};
