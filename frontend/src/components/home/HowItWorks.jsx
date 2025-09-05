import {
  Box,
  Container,
  Grid,
  Typography,
  Avatar,
  useTheme
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ReportIcon from '@mui/icons-material/Report';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';

const HowItWorks = () => {
  const theme = useTheme();

  const steps = [
    {
      number: 1,
      icon: <PersonAddIcon sx={{ fontSize: 30, color: '#fff' }} />,
      title: 'Register & Login',
      description: 'Create an account using your phone number and verify your identity to get started with our platform.'
    },
    {
      number: 2,
      icon: <ReportIcon sx={{ fontSize: 30, color: '#fff' }} />,
      title: 'Submit Complaint',
      description: 'Provide detailed information about the issue, add location data, and upload supporting images for faster resolution.'
    },
    {
      number: 3,
      icon: <TrackChangesIcon sx={{ fontSize: 30, color: '#fff' }} />,
      title: 'Track Resolution',
      description: 'Monitor progress in real-time and receive updates until your issue is completely resolved by authorities.'
    }
  ];

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        color: '#fff',
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
          background: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M20 20c0 11.046-8.954 20-20 20v20h40V20H20z"/%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3
        }
      }}
    >
      <Container maxWidth={false} sx={{ position: 'relative', zIndex: 1, px: { xs: 3, md: 6 }, mx: 0, width: '100%' }}>
        <Box textAlign="center" mb={8}>
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              fontWeight: 700,
              mb: 3,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              position: 'relative'
            }}
          >
            How It Works
            <Box
              sx={{
                position: 'absolute',
                bottom: -10,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 80,
                height: 4,
                backgroundColor: '#fff',
                borderRadius: 2,
                opacity: 0.8
              }}
            />
          </Typography>
          <Typography
            variant="h6"
            sx={{
              opacity: 0.9,
              maxWidth: '600px',
              mx: 'auto',
              fontSize: { xs: '1.1rem', md: '1.25rem' },
              lineHeight: 1.6,
              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}
          >
            Our simple three-step process makes it easy to get your civic issues addressed quickly and efficiently.
          </Typography>
        </Box>

        <Grid container spacing={6}>
          {steps.map((step, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Box
                sx={{
                  textAlign: 'center',
                  position: 'relative',
                  '&::after': index < steps.length - 1 ? {
                    content: '""',
                    position: 'absolute',
                    top: '60px',
                    right: { xs: '50%', md: '-50%' },
                    transform: { xs: 'translateX(50%) rotate(90deg)', md: 'translateY(-50%)' },
                    width: { xs: '60px', md: '100px' },
                    height: '2px',
                    background: 'linear-gradient(90deg, rgba(255,255,255,0.6), rgba(255,255,255,0.2))',
                    display: { xs: 'none', md: 'block' }
                  } : {}
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    display: 'inline-block',
                    mb: 3
                  }}
                >
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
                      fontSize: '2rem',
                      fontWeight: 700,
                      boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                      border: '4px solid rgba(255,255,255,0.2)',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: -8,
                        left: -8,
                        right: -8,
                        bottom: -8,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))',
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                          '0%': {
                            transform: 'scale(1)',
                            opacity: 1
                          },
                          '50%': {
                            transform: 'scale(1.1)',
                            opacity: 0.7
                          },
                          '100%': {
                            transform: 'scale(1)',
                            opacity: 1
                          }
                        }
                      }
                    }}
                  >
                    {step.number}
                  </Avatar>
                  
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      opacity: 0.3
                    }}
                  >
                    {step.icon}
                  </Box>
                </Box>

                <Typography
                  variant="h4"
                  component="h3"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  {step.title}
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    opacity: 0.9,
                    lineHeight: 1.7,
                    fontSize: '1.1rem',
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}
                >
                  {step.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default HowItWorks;
