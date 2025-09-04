// complaintRoutes.js - Complaint routes
const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { upload } = require('../config/upload');

// Submit complaint route
router.post('/', upload.single('image'), complaintController.submitComplaint);

// Get complaints for user
router.get('/user/:userId', complaintController.getUserComplaints);

// Get complaints for admin
router.get('/admin/:department', complaintController.getAdminComplaints);

// Get complaint by ID
router.get('/:id', complaintController.getComplaintById);

// Update complaint status
router.patch('/:id', complaintController.updateComplaintStatus);

// Get statistics for admin dashboard
router.get('/stats/:department', complaintController.getStatistics);

module.exports = router;
