const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Twilio = require("twilio");
require("dotenv").config();
const {
  User,
  userDetails,
  Coach,
  Organization,
  StudentGuardian,
} = require("../models");
const { secret } = require("../config/jwt.config");
const twilioClient = Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const NodeCache = require("node-cache");
const otpCache = new NodeCache({ stdTTL: 300 }); // TTL (time-to-live) of 300 seconds (5 minutes)
const { Op } = require("sequelize");
const nodemailer = require("nodemailer");
const crypto = require("crypto"); // Make sure you require this
const { renderTemplate } = require("../services/templateRenderer"); // Adjust the path as necessary
const { addToBlacklist } = require("../middleware/auth.middleware"); // Import the addToBlacklist function
const saltRounds = 10;

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: true, message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(401)
        .json({ error: true, message: "Invalid credentials" });
    }

    // Check if the user's password matches
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ error: true, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: "1h" }
    );

    // Check if the user is verified
    if (user.isVerify === 0) {
      return res.json({
        contact: user.contactNumber,
        error: false,
        message: "Verification pending",
        otp: true,
        token,
      });
    }

    res.json({ error: false, token }); // No error, send the token
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ error: true, message: "Server error" });
  }
};

const logout = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract the token from the Authorization header

  if (token) {
    // Add the token to the blacklist
    addToBlacklist(token);

    return res
      .status(200)
      .json({ error: false, message: "Logged out successfully" });
  }

  return res.status(400).json({ error: true, message: "No token provided" });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ error: true, success: false, message: "Email is required" });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ error: true, success: false, message: "User not found" });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString(); // Generate a 6-digit OTP
    const otpExpires = Date.now() + 300000; // OTP valid for 5 minutes

    // Save OTP and its expiration time in the user record
    user.otp = otp;
    user.otpExpires = otpExpires;

    otpCache.set(email, otp);

    await user.save();

    // Prepare email template
    const currentYear = new Date().getFullYear();
    const emailContent = renderTemplate("otpTemplate.html", {
      otp,
      currentYear,
    });

    // Send email
    const transporter = nodemailer.createTransport({
      service: "Gmail", // or another service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      to: email,
      from: process.env.EMAIL_USER,
      subject: "Your OTP Code",
      html: emailContent,
    };

    await transporter.sendMail(mailOptions);
    res.json({
      error: false,
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("Error in sendOtp:", error);
    res
      .status(500)
      .json({ error: true, success: false, message: "Server error" });
  }
};

const verifyForgotOtp = async (req, res) => {
  const { email, otp } = req.body;  // Destructure email and otp directly

  // Verify that email is a string (to prevent issues if it's still an object)
  if (typeof email !== 'string') {
    return res.status(400).json({ error: true, message: "Invalid email format" });
  }

  console.log("Received email:", email, "Received OTP:", otp); // Debugging logs

  // Retrieve stored OTP from the cache using email as the key
  const storedOtp = otpCache.get(email);

  if (!storedOtp) {
    return res.status(400).json({ error: true, message: "OTP expired or invalid" });
  }

  // Check if the stored OTP matches the OTP from the request
  if (storedOtp !== otp) {
    return res.status(400).json({ error: true, message: "Invalid OTP" });
  }

  // If OTP matches, delete it from the cache and send success response
  otpCache.del(email); 
  return res.json({ error: false, success: true, message: "OTP verified successfully" });
};


const changePassword = async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res
      .status(400)
      .json({ error: true, message: "Email and password are required" });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    // Hash the new password using bcrypt (same process as in your register method)
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update user's password with the hashed password
    user.password = hashedPassword;

    // Save the updated user record
    await user.save();

    res.json({ error: false, success:true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Error in changePassword:", error);
    res.status(500).json({ error: true, message: "Server error" });
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
    return res
      .status(500)
      .json({ success: false, message: "Failed to send OTP." });
  }
};

const organizationWithCoaches = async (req, res) => {
  console.log("he");
  try {
    // Fetch all organizations
    const organizations = await Organization.findAll({
      attributes: ["id", "name", "status"], // Specify the fields you want to retrieve
    });

    // Fetch all coaches
    const coaches = await Coach.findAll({
      attributes: ["id", "type", "status"], // Specify the fields you want to retrieve
    });

    // Send response with organizations and coaches in separate objects
    res.status(200).json({
      error: false,
      organizations, // List of organizations
      coaches, // List of coaches
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: true, message: "Server error" });
  }
};

const verifyOtp = async (req, res) => {
  const { contactNumber, otp } = req.body;
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
        return res.json({ success: true, message: "OTP verified" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: "Server error." });
    }
  } else {
    return res.json({ success: false, message: "Invalid OTP." });
  }
};

