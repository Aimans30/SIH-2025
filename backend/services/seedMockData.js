// seedMockData.js - Script to insert mock data into MongoDB collections
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/civic-complaints';

// Import models
const userModel = require('../models/userModel');
const departmentModel = require('../models/departmentModel');
const complaintModel = require('../models/complaintModel');

// Get the Mongoose models directly from the model files
const User = mongoose.model('User');
const Department = mongoose.model('Department');
const Complaint = mongoose.model('Complaint');

// Number of salt rounds for bcrypt
const SALT_ROUNDS = 10;

/**
 * Connect to MongoDB
 */
async function connectToMongoDB() {
  try {
    // Removed deprecated options
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    throw error;
  }
}

/**
 * Mock data seeding functions
 */
const seedMockData = {
  /**
   * Seed users collection with mock data
   */
  async seedUsers() {
    try {
      console.log('Seeding users collection with mock data...');
      
      // Check if users already exist
      const existingCount = await User.countDocuments();
      console.log(`Found ${existingCount} existing users`);
      
      if (existingCount > 0) {
        console.log('Users already exist, skipping seeding');
        return await User.find();
      }
      
      // Create users
      const users = [
        { 
          name: 'Regular User 1',
          phone: '1234567890', 
          password: 'user123', 
          role: 'user',
          // Only include department if user has one
          department: null
        },
        { 
          name: 'Regular User 2',
          phone: '9876543210', 
          password: 'user456', 
          role: 'user',
          department: null
        },
        { 
          name: 'Roads Admin',
          phone: 'admin1', 
          password: 'admin123', 
          role: 'admin', 
          department: 'Roads' 
        },
        { 
          name: 'Sanitation Admin',
          phone: 'admin2', 
          password: 'admin456', 
          role: 'admin', 
          department: 'Sanitation' 
        },
        { 
          name: 'Roads Department Head',
          phone: 'head1', 
          password: 'head123', 
          role: 'head', 
          department: 'Roads' 
        },
        { 
          name: 'Sanitation Department Head',
          phone: 'head2', 
          password: 'head456', 
          role: 'head', 
          department: 'Sanitation' 
        }
      ];
      
      // Hash passwords before inserting
      const usersWithHashedPasswords = await Promise.all(users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
        return { ...user, password: hashedPassword };
      }));
      
      // Insert users
      const result = await User.insertMany(usersWithHashedPasswords);
      console.log(`${result.length} users inserted successfully`);
      return result;
    } catch (error) {
      console.error('Error in seedUsers:', error.message);
    }
  },
  
  /**
   * Seed departments collection with mock data
   */
  async seedDepartments(users) {
    try {
      console.log('Seeding departments collection with mock data...');
      
      // Check if departments already exist
      const existingCount = await Department.countDocuments();
      console.log(`Found ${existingCount} existing departments`);
      
      if (existingCount > 0) {
        console.log('Departments already exist, skipping seeding');
        return await Department.find();
      }
      
      // Find head users if we have users data
      const roadsHeadUser = users?.find(user => user.role === 'head' && user.department === 'Roads');
      const sanitationHeadUser = users?.find(user => user.role === 'head' && user.department === 'Sanitation');
      
      // Create departments
      const departmentsToCreate = [
        { 
          name: 'Roads',
          head_id: roadsHeadUser?.id || null
        },
        { 
          name: 'Sanitation',
          head_id: sanitationHeadUser?.id || null
        },
        { 
          name: 'Electricity',
          head_id: null
        },
        { 
          name: 'Water',
          head_id: null
        },
        { 
          name: 'General',
          head_id: null
        }
      ];
      
      // Insert departments
      const result = await Department.insertMany(departmentsToCreate);
      console.log(`${result.length} departments inserted successfully`);
      return result;
    } catch (error) {
      console.error('Error in seedDepartments:', error.message);
      return null;
    }
  },
  
  /**
   * Seed complaints collection with mock data
   */
  async seedComplaints(users) {
    try {
      console.log('Seeding complaints collection with mock data...');
      
      // Check if complaints already exist
      const existingCount = await Complaint.countDocuments();
      console.log(`Found ${existingCount} existing complaints`);
      
      if (existingCount > 0) {
        console.log('Complaints already exist, skipping seeding');
        return await Complaint.find();
      }
      
      if (!users || users.length === 0) {
        users = await User.find();
      }
      
      // Find regular users for complaints
      const regularUsers = users.filter(user => user.role === 'user');
      
      if (regularUsers.length === 0) {
        console.error('No regular users found to associate with complaints');
        return;
      }
      
      // Create complaints
      const complaints = [
        {
          user_id: regularUsers[0].id,
          status: 'Submitted',
          department: 'Roads',
          escalated: false,
          location_address: '123 Main Street, Delhi',
          description: 'Large pothole in the middle of the road causing traffic issues',
          type: 'Broken Road',
          location_lat: 28.6139,
          location_lng: 77.2090
        },
        {
          user_id: regularUsers[0].id,
          status: 'In Progress',
          department: 'Sanitation',
          escalated: false,
          location_address: '456 Park Avenue, Delhi',
          description: 'Garbage not collected for the past week',
          type: 'Garbage Collection',
          location_lat: 28.6129,
          location_lng: 77.2295
        },
        {
          user_id: regularUsers[1]?.id || regularUsers[0].id,
          status: 'Resolved',
          department: 'Electricity',
          escalated: true,
          location_address: '789 Avenue Road, Delhi',
          description: 'Street light not working for the past 3 days',
          type: 'Street Light',
          location_lat: 28.6329,
          location_lng: 77.2195
        }
      ];
      
      // Insert complaints
      const result = await Complaint.insertMany(complaints);
      console.log(`${result.length} complaints inserted successfully`);
      return result;
    } catch (error) {
      console.error('Error in seedComplaints:', error.message);
      return null;
    }
  },
  
  /**
   * Run all seed functions
   */
  async seedAll() {
    try {
      // Connect to MongoDB
      await connectToMongoDB();
      
      console.log('Starting mock data seeding process...');
      const users = await this.seedUsers();
      await this.seedDepartments(users);
      await this.seedComplaints(users);
      console.log('Mock data seeding completed successfully');
      
      // Close MongoDB connection
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    } catch (error) {
      console.error('Error in seedAll:', error.message);
      // Make sure to close the connection even if there's an error
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        console.log('MongoDB connection closed after error');
      }
    }
  }
};

// Execute seeding if this script is run directly
if (require.main === module) {
  seedMockData.seedAll()
    .then(() => {
      console.log('Seeding script completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Seeding script failed:', error);
      process.exit(1);
    });
}

module.exports = seedMockData;
