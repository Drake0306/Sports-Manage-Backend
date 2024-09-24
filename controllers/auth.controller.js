const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Twilio = require('twilio');
require('dotenv').config();
  const { User } = require('../models');
const { secret } = require('../config/jwt.config');
const twilioClient = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const saltRounds = 10;

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: true, message: 'Email and password are required' });

  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: true, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: '1h' }
    );

    res.json({ error: false, token }); // No error, send the token

  } catch (error) {
    res.status(500).json({ error: true, message: 'Server error' });

  }
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


const verifyOtp = async (req, res) => {
    
  const { contactNumber, otp } = req.body;

    if (otpStore[contactNumber] === otp) {
        delete otpStore[contactNumber]; // Clear the OTP after verification
        return res.json({ success: true });
    } else {
        return res.json({ success: false, message: 'Invalid OTP.' });
    }
}







const register = async (req, res) => {
  const { firstname, lastname, email, password, role, contactNumber, dateOfBirth,status } = req.body;
console.log(req.body);
  let errors = [];

  if (!firstname) errors.push('Firstname is required');
  if (!lastname) errors.push('Lastname is required');
  if (!email) errors.push('Email is required');
  if (!password) errors.push('Password is required');
  if (!role) errors.push('Role is required');
  if (!status) errors.push('Status is required');
  if (!contactNumber) errors.push('Contact  is required');
  if (!dateOfBirth) errors.push('Date of Birth is required');

  if (errors.length > 0) {
    return res.status(400).json({ error: true, messages: errors });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: true, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      role,
      contactNumber,
      dateOfBirth,
      status
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: '1h' }
    );

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
  verifyOtp
};
