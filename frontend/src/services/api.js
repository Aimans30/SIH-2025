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
  return {
    id: c.id,
    type: c.type,
    description: c.description,
    status: c.status,
    createdAt: c.createdAt || c.created_at,
    updatedAt: c.updatedAt || c.updated_at,
    imageUrl: c.imageUrl || c.image_url,
    department: c.department,
    // Group location fields if present
    location: c.location || (c.location_address || c.location_lat || c.location_lng
      ? {
          address: c.location_address,
          lat: c.location_lat,
          lng: c.location_lng,
        }
      : undefined),
  };
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
    
    // Append image file only if present
    if (complaintData.image instanceof File) {
      formData.append('image', complaintData.image);
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
    const headers = getAuthHeader();
    const response = await fetch(`${API_URL}/complaints/user/${userId}`, { headers });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch complaints');
    }
    
    const data = await unwrapResponse(response);
    // Ensure we return an array and normalize fields
    const list = Array.isArray(data) ? data : [];
    return list.map(normalizeComplaint);
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
    const headers = getAuthHeader();
    const response = await fetch(`${API_URL}/complaints/${id}`, { headers });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch complaint details');
    }
    
    const data = await unwrapResponse(response);
    return normalizeComplaint(data);
  } catch (error) {
    console.error('Get complaint details error:', error);
    throw error;
  }
};

export const updateComplaintStatus = async (id, statusData) => {
  try {
    // Get auth headers and merge with content-type
    const authHeaders = getAuthHeader();
    
    const response = await fetch(`${API_URL}/complaints/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify(statusData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update complaint status');
    }
    
    const data = await unwrapResponse(response);
    return normalizeComplaint(data);
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
      throw new Error(error.message || 'Failed to fetch statistics');
    }
    
    return await unwrapResponse(response);
  } catch (error) {
    console.error('Get statistics error:', error);
    throw error;
  }
};
