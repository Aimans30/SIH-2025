import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Avatar,
  CircularProgress,
  Alert,
  Divider,
  InputAdornment,
  IconButton
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!formData.name || !formData.phone || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Here you would typically make an API call to register the user
      // For now, we'll simulate a successful registration
      setTimeout(() => {
        setSuccess(true);
        setIsLoading(false);
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }, 1500);
      
    } catch (error) {
      setError('Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Paper 
          elevation={6} 
          sx={{ 
            borderRadius: 3,
            overflow: 'hidden'
          }}
        >
          <Grid container>
            <Grid 
              item 
              xs={12}
              sx={{ 
                bgcolor: 'primary.main',
                color: 'white',
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <Avatar 
                sx={{ 
                  bgcolor: 'white',
                  color: 'primary.main',
                  width: 60,
                  height: 60,
                  mb: 2
                }}
              >
                <PersonAddIcon fontSize="large" />
              </Avatar>
              <Typography variant="h4" component="h1" fontWeight="bold">
                Create Account
              </Typography>
              <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
                Join CivicOne to report and track civic issues
              </Typography>
            </Grid>
            
            <Grid item xs={12} sx={{ p: 4 }}>
              {success ? (
                <Box textAlign="center" py={3}>
                  <Alert severity="success" sx={{ mb: 3 }}>
                    Registration successful! Redirecting to login...
                  </Alert>
                  <CircularProgress size={30} />
                </Box>
              ) : (
                <Box component="form" onSubmit={handleSubmit}>
                  {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
                    </Alert>
                  )}
                  
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="name"
                    label="Full Name"
                    name="name"
                    autoComplete="name"
                    autoFocus
                    value={formData.name}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                  />
                  
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="phone"
                    label="Phone Number"
                    name="phone"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                  />
                  
                  <TextField
                    margin="normal"
                    fullWidth
                    id="email"
                    label="Email Address (Optional)"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                  />
                  
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleTogglePasswordVisibility}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                  
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    sx={{ mb: 3 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={handleToggleConfirmPasswordVisibility}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                  
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isLoading}
                    sx={{ 
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      borderRadius: 2
                    }}
                  >
                    {isLoading ? (
                      <>
                        <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />
                        Creating Account...
                      </>
                    ) : 'Sign Up'}
                  </Button>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  <Box textAlign="center">
                    <Button
                      component={Link}
                      to="/login"
                      startIcon={<ArrowBackIcon />}
                      sx={{ textTransform: 'none' }}
                    >
                      Already have an account? Sign In
                    </Button>
                  </Box>
                </Box>
              )}
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default Signup;
