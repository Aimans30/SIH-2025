import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  useTheme
} from '@mui/material';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

const Features = () => {
  const theme = useTheme();

  const features = [
    {
      icon: <ReportProblemIcon sx={{ fontSize: 60, color: '#1976d2' }} />,
      title: 'Report Issues',
      description: 'Easily report civic problems with location details and images. Our system categorizes and routes your complaint to the right department automatically.'
    },
    {
      icon: <TrackChangesIcon sx={{ fontSize: 60, color: '#1976d2' }} />,
      title: 'Track Progress',
      description: 'Monitor the status of your complaints in real-time. Get instant updates as your issue moves through the resolution process with detailed timeline.'
    },
    {
      icon: <SupportAgentIcon sx={{ fontSize: 60, color: '#1976d2' }} />,
      title: 'Connect with Authorities',
      description: 'Direct communication channel with local government departments. Provide feedback on resolution quality and engage with officials.'
    }
  ];

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: '#ffffff',
        position: 'relative',
        width: '100vw',
        margin: 0,
        padding: 0
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
              color: '#1a202c',
              position: 'relative'
            }}
          >
            Key Features
            <Box
              sx={{
                position: 'absolute',
                bottom: -10,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 80,
                height: 4,
                backgroundColor: '#1976d2',
                borderRadius: 2
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
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(25, 118, 210, 0.1)',
                  transition: 'all 0.3s ease',
                  backgroundColor: '#fff',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: 'linear-gradient(90deg, #1976d2, #1565c0)',
                    transform: 'scaleX(0)',
                    transformOrigin: 'left',
                    transition: 'transform 0.3s ease'
                  },
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(25, 118, 210, 0.15)',
                    '&::before': {
                      transform: 'scaleX(1)'
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
                      mb: 3,
                      p: 2,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(25, 118, 210, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.2)',
                        transform: 'scale(1.1)'
                      }
                    }}
                  >
                    {feature.icon}
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
