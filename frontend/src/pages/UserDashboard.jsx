import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserComplaints } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';
import LeafletHeatmap from '../components/dashboard/LeafletHeatmap';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonIcon from '@mui/icons-material/Person';
import RefreshIcon from '@mui/icons-material/Refresh';

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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            CivicOne | User Dashboard
          </Typography>
          <Box display="flex" alignItems="center">
            <Box display="flex" alignItems="center" mr={2}>
              <PersonIcon sx={{ mr: 1 }} />
              <Typography variant="body2">{user?.phone}</Typography>
            </Box>
            <Button 
              color="inherit" 
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Heatmap (Leaflet-based, no Google dependencies) */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={12}>
            <LeafletHeatmap complaints={complaints} />
          </Grid>
        </Grid>
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center">
            <Typography variant="h4" component="h1" sx={{ mr: 2 }}>
              My Complaints
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={() => fetchComplaints(true)}
              disabled={refreshing}
              sx={{ mr: 1 }}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/submit-complaint')}
          >
            Report New Issue
          </Button>
        </Box>
        
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
            <Table stickyHeader aria-label="complaints table">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Date Reported</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {complaints.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="subtitle1" sx={{ py: 3 }}>
                        You haven't submitted any complaints yet.
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {!user ? 'User information not loaded.' : 
                         `Logged in as: ${user.phone} (${user.role})`}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  complaints.map(complaint => (
                    <TableRow key={complaint.id} hover>
                      <TableCell>{complaint.id}</TableCell>
                      <TableCell>{complaint.type}</TableCell>
                      <TableCell sx={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {complaint.description}
                      </TableCell>
                      <TableCell>{new Date(complaint.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip 
                          label={complaint.status} 
                          color={getStatusColor(complaint.status)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => navigate(`/complaint/${complaint.id}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </Box>
  );
};

export default UserDashboard;
