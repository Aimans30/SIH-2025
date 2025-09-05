import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LoginIcon from '@mui/icons-material/Login';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isUser, setIsUser] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Loading state for API calls
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Validate inputs
    if (!phoneNumber) {
      setError('Phone number is required');
      setIsLoading(false);
      return;
    }
    
    if (!password) {
      setError('Password is required');
      setIsLoading(false);
      return;
    }
    
    try {
      // Call the API service for authentication
      console.log('Attempting login with:', { phone: phoneNumber });
      const response = await loginUser({ phone: phoneNumber, password });
      
      console.log('Login successful:', response);
      
      // Use the login function from AuthContext
      // This will handle storing user info and navigation
      login(response);
      
      // No need for manual navigation as AuthContext handles it
    } catch (error) {
      console.error('Login error:', error);
      // More descriptive error message
      if (error.message === 'Failed to fetch') {
        setError('Unable to connect to the server. Please check your internet connection.');
      } else {
        setError(error.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Card elevation={4}>
        <CardContent sx={{ p: 4 }}>
          <Box textAlign="center" mb={4}>
            <Typography variant="h4" component="h1" gutterBottom>
              Civic Issue Reporting Platform
            </Typography>
          </Box>
          
          <Box display="flex" justifyContent="center" mb={4}>
            <ToggleButtonGroup
              value={isUser ? 'user' : 'admin'}
              exclusive
              onChange={(e, newValue) => {
                if (newValue !== null) {
                  setIsUser(newValue === 'user');
                }
              }}
              aria-label="login type"
              fullWidth
            >
              <ToggleButton value="user" aria-label="user login">
                <PersonIcon sx={{ mr: 1 }} />
                User Login
              </ToggleButton>
              <ToggleButton value="admin" aria-label="admin login">
                <AdminPanelSettingsIcon sx={{ mr: 1 }} />
                Admin Login
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="phone"
              label={isUser ? 'Phone Number' : 'Admin ID'}
              name="phone"
              autoComplete={isUser ? 'tel' : 'username'}
              autoFocus
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder={isUser ? "Enter your phone number" : "Enter admin ID"}
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
            />
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
              sx={{ py: 1.5 }}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box textAlign="center" sx={{ mt: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              For demo purposes:
            </Typography>
            <Typography variant="body2" color="primary" gutterBottom>
              {isUser ? 
                "Use phone: 1234567890, password: user123" : 
                "Use ID: admin1, password: admin123"}
            </Typography>
            
            <Box mt={3} pt={2} borderTop={1} borderColor="divider">
              <Button 
                component={Link} 
                to="/ui-showcase" 
                variant="text" 
                size="small" 
                color="secondary"
              >
                View UI Components Showcase
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Login;
