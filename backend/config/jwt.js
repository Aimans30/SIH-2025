// jwt.js - JWT configuration and utilities
const jwt = require('jsonwebtoken');

// Secret key for JWT signing and verification
// In production, this should be stored in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// Token expiration time
const TOKEN_EXPIRY = '24h';

/**
 * JWT utility functions
 */
const jwtUtils = {
  /**
   * Generate a JWT token for a user
   * @param {Object} user - User object to encode in the token
   * @returns {string} - JWT token
   */
  generateToken(user) {
    // Create payload with user data (exclude sensitive info)
    const payload = {
      id: user._id || user.id, // Support both MongoDB _id and legacy id
      phone: user.phone,
      name: user.name,
      role: user.role,
      department: user.department
    };
    
    // Sign and return the token
    return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
  },
  
  /**
   * Verify and decode a JWT token
   * @param {string} token - JWT token to verify
   * @returns {Object|null} - Decoded token payload or null if invalid
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      console.error('JWT verification error:', error.message);
      return null;
    }
  }
};

module.exports = jwtUtils;