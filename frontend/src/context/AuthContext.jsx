import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

// Create the auth context
export const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is logged in on initial load
  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser && loggedInUser !== 'undefined') {
      try {
        const parsedUser = JSON.parse(loggedInUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        setUserRole(parsedUser.role);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false); // Set loading to false after checking authentication
  }, []);

  // Login function
  const login = (response) => {
    try {
      // Validate response
      if (!response || !response.user) {
        console.error('Invalid login response:', response);
        throw new Error('Invalid login response from server');
      }
      
      if (!response.user.role) {
        console.error('User role missing in response:', response.user);
        throw new Error('User role information missing');
      }
      
      // Store user data and token
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);
      
      console.log('User authenticated:', { 
        id: response.user.id || response.user._id, // Support both MongoDB _id and legacy id
        role: response.user.role,
        phone: response.user.phone
      });
      
      setUser(response.user);
      setIsAuthenticated(true);
      setUserRole(response.user.role);
      
      // Redirect based on user role
      if (response.user.role === 'user') {
        console.log('Redirecting to user dashboard');
        navigate('/user-dashboard');
      } else if (response.user.role === 'admin' || response.user.role === 'head') {
        console.log('Redirecting to admin dashboard');
        navigate('/admin-dashboard');
      } else {
        // Default fallback if role is not recognized
        console.warn('Unknown user role:', response.user.role);
        navigate('/');
      }
    } catch (error) {
      console.error('Error during login process:', error);
      // Clear any partial authentication data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    setUserRole(null);
    setIsLoading(false);
    navigate('/');
  };
  
  // Get auth token
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Context value
  const value = {
    isAuthenticated,
    userRole,
    user,
    isLoading,
    login,
    logout,
    getToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
