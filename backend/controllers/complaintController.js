// complaintController.js - Complaint controller
const complaintModel = require('../models/complaintModel');
const departmentModel = require('../models/departmentModel');
const userModel = require('../models/userModel');
const storageUtils = require('../config/storage');
const { successResponse, errorResponse } = require('../utils/responseUtil');
const { ErrorResponse } = require('../middleware/errorMiddleware');

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
      
      // Image is now optional
      let imageUrl = null;
      let imageKey = null;
      
      // Upload image to Supabase storage if provided
      if (req.file) {
        const uploadResult = await storageUtils.uploadFile(req.file);
        
        if (!uploadResult.success) {
          console.error('Image upload failed:', uploadResult.error);
          return next(new ErrorResponse(`Failed to upload image: ${uploadResult.error}`, 500));
        }
        
        imageUrl = uploadResult.url;
        imageKey = uploadResult.key;
      }
      
      // Generate a proper UUID for the complaint ID
      const { v4: uuidv4 } = require('uuid');
      const complaintId = uuidv4();
      
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
        id: complaintId, // Use our generated UUID
        // Use the actual user UUID from the database
        user_id: user.id,
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

      if (dbError || !createdComplaint || !createdComplaint.id) {
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
        complaintId: createdComplaint.id
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
      
      const complaints = await complaintModel.getByUserId(user.id);
      
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
      
      // Update the history array
      // Check if history exists, if not initialize as empty array
      const currentHistory = Array.isArray(complaint.history) ? complaint.history : [];
      
      const updatedHistory = [...currentHistory, {
        status,
        timestamp: new Date(),
        comment: comment || `Status updated to ${status}`
      }];
      
      // Update the complaint
      const updatedComplaint = await complaintModel.update(id, {
        status,
        updated_at: new Date(),
        history: updatedHistory
      });
      
      if (!updatedComplaint) {
        return next(new ErrorResponse('Failed to update complaint', 500));
      }
      
      return successResponse(res, 200, 'Complaint status updated successfully', updatedComplaint);
    } catch (error) {
      console.error('Update complaint error:', error);
      res.status(500).json({ message: 'Server error' });
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
  }
};

module.exports = complaintController;
