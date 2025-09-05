// authController.js - Authentication controller
const userModel = require('../models/userModel');
const jwtUtils = require('../config/jwt');

/**
 * Authentication controller functions
 */
const authController = {
  /**
   * Login a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async login(req, res) {
    try {
      const { phone, password } = req.body;
      
      // Get user by phone
      const user = await userModel.getByPhone(phone);
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Verify password using bcrypt
      const isPasswordValid = await userModel.verifyPassword(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Generate JWT token
      const token = jwtUtils.generateToken(user);
      
      // Return user data and token
      res.json({
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role,
          department: user.department
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  /**
   * Register a new user (for development purposes)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async register(req, res) {
    try {
      const { name, phone, password, role } = req.body;
      
      // Check if user already exists
      const existingUser = await userModel.getByPhone(phone);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
      
      // Create new user
      const newUser = await userModel.create({
        name,
        phone,
        password, // In production, hash this password
        role: role || 'user',
        created_at: new Date()
      });
      
      if (!newUser) {
        return res.status(500).json({ message: 'Failed to create user' });
      }
      
      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: newUser.id,
          phone: newUser.phone,
          name: newUser.name,
          role: newUser.role
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = authController;
