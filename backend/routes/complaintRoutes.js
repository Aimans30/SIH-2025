// complaintRoutes.js - Complaint routes
const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const multer = require('../config/upload');
const auth = require('../middleware/authMiddleware');

// Get the upload middleware
const upload = multer.upload;

// Submit complaint route - requires authentication
router.post('/', auth.verifyToken, upload.single('image'), complaintController.submitComplaint);

// Get complaints for user - requires authentication
router.get('/user/:userId', auth.verifyToken, complaintController.getUserComplaints);

// Get complaints for admin - requires admin or head role
router.get('/admin/:department', auth.hasRole(['admin', 'head']), complaintController.getAdminComplaints);

// Get complaint by ID - requires authentication
router.get('/:id', auth.verifyToken, complaintController.getComplaintById);

// Update complaint status - requires admin or head role
router.patch('/:id', auth.hasRole(['admin', 'head']), complaintController.updateComplaintStatus);

// Get statistics for admin dashboard - requires admin or head role
router.get('/stats/:department', auth.hasRole(['admin', 'head']), complaintController.getStatistics);

module.exports = router;
