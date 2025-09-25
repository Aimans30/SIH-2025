import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import styles from './Login.module.css';
import CivicLogo from '../components/common/CivicLogo';

// Icon components
const PersonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const AdminIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
  </svg>
);

const VisibilityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
  </svg>
);

const VisibilityOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
  </svg>
);

const LoginIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z" />
  </svg>
);

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isUser, setIsUser] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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
      login(response);
    } catch (error) {
      console.error('Login error:', error);
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
    <div className={styles.loginPage}>
      <div className={styles.container}>
        {/* Left side - Information */}
        <div className={styles.infoSection}>
          <h1 className={styles.infoTitle}>Welcome to CivicOne</h1>
          <p className={styles.infoSubtitle}>
            Access your account to report and track civic issues in your community. Together, we can make our city better.
          </p>
          
          <div className={styles.featureList}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <div className={styles.featureText}>
                <h3 className={styles.featureTitle}>Easy Reporting</h3>
                <p className={styles.featureDescription}>Report issues in just a few clicks with our intuitive interface.</p>
              </div>
            </div>
            
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z" />
                </svg>
              </div>
              <div className={styles.featureText}>
                <h3 className={styles.featureTitle}>Real-time Updates</h3>
                <p className={styles.featureDescription}>Track the status of your reported issues in real-time.</p>
              </div>
            </div>
            
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                </svg>
              </div>
              <div className={styles.featureText}>
                <h3 className={styles.featureTitle}>Secure Platform</h3>
                <p className={styles.featureDescription}>Your data is protected with industry-standard security measures.</p>
              </div>
            </div>
            
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
              </div>
              <div className={styles.featureText}>
                <h3 className={styles.featureTitle}>Community Driven</h3>
                <p className={styles.featureDescription}>Join thousands of citizens making a difference in their communities.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side - Login Form */}
        <div className={styles.loginFormContainer}>
          <div className={styles.loginHeader}>
            <div className={styles.logoContainer}>
              <CivicLogo size="large" color="light" />
            </div>
            <h2 className={styles.welcomeText}>Sign In</h2>
            <p className={styles.subText}>Access your CivicOne account</p>
            <div className={styles.divider}></div>
          </div>
          
          {/* Toggle between user and admin */}
          <div className={styles.toggleContainer}>
            <div 
              className={`${styles.toggleOption} ${isUser ? styles.active : ''}`} 
              onClick={() => setIsUser(true)}
            >
              <PersonIcon />
              <span>Citizen</span>
            </div>
            <div 
              className={`${styles.toggleOption} ${!isUser ? styles.active : ''}`} 
              onClick={() => setIsUser(false)}
            >
              <AdminIcon />
              <span>Administrator</span>
            </div>
          </div>
          
          {error && <div className={styles.errorMessage}>{error}</div>}
          
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="phone">
                {isUser ? 'Phone Number' : 'Admin ID'}
              </label>
              <div className={styles.inputWrapper}>
                <input
                  className={styles.input}
                  type="text"
                  id="phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={isUser ? "Enter your phone number" : "Enter admin ID"}
                  required
                />
              </div>
            </div>
            
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="password">Password</label>
              <div className={styles.inputWrapper}>
                <input
                  className={styles.input}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button 
                  type="button" 
                  className={styles.visibilityToggle}
                  onClick={handleTogglePasswordVisibility}
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </button>
              </div>
            </div>
            
            <div className={styles.forgotPassword}>
              <a href="#" className={styles.forgotPasswordLink}>Forgot password?</a>
            </div>
            
            <button 
              type="submit" 
              className={styles.loginButton}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
              {!isLoading && <LoginIcon />}
            </button>
            
            
            <div className={styles.signupText}>
              Don't have an account? <Link to="/signup" className={styles.signupLink}>Sign up</Link>
            </div>
            
            <div className={styles.demoCredentials}>
              <p className={styles.demoTitle}>For demo purposes:</p>
              <p className={styles.demoText}>
                {isUser ? 
                  "Use phone: 1234567890, password: user123" : 
                  "Use ID: admin1, password: admin123"}
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;