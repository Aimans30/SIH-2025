// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { errorHandler } = require('./middleware/errorMiddleware');
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const imageValidationRoutes = require('./routes/imageValidationRoutes');

// Import services
const escalationService = require('./services/escalationService');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/images', imageValidationRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  const frontendBuildPath = path.resolve(__dirname, '../frontend/dist');
  app.use(express.static(frontendBuildPath));

  // Serve index.html for any route not found
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(frontendBuildPath, 'index.html'));
  });
}

// Error handling middleware
app.use(errorHandler);


// Start escalation job
escalationService.startEscalationJob();

// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error(`Failed to start server due to database connection error: ${err.message}`);
});
