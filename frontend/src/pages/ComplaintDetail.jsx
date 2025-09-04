import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getComplaintById, updateComplaintStatus } from '../services/api';
import '../styles/ComplaintDetail.css';
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

// Map container style
const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '4px'
};

// Default center (India)
const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629
};

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  useEffect(() => {
    // Check if user is logged in
    const loggedInUser = localStorage.getItem('user');
    if (!loggedInUser) {
      navigate('/');
      return;
    }
    
    const userData = JSON.parse(loggedInUser);
    setUser(userData);
    setIsAdmin(['admin', 'head'].includes(userData.role));
    
    // Fetch complaint details from API
    const fetchComplaintDetails = async () => {
      try {
        const complaintData = await getComplaintById(id);
        setComplaint(complaintData);
        
        // Set map center if location coordinates are available
        if (complaintData && complaintData.location_lat && complaintData.location_lng) {
          setMapCenter({
            lat: parseFloat(complaintData.location_lat),
            lng: parseFloat(complaintData.location_lng)
          });
        }
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
      
      // Send API request to update status
      const response = await updateComplaintStatus(complaint.id, { status: newStatus, comment });
      
      // Update local state with the response data
      setComplaint(response.complaint);
    } catch (error) {
      console.error('Error updating complaint status:', error);
      alert('Failed to update complaint status. Please try again.');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 5, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading complaint details...</Typography>
      </Container>
    );
  }

  if (!complaint) {
    return (
      <Container maxWidth="md" sx={{ mt: 5 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>Complaint Not Found</Typography>
          <Typography variant="body1" paragraph>The complaint with ID {id} could not be found.</Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(isAdmin ? '/admin-dashboard' : '/user-dashboard')}
          >
            Back to Dashboard
          </Button>
        </Paper>
      </Container>
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h4" component="h1">
            Complaint Details
          </Typography>
          <Button
            variant="outlined"
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
                  Complaint ID: {complaint.id}
                </Typography>
                <Chip 
                  label={complaint.status} 
                  color={getStatusColor(complaint.status)} 
                  sx={{ ml: 2 }}
                />
                {complaint.escalated && (
                  <Chip label="Escalated" color="error" sx={{ ml: 1 }} />
                )}
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center">
                    <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Reported: {complaint.created_at ? new Date(complaint.created_at).toLocaleString() : 'Unknown date'}
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
        
        <Divider sx={{ mb: 4 }} />
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <CategoryIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Type</Typography>
                </Box>
                <Typography variant="body1">{complaint.type}</Typography>
              </CardContent>
            </Card>
            
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <DescriptionIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Description</Typography>
                </Box>
                <Typography variant="body1">{complaint.description}</Typography>
              </CardContent>
            </Card>
            
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Location</Typography>
                </Box>
                <Typography variant="body1" paragraph>{complaint.location_address || 'No address available'}</Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Coordinates: {complaint.location_lat ? complaint.location_lat.toFixed(6) : '0.000000'}, {complaint.location_lng ? complaint.location_lng.toFixed(6) : '0.000000'}
                </Typography>
                
                {/* Google Map */}
                <Box sx={{ mt: 2, border: '1px solid #eee', borderRadius: '4px', overflow: 'hidden' }}>
                  {/* Temporarily disable Google Maps due to API key issue */}
                  <Box sx={{ 
                    height: '300px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5',
                    color: '#666'
                  }}>
                    <Typography variant="body2">
                      Map view temporarily unavailable - Please configure Google Maps API key
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                component="img"
                image={complaint.image_url}
                alt={`Image for complaint ${complaint.id}`}
                sx={{ height: 300, objectFit: 'cover' }}
              />
            </Card>
            
            {isAdmin && user.department === complaint.department && (
              <Box mt={3} p={2} border={1} borderColor="divider" borderRadius={1}>
                <Typography variant="h6" gutterBottom>Update Status</Typography>
                <ButtonGroup variant="contained" fullWidth>
                  <Button
                    color={complaint.status === 'Submitted' ? 'primary' : 'inherit'}
                    onClick={() => handleStatusUpdate('Submitted')}
                    disabled={complaint.status === 'Submitted'}
                  >
                    Submitted
                  </Button>
                  <Button
                    color={complaint.status === 'In Progress' ? 'primary' : 'inherit'}
                    onClick={() => handleStatusUpdate('In Progress')}
                    disabled={complaint.status === 'In Progress'}
                  >
                    In Progress
                  </Button>
                  <Button
                    color={complaint.status === 'Resolved' ? 'primary' : 'inherit'}
                    onClick={() => handleStatusUpdate('Resolved')}
                    disabled={complaint.status === 'Resolved'}
                  >
                    Resolved
                  </Button>
                </ButtonGroup>
              </Box>
            )}
          </Grid>
        </Grid>
        
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>Status</Typography>
          <List>
            {complaint.history && complaint.history.length > 0 ? complaint.history.map((event, index) => (
              <ListItem key={index} alignItems="flex-start" sx={{ py: 1 }}>
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: getStatusColor(event.status) === 'success' ? 'success.main' : 
                                      getStatusColor(event.status) === 'warning' ? 'warning.main' : 'info.main' }}>
                    {event.status.charAt(0)}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="subtitle1">{event.status}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(event.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                  }
                  secondary={event.comment}
                />
              </ListItem>
            )) : (
              <ListItem>
                <ListItemText primary="No history available" />
              </ListItem>
            )}
          </List>
        </Box>
      </Paper>
    </Container>
  );
};

export default ComplaintDetail;
