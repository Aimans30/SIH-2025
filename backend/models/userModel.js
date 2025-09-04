// userModel.js - User model for Supabase
const supabase = require('../config/supabase');

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
   * Create a new user
   * @param {Object} userData - User data to insert
   * @returns {Promise<Object>} - The created user or null
   */
  async create(userData) {
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