const register = async (req, res) => {
  console.log(req.body);
  const {
    username,
    firstname,
    lastname,
    email,
    password,
    role,
    phoneNumber,
    dateOfBirth,
    status,
    socialLogin,
    coachType,
    organization,
    parentEmail,
    parentContact,
    athleteCode,
  } = req.body;

  let errors = [];

  // Common validations
  if (!username) errors.push("Username is required");
  if (!firstname) errors.push("Firstname is required");
  if (!email) errors.push("Email is required");
  if (!password) errors.push("Password is required");
  if (!role) errors.push("Role is required");
  if (!status) errors.push("Status is required");
  if (!phoneNumber) errors.push("Contact number is required");
  if (!dateOfBirth) errors.push("Date of Birth is required");

  // Validate only for 'coach' role
  if (role === "coach") {
    if (!coachType) errors.push("Coach Type is required");
    if (!organization) errors.push("Organization is required");
  }
  if (role === "parent") {
    if (!athleteCode) errors.push("Code  is required");
  }
  if (role === "student") {
    if (!organization) errors.push("Organization is required");
    if (!parentEmail) errors.push("Parent email is required for students");
    if (!parentContact)
      errors.push("Parent contact number is required for students");
  }

  // Return validation errors if any
  if (errors.length > 0) {
    return res.status(400).json({ error: true, messages: errors });
  }
  try {
    // Check if the user with the provided email already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email: email }, { username: username }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        error: true,
        message: "User with this email or username already exists",
      });
    }

    if (role === "parent") {
      const { athleteCode, email } = req.body;
      const result = await updateParentSignup(athleteCode, email);
      if (result.error) {
        return res.status(400).json({ error: true, message: result.message });
      }
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
      contactNumber: phoneNumber,
      dateOfBirth,
      status,
      socialLogin,
    });

    // After user creation, create an entry in the userDetails table
    if (role === "coach") {
      await createCoachDetails(user.id, coachType, organization);
    } else if (role === "student") {
      // Insert into StudentGuardian for 'student' role
      await createStudentGuardianDetails(
        user.id,
        parentEmail,
        parentContact,
        organization
      );
    }

    // Generate JWT token for the user
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        username: user.username,
      },
      secret,
      { expiresIn: "1h" }
    );

    // Respond with the generated token
    res.status(201).json({ error: false, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: true, message: "Server error" });
  }
};

const createRandomNumericCode = (length) => {
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomDigit = Math.floor(Math.random() * 10); // Generates a random digit from 0 to 9
    result += randomDigit;
  }
  return result;
};

const updateParentSignup = async (athleteCode, parentEmail) => {
  try {
    // Find the student guardian with the provided athlete code and email
    const studentGuardian = await StudentGuardian.findOne({
      where: {
        athleteCode: athleteCode,
        parentEmail: parentEmail,
      },
    });

    if (!studentGuardian) {
      return { error: true, message: "Wrong athlete code or email" };
    }

    // Update parentSignup from 0 to 1
    studentGuardian.parentSignup = 1;
    await studentGuardian.save();

    return { error: false, message: "Parent signup updated successfully" };
  } catch (error) {
    console.error("Error updating parent signup:", error);
    throw error; // Handle this error as necessary
  }
};

const createStudentGuardianDetails = async (
  userId,
  parentEmail,
  parentContact,
  organization
) => {
  const athleteCode = createRandomNumericCode(6);
  try {
    await StudentGuardian.create({
      userId, // ID from the user table
      parentEmail, // Parent email
      parentContact, // Parent contact number
      parentSignup: 0,
      organizationId: organization, // Default value for parentSignup
      athleteCode,
      status: "active", // Default status
    });

    const emailContent = renderTemplate("athleteCodeTemplate.html", {
      athleteCode,
    });

    const transporter = nodemailer.createTransport({
      service: "Gmail", // Change service as necessary
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Define mail options
    const mailOptions = {
      to: parentEmail,
      from: process.env.EMAIL_USER,
      subject: "Your Athlete Code",
      html: emailContent,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error creating student guardian details:", error);
    throw error; // You may want to handle this error accordingly
  }
};

const createCoachDetails = async (userId, coachTypeId, organizationId) => {
  try {
    await userDetails.create({
      userId: userId, // user.id from the created user
      coachTypeId: coachTypeId, // coachTypeId from the request
      organizationId: organizationId, // OrganizationId from the request
      status: "active", // Set default status or modify as per need
    });
  } catch (error) {
    console.error("Error creating coach details:", error);
    throw new Error("Failed to create coach details");
  }
};

module.exports = {
  login,
  register,
  sendOtp,
  organizationWithCoaches,
  logout,
  verifyForgotOtp,
  forgotPassword,
  changePassword,
  verifyOtp,
};
