// departmentModel.js - Department model for MongoDB
const mongoose = require('mongoose');

// Define the department schema
const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    unique: true,
    trim: true
  },
  head_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  description: {
    type: String,
    default: ''
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

// Create the Department model
const Department = mongoose.model('Department', departmentSchema);

/**
 * Department model functions for interacting with the departments collection in MongoDB
 */
const departmentModel = {
  /**
   * Get all departments
   * @returns {Promise<Array>} - Array of departments
   */
  async getAll() {
    try {
      const departments = await Department.find().lean();
      return departments;
    } catch (error) {
      console.error('Error fetching all departments:', error);
      return [];
    }
  },
  
  /**
   * Get a department by ID
   * @param {string} id - The department ID
   * @returns {Promise<Object>} - The department object or null
   */
  async getById(id) {
    try {
      const department = await Department.findById(id).lean();
      return department;
    } catch (error) {
      console.error('Error fetching department by ID:', error);
      return null;
    }
  },
  
  /**
   * Get a department by name
   * @param {string} name - The department name
   * @returns {Promise<Object>} - The department object or null
   */
  async getByName(name) {
    try {
      const department = await Department.findOne({ name }).lean();
      return department;
    } catch (error) {
      console.error('Error fetching department by name:', error);
      return null;
    }
  },
  
  /**
   * Get department with its head user
   * @param {string} id - The department ID
   * @returns {Promise<Object>} - The department with head user details or null
   */
  async getDepartmentWithHead(id) {
    try {
      const department = await Department.findById(id)
        .populate('head_id')
        .lean();
      
      if (!department) return null;
      
      // Restructure to match the expected format from Supabase
      return {
        ...department,
        head: department.head_id
      };
    } catch (error) {
      console.error('Error fetching department with head:', error);
      return null;
    }
  },
  
  /**
   * Create a new department
   * @param {Object} departmentData - Department data to insert
   * @returns {Promise<Object>} - The created department or null
   */
  async create(departmentData) {
    try {
      const newDepartment = new Department(departmentData);
      const savedDepartment = await newDepartment.save();
      return savedDepartment.toObject();
    } catch (error) {
      console.error('Error creating department:', error);
      return null;
    }
  },
  
  /**
   * Update a department
   * @param {string} id - The department ID
   * @param {Object} updateData - The data to update
   * @returns {Promise<Object>} - The updated department or null
   */
  async update(id, updateData) {
    try {
      const updatedDepartment = await Department.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      ).lean();
      
      return updatedDepartment;
    } catch (error) {
      console.error('Error updating department:', error);
      return null;
    }
  },
  
  /**
   * Delete a department
   * @param {string} id - The department ID
   * @returns {Promise<boolean>} - True if deleted, false otherwise
   */
  async delete(id) {
    try {
      const result = await Department.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting department:', error);
      return false;
    }
  }
};

module.exports = departmentModel;
