// seedService.js - Service for seeding initial data
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/civic-complaints';

// Import models
const userModel = require('../models/userModel');
const departmentModel = require('../models/departmentModel');

// Get the Mongoose models directly from the model files
const User = mongoose.model('User');
const Department = mongoose.model('Department');

// Number of salt rounds for bcrypt
const SALT_ROUNDS = 10;

/**
 * Connect to MongoDB
 */
async function connectToMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    throw error;
  }
}

/**
 * Seed service functions
 */
const seedService = {
  /**
   * Seed initial users for prototype
   */
  async seedUsers() {
    try {
      console.log('Checking if users need to be seeded...');
      
      // Check if users already exist
      const count = await User.countDocuments();
      
      if (count === 0) {
        console.log('No users found, seeding initial users...');
        
        const users = [
          { 
            name: 'Regular User 1',
            phone: '1234567890', 
            password: 'user123', 
            role: 'user' 
          },
          { 
            name: 'Regular User 2',
            phone: '9876543210', 
            password: 'user456', 
            role: 'user' 
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
        await User.insertMany(usersWithHashedPasswords);
        console.log('Users seeded successfully');
      } else {
        console.log('Users already exist, skipping seed');
      }
    } catch (error) {
      console.error('Error seeding users:', error);
    }
  },
  
  /**
   * Seed initial departments
   */
  async seedDepartments() {
    try {
      console.log('Checking if departments need to be seeded...');
      
      // Check if departments already exist
      const count = await Department.countDocuments();
      
      if (count === 0) {
        console.log('No departments found, seeding initial departments...');
        
        // First get the head users
        const headUsers = await User.find({ role: 'head' }).select('_id department');
        
        // Create departments with their respective heads
        const departments = [
          { 
            name: 'Roads',
            head_id: headUsers.find(user => user.department === 'Roads')?._id
          },
          { 
            name: 'Sanitation',
            head_id: headUsers.find(user => user.department === 'Sanitation')?._id
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
        await Department.insertMany(departments);
        
        console.log('Departments seeded successfully');
      } else {
        console.log('Departments already exist, skipping seed');
      }
    } catch (error) {
      console.error('Error seeding departments:', error);
    }
  },
  
  /**
   * Run all seed functions
   */
  async seedAll() {
    try {
      // Connect to MongoDB first
      await connectToMongoDB();
      
      console.log('Starting seed operations...');
      await this.seedUsers();
      await this.seedDepartments();
      console.log('All seed operations completed');
      
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
  seedService.seedAll()
    .then(() => {
      console.log('Seeding script completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Seeding script failed:', error);
      process.exit(1);
    });
}

module.exports = seedService;
