import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitComplaint, validateImage } from '../services/api';
import Alert from '../components/common/Alert';
import ImageValidationFeedback from '../components/common/ImageValidationFeedback';
import styles from './SubmitComplaint.module.css';
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
  IconButton,
  Tabs,
  Tab,
  Dialog,
  DialogContent,
  DialogActions
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CategoryIcon from '@mui/icons-material/Category';

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
  const [errorOpen, setErrorOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [imageTab, setImageTab] = useState(0); // 0 for upload, 1 for camera
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [imageValidation, setImageValidation] = useState({
    isValid: null,
    feedback: '',
    suggestedAction: '',
    confidence: null
  });
  const [isValidating, setIsValidating] = useState(false);
  const [validationComplete, setValidationComplete] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      const userData = JSON.parse(loggedInUser);
      setUser(userData);
    }
    
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

  // Function to manually verify image with Gemini
  const handleVerifyImage = async () => {
    console.group('🖼️ Manual Image Verification');
    
    // Check if we have all required fields
    if (!formData.image || !formData.type || !formData.description.trim()) {
      console.log('❌ Missing required fields for verification');
      setError('Please fill in all fields (type, description) and upload an image before verifying.');
      setErrorOpen(true);
      console.groupEnd();
      return;
    }
    
    console.log('🔍 Starting manual image verification...');
    setIsValidating(true);
    setValidationComplete(false);
    
    try {
      console.log('📤 Sending image to verification service...');
      console.time('⏱️ Image Verification Duration');
      const result = await validateImage(formData.image, formData.type, formData.description);
      console.timeEnd('⏱️ Image Verification Duration');
      
      console.log('📥 Verification result received:', result);
      
      // Check if the feedback contains JSON that might have a different isValid value
      if (result.feedback && result.feedback.includes('```json')) {
        console.log('🔎 Detected JSON in feedback, checking for consistency...');
        const jsonMatch = result.feedback.match(/\{[\s\S]*?\}/); // Match JSON object
        if (jsonMatch) {
          try {
            const extractedJson = JSON.parse(jsonMatch[0]);
            if (extractedJson.isValid !== undefined && extractedJson.isValid !== result.isValid) {
              console.warn('⚠️ Inconsistency detected in component: result.isValid =', result.isValid, 
                          'but JSON in feedback has isValid =', extractedJson.isValid);
              console.log('🔄 Correcting isValid value based on JSON in feedback');
              result.isValid = extractedJson.isValid;
            }
          } catch (e) {
            console.error('❌ Error parsing JSON in feedback:', e);
          }
        }
      }
      
      console.log(`🎯 Final result: ${result.isValid ? '✅ Valid' : '❌ Invalid'}`);
      setImageValidation(result);
      setValidationComplete(true);
    } catch (error) {
      console.error('❌ Error verifying image:', error);
      console.log('⚠️ Creating fallback verification result');
      
      const fallbackResult = {
        isValid: false,
        feedback: 'We encountered a technical issue while verifying your image: ' + error.message + '\n\nThis is not related to your image content, but rather a system limitation.',
        suggestedAction: 'You can try again with the same image or upload a different one that clearly shows the issue'
      };
      
      console.log('🔧 Fallback verification result:', fallbackResult);
      setImageValidation(fallbackResult);
      setValidationComplete(true);
    } finally {
      console.log(`🔔 Verification process completed`);
      setIsValidating(false);
      console.groupEnd();
    }
  };
  
  // Reset validation state when type or description changes
  useEffect(() => {
    if (formData.image && validationComplete) {
      console.log('🔄 Form fields changed, resetting validation state');
      setValidationComplete(false);
      setImageValidation({
        isValid: null,
        feedback: '',
        suggestedAction: '',
        confidence: null
      });
    }
  }, [formData.type, formData.description]);

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
      setErrorOpen(true);
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      setErrorOpen(true);
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
    
    // Reset validation state when a new image is selected
    setImageValidation({
      isValid: null,
      feedback: '',
      suggestedAction: '',
      confidence: null
    });
    setValidationComplete(false);
    
    setError('');
    setErrorOpen(false);
  };

  // Camera handling functions
  const handleOpenCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setCameraOpen(true);
      
      // Set timeout to ensure DOM is ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions.');
      setErrorOpen(true);
    }
  };

  const handleCloseCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraOpen(false);
  };

  const handleCaptureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          // Create a File object from the blob
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
          
          // Update form data
          setFormData(prev => ({
            ...prev,
            image: file
          }));
          
          // Create preview
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreview(reader.result);
          };
          reader.readAsDataURL(blob);
          
          // Reset validation state when a new image is captured
          setImageValidation({
            isValid: null,
            feedback: '',
            suggestedAction: '',
            confidence: null
          });
          setValidationComplete(false);
          
          // Close camera
          handleCloseCamera();
        }
      }, 'image/jpeg', 0.8);
    }
  };

  const handleTabChange = (event, newValue) => {
    setImageTab(newValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorOpen(false);
    
    // Validate form
    if (!formData.type) {
      setError('Please select an issue type');
      setErrorOpen(true);
      return;
    }
    
    if (!formData.description) {
      setError('Please provide a description');
      setErrorOpen(true);
      return;
    }
    
    // Image is now optional
    
    if (!formData.location.lat || !formData.location.lng) {
      setError('Location information is missing. Please enable location services.');
      setErrorOpen(true);
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
      setSuccessOpen(true);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/user-dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error submitting complaint:', error);
      
      // Check if the error is related to image validation
      if (error.message && error.message.includes('Image validation failed')) {
        // Extract the feedback and suggested action from the error message
        const errorMsg = error.message;
        setError(errorMsg);
        
        // Try to parse the validation details from the error message
        try {
          // Extract feedback and suggested action using regex
          const feedbackMatch = errorMsg.match(/Image validation failed: (.+?)\./i);
          const actionMatch = errorMsg.match(/\. ([^.]+)$/i);
          
          const feedback = feedbackMatch ? feedbackMatch[1] : 'The image does not appear to match the complaint';
          const suggestedAction = actionMatch ? actionMatch[1] : 'Please upload a more relevant image';
          
          // Update the validation state
          setImageValidation({
            isValid: false,
            feedback,
            suggestedAction,
            confidence: 0 // We don't have this from the error message
          });
        } catch (parseError) {
          console.error('Error parsing validation message:', parseError);
          // Set a generic validation error
          setImageValidation({
            isValid: false,
            feedback: 'The image does not appear to match the complaint type',
            suggestedAction: 'Please upload a more relevant image',
            confidence: 0
          });
        }
        
        // Don't clear the image automatically, let the user decide via the feedback component
      } else {
        setError(error.message || 'Failed to submit complaint. Please try again.');
      }
      
      setErrorOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCloseError = () => {
    setErrorOpen(false);
  };
  
  const handleCloseSuccess = () => {
    setSuccessOpen(false);
  };
  
  const handleRetryImage = () => {
    // Clear the current image
    setFormData(prev => ({
      ...prev,
      image: null
    }));
    setImagePreview(null);
    
    // Reset validation state
    setImageValidation({
      isValid: null,
      feedback: '',
      suggestedAction: '',
      confidence: null
    });
  };
  
  const handleContinueWithoutImage = () => {
    // Clear the image but keep the validation state for reference
    setFormData(prev => ({
      ...prev,
      image: null
    }));
    setImagePreview(null);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} className={styles.formContainer}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h4" component="h1" className={styles.pageTitle}>
            CivicOne - Report an Issue
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/user-dashboard')}
          >
            Back to Dashboard
          </Button>
        </Box>
        
        <Alert 
          severity="error" 
          message={error}
          open={errorOpen}
          onClose={handleCloseError}
        />
        
        <Alert 
          severity="success" 
          message="Complaint submitted successfully! Redirecting to dashboard..."
          open={successOpen}
          onClose={handleCloseSuccess}
        />
        
        {success ? (
          <Box textAlign="center" py={4} className={styles.formSection}>
            <CheckCircleOutlineIcon sx={{ fontSize: 60, color: '#4caf50', mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 2, color: '#4caf50', fontWeight: 600 }}>Thank you for your report!</Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>Your complaint has been submitted successfully.</Typography>
            <Typography variant="body2" color="text.secondary">You will be redirected to your dashboard shortly...</Typography>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3} sx={{ display: 'flex', flexDirection: 'column' }}>
              <Grid className={styles.formSection}>
                <Typography variant="h6" className={styles.sectionTitle}>
                  <CategoryIcon sx={{ mr: 1 }} /> Issue Information
                </Typography>
                
                <div className={styles.inputGroup}>
                  <FormControl fullWidth required>
                    <InputLabel id="issue-type-label">Issue Type</InputLabel>
                    <Select
                      labelId="issue-type-label"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      label="Issue Type"
                      className={styles.select}
                    >
                      <MenuItem value="">Select Issue Type</MenuItem>
                      <MenuItem value="Broken Road">Broken Road</MenuItem>
                      <MenuItem value="Garbage Collection">Garbage Collection</MenuItem>
                      <MenuItem value="Street Light">Street Light</MenuItem>
                      <MenuItem value="Water Supply">Water Supply</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                
                <div className={styles.inputGroup}>
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
                    className={styles.textarea}
                  />
                </div>
              </Grid>
              
              <Grid className={styles.formSection}>
                <Typography variant="h6" className={styles.sectionTitle}>
                  <CameraAltIcon sx={{ mr: 1 }} /> Add Image (Optional)
                </Typography>
                
                <div className={styles.imageUploadSection}>
                  <div className={styles.tabsContainer}>
                    <Tabs value={imageTab} onChange={handleTabChange} aria-label="image upload options" sx={{ mb: 2 }}>
                      <Tab icon={<PhotoLibraryIcon />} label="Upload" className={imageTab === 0 ? styles.tabActive : styles.tab} />
                      <Tab icon={<CameraAltIcon />} label="Camera" className={imageTab === 1 ? styles.tabActive : styles.tab} />
                    </Tabs>
                  </div>
                  
                  {imageTab === 0 ? (
                    <Button
                      variant="contained"
                      component="label"
                      startIcon={<CloudUploadIcon />}
                      className={styles.uploadButton}
                    >
                      Choose File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        hidden
                      />
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      startIcon={<CameraAltIcon />}
                      onClick={handleOpenCamera}
                      className={styles.uploadButton}
                    >
                      Open Camera
                    </Button>
                  )}
                </div>
                
                {imagePreview && (
                  <div className={styles.imagePreviewContainer}>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className={styles.imagePreview}
                    />
                    <IconButton 
                      size="small" 
                      className={styles.removeImageButton}
                      onClick={() => {
                        setImagePreview(null);
                        setFormData(prev => ({ ...prev, image: null }));
                        // Reset validation state
                        setImageValidation({
                          isValid: null,
                          feedback: '',
                          suggestedAction: '',
                          confidence: null
                        });
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </div>
                )}
                
                {/* Verify Image Button */}
                {imagePreview && formData.type && formData.description.trim() && (
                  <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={handleVerifyImage}
                      disabled={isValidating}
                      startIcon={isValidating ? <CircularProgress size={20} /> : <CheckCircleOutlineIcon />}
                      sx={{ 
                        backgroundColor: '#9c27b0',
                        '&:hover': { backgroundColor: '#7b1fa2' },
                        padding: '10px 20px',
                        fontWeight: 600
                      }}
                    >
                      {isValidating ? 'Verifying with AI...' : 'Verify Image with AI'}
                    </Button>
                  </div>
                )}
                
                {/* Image Validation Feedback */}
                {imagePreview && imageValidation.isValid !== null && (
                  <ImageValidationFeedback
                    isValid={imageValidation.isValid}
                    feedback={imageValidation.feedback}
                    suggestedAction={imageValidation.suggestedAction}
                    onRetry={handleRetryImage}
                    onContinue={handleContinueWithoutImage}
                  />
                )}
                
                {/* Camera Dialog */}
                <Dialog 
                  open={cameraOpen} 
                  onClose={handleCloseCamera}
                  maxWidth="md"
                  fullWidth
                >
                  <DialogContent>
                    <Box sx={{ position: 'relative' }}>
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        style={{ width: '100%', borderRadius: '4px' }} 
                      />
                      <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </Box>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleCloseCamera}>Cancel</Button>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={handleCaptureImage}
                      startIcon={<CameraAltIcon />}
                    >
                      Capture
                    </Button>
                  </DialogActions>
                </Dialog>
              </Grid>
              
              <Grid className={styles.formSection}>
                <Typography variant="h6" className={styles.sectionTitle}>
                  <LocationOnIcon sx={{ mr: 1 }} /> Location Information
                </Typography>
                
                <Paper variant="outlined" className={styles.locationSection}>
                  {formData.location.lat && formData.location.lng ? (
                    <div className={styles.locationInfo}>
                      <Typography variant="body1" className={styles.locationAddress}>
                        <strong>Address:</strong> {formData.location.address}
                      </Typography>
                      <Typography variant="body2" className={styles.locationCoordinates}>
                        <strong>Coordinates:</strong> {formData.location.lat.toFixed(6)}, {formData.location.lng.toFixed(6)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Location captured automatically from your device
                      </Typography>
                    </div>
                  ) : (
                    <Box display="flex" alignItems="center">
                      <CircularProgress size={20} sx={{ mr: 1 }} className={styles.loadingSpinner} />
                      <Typography>Getting your location...</Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
              
              {error && (
                <Grid className={styles.formSection}>
                  <Alert severity="error">{error}</Alert>
                </Grid>
              )}
              
              <Grid className={styles.formSection}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={isSubmitting || 
                    // Disable if validation is in progress
                    isValidating ||
                    // Disable if image validation failed
                    (validationComplete && !imageValidation.isValid)
                  }
                  className={styles.submitButton}
                >
                  {isSubmitting ? (
                    <>
                      <CircularProgress size={24} className={styles.loadingSpinner} />
                      Submitting...
                    </>
                  ) : isValidating ? (
                    <>
                      <CircularProgress size={24} className={styles.loadingSpinner} />
                      Verifying Image...
                    </>
                  ) : validationComplete && !imageValidation.isValid ? (
                    'Image Verification Failed'
                  ) : (
                    'Submit Report'
                  )}
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
