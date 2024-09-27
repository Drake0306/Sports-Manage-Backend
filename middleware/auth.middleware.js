const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwt.config');

const blacklist = new Set(); // Initialize your blacklist

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

  if (token == null) {
    return res.status(401).json({ error: 'Token is required' }); // Token is missing
  }

  // Check if the token is blacklisted
  if (isBlacklisted(token)) {
    return res.status(403).json({ error: 'Token is invalidated' }); // Token is blacklisted
  }

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' }); // Token is invalid or expired
    }
    req.user = user; // Attach user info to request object
    next(); // Proceed to the next middleware or route handler
  });
};

// Middleware to authorize user based on role
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role; // Extract user role from the authenticated token

    if (!userRole) {
      return res.status(403).json({ error: 'Role information is missing' }); // Role information is missing
    }

    if (allowedRoles.includes(userRole)) {
      next(); // User has an allowed role, proceed to the route handler
    } else {
      res.status(403).json({ error: 'You do not have permission to access this resource' }); // User role is not allowed
    }
  };
};

const addToBlacklist = (token) => {
  blacklist.add(token);
};

// Function to check if token is blacklisted
const isBlacklisted = (token) => {
  return blacklist.has(token);
};
// Export the middleware and blacklist functions
module.exports = {
  authenticateToken,
  authorizeRole,
  addToBlacklist, // Function to add token to blacklist
  isBlacklisted // Function to check if token is blacklisted
};
