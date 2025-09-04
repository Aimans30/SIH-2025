import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitComplaint } from '../services/api';
import '../styles/SubmitComplaint.css';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select, 
  Paper, 
  Grid, 
  Box, 
  CircularProgress, 
  Alert, 
  IconButton 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const SubmitComplaint = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    image: null,
    location: { lat: null, lng: null, address: '' }
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const loggedInUser = localStorage.getItem('user');
    if (!loggedInUser) {
      navigate('/');
      return;
    }
    
    const userData = JSON.parse(loggedInUser);
    if (userData.role !== 'user') {
      // If not a regular user, redirect to appropriate dashboard
      navigate(userData.role === 'admin' || userData.role === 'head' ? '/admin-dashboard' : '/');
      return;
    }
    
    setUser(userData);
    
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocoding to get address using Nominatim API
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
              { headers: { 'Accept-Language': 'en' } }
            );
            
            if (!response.ok) {
              throw new Error('Failed to fetch address');
            }
            
            const data = await response.json();
            const address = data.display_name || 'Unknown location';
            
            setFormData(prev => ({
              ...prev,
              location: {
                lat: latitude,
                lng: longitude,
                address: address
              }
            }));
          } catch (error) {
            console.error('Error fetching address:', error);
            // Fallback to coordinates if address lookup fails
            setFormData(prev => ({
              ...prev,
              location: {
                lat: latitude,
                lng: longitude,
                address: `Location at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
              }
            }));
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG or PNG)');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      image: file
    }));
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate form
    if (!formData.type) {
      setError('Please select an issue type');
      return;
    }
    
    if (!formData.description) {
      setError('Please provide a description');
      return;
    }
    
    // Image is now optional
    
    if (!formData.location.lat || !formData.location.lng) {
      setError('Location information is missing. Please enable location services.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare complaint data for API
      const complaintData = {
        type: formData.type,
        description: formData.description,
        image: formData.image, // This is the actual file object
        location: formData.location,
        userId: user.phone // Use phone number as user ID
      };
      
      // Submit complaint to API
      const response = await submitComplaint(complaintData);
      
      console.log('Complaint submitted successfully:', response);
      
      setSuccess(true);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/user-dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error submitting complaint:', error);
      setError(error.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            Report a Civic Issue
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/user-dashboard')}
          >
            Back to Dashboard
          </Button>
        </Box>
        
        {success ? (
          <Box textAlign="center" py={4}>
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="h6">Thank you for your report!</Typography>
              <Typography>Your complaint has been submitted successfully.</Typography>
              <Typography>You will be redirected to your dashboard shortly...</Typography>
            </Alert>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3} sx={{ display: 'flex', flexDirection: 'column' }}>
              <Grid>
                <FormControl fullWidth required>
                  <InputLabel id="issue-type-label">Issue Type</InputLabel>
                  <Select
                    labelId="issue-type-label"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    label="Issue Type"
                  >
                    <MenuItem value="">Select Issue Type</MenuItem>
                    <MenuItem value="Broken Road">Broken Road</MenuItem>
                    <MenuItem value="Garbage Collection">Garbage Collection</MenuItem>
                    <MenuItem value="Street Light">Street Light</MenuItem>
                    <MenuItem value="Water Supply">Water Supply</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid>
                <TextField
                  name="description"
                  label="Description"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Please describe the issue in detail"
                  fullWidth
                  required
                />
              </Grid>
              
              <Grid>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Upload Image (Optional)
                  </Typography>
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mb: 2 }}
                  >
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      hidden
                    />
                  </Button>
                </Box>
                {imagePreview && (
                  <Box sx={{ mt: 2, mb: 2 }}>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '4px' }} 
                    />
                  </Box>
                )}
              </Grid>
              
              <Grid>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="subtitle1">Location</Typography>
                  </Box>
                  
                  {formData.location.lat && formData.location.lng ? (
                    <Box>
                      <Typography variant="body1">
                        <strong>Address:</strong> {formData.location.address}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Coordinates:</strong> {formData.location.lat.toFixed(6)}, {formData.location.lng.toFixed(6)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Location captured automatically from your device
                      </Typography>
                    </Box>
                  ) : (
                    <Box display="flex" alignItems="center">
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      <Typography>Getting your location...</Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
              
              {error && (
                <Grid>
                  <Alert severity="error">{error}</Alert>
                </Grid>
              )}
              
              <Grid>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />
                      Submitting...
                    </>
                  ) : 'Submit Report'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default SubmitComplaint;
