import React from 'react';
import { Alert as MuiAlert, Snackbar } from '@mui/material';

/**
 * Alert component for displaying success, error, warning, and info messages
 * @param {Object} props - Component props
 * @param {string} props.severity - Alert type: 'error', 'warning', 'info', 'success'
 * @param {string} props.message - Alert message
 * @param {boolean} props.open - Whether the alert is visible
 * @param {function} props.onClose - Function to call when alert is closed
 * @param {number} props.autoHideDuration - Time in ms before alert auto-hides
 */
const Alert = ({
  severity = 'info',
  message,
  open,
  onClose,
  autoHideDuration = 6000,
}) => {
  if (!message) return null;

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <MuiAlert
        elevation={6}
        variant="filled"
        onClose={onClose}
        severity={severity}
      >
        {message}
      </MuiAlert>
    </Snackbar>
  );
};

export default Alert;