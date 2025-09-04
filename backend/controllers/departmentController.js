// departmentController.js - Department controller
const departmentModel = require('../models/departmentModel');
const userModel = require('../models/userModel');

/**
 * Department controller functions
 */
const departmentController = {
  /**
   * Get all departments
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllDepartments(req, res) {
    try {
      const departments = await departmentModel.getAll();
      res.json(departments);
    } catch (error) {
      console.error('Get all departments error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  /**
   * Get department by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getDepartmentById(req, res) {
    try {
      const { id } = req.params;
      const department = await departmentModel.getById(id);
      
      if (!department) {
        return res.status(404).json({ message: 'Department not found' });
      }
      
      res.json(department);
    } catch (error) {
      console.error('Get department error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  /**
   * Get department with its head
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getDepartmentWithHead(req, res) {
    try {
      const { id } = req.params;
      const department = await departmentModel.getDepartmentWithHead(id);
      
      if (!department) {
        return res.status(404).json({ message: 'Department not found' });
      }
      
      res.json(department);
    } catch (error) {
      console.error('Get department with head error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  /**
   * Create a new department
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createDepartment(req, res) {
    try {
      const { name, headId } = req.body;
      
      // Check if department already exists
      const existingDepartment = await departmentModel.getByName(name);
      if (existingDepartment) {
        return res.status(400).json({ message: 'Department already exists' });
      }
      
      // Create new department
      const newDepartment = await departmentModel.create({
        name,
        head_id: headId
      });
      
      if (!newDepartment) {
        return res.status(500).json({ message: 'Failed to create department' });
      }
      
      res.status(201).json({
        message: 'Department created successfully',
        department: newDepartment
      });
    } catch (error) {
      console.error('Create department error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  /**
   * Update a department
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateDepartment(req, res) {
    try {
      const { id } = req.params;
      const { name, headId } = req.body;
      
      // Check if department exists
      const existingDepartment = await departmentModel.getById(id);
      if (!existingDepartment) {
        return res.status(404).json({ message: 'Department not found' });
      }
      
      // Update department
      const updatedDepartment = await departmentModel.update(id, {
        name: name || existingDepartment.name,
        head_id: headId || existingDepartment.head_id
      });
      
      if (!updatedDepartment) {
        return res.status(500).json({ message: 'Failed to update department' });
      }
      
      res.json({
        message: 'Department updated successfully',
        department: updatedDepartment
      });
    } catch (error) {
      console.error('Update department error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = departmentController;
