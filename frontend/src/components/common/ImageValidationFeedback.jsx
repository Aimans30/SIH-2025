import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import styles from './ImageValidationFeedback.module.css';

/**
 * Component to display image validation feedback from Gemini API
 */
const ImageValidationFeedback = ({ 
  isValid, 
  feedback, 
  suggestedAction,
  confidence,
  onRetry,
  onContinue
}) => {
  // If no validation has been performed yet, don't show anything
  if (isValid === null) return null;
  
  const containerClass = `${styles.validationContainer} ${isValid ? styles.validSuccess : styles.validError}`;
  
  return (
    <div className={containerClass}>
      <div className={styles.header}>
        {isValid ? (
          <CheckCircleOutlineIcon className={`${styles.icon} ${styles.iconSuccess}`} />
        ) : (
          <ErrorOutlineIcon className={`${styles.icon} ${styles.iconError}`} />
        )}
        <h3 className={`${styles.title} ${isValid ? styles.titleSuccess : styles.titleError}`}>
          {isValid ? 'Image Validated' : 'Image Validation Failed'}
        </h3>
      </div>
      
      <div className={styles.content}>
        <div className={styles.feedbackBox}>
          <h4 className={styles.feedbackTitle}>Feedback:</h4>
          <p className={styles.feedbackText}>
            {(() => {
              // Handle case where feedback contains JSON
              if (feedback && feedback.includes('```json')) {
                // Extract the actual feedback from the JSON response
                const jsonMatch = feedback.match(/\{[\s\S]*?\}/); // Match JSON object
                if (jsonMatch) {
                  try {
                    const jsonObj = JSON.parse(jsonMatch[0]);
                    
                    // IMPORTANT: If the extracted JSON has a different isValid value than what we're showing,
                    // log a warning about the inconsistency
                    if (jsonObj.isValid !== undefined && jsonObj.isValid !== isValid) {
                      console.warn('⚠️ Inconsistency detected: Component isValid:', isValid, 
                                  'but extracted JSON isValid:', jsonObj.isValid);
                    }
                    
                    return jsonObj.feedback || feedback;
                  } catch (e) {
                    console.error('Error parsing JSON in feedback:', e);
                    // If JSON parsing fails, return the original feedback
                    return feedback;
                  }
                }
              }
              
              // Handle technical error message
              if (!feedback || feedback.includes('Unable to validate image due to technical issues')) {
                return 'The image validation could not be completed. Please ensure your image clearly shows the issue described in your complaint.';
              }
              
              // Default case - return the feedback as is
              return feedback;
            })()}
          </p>
        </div>
        
        {!isValid && (
          <div className={styles.validationRules}>
            <h4 className={styles.rulesTitle}>Validation Rules:</h4>
            <ul className={styles.rulesList}>
              <li>Your image must clearly show the exact issue described in the complaint type</li>
              <li>The image must match the specific details mentioned in your description</li>
              <li>The issue must be clearly visible and well-documented in the image</li>
              <li>All three elements (type, description, image) must be perfectly aligned</li>
            </ul>
          </div>
        )}
        
        {!isValid && suggestedAction && (
          <p className={styles.suggestion}>
            <strong>Suggestion:</strong> {suggestedAction}
          </p>
        )}
      </div>
      
      {!isValid && (
        <div className={styles.actions}>
          <button 
            className={styles.retryButton}
            onClick={onRetry}
          >
            Upload Different Image
          </button>
          <button 
            className={styles.continueButton}
            onClick={onContinue}
          >
            Continue Without Image
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageValidationFeedback;
