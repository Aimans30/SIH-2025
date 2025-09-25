// imageValidationRoutes.js - Routes for image validation
const express = require('express');
const router = express.Router();
const imageValidationController = require('../controllers/imageValidationController');
const { uploadToMemory } = require('../config/upload');
const auth = require('../middleware/authMiddleware');

// Validate image route - requires authentication
router.post(
  '/validate', 
  auth.verifyToken, 
  uploadToMemory.single('image'), 
  imageValidationController.validateImage
);

module.exports = router;
