// departmentRoutes.js - Department routes
const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');

// Get all departments
router.get('/', departmentController.getAllDepartments);

// Get department by ID
router.get('/:id', departmentController.getDepartmentById);

// Get department with its head
router.get('/:id/with-head', departmentController.getDepartmentWithHead);

// Create a new department
router.post('/', departmentController.createDepartment);

// Update a department
router.patch('/:id', departmentController.updateDepartment);

module.exports = router;
