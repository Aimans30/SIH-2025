// userModel.js - User model for MongoDB
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Number of salt rounds for bcrypt
const SALT_ROUNDS = 10;

// Define the user schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'head'],
    default: 'user'
  },
  department: {
    type: String,
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
});

// Pre-save hook to hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it's modified or new
  if (!this.isModified('password')) return next();
  
  try {
    // Hash the password with the specified salt rounds
    this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
    next();
  } catch (error) {
    next(error);
  }
});

// Create the User model
const User = mongoose.model('User', userSchema);

/**
 * User model functions for interacting with the users collection in MongoDB
 */
const userModel = {
  /**
   * Get a user by phone number
   * @param {string} phone - The user's phone number
   * @returns {Promise<Object>} - The user object or null
   */
  async getByPhone(phone) {
    try {
      const user = await User.findOne({ phone }).lean();
      return user;
    } catch (error) {
      console.error('Error fetching user by phone:', error);
      return null;
    }
  },
  
  /**
   * Create a new user with hashed password
   * @param {Object} userData - User data to insert
   * @returns {Promise<Object>} - The created user or null
   */
  async create(userData) {
    try {
      // Create a new user document (password hashing is handled by the pre-save hook)
      const newUser = new User(userData);
      
      // Save the user to the database
      const savedUser = await newUser.save();
      
      return savedUser.toObject();
    } catch (err) {
      console.error('Error creating user:', err);
      return null;
    }
  },
  
  /**
   * Verify a user's password
   * @param {string} plainPassword - The plain text password to verify
   * @param {string} hashedPassword - The hashed password from the database
   * @returns {Promise<boolean>} - True if password matches, false otherwise
   */
  async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (err) {
      console.error('Error verifying password:', err);
      return false;
    }
  },
  
  /**
   * Get all users
   * @returns {Promise<Array>} - Array of users
   */
  async getAll() {
    try {
      const users = await User.find().lean();
      return users;
    } catch (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
  },
  
  /**
   * Get users by role
   * @param {string} role - The role to filter by
   * @returns {Promise<Array>} - Array of users with the specified role
   */
  async getByRole(role) {
    try {
      const users = await User.find({ role }).lean();
      return users;
    } catch (error) {
      console.error('Error fetching users by role:', error);
      return [];
    }
  },
  
  /**
   * Get users by department
   * @param {string} department - The department to filter by
   * @returns {Promise<Array>} - Array of users in the specified department
   */
  async getByDepartment(department) {
    try {
      const users = await User.find({ department }).lean();
      return users;
    } catch (error) {
      console.error('Error fetching users by department:', error);
      return [];
    }
  },
  
  /**
   * Get a user by ID
   * @param {string} id - The user's ID
   * @returns {Promise<Object>} - The user object or null
   */
  async getById(id) {
    try {
      const user = await User.findById(id).lean();
      return user;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }
  },
  
  /**
   * Update a user
   * @param {string} id - The user's ID
   * @param {Object} updateData - The data to update
   * @returns {Promise<Object>} - The updated user or null
   */
  async update(id, updateData) {
    try {
      const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).lean();
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  },
  
  /**
   * Delete a user
   * @param {string} id - The user's ID
   * @returns {Promise<boolean>} - True if deleted, false otherwise
   */
  async delete(id) {
    try {
      const result = await User.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }
};

module.exports = userModel;
