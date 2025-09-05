// userModel.js - User model for Supabase
const supabase = require('../config/supabase');
const bcrypt = require('bcrypt');

// Number of salt rounds for bcrypt
const SALT_ROUNDS = 10;

/**
 * User model functions for interacting with the users table in Supabase
 */
const userModel = {
  /**
   * Get a user by phone number
   * @param {string} phone - The user's phone number
   * @returns {Promise<Object>} - The user object or null
   */
  async getByPhone(phone) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();
    
    if (error) {
      console.error('Error fetching user by phone:', error);
      return null;
    }
    
    return data;
  },
  
  /**
   * Create a new user with hashed password
   * @param {Object} userData - User data to insert
   * @returns {Promise<Object>} - The created user or null
   */
  async create(userData) {
    try {
      // Hash the password before storing
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, SALT_ROUNDS);
      }
      
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating user:', error);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error('Error hashing password:', err);
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
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
    
    return data;
  },
  
  /**
   * Get users by role
   * @param {string} role - The role to filter by
   * @returns {Promise<Array>} - Array of users with the specified role
   */
  async getByRole(role) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role);
    
    if (error) {
      console.error('Error fetching users by role:', error);
      return [];
    }
    
    return data;
  },
  
  /**
   * Get users by department
   * @param {string} department - The department to filter by
   * @returns {Promise<Array>} - Array of users in the specified department
   */
  async getByDepartment(department) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('department', department);
    
    if (error) {
      console.error('Error fetching users by department:', error);
      return [];
    }
    
    return data;
  }
};

module.exports = userModel;
