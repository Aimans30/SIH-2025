import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminComplaints, getDepartmentStats, updateComplaintStatus, transferComplaintToHead } from '../services/api';
import { useAuth } from '../context/AuthContext';
import styles from './AdminDashboard.module.css';
import CivicLogo from '../components/common/CivicLogo';

// Icon components
const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
  </svg>
);

const VisibilityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
  </svg>
);

const PersonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </svg>
);

const FilterListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
  </svg>
);

const AssessmentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
  </svg>
);

const AccessTimeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
    <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

const PendingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
    <path d="M7 13.5h8v-3H7z" />
  </svg>
);

const LoopIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);

const ListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
  </svg>
);

const TransferIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" />
  </svg>
);

const ForwardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" />
  </svg>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('error');
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    priority: '',
    dateRange: '',
    location: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    pending: 0,
    inProgress: 0,
    avgResolutionTime: '5.2 days'
  });

  useEffect(() => {
    if (user) {
      setAdmin(user);
      
      // Fetch admin complaints and stats from API
      const fetchData = async () => {
        try {
          // Check if user has admin/head role and department
          if (user.department && (user.role === 'admin' || user.role === 'head')) {
            // Get complaints for this admin's department
            const complaintsData = await getAdminComplaints(user.department);
            setComplaints(complaintsData);
            setFilteredComplaints(complaintsData);
            
            // Get department statistics
            const statsData = await getDepartmentStats(user.department);
            console.log('Stats data received:', statsData);
            
            // Update stats with data from API
            setStats({
              total: statsData.totalComplaints || 0,
              resolved: statsData.statusCounts?.Resolved || 0,
              pending: statsData.statusCounts?.Submitted || 0,
              inProgress: statsData.statusCounts?.['In Progress'] || 0,
              avgResolutionTime: statsData.avgResolutionTime || 'N/A'
            });
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          // If API fails, show empty data
          setComplaints([]);
          setFilteredComplaints([]);
        } finally {
          setLoading(false);
        }
      };
    
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    // Apply filters when they change
    let result = [...complaints];
    
    if (filters.type) {
      result = result.filter(c => c.type === filters.type);
    }
    
    if (filters.status) {
      result = result.filter(c => c.status === filters.status);
    }
    
    if (filters.priority) {
      result = result.filter(c => c.priority === filters.priority);
    }
    
    if (filters.location) {
      result = result.filter(c => 
        c.location.address.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    setFilteredComplaints(result);
  }, [filters, complaints]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      console.log(`Attempting to update complaint ${complaintId} to status: ${newStatus}`);
      
      // Send API request to update status
      const updatedComplaint = await updateComplaintStatus(complaintId, { 
        status: newStatus,
        comment: `Status updated to ${newStatus} by ${admin.role}`
      });
      
      console.log('Received updated complaint data:', updatedComplaint);
      
      // Update local state with the returned data
      const updatedComplaints = complaints.map(complaint => {
        if (complaint.id === complaintId) {
          return {
            ...complaint,
            ...updatedComplaint, // Use all fields from the updated complaint
            status: newStatus, // Ensure status is set correctly
            updatedAt: updatedComplaint.updatedAt || updatedComplaint.updated_at || new Date().toISOString()
          };
        }
        return complaint;
      });
      
      setComplaints(updatedComplaints);
      
      // Show success message
      setAlertMessage(`Complaint status updated to ${newStatus} successfully`);
      setAlertSeverity('success');
      setAlertOpen(true);
      
      // Refresh stats after status update
      try {
        const statsData = await getDepartmentStats(admin.department);
        console.log('Updated stats data after status change:', statsData);
        
        // Map the backend response to our frontend state
        setStats({
          total: statsData.totalComplaints || 0,
          resolved: statsData.statusCounts?.Resolved || 0,
          pending: statsData.statusCounts?.Submitted || 0,
          inProgress: statsData.statusCounts?.['In Progress'] || 0,
          avgResolutionTime: statsData.avgResolutionTime ? `${statsData.avgResolutionTime.toFixed(1)} days` : '0 days',
          escalated: statsData.statusCounts?.Escalated || 0
        });
      } catch (statsError) {
        console.error('Error fetching updated stats:', statsError);
        // Don't show an error to the user since the status update was successful
      }
    } catch (error) {
      console.error('Error updating complaint status:', error);
      setAlertMessage('Failed to update complaint status. Please try again.');
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  };
  
  const handleTransferToHead = async (complaintId) => {
    try {
      console.log(`Attempting to transfer complaint ${complaintId} to department head`);
      
      // Confirm with user before transferring
      if (!window.confirm('Are you sure you want to transfer this complaint to the department head?')) {
        return; // User cancelled the transfer
      }
      
      // Send API request to transfer complaint
      const updatedComplaint = await transferComplaintToHead(complaintId);
      
      console.log('Received transferred complaint data:', updatedComplaint);
      
      // Update local state with the returned data
      const updatedComplaints = complaints.map(complaint => {
        if (complaint.id === complaintId) {
          return {
            ...complaint,
            ...updatedComplaint,
            transferred_to_head: true,
            updatedAt: updatedComplaint.updatedAt || updatedComplaint.updated_at || new Date().toISOString()
          };
        }
        return complaint;
      });
      
      setComplaints(updatedComplaints);
      
      // Show success message
      setAlertMessage('Complaint transferred to department head successfully');
      setAlertSeverity('success');
      setAlertOpen(true);
      
      // Refresh stats after transfer
      try {
        const statsData = await getDepartmentStats(admin.department);
        console.log('Updated stats data after transfer:', statsData);
        
        // Map the backend response to our frontend state
        setStats({
          total: statsData.totalComplaints || 0,
          resolved: statsData.statusCounts?.Resolved || 0,
          pending: statsData.statusCounts?.Submitted || 0,
          inProgress: statsData.statusCounts?.['In Progress'] || 0,
          avgResolutionTime: statsData.avgResolutionTime ? `${statsData.avgResolutionTime.toFixed(1)} days` : '0 days',
          escalated: statsData.statusCounts?.Escalated || 0
        });
      } catch (statsError) {
        console.error('Error fetching updated stats:', statsError);
        // Don't show an error to the user since the transfer was successful
      }
    } catch (error) {
      console.error('Error transferring complaint:', error);
      setAlertMessage('Failed to transfer complaint. Please try again.');
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Submitted': return 'info';
      case 'In Progress': return 'warning';
      case 'Resolved': return 'success';
      default: return 'default';
    }
  };
  
  const getStatusIcon = (status) => {
    switch(status) {
      case 'Submitted': return <PendingIcon />;
      case 'In Progress': return <LoopIcon />;
      case 'Resolved': return <CheckCircleIcon />;
      default: return null;
    }
  };

  const handleLogout = () => {
    // Use the logout function from AuthContext
    // This will handle clearing localStorage and navigation
    logout();
  };

  // Custom Alert Component
  const Alert = ({ message, severity, onClose }) => {
    if (!message) return null;
    
    return (
      <div className={`${styles.alert} ${severity === 'success' ? styles.alertSuccess : styles.alertError}`}>
        <div className={styles.alertIcon}>
          {severity === 'success' ? <CheckCircleIcon /> : <CloseIcon />}
        </div>
        <div className={styles.alertMessage}>{message}</div>
        <button className={styles.alertCloseButton} onClick={onClose}>
          <CloseIcon />
        </button>
      </div>
    );
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
      {alertOpen && (
        <Alert 
          message={alertMessage} 
          severity={alertSeverity} 
          onClose={() => setAlertOpen(false)} 
        />
      )}
      
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.welcomeSection}>
            <h1 className={styles.welcomeTitle}>{admin?.department} Department</h1>
            <p className={styles.welcomeSubtitle}>
              Manage and respond to citizen complaints for your department.
            </p>
          </div>
          
          <div className={styles.actionButtons}>
            <div className={styles.userInfo}>
              <div className={styles.userIcon}>
                <PersonIcon />
              </div>
              <span className={styles.userName}>
                {admin?.role === 'head' ? 'Department Head' : 'Admin'}: {admin?.phone}
              </span>
            </div>
            
            <button className={styles.logoutButton} onClick={handleLogout}>
              <LogoutIcon /> Logout
            </button>
          </div>
        </div>
      
        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconTotal}`}>
              <AssessmentIcon />
            </div>
            <div className={`${styles.statValue} ${styles.statValueTotal}`}>{stats.total}</div>
            <div className={styles.statLabel}>Total Complaints</div>
          </div>
          
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconResolved}`}>
              <CheckCircleIcon />
            </div>
            <div className={`${styles.statValue} ${styles.statValueResolved}`}>{stats.resolved}</div>
            <div className={styles.statLabel}>Resolved</div>
          </div>
          
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconPending}`}>
              <PendingIcon />
            </div>
            <div className={`${styles.statValue} ${styles.statValuePending}`}>{stats.pending}</div>
            <div className={styles.statLabel}>Pending</div>
          </div>
          
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconInProgress}`}>
              <LoopIcon />
            </div>
            <div className={`${styles.statValue} ${styles.statValueInProgress}`}>{stats.inProgress}</div>
            <div className={styles.statLabel}>In Progress</div>
          </div>
          
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconTime}`}>
              <AccessTimeIcon />
            </div>
            <div className={`${styles.statValue} ${styles.statValueTime}`}>{stats.avgResolutionTime}</div>
            <div className={styles.statLabel}>Avg. Resolution Time</div>
          </div>
        </div>
        
        {/* Filters */}
        <div className={styles.filtersContainer}>
          <h2 className={styles.filtersTitle}>
            <FilterListIcon /> Filters
          </h2>
          
          <div className={styles.filtersGrid}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel} htmlFor="type-filter">Type</label>
              <select 
                id="type-filter" 
                className={styles.filterSelect}
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
              >
                <option value="">All Types</option>
                <option value="Broken Road">Broken Road</option>
                <option value="Garbage Collection">Garbage Collection</option>
                <option value="Street Light">Street Light</option>
              </select>
            </div>
            
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel} htmlFor="status-filter">Status</label>
              <select 
                id="status-filter" 
                className={styles.filterSelect}
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel} htmlFor="priority-filter">Priority</label>
              <select 
                id="priority-filter" 
                className={styles.filterSelect}
                name="priority"
                value={filters.priority}
                onChange={handleFilterChange}
              >
                <option value="">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel} htmlFor="location-filter">Location</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="location-filter"
                  className={styles.filterInput}
                  type="text"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="Search by location"
                />
                <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                  <SearchIcon />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Complaints Section */}
        <div className={styles.complaintsSection}>
          <div className={styles.complaintsHeader}>
            <h2 className={styles.complaintsTitle}>
              <ListIcon /> Complaints
            </h2>
            <div className={styles.complaintsCount}>
              {filteredComplaints.length} {filteredComplaints.length === 1 ? 'complaint' : 'complaints'} found
            </div>
          </div>
          
          <div className={styles.tableContainer}>
            {filteredComplaints.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 11v2h10v-2H7zm5-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                  </svg>
                </div>
                <p className={styles.emptyStateText}>
                  No complaints match your filters.
                </p>
              </div>
            ) : (
              <table className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th className={styles.tableHeaderCell}>ID</th>
                    <th className={styles.tableHeaderCell}>Type</th>
                    <th className={styles.tableHeaderCell}>Description</th>
                    <th className={styles.tableHeaderCell}>Location</th>
                    <th className={styles.tableHeaderCell}>Date</th>
                    <th className={styles.tableHeaderCell}>Status</th>
                    <th className={styles.tableHeaderCell}>Priority</th>
                    <th className={styles.tableHeaderCell}>Actions</th>
                  </tr>
                </thead>
                
                <tbody>
                  {filteredComplaints.map(complaint => (
                    <tr key={complaint.id} className={styles.tableRow}>
                      <td className={styles.tableCell}>{complaint.id && complaint.id.substring(0, 8)}...</td>
                      <td className={styles.tableCell}>{complaint.type}</td>
                      <td className={`${styles.tableCell} ${styles.descriptionCell}`}>
                        <div className={styles.truncatedText} title={complaint.description}>
                          {complaint.description}
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.truncatedText}>
                          {complaint.location ? complaint.location.address : 
                           complaint.location_address ? complaint.location_address : 'No location data'}
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        {complaint.created_at ? new Date(complaint.created_at).toLocaleDateString() : 'Unknown date'}
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.statusContainer}>
                          <span className={`${styles.statusBadge} ${
                            complaint.status === 'Submitted' ? styles.statusSubmitted :
                            complaint.status === 'In Progress' ? styles.statusInProgress :
                            styles.statusResolved
                          }`}>
                            {complaint.status}
                          </span>
                          {complaint.transferred_to_head && (
                            <span className={`${styles.statusBadge} ${styles.transferredBadge}`}>
                              <ForwardIcon /> Transferred
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <span className={`${styles.priorityBadge} ${
                          complaint.priority === 'High' ? styles.priorityHigh :
                          complaint.priority === 'Medium' ? styles.priorityMedium :
                          styles.priorityLow
                        }`}>
                          {complaint.priority}
                        </span>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.actionButtons}>
                          <button 
                            className={styles.viewButton}
                            onClick={() => navigate(`/complaint/${complaint.id}`)}
                          >
                            <VisibilityIcon /> View
                          </button>
                          
                          <select
                            className={styles.statusSelect}
                            value={complaint.status}
                            onChange={(e) => handleStatusUpdate(complaint.id, e.target.value)}
                          >
                            <option value="Submitted">Submitted</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                          
                          {/* Only show transfer button for admin users (not department heads) and for complaints not already transferred */}
                          {admin?.role === 'admin' && !complaint.transferred_to_head && (
                            <button 
                              className={styles.transferButton}
                              onClick={() => handleTransferToHead(complaint.id)}
                              title="Transfer to Department Head"
                            >
                              <TransferIcon /> Transfer
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
