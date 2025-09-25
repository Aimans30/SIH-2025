// complaintRoutes.js - Complaint routes
const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { uploadToMemory } = require('../config/upload');
const auth = require('../middleware/authMiddleware');

// Submit complaint route - requires authentication
// Use memory storage for image validation with Gemini API
router.post('/', auth.verifyToken, uploadToMemory.single('image'), complaintController.submitComplaint);

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

// Transfer complaint to department head - requires admin role
router.post('/:id/transfer-to-head', auth.hasRole(['admin']), complaintController.transferToHead);

module.exports = router;
