// storage.js - Supabase storage configuration for file uploads
const supabase = require('./supabase');
const path = require('path');
const fs = require('fs');

// Log that we're using the existing bucket
console.log('Using existing Supabase storage bucket: images');

/**
 * Utility functions for handling file uploads to Supabase Storage
 */
const storageUtils = {
  /**
   * Upload a file to Supabase Storage
   * @param {Object} file - The file object from multer
   * @param {string} bucketName - The name of the bucket to upload to
   * @returns {Promise<Object>} - Object containing the file URL or error
   */
  async uploadFile(file, bucketName = 'images') {
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
      
      // Upload to Supabase Storage
      console.log(`Uploading file to bucket '${bucketName}'...`);
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, fileBuffer, {
          contentType: file.mimetype,
          cacheControl: '3600'
        });
      
      if (error) {
        console.error('Error uploading file to Supabase:', error);
        return { success: false, error: `Upload failed: ${error.message}` };
      }
      
      // Get public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);
      
      if (!urlData || !urlData.publicUrl) {
        console.error('Failed to get public URL');
        return { success: false, error: 'Failed to get public URL' };
      }
      
      console.log(`File uploaded successfully. Public URL: ${urlData.publicUrl}`);
      
      // Delete local file after successful upload
      try {
        fs.unlinkSync(file.path);
      } catch (unlinkError) {
        console.warn(`Warning: Could not delete local file: ${unlinkError.message}`);
        // Continue despite this error
      }
      
      return {
        success: true,
        url: urlData.publicUrl,
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
   * Delete a file from Supabase Storage
   * @param {string} fileName - The name of the file to delete
   * @param {string} bucketName - The name of the bucket
   * @returns {Promise<Object>} - Success or error object
   */
  async deleteFile(fileName, bucketName = 'images') {
    try {
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([fileName]);
      
      if (error) {
        throw new Error('Failed to delete file from storage');
      }
      
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
