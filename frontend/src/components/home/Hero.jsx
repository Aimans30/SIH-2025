import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import InfoIcon from '@mui/icons-material/Info';

const Hero = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 30%, #0d47a1 70%, #0a3d91 100%)',
        color: '#fff',
        py: { xs: 8, md: 12 },
        position: 'relative',
        overflow: 'hidden',
        width: '100vw',
        margin: 0,
        padding: 0,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3
        }
      }}
    >
      <Container 
        maxWidth={false} 
        sx={{ 
          position: 'relative', 
          zIndex: 1,
          textAlign: 'center',
          px: { xs: 3, md: 6 },
          mx: 0,
          width: '100%'
        }}
      >
        <Box
          sx={{
            animation: 'fadeInUp 1s ease-out',
            '@keyframes fadeInUp': {
              from: {
                opacity: 0,
                transform: 'translateY(30px)'
              },
              to: {
                opacity: 1,
                transform: 'translateY(0)'
              }
            }
          }}
        >
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
              fontWeight: 800,
              mb: 3,
              textShadow: '0 4px 8px rgba(0,0,0,0.3)',
              background: 'linear-gradient(45deg, #fff 30%, #e3f2fd 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.2
            }}
          >
            Report & Track
            <br />
            Civic Issues
          </Typography>

          <Typography
            variant="h5"
            component="p"
            sx={{
              fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
              mb: 5,
              maxWidth: '800px',
              mx: 'auto',
              opacity: 0.95,
              fontWeight: 400,
              lineHeight: 1.6,
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            A comprehensive platform for citizens to report problems, track their resolution status, 
            and connect directly with local authorities for faster solutions.
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            justifyContent="center"
            alignItems="center"
            sx={{ mt: 4 }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<LoginIcon />}
              onClick={() => navigate('/login')}
              sx={{
                px: 4,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                backgroundColor: '#1565c0',
                color: '#fff',
                borderRadius: 3,
                textTransform: 'none',
                boxShadow: '0 8px 25px rgba(21, 101, 192, 0.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#0d47a1',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 35px rgba(21, 101, 192, 0.5)'
                }
              }}
            >
              Get Started
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<InfoIcon />}
              onClick={() => navigate('/about')}
              sx={{
                px: 4,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.5)',
                borderRadius: 3,
                textTransform: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderColor: '#fff',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 25px rgba(255,255,255,0.2)'
                }
              }}
            >
              Learn More
            </Button>
          </Stack>
        </Box>

        {/* Floating elements for visual appeal */}
        <Box
          sx={{
            position: 'absolute',
            top: '20%',
            left: '10%',
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.1)',
            animation: 'float 6s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-20px)' }
            },
            display: { xs: 'none', md: 'block' }
          }}
        />
        
        <Box
          sx={{
            position: 'absolute',
            top: '60%',
            right: '15%',
            width: 60,
            height: 60,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.08)',
            animation: 'float 8s ease-in-out infinite reverse',
            display: { xs: 'none', md: 'block' }
          }}
        />
      </Container>
    </Box>
  );
};

export default Hero;
