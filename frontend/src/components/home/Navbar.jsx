import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

const Navbar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleMenuClose();
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Login', path: '/login' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ];

  return (
    <AppBar 
      position="static" 
      sx={{ 
        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        width: '100vw',
        margin: 0,
        padding: 0
      }}
    >
      <Container maxWidth={false} sx={{ width: '100%', margin: 0, padding: 0 }}>
        <Toolbar 
          disableGutters 
          sx={{ 
            minHeight: { xs: 64, md: 80 },
            px: { xs: 3, md: 6 }
          }}
        >
          {/* Logo Section */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              flexGrow: 1,
              cursor: 'pointer'
            }}
            onClick={() => navigate('/')}
          >
            <ReportProblemIcon 
              sx={{ 
                fontSize: { xs: 28, md: 32 }, 
                mr: 2,
                color: '#fff'
              }} 
            />
            <Typography
              variant="h5"
              component="div"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.2rem', md: '1.5rem' },
                color: '#fff',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              Citizen Grievance Portal
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile ? (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  color="inherit"
                  onClick={() => navigate(item.path)}
                  sx={{
                    mx: 1,
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    fontSize: '1rem',
                    borderRadius: 2,
                    textTransform: 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          ) : (
            /* Mobile Navigation */
            <>
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleMenuOpen}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                sx={{
                  '& .MuiPaper-root': {
                    backgroundColor: '#1976d2',
                    color: '#fff',
                    minWidth: 200
                  }
                }}
              >
                {navItems.map((item) => (
                  <MenuItem 
                    key={item.label}
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      py: 2,
                      px: 3,
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    {item.label}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
