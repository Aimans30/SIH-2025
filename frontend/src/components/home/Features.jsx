import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  useTheme,
  Grid
} from '@mui/material';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

const Features = () => {
  const theme = useTheme();

  const features = [
    {
      icon: <ReportProblemIcon sx={{ fontSize: 70, color: '#ff6b6b' }} />,
      title: '📱 Instant Reporting',
      description: 'Snap, report, done! Upload photos, add location, and describe issues in seconds. AI-powered categorization ensures your report reaches the right department instantly.',
      gradient: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
      emoji: '🚨'
    },
    {
      icon: <TrackChangesIcon sx={{ fontSize: 70, color: '#48dbfb' }} />,
      title: '⚡ Real-time Tracking',
      description: 'Watch your issues come to life! Get live updates, progress photos, and estimated completion times. Never wonder about your complaint status again.',
      gradient: 'linear-gradient(135deg, #48dbfb 0%, #0abde3 100%)',
      emoji: '📊'
    },
    {
      icon: <SupportAgentIcon sx={{ fontSize: 70, color: '#ff9ff3' }} />,
      title: '🤝 Direct Connect',
      description: 'Chat directly with officials, rate services, and provide feedback. Build stronger communities through transparent communication.',
      gradient: 'linear-gradient(135deg, #ff9ff3 0%, #f368e0 100%)',
      emoji: '💬'
    }
  ];

  return (
    <Box
      sx={{
        py: { xs: 10, md: 16 },
        background: 'linear-gradient(135deg, #f8f9ff 0%, #e8eaff 50%, #f0f2ff 100%)',
        position: 'relative',
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
          background: 'radial-gradient(circle at 30% 20%, rgba(102, 126, 234, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(240, 147, 251, 0.1) 0%, transparent 50%)',
          zIndex: 0
        }
      }}
    >
      <Container maxWidth={false} sx={{ position: 'relative', zIndex: 1, px: { xs: 3, md: 6 }, mx: 0, width: '100%', maxWidth: '100% !important', left: 0, right: 0 }}>
        <Box textAlign="center" mb={8}>
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontSize: { xs: '3rem', md: '4rem' },
              fontWeight: 900,
              mb: 4,
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              position: 'relative',
              letterSpacing: '-0.02em'
            }}
          >
            ✨ Why Choose CivicOne?
            <Box
              sx={{
                position: 'absolute',
                bottom: -15,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 120,
                height: 6,
                background: 'linear-gradient(45deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3)',
                borderRadius: 3,
                animation: 'shimmer 2s ease-in-out infinite',
                '@keyframes shimmer': {
                  '0%, 100%': { opacity: 0.8 },
                  '50%': { opacity: 1 }
                }
              }}
            />
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#64748b',
              maxWidth: '600px',
              mx: 'auto',
              fontSize: { xs: '1.1rem', md: '1.25rem' },
              lineHeight: 1.6
            }}
          >
            Our platform provides a seamless experience for citizens to report and track civic issues in their community.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 4,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                  border: 'none',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(20px)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 6,
                    background: feature.gradient,
                    transform: 'scaleX(0)',
                    transformOrigin: 'left',
                    transition: 'transform 0.4s ease'
                  },
                  '&::after': {
                    content: `"${feature.emoji}"`,
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    fontSize: '2rem',
                    opacity: 0.1,
                    transition: 'all 0.4s ease'
                  },
                  '&:hover': {
                    transform: 'translateY(-15px) scale(1.02)',
                    boxShadow: '0 25px 80px rgba(0,0,0,0.15)',
                    '&::before': {
                      transform: 'scaleX(1)'
                    },
                    '&::after': {
                      opacity: 0.3,
                      transform: 'scale(1.2) rotate(10deg)'
                    }
                  }
                }}
              >
                <CardContent
                  sx={{
                    flexGrow: 1,
                    textAlign: 'center',
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  <Box
                    sx={{
                      mb: 4,
                      p: 3,
                      borderRadius: '50%',
                      background: feature.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.4s ease',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: -2,
                        left: -2,
                        right: -2,
                        bottom: -2,
                        background: feature.gradient,
                        borderRadius: '50%',
                        opacity: 0,
                        transition: 'opacity 0.4s ease'
                      },
                      '&:hover': {
                        transform: 'scale(1.15) rotate(5deg)',
                        boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
                        '&::before': {
                          opacity: 0.3
                        }
                      }
                    }}
                  >
                    <Box sx={{ position: 'relative', zIndex: 1, color: 'white' }}>
                      {feature.icon}
                    </Box>
                  </Box>
                  
                  <Typography
                    variant="h5"
                    component="h3"
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      color: '#1a202c'
                    }}
                  >
                    {feature.title}
                  </Typography>
                  
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#64748b',
                      lineHeight: 1.7,
                      fontSize: '1rem'
                    }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Features;
