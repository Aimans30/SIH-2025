// departmentRoutes.js - Department routes
const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const auth = require('../middleware/authMiddleware');

// Get all departments
router.get('/', departmentController.getAllDepartments);

// Get department by ID
router.get('/:id', departmentController.getDepartmentById);

// Get department with its head
router.get('/:id/with-head', departmentController.getDepartmentWithHead);

// Create a new department - admin only
router.post('/', auth.hasRole('admin'), departmentController.createDepartment);

// Update a department - admin only
router.patch('/:id', auth.hasRole('admin'), departmentController.updateDepartment);

module.exports = router;
