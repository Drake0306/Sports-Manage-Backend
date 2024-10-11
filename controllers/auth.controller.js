const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Twilio = require('twilio');
require('dotenv').config();
  const { User, userDetails, Coach, Organization  } = require('../models');
const { secret } = require('../config/jwt.config');
const twilioClient = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const { addToBlacklist } = require('../middleware/auth.middleware'); // Import the addToBlacklist function



const saltRounds = 10;

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: true, message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: true, message: 'Invalid credentials' });
    }

    // Check if the user's password matches
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: true, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: '1h' }
    );

    // Check if the user is verified
    if (user.isVerify === 0) {
      return res.json({ contact:user.contactNumber,error: false, message: 'Verification pending', otp: true, token });

    }

    res.json({ error: false, token }); // No error, send the token

  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ error: true, message: 'Server error' });
  }
};

const logout = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract the token from the Authorization header

  if (token) {
    // Add the token to the blacklist
    addToBlacklist(token);

    return res.status(200).json({ error: false, message: 'Logged out successfully' });
  }

  return res.status(400).json({ error: true, message: 'No token provided' });
};



let otpStore = {}; // Temporary storage for OTPs
const sendOtp = async (req, res) => {
    
    const { contactNumber } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP

    try {
        await twilioClient.messages.create({
            body: `Your OTP code is ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: contactNumber,
        });

        otpStore[contactNumber] = otp; // Store OTP
        return res.json({ success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Failed to send OTP.' });
    }

}

const organizationWithCoaches = async (req, res) => {
  console.log('he');
  try {
    // Fetch all organizations
    const organizations = await Organization.findAll({
      attributes: ['id', 'name', 'status'], // Specify the fields you want to retrieve
    });

    // Fetch all coaches
    const coaches = await Coach.findAll({
      attributes: ['id', 'type', 'status'], // Specify the fields you want to retrieve
    });

    // Send response with organizations and coaches in separate objects
    res.status(200).json({
      error: false,
      organizations, // List of organizations
      coaches,       // List of coaches
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: true, message: 'Server error' });
  }
};


const verifyOtp = async (req, res) => {
  const { contactNumber,otp } = req.body;
  const userEmail = req.user.email; // Extract email from the authenticated user in the JWT

  if (otpStore[contactNumber] === otp) {
    delete otpStore[contactNumber]; // Clear the OTP after verification


    try {
      // Update the user's isVerify status in the database using the email
      const [updated] = await User.update(
        { isVerify: 1 }, // Set isVerify to 1
        { where: { email: userEmail } } // Use the email from the JWT
      );

      if (updated) {
        return res.json({ success: true, message: 'OTP verified' });
      } 
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Server error.' });
    }

    
  } else {
    return res.json({ success: false, message: 'Invalid OTP.' });
  }
};


const register = async (req, res) => {
  console.log(req.body)
  const {
    username, firstname, lastname, email, password, role, phoneNumber, 
    dateOfBirth, status, socialLogin, coachType, organization
  } = req.body;
  
  let errors = [];
  if (!username) errors.push('Username is required');
  if (!firstname) errors.push('Firstname is required');
  if (!lastname) errors.push('Lastname is required');
  if (!email) errors.push('Email is required');
  if (!password) errors.push('Password is required');
  if (!role) errors.push('Role is required');
  if (!coachType) errors.push('Coach Type is required');
  if (!organization) errors.push('Organization is required');
  if (!status) errors.push('Status is required');
  if (!phoneNumber) errors.push('Contact number is required');
  if (!dateOfBirth) errors.push('Date of Birth is required');

  if (errors.length > 0) {
    return res.status(400).json({ error: true, messages: errors });
  }

  try {
    // Check if the user with the provided email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: true, message: 'User already exists' });
    }

    // Hash the user's password before storing
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user record in the User table
    const user = await User.create({
      username,
      firstname,
      lastname,
      email,
      password: hashedPassword,
      role,
      contactNumber:phoneNumber,
      dateOfBirth,
      status,
      socialLogin
    });

    // After user creation, create an entry in the userDetails table
    await userDetails.create({
      userId: user.id,          // user.id from the created user
      coachTypeId: coachType, // coachTypeId from the request
      organizationId: organization, // OrganizationId from the request
      status: 'active'          // Set default status or modify as per need
    });

    // Generate JWT token for the user
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, username: user.username },
      secret,
      { expiresIn: '1h' }
    );

    // Respond with the generated token
    res.status(201).json({ error: false, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: true, message: 'Server error' });
  }
};


module.exports = {
  login,
  register,
  sendOtp,
  organizationWithCoaches,
  logout,
  verifyOtp
};
