// departmentModel.js - Department model for Supabase
const supabase = require('../config/supabase');

/**
 * Department model functions for interacting with the departments table in Supabase
 */
const departmentModel = {
  /**
   * Get all departments
   * @returns {Promise<Array>} - Array of departments
   */
  async getAll() {
    const { data, error } = await supabase
      .from('departments')
      .select('*');
    
    if (error) {
      console.error('Error fetching all departments:', error);
      return [];
    }
    
    return data;
  },
  
  /**
   * Get a department by ID
   * @param {string} id - The department ID
   * @returns {Promise<Object>} - The department object or null
   */
  async getById(id) {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching department by ID:', error);
      return null;
    }
    
    return data;
  },
  
  /**
   * Get a department by name
   * @param {string} name - The department name
   * @returns {Promise<Object>} - The department object or null
   */
  async getByName(name) {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('name', name)
      .single();
    
    if (error) {
      console.error('Error fetching department by name:', error);
      return null;
    }
    
    return data;
  },
  
  /**
   * Get department with its head user
   * @param {string} id - The department ID
   * @returns {Promise<Object>} - The department with head user details or null
   */
  async getDepartmentWithHead(id) {
    const { data, error } = await supabase
      .from('departments')
      .select(`
        *,
        head:head_id(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching department with head:', error);
      return null;
    }
    
    return data;
  },
  
  /**
   * Create a new department
   * @param {Object} departmentData - Department data to insert
   * @returns {Promise<Object>} - The created department or null
   */
  async create(departmentData) {
    const { data, error } = await supabase
      .from('departments')
      .insert(departmentData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating department:', error);
      return null;
    }
    
    return data;
  },
  
  /**
   * Update a department
   * @param {string} id - The department ID
   * @param {Object} updateData - The data to update
   * @returns {Promise<Object>} - The updated department or null
   */
  async update(id, updateData) {
    const { data, error } = await supabase
      .from('departments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating department:', error);
      return null;
    }
    
    return data;
  }
};

module.exports = departmentModel;
