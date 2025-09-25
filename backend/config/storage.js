// storage.js - Local file storage configuration for file uploads
const path = require('path');
const fs = require('fs');

// Define uploads directory
const uploadsDir = path.join(__dirname, '..', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

console.log('Using local file storage for uploads');

/**
 * Utility functions for handling file uploads to local storage
 */
const storageUtils = {
  /**
   * Upload a file to local storage
   * @param {Object} file - The file object from multer
   * @param {string} subDir - Optional subdirectory within uploads
   * @returns {Promise<Object>} - Object containing the file URL or error
   */
  async uploadFile(file, subDir = '') {
    try {
      if (!file) {
        console.error('No file provided for upload');
        return { success: false, error: 'No file provided' };
      }

      console.log(`Uploading file: ${file.originalname} (${file.size} bytes)`);
      
      // Check if file exists on disk
      if (!fs.existsSync(file.path)) {
        console.error(`File not found at path: ${file.path}`);
        return { success: false, error: 'File not found on disk' };
      }

      // Read file from disk
      let fileBuffer;
      try {
        fileBuffer = fs.readFileSync(file.path);
        console.log(`File read successfully, size: ${fileBuffer.length} bytes`);
      } catch (readError) {
        console.error(`Error reading file: ${readError.message}`);
        return { success: false, error: `Error reading file: ${readError.message}` };
      }
      
      // Generate a unique filename
      const timestamp = Date.now();
      const fileExt = path.extname(file.originalname);
      const fileName = `${timestamp}-${Math.round(Math.random() * 1E9)}${fileExt}`;
      
      // Create target directory if it doesn't exist
      const targetDir = subDir ? path.join(uploadsDir, subDir) : uploadsDir;
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      // Define the destination path
      const destPath = path.join(targetDir, fileName);
      
      // Write the file
      try {
        fs.writeFileSync(destPath, fileBuffer);
        console.log(`File saved to ${destPath}`);
      } catch (writeError) {
        console.error(`Error writing file: ${writeError.message}`);
        return { success: false, error: `Failed to save file: ${writeError.message}` };
      }
      
      // Generate URL (relative to server root)
      const urlPath = subDir 
        ? `/uploads/${subDir}/${fileName}` 
        : `/uploads/${fileName}`;
      
      console.log(`File uploaded successfully. URL path: ${urlPath}`);
      
      // Delete the temporary file if it's different from our destination
      if (file.path !== destPath) {
        try {
          fs.unlinkSync(file.path);
        } catch (unlinkError) {
          console.warn(`Warning: Could not delete temporary file: ${unlinkError.message}`);
          // Continue despite this error
        }
      }
      
      return {
        success: true,
        url: urlPath,
        key: fileName
      };
    } catch (error) {
      console.error('File upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Upload a file from memory buffer to local storage
   * @param {Object} file - The file object with buffer from multer memory storage
   * @param {string} subDir - Optional subdirectory within uploads
   * @returns {Promise<Object>} - Object containing the file URL or error
   */
  async uploadFromMemory(file, subDir = '') {
    try {
      if (!file || !file.buffer) {
        console.error('No file buffer provided for upload');
        return { success: false, error: 'No file buffer provided' };
      }

      console.log(`Uploading file from memory: ${file.originalname} (${file.size} bytes)`);
      
      // Generate a unique filename
      const timestamp = Date.now();
      const fileExt = path.extname(file.originalname);
      const fileName = `${timestamp}-${Math.round(Math.random() * 1E9)}${fileExt}`;
      
      // Create target directory if it doesn't exist
      const targetDir = subDir ? path.join(uploadsDir, subDir) : uploadsDir;
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      // Define the destination path
      const destPath = path.join(targetDir, fileName);
      
      // Write the file from buffer
      try {
        fs.writeFileSync(destPath, file.buffer);
        console.log(`File saved to ${destPath}`);
      } catch (writeError) {
        console.error(`Error writing file: ${writeError.message}`);
        return { success: false, error: `Failed to save file: ${writeError.message}` };
      }
      
      // Generate URL (relative to server root)
      const urlPath = subDir 
        ? `/uploads/${subDir}/${fileName}` 
        : `/uploads/${fileName}`;
      
      console.log(`File uploaded successfully from memory. URL path: ${urlPath}`);
      
      return {
        success: true,
        url: urlPath,
        key: fileName
      };
    } catch (error) {
      console.error('File upload from memory error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Delete a file from local storage
   * @param {string} fileName - The name of the file to delete
   * @param {string} subDir - Optional subdirectory within uploads
   * @returns {Promise<Object>} - Success or error object
   */
  async deleteFile(fileName, subDir = '') {
    try {
      const filePath = subDir 
        ? path.join(uploadsDir, subDir, fileName)
        : path.join(uploadsDir, fileName);
      
      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          error: 'File not found'
        };
      }
      
      fs.unlinkSync(filePath);
      console.log(`File deleted: ${filePath}`);
      
      return {
        success: true
      };
    } catch (error) {
      console.error('File deletion error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

module.exports = storageUtils;
