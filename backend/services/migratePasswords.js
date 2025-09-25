// migratePasswords.js - Script to migrate plain text passwords to bcrypt hashed passwords
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/civic-complaints';

// Number of salt rounds for bcrypt
const SALT_ROUNDS = 10;

// Import User model
const userModel = require('../models/userModel');

// Get the Mongoose model directly
const User = mongoose.model('User');

/**
 * Migrate all user passwords from plain text to bcrypt hashed
 */
async function migratePasswords() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    console.log('Starting password migration...');
    
    // Get all users
    const users = await User.find({}).select('_id password');
    
    console.log(`Found ${users.length} users to migrate`);
    
    // Update each user's password
    for (const user of users) {
      try {
        // Skip if password is already hashed
        if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
          console.log(`Password for user ${user._id} is already hashed, skipping`);
          continue;
        }
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
        
        // Update the user record
        await User.updateOne(
          { _id: user._id },
          { $set: { password: hashedPassword }}
        );
        
        console.log(`Updated password for user ${user._id}`);
      } catch (err) {
        console.error(`Error processing user ${user._id}:`, err);
      }
    }
    
    console.log('Password migration completed');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the migration
migratePasswords().catch(err => {
  console.error('Unhandled error during migration:', err);
  process.exit(1);
});