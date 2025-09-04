// complaintController.js - Complaint controller
const complaintModel = require('../models/complaintModel');
const departmentModel = require('../models/departmentModel');
const userModel = require('../models/userModel');
const storageUtils = require('../config/storage');

/**
 * Complaint controller functions
 */
const complaintController = {
  /**
   * Submit a new complaint
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async submitComplaint(req, res) {
    try {
      const { type, description, lat, lng, address, userId } = req.body;
      
      // Look up the actual user ID (UUID) based on the phone number
      const user = await userModel.getByPhone(userId);
      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }
      
      // Image is now optional
      let imageUrl = null;
      let imageKey = null;
      
      // Upload image to Supabase storage if provided
      if (req.file) {
        const uploadResult = await storageUtils.uploadFile(req.file);
        
        if (!uploadResult.success) {
          console.error('Image upload failed:', uploadResult.error);
          return res.status(500).json({ message: `Failed to upload image: ${uploadResult.error}` });
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
      
      // Add image fields only if an image was uploaded
      if (imageUrl && imageKey) {
        complaintData.image_url = imageUrl;
        complaintData.image_key = imageKey;
      }
      
      console.log('Creating complaint with data:', JSON.stringify(complaintData));
      
      // Create new complaint with Supabase image URL
      const newComplaint = await complaintModel.create(complaintData);
      
      if (!newComplaint) {
        // If complaint creation fails and we uploaded an image, try to delete it
        if (imageKey) {
          await storageUtils.deleteFile(imageKey, 'images');
        }
        return res.status(500).json({ message: 'Failed to submit complaint' });
      }
      
      // Create response object
      const response = { 
        message: 'Complaint submitted successfully', 
        complaintId: newComplaint.id  // Use the auto-generated ID from the database
      };
      if (imageUrl) response.imageUrl = imageUrl;
      
      res.status(201).json(response);
    } catch (error) {
      console.error('Complaint submission error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  /**
   * Get complaints for a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUserComplaints(req, res) {
    try {
      const { userId } = req.params;
      
      // Look up the actual user ID (UUID) based on the phone number
      const user = await userModel.getByPhone(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const complaints = await complaintModel.getByUserId(user.id);
      
      res.json(complaints);
    } catch (error) {
      console.error('Get user complaints error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  /**
   * Get complaints for an admin by department
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAdminComplaints(req, res) {
    try {
      const { department } = req.params;
      
      const complaints = await complaintModel.getByDepartment(department);
      
      res.json(complaints);
    } catch (error) {
      console.error('Get admin complaints error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  /**
   * Get a complaint by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getComplaintById(req, res) {
    try {
      const { id } = req.params;
      
      const complaint = await complaintModel.getById(id);
      
      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found' });
      }
      
      res.json(complaint);
    } catch (error) {
      console.error('Get complaint error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  /**
   * Update complaint status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateComplaintStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, comment } = req.body;
      
      // Get the current complaint
      const complaint = await complaintModel.getById(id);
      
      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found' });
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
        return res.status(500).json({ message: 'Failed to update complaint' });
      }
      
      res.json({
        message: 'Complaint status updated successfully',
        complaint: updatedComplaint
      });
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
  async getStatistics(req, res) {
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
      
      res.json({
        totalComplaints,
        statusCounts,
        typeCounts,
        avgResolutionTime
      });
    } catch (error) {
      console.error('Get statistics error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = complaintController;
