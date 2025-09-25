// complaintModel.js - Complaint model for MongoDB
const mongoose = require('mongoose');

// Define the complaint schema
const complaintSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  type: {
    type: String,
    required: [true, 'Complaint type is required'],
    enum: ['Broken Road', 'Garbage Collection', 'Street Light', 'Water Supply', 'General']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  image_url: {
    type: String,
    default: null
  },
  location_lat: {
    type: Number,
    required: [true, 'Latitude is required']
  },
  location_lng: {
    type: Number,
    required: [true, 'Longitude is required']
  },
  location_address: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Submitted', 'In Progress', 'Resolved'],
    default: 'Submitted'
  },
  department: {
    type: String,
    required: [true, 'Department is required']
  },
  escalated: {
    type: Boolean,
    default: false
  },
  transferred_to_head: {
    type: Boolean,
    default: false
  },
  history: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    comment: String
  }],
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
});

// Virtual for location object
complaintSchema.virtual('location').get(function() {
  return {
    lat: this.location_lat,
    lng: this.location_lng,
    address: this.location_address
  };
});

// Create the Complaint model
const Complaint = mongoose.model('Complaint', complaintSchema);

/**
 * Complaint model functions for interacting with the complaints collection in MongoDB
 */
const complaintModel = {
  /**
   * Create a new complaint
   * @param {Object} complaintData - Complaint data to insert
   * @returns {Promise<Object>} - The created complaint or null
   */
  async create(complaintData) {
    try {
      // Log the operation
      console.log('Inserting complaint into database...');
      
      // Ensure required fields are present
      const requiredFields = ['user_id', 'type', 'description'];
      for (const field of requiredFields) {
        if (!complaintData[field]) {
          console.error(`Missing required field: ${field}`);
          return { data: null, error: new Error(`Missing required field: ${field}`) };
        }
      }
      
      // Create a new complaint document
      const newComplaint = new Complaint(complaintData);
      
      // Save the complaint to the database
      const savedComplaint = await newComplaint.save();
      
      console.log('Complaint created successfully:', savedComplaint._id);
      return { data: savedComplaint.toObject(), error: null };
    } catch (err) {
      console.error('Unexpected error creating complaint:', err);
      return { data: null, error: err };
    }
  },
  
  /**
   * Get a complaint by ID
   * @param {string} id - The complaint ID
   * @returns {Promise<Object>} - The complaint object or null
   */
  async getById(id) {
    try {
      const complaint = await Complaint.findById(id).lean();
      return complaint;
    } catch (error) {
      console.error('Error fetching complaint by ID:', error);
      return null;
    }
  },
  
  /**
   * Get complaints by user ID
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} - Array of complaints
   */
  async getByUserId(userId) {
    try {
      const complaints = await Complaint.find({ user_id: userId })
        .sort({ created_at: -1 })
        .lean();
      return complaints;
    } catch (error) {
      console.error('Error fetching complaints by user ID:', error);
      return [];
    }
  },
  
  /**
   * Get complaints by department
   * @param {string} department - The department
   * @returns {Promise<Array>} - Array of complaints
   */
  async getByDepartment(department) {
    try {
      const complaints = await Complaint.find({ department })
        .sort({ created_at: -1 })
        .lean();
      return complaints;
    } catch (error) {
      console.error('Error fetching complaints by department:', error);
      return [];
    }
  },
  
  /**
   * Update a complaint
   * @param {string} id - The complaint ID
   * @param {Object} updateData - The data to update
   * @returns {Promise<Object>} - The updated complaint or null
   */
  async update(id, updateData) {
    try {
      // Update the updated_at field
      updateData.updated_at = new Date();
      
      const updatedComplaint = await Complaint.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      ).lean();
      
      return updatedComplaint;
    } catch (error) {
      console.error('Error updating complaint:', error);
      return null;
    }
  },
  
  /**
   * Get complaints by status
   * @param {string} status - The status to filter by
   * @returns {Promise<Array>} - Array of complaints
   */
  async getByStatus(status) {
    try {
      const complaints = await Complaint.find({ status })
        .sort({ created_at: -1 })
        .lean();
      return complaints;
    } catch (error) {
      console.error('Error fetching complaints by status:', error);
      return [];
    }
  },
  
  /**
   * Get complaints that need escalation (older than specified days and not resolved)
   * @param {number} days - Number of days threshold
   * @returns {Promise<Array>} - Array of complaints to escalate
   */
  async getForEscalation(days) {
    try {
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() - days);
      
      const complaints = await Complaint.find({
        status: { $ne: 'Resolved' },
        escalated: false,
        created_at: { $lt: thresholdDate }
      }).lean();
      
      return complaints;
    } catch (error) {
      console.error('Error fetching complaints for escalation:', error);
      return [];
    }
  },
  
  /**
   * Transfer a complaint to department head
   * @param {string} id - The complaint ID
   * @returns {Promise<Object>} - The updated complaint or null
   */
  async transferToHead(id) {
    try {
      // Update the complaint with transferred flag and add to history
      const updatedComplaint = await Complaint.findByIdAndUpdate(
        id,
        {
          $set: {
            transferred_to_head: true,
            updated_at: new Date()
          },
          $push: {
            history: {
              status: 'Transferred to Department Head',
              timestamp: new Date(),
              comment: 'Complaint transferred to department head for review'
            }
          }
        },
        { new: true }
      ).lean();
      
      console.log('Complaint transferred to department head:', updatedComplaint);
      return updatedComplaint;
    } catch (error) {
      console.error('Error transferring complaint to department head:', error);
      return null;
    }
  }
};

module.exports = complaintModel;
