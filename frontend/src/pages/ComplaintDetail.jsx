import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getComplaintById, updateComplaintStatus } from '../services/api';
import styles from './ComplaintDetail.module.css';
import ComplaintLocationMap from '../components/maps/ComplaintLocationMap';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Button,
  CircularProgress,
  Chip,
  Divider,
  Card,
  CardContent,
  CardMedia,
  ButtonGroup,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Stack
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CategoryIcon from '@mui/icons-material/Category';
import DescriptionIcon from '@mui/icons-material/Description';
import DepartmentIcon from '@mui/icons-material/AccountBalance';
import ForwardIcon from '@mui/icons-material/Forward';

// Map container style is now handled in the ComplaintLocationMap component

// Helper function to format dates consistently
const formatDate = (dateString) => {
  if (!dateString) return 'Unknown date';
  
  try {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error, dateString);
    return 'Invalid date';
  }
};

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  // Map center is now handled in the ComplaintLocationMap component

  useEffect(() => {
    // Check if user is logged in
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      const userData = JSON.parse(loggedInUser);
      setUser(userData);
      setIsAdmin(['admin', 'head'].includes(userData.role));
    }
    
    // Fetch complaint details from API
    const fetchComplaintDetails = async () => {
      try {
        const complaintData = await getComplaintById(id);
        
        // Ensure date fields are properly set
        if (complaintData) {
          console.log('Complaint data received:', complaintData);
          console.log('Date fields:', {
            created_at: complaintData.created_at,
            createdAt: complaintData.createdAt,
            updated_at: complaintData.updated_at,
            updatedAt: complaintData.updatedAt
          });
          
          // If date fields are missing, try to set them from the other format
          if (!complaintData.created_at && complaintData.createdAt) {
            complaintData.created_at = complaintData.createdAt;
          } else if (!complaintData.createdAt && complaintData.created_at) {
            complaintData.createdAt = complaintData.created_at;
          }
          
          if (!complaintData.updated_at && complaintData.updatedAt) {
            complaintData.updated_at = complaintData.updatedAt;
          } else if (!complaintData.updatedAt && complaintData.updated_at) {
            complaintData.updatedAt = complaintData.updated_at;
          }
          
          // If still no date, set a default
          if (!complaintData.created_at && !complaintData.createdAt) {
            complaintData.created_at = complaintData.createdAt = new Date().toISOString();
            console.log('Setting default created date');
          }
          
          if (!complaintData.updated_at && !complaintData.updatedAt) {
            complaintData.updated_at = complaintData.updatedAt = new Date().toISOString();
            console.log('Setting default updated date');
          }
        }
        
        setComplaint(complaintData);
        
        // Map center is now handled in the ComplaintLocationMap component
      } catch (error) {
        console.error('Error fetching complaint details:', error);
        // Complaint not found or error
        setComplaint(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchComplaintDetails();
  }, [id]);

  const getStatusClass = (status) => {
    switch(status) {
      case 'Submitted': return 'status-submitted';
      case 'In Progress': return 'status-progress';
      case 'Resolved': return 'status-resolved';
      default: return '';
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      // Generate appropriate comment based on status
      let comment = '';
      switch(newStatus) {
        case 'In Progress':
          comment = `Assigned to ${user.department} team`;
          break;
        case 'Resolved':
          comment = `Issue resolved by ${user.department} team`;
          break;
        default:
          comment = 'Status updated';
      }
      
      console.log(`Updating complaint ${complaint.id} status to ${newStatus}`);
      
      // Send API request to update status
      const response = await updateComplaintStatus(complaint.id, { status: newStatus, comment });
      
      console.log('Status update response:', response);
      
      // Update local state with the response data
      // The response is already normalized by the API service
      setComplaint(response);
      
      console.log('Complaint state updated successfully');
    } catch (error) {
      console.error('Error updating complaint status:', error);
      alert('Failed to update complaint status. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <CircularProgress className={styles.spinner} />
        <Typography variant="h6">Loading complaint details...</Typography>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className={styles.detailContainer}>
        <div className={styles.content}>
          <Paper className={styles.paper} style={{textAlign: 'center'}}>
            <Typography variant="h4" gutterBottom>Complaint Not Found</Typography>
            <Typography variant="body1" paragraph>The complaint with ID {id} could not be found.</Typography>
            <Button
              className={styles.backButton}
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(isAdmin ? '/admin-dashboard' : '/user-dashboard')}
            >
              Back to Dashboard
            </Button>
          </Paper>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'Submitted': return 'info';
      case 'In Progress': return 'warning';
      case 'Resolved': return 'success';
      default: return 'default';
    }
  };

  return (
    <div className={styles.detailContainer}>
      <div className={styles.content}>
        <Paper className={styles.paper}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Typography variant="h4" component="h1">
              CivicOne | Complaint Details
            </Typography>
            <Button
              className={styles.backButton}
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(isAdmin ? '/admin-dashboard' : '/user-dashboard')}
            >
              Back to Dashboard
            </Button>
          </Box>
        
        <Box mb={4}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box display="flex" alignItems="center" mb={1}>
                <Typography variant="h5" component="h2">
                  Complaint ID: {complaint.id && complaint.id.substring(0, 8)}...
                </Typography>
                <Chip 
                  label={complaint.status} 
                  className={`${styles.statusChip} ${
                    complaint.status === 'Submitted' ? styles.statusSubmitted : 
                    complaint.status === 'In Progress' ? styles.statusInProgress : 
                    styles.statusResolved
                  }`}
                />
                {complaint.escalated && (
                  <Chip label="Escalated" className={`${styles.statusChip} ${styles.escalatedChip}`} />
                )}
                {complaint.transferred_to_head && (
                  <Chip 
                    icon={<ForwardIcon style={{ color: '#9b59b6' }} />}
                    label="Transferred to Head" 
                    className={`${styles.statusChip} ${styles.transferredChip}`}
                  />
                )}
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center">
                    <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Reported: {formatDate(complaint.created_at || complaint.createdAt)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center">
                    <DepartmentIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Department: {complaint.department}
                    </Typography>
                  </Box>
                </Grid>
                {isAdmin && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Priority:</strong> {complaint.priority}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Box>
        
        <Divider className={styles.divider} />
        
        {/* Main Content - Four boxes in one line */}
        <Grid container spacing={3} mb={4}>
          {/* Type Card - Small */}
          <Grid item xs={12} sm={6} md={2} lg={2}>
            <Card variant="outlined" className={styles.imageCard}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <CategoryIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Type</Typography>
                </Box>
                <Typography variant="body1">{complaint.type}</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Description Card - Small */}
          <Grid item xs={12} sm={6} md={2} lg={2}>
            <Card variant="outlined" className={styles.imageCard}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <DescriptionIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Description</Typography>
                </Box>
                <Typography variant="body1">{complaint.description}</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Location Card - Small */}
          <Grid item xs={12} sm={6} md={2} lg={2}>
            <Card variant="outlined" className={styles.imageCard}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Location</Typography>
                </Box>
                <Typography variant="body1" paragraph>
                  {complaint.location?.address || complaint.location_address || 'No address available'}
                </Typography>
                
                <Box display="flex" alignItems="center" mb={1} flexWrap="wrap" gap={1}>
                  <Typography variant="body2" color="text.secondary">
                    {((complaint.location?.lat && complaint.location?.lng) || (complaint.location_lat && complaint.location_lng)) && 
                     ((parseFloat(complaint.location?.lat || complaint.location_lat) !== 0 && 
                       parseFloat(complaint.location?.lng || complaint.location_lng) !== 0)) ? (
                      `Coordinates: ${parseFloat(complaint.location?.lat || complaint.location_lat).toFixed(6)}, 
                       ${parseFloat(complaint.location?.lng || complaint.location_lng).toFixed(6)}`
                    ) : (
                      'No coordinates available'
                    )}
                  </Typography>
                  
                  {/* Google Maps Link Button */}
                  {((complaint.location?.lat && complaint.location?.lng) || (complaint.location_lat && complaint.location_lng)) && 
                   ((parseFloat(complaint.location?.lat || complaint.location_lat) !== 0 && 
                     parseFloat(complaint.location?.lng || complaint.location_lng) !== 0)) && (
                    <Button
                      variant="outlined"
                      size="small"
                      color="primary"
                      startIcon={<LocationOnIcon />}
                      href={`https://www.google.com/maps?q=${parseFloat(complaint.location?.lat || complaint.location_lat)},${parseFloat(complaint.location?.lng || complaint.location_lng)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View in Google Maps
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Map View Card - Large */}
          <Grid item xs={12} sm={12} md={6} lg={6}>
            <Card variant="outlined" className={styles.imageCard}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Map View</Typography>
                </Box>
                <div className={styles.mapContainer}>
                  <ComplaintLocationMap 
                    lat={complaint.location?.lat || complaint.location_lat} 
                    lng={complaint.location?.lng || complaint.location_lng} 
                    address={complaint.location?.address || complaint.location_address} 
                  />
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Independent Image Section */}
        <Box mb={4} className={styles.imageWrapper}>
          <img
            className={styles.standAloneImage}
            src={complaint.image_url || complaint.imageUrl || "https://cdn.shopify.com/s/files/1/0274/7288/7913/files/MicrosoftTeams-image_32.jpg?v=1705315718"}
            alt={`Image for complaint ${complaint.id}`}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://cdn.shopify.com/s/files/1/0274/7288/7913/files/MicrosoftTeams-image_32.jpg?v=1705315718";
            }}
          />
        </Box>

        {/* Admin Actions */}
        {isAdmin && user.department === complaint.department && (
          <Box mb={4}>
            <div className={styles.adminActions}>
              <Typography variant="h6" gutterBottom>Update Status</Typography>
              <ButtonGroup variant="contained" fullWidth>
                <Button
                  className={`${styles.statusButton} ${styles.submittedButton} ${complaint.status === 'Submitted' ? styles.active : ''}`}
                  onClick={() => handleStatusUpdate('Submitted')}
                  disabled={complaint.status === 'Submitted'}
                >
                  Submitted
                </Button>
                <Button
                  className={`${styles.statusButton} ${styles.inProgressButton} ${complaint.status === 'In Progress' ? styles.active : ''}`}
                  onClick={() => handleStatusUpdate('In Progress')}
                  disabled={complaint.status === 'In Progress'}
                >
                  In Progress
                </Button>
                <Button
                  className={`${styles.statusButton} ${styles.resolvedButton} ${complaint.status === 'Resolved' ? styles.active : ''}`}
                  onClick={() => handleStatusUpdate('Resolved')}
                  disabled={complaint.status === 'Resolved'}
                >
                  Resolved
                </Button>
              </ButtonGroup>
            </div>
          </Box>
        )}
        
        <Box mt={4}>
          <Typography variant="h6" gutterBottom className={styles.centeredTitle}>Status Timeline</Typography>
          
          <Paper elevation={0} className={styles.statusTimeline}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {/* Status Timeline */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'info.main',
                    mr: 2
                  }}
                >
                  S
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1">Submitted</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(complaint.createdAt || complaint.created_at)}
                  </Typography>
                </Box>
                <Chip 
                  label={complaint.status === 'Submitted' ? 'Current' : 'Completed'} 
                  color={complaint.status === 'Submitted' ? 'primary' : 'success'} 
                  size="small" 
                  variant={complaint.status === 'Submitted' ? 'filled' : 'outlined'}
                />
              </Box>
              
              {/* In Progress Status */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2,
                opacity: ['In Progress', 'Resolved'].includes(complaint.status) ? 1 : 0.5
              }}>
                <Avatar 
                  sx={{ 
                    bgcolor: ['In Progress', 'Resolved'].includes(complaint.status) ? 'warning.main' : 'grey.400',
                    mr: 2
                  }}
                >
                  P
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1">In Progress</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {complaint.status === 'In Progress' ? 
                      `Updated on ${formatDate(complaint.updatedAt || complaint.updated_at)}` : 
                      complaint.status === 'Resolved' ? 'Completed' : 'Pending'}
                  </Typography>
                </Box>
                {complaint.status === 'In Progress' && (
                  <Chip label="Current" color="primary" size="small" />
                )}
                {complaint.status === 'Resolved' && (
                  <Chip label="Completed" color="success" size="small" variant="outlined" />
                )}
              </Box>
              
              {/* Transferred to Department Head Status - Only show if transferred */}
              {complaint.transferred_to_head && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  mb: 2
                }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'purple',
                      mr: 2
                    }}
                  >
                    <ForwardIcon fontSize="small" />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1">Transferred to Department Head</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(complaint.updatedAt || complaint.updated_at)}
                    </Typography>
                  </Box>
                  <Chip 
                    icon={<ForwardIcon style={{ fontSize: '0.8rem', color: '#9b59b6' }} />}
                    label="Escalated" 
                    color="secondary" 
                    size="small" 
                    className={styles.transferredChip}
                  />
                </Box>
              )}
              
              {/* Resolved Status */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                opacity: complaint.status === 'Resolved' ? 1 : 0.5
              }}>
                <Avatar 
                  sx={{ 
                    bgcolor: complaint.status === 'Resolved' ? 'success.main' : 'grey.400',
                    mr: 2
                  }}
                >
                  R
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1">Resolved</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {complaint.status === 'Resolved' ? 
                      `Resolved on ${formatDate(complaint.updatedAt || complaint.updated_at)}` : 
                      'Pending'}
                  </Typography>
                </Box>
                {complaint.status === 'Resolved' && (
                  <Chip label="Current" color="primary" size="small" />
                )}
              </Box>
            </Box>
          </Paper>
        </Box>
      </Paper>
      </div>
    </div>
  );
};

export default ComplaintDetail;
