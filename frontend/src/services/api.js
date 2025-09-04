// API service for making requests to the backend

const API_URL = 'http://localhost:5000/api';

// Authentication API calls
export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Complaints API calls
export const submitComplaint = async (complaintData) => {
  try {
    // Create FormData for file upload
    const formData = new FormData();
    
    // Append image file
    formData.append('image', complaintData.image);
    
    // Append other complaint data
    formData.append('type', complaintData.type);
    formData.append('description', complaintData.description);
    formData.append('lat', complaintData.location.lat);
    formData.append('lng', complaintData.location.lng);
    formData.append('address', complaintData.location.address);
    formData.append('userId', complaintData.userId);
    
    const response = await fetch(`${API_URL}/complaints`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit complaint');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Complaint submission error:', error);
    throw error;
  }
};

export const getUserComplaints = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/complaints/user/${userId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch complaints');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get user complaints error:', error);
    throw error;
  }
};

export const getAdminComplaints = async (department) => {
  try {
    const response = await fetch(`${API_URL}/complaints/admin/${department}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch complaints');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get admin complaints error:', error);
    throw error;
  }
};

export const getComplaintById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/complaints/${id}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch complaint details');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get complaint details error:', error);
    throw error;
  }
};

export const updateComplaintStatus = async (id, statusData) => {
  try {
    const response = await fetch(`${API_URL}/complaints/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(statusData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update complaint status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Update complaint status error:', error);
    throw error;
  }
};

export const getDepartmentStats = async (department) => {
  try {
    const response = await fetch(`${API_URL}/complaints/stats/${department}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch statistics');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get statistics error:', error);
    throw error;
  }
};
