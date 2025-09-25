// API service for making requests to the backend
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Unwrap our backend response envelope and return the `data` payload directly
const unwrapResponse = async (response) => {
  const json = await response.json();
  // Our backend returns { success, message, data }
  if (json && Object.prototype.hasOwnProperty.call(json, 'data')) {
    return json.data;
  }
  return json;
};

// Normalize complaint fields to the shape expected by the UI
const normalizeComplaint = (c) => {
  if (!c) return c;
  
  // Log the raw complaint data to help diagnose issues
  console.log('Raw complaint data before normalization:', c);
  
  // Log date fields for debugging
  console.log('Date fields in complaint:', {
    createdAt: c.createdAt,
    created_at: c.created_at,
    updatedAt: c.updatedAt,
    updated_at: c.updated_at
  });
  
  // Create a normalized complaint object
  const normalized = {
    id: c._id || c.id, // Support both MongoDB _id and legacy id
    type: c.type,
    description: c.description,
    status: c.status,
    createdAt: c.createdAt || c.created_at,
    updatedAt: c.updatedAt || c.updated_at,
    created_at: c.created_at || c.createdAt, // Ensure both formats are available
    updated_at: c.updated_at || c.updatedAt, // Ensure both formats are available,
    // Handle all possible image URL field variations and provide a fallback
    imageUrl: c.imageUrl || c.image_url || "https://cdn.shopify.com/s/files/1/0274/7288/7913/files/MicrosoftTeams-image_32.jpg?v=1705315718",
    image_url: c.image_url || c.imageUrl || "https://cdn.shopify.com/s/files/1/0274/7288/7913/files/MicrosoftTeams-image_32.jpg?v=1705315718",
    department: c.department,
    history: c.history || [],
    transferred_to_head: c.transferred_to_head || false,
    
    // Preserve original location fields for backward compatibility
    location_address: c.location_address,
    location_lat: c.location_lat,
    location_lng: c.location_lng,
    
    // Group location fields into a structured object
    location: c.location || (c.location_address || c.location_lat || c.location_lng
      ? {
          address: c.location_address || null,
          lat: c.location_lat ? parseFloat(c.location_lat) : null,
          lng: c.location_lng ? parseFloat(c.location_lng) : null,
        }
      : null),
  };
  
  // Log the normalized complaint data
  console.log('Normalized complaint data:', normalized);
  
  return normalized;
};

// Authentication API calls
export const loginUser = async (credentials) => {
  try {
    console.log('Making login request to:', `${API_URL}/auth/login`);
    
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    console.log('Login response status:', response.status);
    
    if (!response.ok) {
      // Try to parse error response
      try {
        const errorData = await response.json();
        console.error('Server error response:', errorData);
        throw new Error(errorData.message || `Login failed with status: ${response.status}`);
      } catch (jsonError) {
        // If response is not valid JSON
        console.error('Error parsing error response:', jsonError);
        throw new Error(`Login failed with status: ${response.status}`);
      }
    }
    
    const data = await response.json();
    console.log('Login successful, received data:', { ...data, token: data.token ? '***' : 'none' });
    return data;
  } catch (error) {
    console.error('Login error:', error);
    // Add more context to network errors
    if (error.message === 'Failed to fetch') {
      console.error('Network error - server might be down or unreachable');
    }
    throw error;
  }
};

