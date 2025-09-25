import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserComplaints } from '../services/api';
import { useAuth } from '../context/AuthContext';
import styles from './UserDashboard.module.css';
import './UserDashboard.responsive.css'; // Import responsive styles
import LeafletHeatmap from '../components/dashboard/LeafletHeatmap';
import CivicLogo from '../components/common/CivicLogo';
import ResponsiveComplaintList from '../components/dashboard/ResponsiveComplaintList';

// Icon components
const AddIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
  </svg>
);

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
  </svg>
);

const PersonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const VisibilityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
  </svg>
);

const ListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
  </svg>
);

const MapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z" />
  </svg>
);

const UserDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Create a memoized fetch function that can be reused
  const fetchComplaints = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    }
    try {
      if (user && user.phone) {
        console.log('Fetching complaints for user:', user.phone);
        const data = await getUserComplaints(user.phone);
        console.log('Complaints data received:', data);
        
        // Check if data is valid
        if (Array.isArray(data)) {
          setComplaints(data);
        } else {
          console.error('Invalid complaints data format:', data);
          setComplaints([]);
        }
      } else {
        console.warn('User or phone number missing:', user);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      // If API fails, show empty complaints list
      setComplaints([]);
    } finally {
      setLoading(false);
      if (isManualRefresh) {
        setRefreshing(false);
      }
    }
  }, [user]);
  
  // Initial fetch when component mounts
  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);
  
  // Set up auto-refresh every 30 seconds
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing complaints data...');
      fetchComplaints();
    }, 30000); // 30 seconds
    
    // Clean up interval on component unmount
    return () => clearInterval(refreshInterval);
  }, [fetchComplaints]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Submitted': return 'info';
      case 'In Progress': return 'warning';
      case 'Resolved': return 'success';
      default: return 'default';
    }
  };

  const handleLogout = () => {
    // Use the logout function from AuthContext
    // This will handle clearing localStorage and navigation
    logout();
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <div className={styles.loadingText}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.welcomeSection}>
            <h1 className={styles.welcomeTitle}>Welcome, Citizen</h1>
            <p className={styles.welcomeSubtitle}>
              Track your complaints and report new issues in your community.
            </p>
          </div>
          
          <div className={styles.actionButtons}>
            <div className={styles.userInfo}>
              <div className={styles.userIcon}>
                <PersonIcon />
              </div>
              <span className={styles.userName}>{user?.phone}</span>
            </div>
            
            <button className={styles.logoutButton} onClick={handleLogout}>
              <LogoutIcon /> Logout
            </button>
          </div>
        </div>
        
        {/* Map Section */}
        <div className={styles.mapContainer}>
          <LeafletHeatmap complaints={complaints} />
        </div>
        
        {/* Complaints Section */}
        <div className={styles.complaintsSection}>
          <div className={styles.complaintsHeader}>
            <h2 className={styles.sectionTitle}>
              <ListIcon /> My Complaints
            </h2>
            
            <div className={styles.actionButtons}>
              <button 
                className={styles.secondaryButton}
                onClick={() => fetchComplaints(true)}
                disabled={refreshing}
              >
                <RefreshIcon />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              
              <button 
                className={styles.primaryButton}
                onClick={() => navigate('/submit-complaint')}
              >
                <AddIcon />
                Report New Issue
              </button>
            </div>
          </div>
          
          <div className={styles.tableContainer}>
            <ResponsiveComplaintList 
              complaints={complaints}
              onRefresh={() => fetchComplaints(true)}
              refreshing={refreshing}
              onAddNew={() => navigate('/submit-complaint')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
