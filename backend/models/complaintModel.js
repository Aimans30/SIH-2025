// complaintModel.js - Complaint model for Supabase
const supabase = require('../config/supabase');

/**
 * Complaint model functions for interacting with the complaints table in Supabase
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
          return null;
        }
      }
      
      // Insert the complaint
      const { data, error } = await supabase
        .from('complaints')
        .insert(complaintData)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating complaint:', error);
        return null;
      }
      
      console.log('Complaint created successfully:', data?.id);
      return data;
    } catch (err) {
      console.error('Unexpected error creating complaint:', err);
      return null;
    }
  },
  
  /**
   * Get a complaint by ID
   * @param {string} id - The complaint ID
   * @returns {Promise<Object>} - The complaint object or null
   */
  async getById(id) {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching complaint by ID:', error);
      return null;
    }
    
    return data;
  },
  
  /**
   * Get complaints by user ID
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} - Array of complaints
   */
  async getByUserId(userId) {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching complaints by user ID:', error);
      return [];
    }
    
    return data;
  },
  
  /**
   * Get complaints by department
   * @param {string} department - The department
   * @returns {Promise<Array>} - Array of complaints
   */
  async getByDepartment(department) {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('department', department)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching complaints by department:', error);
      return [];
    }
    
    return data;
  },
  
  /**
   * Update a complaint
   * @param {string} id - The complaint ID
   * @param {Object} updateData - The data to update
   * @returns {Promise<Object>} - The updated complaint or null
   */
  async update(id, updateData) {
    const { data, error } = await supabase
      .from('complaints')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating complaint:', error);
      return null;
    }
    
    return data;
  },
  
  /**
   * Get complaints by status
   * @param {string} status - The status to filter by
   * @returns {Promise<Array>} - Array of complaints
   */
  async getByStatus(status) {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching complaints by status:', error);
      return [];
    }
    
    return data;
  },
  
  /**
   * Get complaints that need escalation (older than specified days and not resolved)
   * @param {number} days - Number of days threshold
   * @returns {Promise<Array>} - Array of complaints to escalate
   */
  async getForEscalation(days) {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - days);
    
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .neq('status', 'Resolved')
      .eq('escalated', false)
      .lt('created_at', thresholdDate.toISOString());
    
    if (error) {
      console.error('Error fetching complaints for escalation:', error);
      return [];
    }
    
    return data;
  }
};

module.exports = complaintModel;