// Complaints API calls
export const submitComplaint = async (complaintData) => {
  try {
    // Create FormData for file upload
    const formData = new FormData();
    
    // Use the actual image if provided
    if (complaintData.image) {
      formData.append('image', complaintData.image);
      console.log('Uploading actual image:', complaintData.image.name);
    } else {
      console.log('No image provided for complaint');
    }
    
    // Append other complaint data
    formData.append('type', complaintData.type);
    formData.append('description', complaintData.description);
    formData.append('lat', complaintData.location.lat);
    formData.append('lng', complaintData.location.lng);
    formData.append('address', complaintData.location.address);
    formData.append('userId', complaintData.userId);
    
    // Get auth headers
    const headers = getAuthHeader();
    
    // Remove Content-Type header to let the browser set it with the correct boundary for FormData
    delete headers['Content-Type'];
    
    console.log('Submitting complaint with data:', {
      type: complaintData.type,
      description: complaintData.description.substring(0, 30) + '...',
      hasImage: !!complaintData.image,
      location: `${complaintData.location.lat}, ${complaintData.location.lng}`,
      userId: complaintData.userId
    });
    
    const response = await fetch(`${API_URL}/complaints`, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    if (!response.ok) {
      let errPayload = null;
      try {
        errPayload = await response.json();
      } catch (_) {}
      const errMsg = (errPayload && (errPayload.error || errPayload.message)) || `Failed to submit complaint (HTTP ${response.status})`;
      throw new Error(errMsg);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Complaint submission error:', error);
    throw error;
  }
};

export const getUserComplaints = async (userId) => {
  try {
    console.log('getUserComplaints called with userId:', userId);
    const headers = getAuthHeader();
    console.log('Auth headers:', headers);
    
    const url = `${API_URL}/complaints/user/${userId}`;
    console.log('Fetching from URL:', url);
    
    const response = await fetch(url, { headers });
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.error('Error response data:', errorData);
      } catch (e) {
        console.error('Failed to parse error response:', e);
        errorData = { message: 'Unknown error' };
      }
      throw new Error(errorData.message || `Failed to fetch complaints (HTTP ${response.status})`);
    }
    
    const responseText = await response.text();
    console.log('Raw response:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Parsed response data:', data);
      
      // Check if we need to unwrap the data from our backend envelope
      if (data && Object.prototype.hasOwnProperty.call(data, 'data')) {
        data = data.data;
        console.log('Unwrapped data:', data);
      }
    } catch (e) {
      console.error('Failed to parse JSON response:', e);
      throw new Error('Invalid JSON response from server');
    }
    
    // Ensure we return an array and normalize fields
    const list = Array.isArray(data) ? data : [];
    console.log('Final complaint list before normalization:', list);
    
    const normalizedList = list.map(normalizeComplaint);
    console.log('Normalized complaint list:', normalizedList);
    
    return normalizedList;
  } catch (error) {
    console.error('Get user complaints error:', error);
    throw error;
  }
};

export const getAdminComplaints = async (department) => {
  try {
    const headers = getAuthHeader();
    const response = await fetch(`${API_URL}/complaints/admin/${department}`, { headers });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch complaints');
    }
    
    const data = await unwrapResponse(response);
    const list = Array.isArray(data) ? data : [];
    return list.map(normalizeComplaint);
  } catch (error) {
    console.error('Get admin complaints error:', error);
    throw error;
  }
};

export const getComplaintById = async (id) => {
  try {
    console.log(`Fetching complaint details for ID: ${id}`);
    const headers = getAuthHeader();
    console.log('Auth headers:', headers);
    
    const url = `${API_URL}/complaints/${id}`;
    console.log('Fetching from URL:', url);
    
    const response = await fetch(url, { headers });
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.error('Error response data:', errorData);
      } catch (e) {
        console.error('Failed to parse error response:', e);
        errorData = { message: 'Unknown error' };
      }
      throw new Error(errorData.message || `Failed to fetch complaint details (HTTP ${response.status})`);
    }
    
    const responseText = await response.text();
    console.log('Raw response text length:', responseText.length);
    
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Parsed response data:', data);
      
      // Check if we need to unwrap the data from our backend envelope
      if (data && Object.prototype.hasOwnProperty.call(data, 'data')) {
        data = data.data;
        console.log('Unwrapped data:', data);
      }
    } catch (e) {
      console.error('Failed to parse JSON response:', e);
      throw new Error('Invalid JSON response from server');
    }
    
    const normalizedData = normalizeComplaint(data);
    return normalizedData;
  } catch (error) {
    console.error('Get complaint details error:', error);
    throw error;
  }
};

export const updateComplaintStatus = async (id, statusData) => {
  try {
    console.log(`Updating complaint status for ID: ${id}`, statusData);
    
    // Get auth headers and merge with content-type
    const authHeaders = getAuthHeader();
    console.log('Auth headers:', authHeaders);
    
    const url = `${API_URL}/complaints/${id}`;
    console.log('Request URL:', url);
    console.log('Request body:', JSON.stringify(statusData));
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify(statusData),
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.error('Error response data:', errorData);
      } catch (e) {
        console.error('Failed to parse error response:', e);
        errorData = { message: 'Unknown error' };
      }
      throw new Error(errorData.message || `Failed to update complaint status (HTTP ${response.status})`);
    }
    
    const responseText = await response.text();
    console.log('Raw response text length:', responseText.length);
    
    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
      console.log('Parsed response data:', data);
      
      // Check if we need to unwrap the data from our backend envelope
      if (data && Object.prototype.hasOwnProperty.call(data, 'data')) {
        data = data.data;
        console.log('Unwrapped data:', data);
      }
    } catch (e) {
      console.error('Failed to parse JSON response:', e);
      throw new Error('Invalid JSON response from server');
    }
    
    const normalizedData = normalizeComplaint(data);
    console.log('Normalized complaint data after status update:', normalizedData);
    return normalizedData;
  } catch (error) {
    console.error('Update complaint status error:', error);
    throw error;
  }
};

