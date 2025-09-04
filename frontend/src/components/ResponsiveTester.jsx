import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  ButtonGroup, 
  Paper, 
  Slider, 
  FormControlLabel,
  Switch,
  Tooltip,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import TabletIcon from '@mui/icons-material/Tablet';
import LaptopIcon from '@mui/icons-material/Laptop';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import SettingsIcon from '@mui/icons-material/Settings';

const ResponsiveTester = ({ children }) => {
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showRulers, setShowRulers] = useState(true);

  // Predefined device sizes
  const deviceSizes = [
    { name: 'Mobile S', width: 320, height: 568, icon: <PhoneIphoneIcon /> },
    { name: 'Mobile M', width: 375, height: 667, icon: <PhoneIphoneIcon /> },
    { name: 'Mobile L', width: 425, height: 812, icon: <PhoneIphoneIcon /> },
    { name: 'Tablet', width: 768, height: 1024, icon: <TabletIcon /> },
    { name: 'Laptop', width: 1024, height: 768, icon: <LaptopIcon /> },
    { name: 'Desktop', width: 1440, height: 900, icon: <DesktopWindowsIcon /> },
    { name: 'Full', width: window.innerWidth, height: window.innerHeight, icon: <DesktopWindowsIcon /> }
  ];

  // Common breakpoints
  const breakpoints = [
    { name: 'xs', value: 320 },
    { name: 'sm', value: 576 },
    { name: 'md', value: 768 },
    { name: 'lg', value: 992 },
    { name: 'xl', value: 1200 },
    { name: '2xl', value: 1400 }
  ];

  const handleDeviceSelect = (deviceWidth, deviceHeight) => {
    setWidth(deviceWidth);
    setHeight(deviceHeight);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  return (
    <Box sx={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      bgcolor: 'background.default',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header with controls */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: isCollapsed ? 1 : 2, 
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: 0,
          transition: 'all 0.3s ease'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: isCollapsed ? 0 : 2 }}>
          <Typography variant="h6" component="h2" sx={{ display: 'flex', alignItems: 'center' }}>
            <SettingsIcon sx={{ mr: 1 }} /> Responsive Tester
          </Typography>
          <Box>
            <Tooltip title={isCollapsed ? "Expand" : "Collapse"}>
              <IconButton onClick={toggleCollapse} size="small">
                {isCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Close Tester">
              <IconButton 
                onClick={() => window.location.href = window.location.pathname.replace('/responsive-test', '')} 
                size="small" 
                color="error"
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {!isCollapsed && showControls && (
          <>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <ButtonGroup variant="outlined" size="small">
                {deviceSizes.map((device) => (
                  <Tooltip key={device.name} title={`${device.name} (${device.width}x${device.height})`}>
                    <Button 
                      onClick={() => handleDeviceSelect(device.width, device.height)}
                      startIcon={device.icon}
                      color={width === device.width ? 'primary' : 'inherit'}
                    >
                      {device.name}
                    </Button>
                  </Tooltip>
                ))}
              </ButtonGroup>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <Box sx={{ width: 200 }}>
                <Typography variant="body2" gutterBottom>
                  Width: {width}px
                </Typography>
                <Slider
                  value={width}
                  onChange={(_, newValue) => setWidth(newValue)}
                  min={320}
                  max={window.innerWidth}
                  valueLabelDisplay="auto"
                />
              </Box>
              
              <Box sx={{ width: 200 }}>
                <Typography variant="body2" gutterBottom>
                  Height: {height}px
                </Typography>
                <Slider
                  value={height}
                  onChange={(_, newValue) => setHeight(newValue)}
                  min={320}
                  max={window.innerHeight}
                  valueLabelDisplay="auto"
                />
              </Box>

              <FormControlLabel
                control={
                  <Switch 
                    checked={showRulers} 
                    onChange={() => setShowRulers(!showRulers)} 
                    size="small"
                  />
                }
                label="Show Rulers"
              />
            </Box>

            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {breakpoints.map((bp) => (
                <Tooltip key={bp.name} title={`${bp.name} breakpoint: ${bp.value}px`}>
                  <Button
                    variant="outlined"
                    size="small"
                    color={width >= bp.value && width < (breakpoints[breakpoints.indexOf(bp) + 1]?.value || Infinity) ? 'secondary' : 'inherit'}
                    onClick={() => setWidth(bp.value)}
                    sx={{ minWidth: 'auto', px: 1 }}
                  >
                    {bp.name}
                  </Button>
                </Tooltip>
              ))}
            </Box>
          </>
        )}
      </Paper>

      {/* Content frame */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        p: 2, 
        bgcolor: '#f0f0f0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Horizontal ruler */}
        {showRulers && (
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            height: 20, 
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            overflow: 'hidden'
          }}>
            {Array.from({ length: Math.ceil(width / 100) }).map((_, i) => (
              <Box key={i} sx={{ 
                width: 100, 
                height: '100%', 
                borderRight: '1px solid',
                borderColor: 'divider',
                position: 'relative',
                '&::after': {
                  content: `"${(i + 1) * 100}"`,
                  position: 'absolute',
                  bottom: 2,
                  right: 5,
                  fontSize: '0.6rem',
                  color: 'text.secondary'
                }
              }} />
            ))}
          </Box>
        )}

        {/* Vertical ruler */}
        {showRulers && (
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            bottom: 0, 
            width: 20, 
            bgcolor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {Array.from({ length: Math.ceil(height / 100) }).map((_, i) => (
              <Box key={i} sx={{ 
                height: 100, 
                width: '100%', 
                borderBottom: '1px solid',
                borderColor: 'divider',
                position: 'relative',
                '&::after': {
                  content: `"${(i + 1) * 100}"`,
                  position: 'absolute',
                  bottom: 2,
                  left: 2,
                  fontSize: '0.6rem',
                  color: 'text.secondary'
                }
              }} />
            ))}
          </Box>
        )}

        {/* The iframe containing the actual content */}
        <Box 
          component="iframe"
          src={window.location.pathname.replace('/responsive-test', '')}
          sx={{
            width: `${width}px`,
            height: `${height}px`,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: 3,
            bgcolor: 'background.paper',
            transition: 'width 0.3s ease, height 0.3s ease',
            ml: showRulers ? '20px' : 0,
            mt: showRulers ? '20px' : 0
          }}
          title="Responsive Tester"
        />
      </Box>

      {/* Footer with current size */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 1, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: 0
        }}
      >
        <Typography variant="body2">
          Current size: {width} × {height}px
        </Typography>
        <Button 
          size="small" 
          variant="text" 
          onClick={toggleControls}
          startIcon={showControls ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        >
          {showControls ? 'Hide Controls' : 'Show Controls'}
        </Button>
      </Paper>
    </Box>
  );
};

export default ResponsiveTester;
