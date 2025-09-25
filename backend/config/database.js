// database.js - MongoDB connection configuration
const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/civic-complaints';

// MongoDB connection options
const options = {
  // These options help with connection stability
  serverSelectionTimeoutMS: 5000, // Timeout for server selection
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
  // Removed deprecated options: useNewUrlParser, useUnifiedTopology
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false); // Prepare for Mongoose 7
    
    const conn = await mongoose.connect(MONGODB_URI, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Set up connection error handlers
    mongoose.connection.on('error', err => {
      console.error(`MongoDB connection error: ${err.message}`);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });
    
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
