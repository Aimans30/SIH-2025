import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminComplaints, getDepartmentStats, updateComplaintStatus } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CustomAlert from '../components/common/Alert';
import '../styles/Dashboard.css';
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
  Grid,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import LoopIcon from '@mui/icons-material/Loop';

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
      <CustomAlert 
        open={alertOpen}
        message={alertMessage}
        severity={alertSeverity}
        onClose={() => setAlertOpen(false)}
      />
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            CivicOne | {admin?.department} Department
          </Typography>
          <Box display="flex" alignItems="center">
            <Box display="flex" alignItems="center" mr={2}>
              <PersonIcon sx={{ mr: 1 }} />
              <Typography variant="body2">
                {admin?.role === 'head' ? 'Department Head' : 'Admin'}: {admin?.phone}
              </Typography>
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
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={2}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <AssessmentIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" gutterBottom>Total</Typography>
                <Typography variant="h4" color="primary">{stats.total}</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={2}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" gutterBottom>Resolved</Typography>
                <Typography variant="h4" color="success">{stats.resolved}</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={2}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <PendingIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" gutterBottom>Pending</Typography>
                <Typography variant="h4" color="info">{stats.pending}</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={2}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <LoopIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" gutterBottom>In Progress</Typography>
                <Typography variant="h4" color="warning">{stats.inProgress}</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={2}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <AccessTimeIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" gutterBottom>Avg. Resolution</Typography>
                <Typography variant="h4" color="secondary">{stats.avgResolutionTime}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Filters */}
        <Paper sx={{ p: 3, mb: 4 }} elevation={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" component="h2" sx={{ display: 'flex', alignItems: 'center' }}>
              <FilterListIcon sx={{ mr: 1 }} /> Filters
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel id="type-filter-label">Type</InputLabel>
                <Select
                  labelId="type-filter-label"
                  id="type-filter"
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  label="Type"
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="Broken Road">Broken Road</MenuItem>
                  <MenuItem value="Garbage Collection">Garbage Collection</MenuItem>
                  <MenuItem value="Street Light">Street Light</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  id="status-filter"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  label="Status"
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="Submitted">Submitted</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Resolved">Resolved</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel id="priority-filter-label">Priority</InputLabel>
                <Select
                  labelId="priority-filter-label"
                  id="priority-filter"
                  name="priority"
                  value={filters.priority}
                  onChange={handleFilterChange}
                  label="Priority"
                >
                  <MenuItem value="">All Priorities</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                name="location"
                label="Location"
                variant="outlined"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="Search by location"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Paper>
        
        {/* Complaints Table */}
        <Paper sx={{ width: '100%', overflow: 'hidden', mb: 4 }} elevation={2}>
          <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" component="h2">
              Complaints
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              {filteredComplaints.length} {filteredComplaints.length === 1 ? 'complaint' : 'complaints'} found
            </Typography>
          </Box>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)', overflowX: 'auto' }}>
            <Table stickyHeader aria-label="complaints table" sx={{ minWidth: 1200 }}>
              <TableHead>
                <TableRow>
                  <TableCell width="80px">ID</TableCell>
                  <TableCell width="120px">Type</TableCell>
                  <TableCell width="350px">Description</TableCell>
                  <TableCell width="250px">Location</TableCell>
                  <TableCell width="100px">Date</TableCell>
                  <TableCell width="120px">Status</TableCell>
                  <TableCell width="100px">Priority</TableCell>
                  <TableCell width="150px" align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredComplaints.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Box py={3}>
                        <Typography variant="subtitle1">
                          No complaints match your filters.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredComplaints.map(complaint => (
                    <TableRow 
                      key={complaint.id} 
                      hover
                      sx={{
                        '&:nth-of-type(odd)': {
                          backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        },
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04) !important',
                        },
                        '& > td': { 
                          py: 2,
                          verticalAlign: 'top' 
                        }
                      }}
                    >
                      <TableCell>{complaint.id}</TableCell>
                      <TableCell>{complaint.type}</TableCell>
                      <TableCell sx={{ minWidth: '250px', maxWidth: '350px' }}>
                        <Typography 
                          sx={{ 
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            lineHeight: 1.2,
                            maxHeight: '3.6em'
                          }}
                          title={complaint.description} // Shows full text on hover
                        >
                          {complaint.description}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ minWidth: '180px', maxWidth: '250px' }}>
                        <Typography 
                          sx={{ 
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            lineHeight: 1.2,
                            maxHeight: '2.4em'
                          }}
                          title={complaint.location ? complaint.location.address : 
                                 complaint.location_address ? complaint.location_address : 'No location data'}
                        >
                          {complaint.location ? complaint.location.address : 
                           complaint.location_address ? complaint.location_address : 'No location data'}
                        </Typography>
                      </TableCell>
                      <TableCell>{complaint.created_at ? new Date(complaint.created_at).toLocaleDateString() : 'Unknown date'}</TableCell>
                      <TableCell>
                        <Chip 
                          icon={getStatusIcon(complaint.status)}
                          label={complaint.status} 
                          color={getStatusColor(complaint.status)} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={complaint.priority} 
                          color={complaint.priority === 'High' ? 'error' : 
                                 complaint.priority === 'Medium' ? 'warning' : 'success'} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" gap={1}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => navigate(`/complaint/${complaint.id}`)}
                          >
                            View
                          </Button>
                          
                          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value={complaint.status}
                              onChange={(e) => handleStatusUpdate(complaint.id, e.target.value)}
                              displayEmpty
                              size="small"
                            >
                              <MenuItem value="Submitted">Submitted</MenuItem>
                              <MenuItem value="In Progress">In Progress</MenuItem>
                              <MenuItem value="Resolved">Resolved</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
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

export default AdminDashboard;