export const getDepartmentStats = async (department) => {
  try {
    const headers = getAuthHeader();
    const response = await fetch(`${API_URL}/complaints/stats/${department}`, { headers });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch department statistics');
    }
    
    const data = await unwrapResponse(response);
    return data;
  } catch (error) {
    console.error('Get department stats error:', error);
    throw error;
  }
};

export const transferComplaintToHead = async (id) => {
  try {
    console.log(`Transferring complaint ID: ${id} to department head`);
    
    // Get auth headers
    const headers = {
      ...getAuthHeader(),
      'Content-Type': 'application/json'
    };
    
    const url = `${API_URL}/complaints/${id}/transfer-to-head`;
    console.log('Request URL:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to transfer complaint (HTTP ${response.status})`);
    }
    
    const data = await unwrapResponse(response);
    return normalizeComplaint(data);
  } catch (error) {
    console.error('Transfer complaint error:', error);
    throw error;
  }
};

/**
 * @param {File} image - The image file to validate
 * @param {string} type - The complaint type
 * @param {string} description - The complaint description
 * @returns {Promise<Object>} - Validation result
 */
export const validateImage = async (image, type, description) => {
  console.group('Image Validation - Frontend');
  try {
    console.log(`Validating image for type: ${type}`);
    console.log(`Description: ${description.substring(0, 30)}...`);
    console.log(`Image details: ${image.name}, ${image.type}, ${image.size} bytes`);
    
    // Create FormData for file upload
    console.log('Creating FormData for image upload...');
    const formData = new FormData();
    formData.append('image', image);
    formData.append('type', type);
    formData.append('description', description);
    
    // Get auth headers
    const headers = getAuthHeader();
    console.log('Auth headers obtained');
    
    // Remove Content-Type header to let the browser set it with the correct boundary for FormData
    delete headers['Content-Type'];
    console.log('Content-Type header removed for proper FormData handling');
    
    console.log('Sending validation request to server...');
    console.time('Image Validation Request');
    
    const response = await fetch(`${API_URL}/images/validate`, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    console.timeEnd('Image Validation Request');
    console.log(`Response received with status: ${response.status}`);
    
    if (!response.ok) {
      console.warn(`Non-OK response: ${response.status} ${response.statusText}`);
      let errPayload = null;
      try {
        errPayload = await response.json();
        console.error('Error payload:', errPayload);
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError);
      }
      const errMsg = (errPayload && (errPayload.error || errPayload.message)) || `Failed to validate image (HTTP ${response.status})`;
      throw new Error(errMsg);
    }
    
    const responseData = await response.json();
    // Log a preview of the response data
    const previewData = {
      ...responseData,
      data: responseData.data ? {
        ...responseData.data,
        feedback: responseData.data.feedback?.length > 100 ?
          responseData.data.feedback.substring(0, 100) + '... (truncated in log only)' :
          responseData.data.feedback
      } : null
    };
    console.log('Validation response data preview:', previewData);
    
    const result = responseData.data;
    
    // Check if the feedback contains JSON that might have a different isValid value
    if (result.feedback && result.feedback.includes('```json')) {
      console.log('🔎 Detected JSON in feedback, checking for consistency...');
      const jsonMatch = result.feedback.match(/\{[\s\S]*?\}/); // Match JSON object
      if (jsonMatch) {
        try {
          const extractedJson = JSON.parse(jsonMatch[0]);
          if (extractedJson.isValid !== undefined && extractedJson.isValid !== result.isValid) {
            console.warn('⚠️ Inconsistency detected in API response: result.isValid =', result.isValid, 
                        'but JSON in feedback has isValid =', extractedJson.isValid);
            console.log('🔄 Correcting isValid value based on JSON in feedback');
            result.isValid = extractedJson.isValid;
          }
        } catch (e) {
          console.error('❌ Error parsing JSON in feedback:', e);
        }
      }
    }
    
    console.log(`Validation result - isValid: ${result.isValid}`);
    console.log(`Feedback length: ${result.feedback?.length || 0} characters`);
    
    console.groupEnd();
    return result;
  } catch (error) {
    console.error('Image validation error:', error);
    console.groupEnd();
    throw error;
  }
};
