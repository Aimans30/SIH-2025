// imageValidationController.js - Controller for image validation
const { validateComplaintImage } = require('../utils/geminiUtils');
const { successResponse, errorResponse } = require('../utils/responseUtil');
const { ErrorResponse } = require('../middleware/errorMiddleware');

/**
 * Image validation controller functions
 */
const imageValidationController = {
  /**
   * Validate an image against complaint type and description
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async validateImage(req, res, next) {
    console.log('📷 Image validation request received');
    try {
      const { type, description } = req.body;
      console.log('📝 Request body:', { type, description: description?.substring(0, 50) + '...' });
      console.log('📂 Files received:', req.file ? `${req.file.originalname} (${req.file.size} bytes)` : 'None');
      
      // Validate required fields
      if (!type || !description) {
        console.log('⛔ Missing required fields: ' + (!type ? 'type ' : '') + (!description ? 'description' : ''));
        return res.status(400).json({
          success: false,
          message: 'Please provide complaint type and description for validation',
          data: null
        });
      }
      
      // Check if image file is provided
      if (!req.file || !req.file.buffer) {
        console.log('⛔ No image file or buffer provided');
        return res.status(400).json({
          success: false,
          message: 'No image file provided',
          data: null
        });
      }
      
      console.log(`🔍 Starting validation for complaint type: ${type}, description: ${description.substring(0, 30)}...`);
      console.log(`💾 Image details: ${req.file.originalname}, ${req.file.mimetype}, ${req.file.size} bytes`);
      
      // Validate image using Gemini API
      try {
        const imageValidation = await validateComplaintImage(
          req.file.buffer, 
          type, 
          description
        );
        
        // Log a preview of the validation result
        const previewResult = {
          ...imageValidation,
          feedback: imageValidation.feedback?.length > 100 ? 
            imageValidation.feedback.substring(0, 100) + '... (truncated in log only)' : 
            imageValidation.feedback
        };
        console.log('📝 Image validation result preview:', JSON.stringify(previewResult, null, 2));
        console.log(`📏 Full feedback length: ${imageValidation.feedback?.length || 0} characters`);
        console.log(`✅ Validation success: ${imageValidation.isValid}`);
        
        // Return validation result
        const responseObj = {
          success: true,
          message: imageValidation.isValid 
            ? 'Image validation successful' 
            : 'Image validation failed',
          data: imageValidation
        };
        
        console.log('📦 Sending response to client:', responseObj);
        return res.status(200).json(responseObj);
        
      } catch (validationError) {
        console.error('❌ Error during image validation:', validationError);
        console.log('🚨 Error details:', validationError.message);
        console.log('🔄 Stack trace:', validationError.stack);
        
        const errorResponse = {
          success: false,
          message: 'Error validating image',
          error: validationError.message,
          data: null
        };
        
        console.log('⛔ Sending error response to client:', errorResponse);
        return res.status(500).json(errorResponse);
      }
    } catch (error) {
      console.error('❗ Image validation controller error:', error);
      console.log('🚨 Error details:', error.message);
      console.log('🔄 Stack trace:', error.stack);
      console.log('⚠️ Passing error to next middleware');
      return next(error);
    }
  }
};

module.exports = imageValidationController;
