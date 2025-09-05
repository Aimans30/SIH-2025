import { useState, useEffect } from 'react';
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

const UserDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    // Fetch user complaints from API
    const fetchComplaints = async () => {
      try {
        if (user && user.phone) {
          const data = await getUserComplaints(user.phone);
          setComplaints(data);
        }
      } catch (error) {
        console.error('Error fetching complaints:', error);
        // If API fails, show empty complaints list
        setComplaints([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchComplaints();
  }, [user]);

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
            Citizen Dashboard
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
          <Typography variant="h4" component="h1">
            My Complaints
          </Typography>
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
