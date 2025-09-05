import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You could log this to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Widget failed to load
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The map component encountered an error and was disabled to keep the dashboard working.
          </Typography>
          {process.env.NODE_ENV === 'development' && (
            <Box mt={2}>
              <Typography variant="caption" color="error">
                {String(this.state.error)}
              </Typography>
            </Box>
          )}
        </Paper>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
