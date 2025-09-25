// complaintController.js - Complaint controller
const complaintModel = require('../models/complaintModel');
const departmentModel = require('../models/departmentModel');
const userModel = require('../models/userModel');
const storageUtils = require('../config/storage');
const { successResponse, errorResponse } = require('../utils/responseUtil');
const { ErrorResponse } = require('../middleware/errorMiddleware');
const { validateComplaintImage } = require('../utils/geminiUtils');

/**
 * Complaint controller functions
 */
const complaintController = {
  /**
   * Submit a new complaint
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async submitComplaint(req, res, next) {
    try {
      const { type, description, lat, lng, address, userId } = req.body;
      
      // Validate required fields
      if (!type || !description || !lat || !lng || !address || !userId) {
        return next(new ErrorResponse('Please provide all required fields', 400));
      }
      
      // Look up the actual user ID (UUID) based on the phone number
      const user = await userModel.getByPhone(userId);
      if (!user) {
        return next(new ErrorResponse('User not found', 404));
      }
      
      let imageUrl = null;
      let imageKey = null;
      let imageValidation = null;
      
      // Process image if provided
      if (req.file) {
        // Validate image using Gemini API
        try {
          console.log('Validating image with Gemini API...');
          imageValidation = await validateComplaintImage(
            req.file.buffer, 
            type, 
            description
          );
          
          console.log('Image validation result:', imageValidation);
          
          // If image is not valid, return error
          if (imageValidation && !imageValidation.isValid) {
            return next(new ErrorResponse(
              `Image validation failed: ${imageValidation.feedback}. ${imageValidation.suggestedAction}`, 
              400
            ));
          }
          
          // If image is valid, upload it from memory
          const uploadResult = await storageUtils.uploadFromMemory(req.file);
          
          if (!uploadResult.success) {
            console.error('Image upload failed:', uploadResult.error);
            return next(new ErrorResponse(`Failed to upload image: ${uploadResult.error}`, 500));
          }
          
          imageUrl = uploadResult.url;
          imageKey = uploadResult.key;
        } catch (validationError) {
          console.error('Error during image validation:', validationError);
          // Continue with submission even if validation fails
          // But log the error for monitoring
        }
      }
      
      // MongoDB will generate its own _id, so we don't need to generate a UUID
      
      // Determine department based on complaint type
      let department;
      switch (type) {
        case 'Broken Road':
          department = 'Roads';
          break;
        case 'Garbage Collection':
          department = 'Sanitation';
          break;
        case 'Street Light':
          department = 'Electricity';
          break;
        case 'Water Supply':
          department = 'Water';
          break;
        default:
          department = 'General';
      }
      
      // Prepare complaint data for database
      const complaintData = {
        // Use the actual user ID from the database
        user_id: user._id,
        type,
        description,
        location_lat: parseFloat(lat) || 0,
        location_lng: parseFloat(lng) || 0,
        location_address: address || '',
        status: 'Submitted',
        // Remove priority field as it doesn't exist in the database schema
        department,
        escalated: false,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      // Add image URL only if an image was uploaded
      if (imageUrl) {
        complaintData.image_url = imageUrl;
      }
      
      console.log('Creating complaint with data:', JSON.stringify(complaintData));
      
      // Create new complaint with Supabase image URL
      const { data: createdComplaint, error: dbError } = await complaintModel.create(complaintData);

      if (dbError || !createdComplaint || !createdComplaint._id) {
        console.error('Complaint insert failed:', dbError || createdComplaint);
        // If complaint creation fails and we uploaded an image, try to delete it
        if (imageKey) {
          try { await storageUtils.deleteFile(imageKey, 'images'); } catch (_) {}
        }
        const msg = dbError?.message || 'Failed to submit complaint (database insert failed)';
        return errorResponse(res, 500, msg, dbError || undefined);
      }

      // Create response data
      const responseData = {
        complaintId: createdComplaint._id
      };
      if (imageUrl) responseData.imageUrl = imageUrl;

      console.log('Complaint submission success response:', responseData);
      return successResponse(res, 201, 'Complaint submitted successfully', responseData);
    } catch (error) {
      console.error('Complaint submission error:', error);
      return next(error);
    }
  },
  
  /**
   * Get complaints for a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUserComplaints(req, res, next) {
    try {
      const { userId } = req.params;
      
      // Look up the actual user ID (UUID) based on the phone number
      const user = await userModel.getByPhone(userId);
      if (!user) {
        return next(new ErrorResponse('User not found', 404));
      }
      
      const complaints = await complaintModel.getByUserId(user._id);
      
      return successResponse(res, 200, 'User complaints retrieved successfully', complaints);
    } catch (error) {
      console.error('Get user complaints error:', error);
      return next(error);
    }
  },
  
  /**
   * Get complaints for an admin by department
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAdminComplaints(req, res, next) {
    try {
      const { department } = req.params;
      
      const complaints = await complaintModel.getByDepartment(department);
      
      return successResponse(res, 200, 'Admin complaints retrieved successfully', complaints);
    } catch (error) {
      console.error('Get admin complaints error:', error);
      return next(error);
    }
  },
  
  /**
   * Get a complaint by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getComplaintById(req, res, next) {
    try {
      const { id } = req.params;
      
      const complaint = await complaintModel.getById(id);
      
      if (!complaint) {
        return next(new ErrorResponse('Complaint not found', 404));
      }
      
      return successResponse(res, 200, 'Complaint retrieved successfully', complaint);
    } catch (error) {
      console.error('Get complaint error:', error);
      return next(error);
    }
  },
  
  /**
   * Update complaint status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateComplaintStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, comment } = req.body;
      
      if (!status) {
        return next(new ErrorResponse('Status is required', 400));
      }
      
      // Get the current complaint
      const complaint = await complaintModel.getById(id);
      
      if (!complaint) {
        return next(new ErrorResponse('Complaint not found', 404));
      }
      
      console.log(`Updating complaint ${id} status to ${status}`);
      
      // Update the complaint with only status and updated_at fields
      const updatedComplaint = await complaintModel.update(id, {
        status,
        updated_at: new Date()
      });
      
      if (!updatedComplaint) {
        console.error('Failed to update complaint status');
        return next(new ErrorResponse('Failed to update complaint', 500));
      }
      
      console.log('Complaint status updated successfully:', updatedComplaint);
      return successResponse(res, 200, 'Complaint status updated successfully', updatedComplaint);
    } catch (error) {
      console.error('Update complaint error:', error);
      return next(error); // Use the error middleware
    }
  },
  
  /**
   * Get statistics for admin dashboard
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getStatistics(req, res, next) {
    try {
      const { department } = req.params;
      
      // Get all complaints for the department
      const complaints = await complaintModel.getByDepartment(department);
      
      // Calculate statistics
      const totalComplaints = complaints.length;
      
      const statusCounts = complaints.reduce((acc, complaint) => {
        const status = complaint.status;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      
      const typeCounts = complaints.reduce((acc, complaint) => {
        const type = complaint.type;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      
      // Calculate resolution time (for resolved complaints)
      const resolvedComplaints = complaints.filter(c => c.status === 'Resolved');
      let avgResolutionTime = 0;
      
      if (resolvedComplaints.length > 0) {
        const totalResolutionTime = resolvedComplaints.reduce((total, complaint) => {
          const submittedTime = new Date(complaint.created_at).getTime();
          const resolvedTime = new Date(complaint.updated_at).getTime();
          return total + (resolvedTime - submittedTime);
        }, 0);
        
        avgResolutionTime = totalResolutionTime / resolvedComplaints.length / (1000 * 60 * 60 * 24); // in days
      }
      
      const statistics = {
        totalComplaints,
        statusCounts,
        typeCounts,
        avgResolutionTime
      };
      
      return successResponse(res, 200, 'Statistics retrieved successfully', statistics);
    } catch (error) {
      console.error('Get statistics error:', error);
      return next(error);
    }
  },
  
  /**
   * Transfer a complaint to department head
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async transferToHead(req, res, next) {
    try {
      const { id } = req.params;
      
      // Get the current complaint
      const complaint = await complaintModel.getById(id);
      
      if (!complaint) {
        return next(new ErrorResponse('Complaint not found', 404));
      }
      
      // Check if complaint is already transferred
      if (complaint.transferred_to_head) {
        return next(new ErrorResponse('Complaint already transferred to department head', 400));
      }
      
      console.log(`Transferring complaint ${id} to department head`);
      
      // Transfer the complaint to department head
      const updatedComplaint = await complaintModel.transferToHead(id);
      
      if (!updatedComplaint) {
        console.error('Failed to transfer complaint to department head');
        return next(new ErrorResponse('Failed to transfer complaint', 500));
      }
      
      console.log('Complaint transferred successfully:', updatedComplaint);
      return successResponse(res, 200, 'Complaint transferred to department head successfully', updatedComplaint);
    } catch (error) {
      console.error('Transfer complaint error:', error);
      return next(error);
    }
  }
};

module.exports = complaintController;
