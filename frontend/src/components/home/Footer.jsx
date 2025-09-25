import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Link,
  IconButton,
  Divider,
  Stack,
  Grid
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

const Footer = () => {
  const navigate = useNavigate();

  const quickLinks = [
    { label: 'Home', path: '/' },
    { label: 'Login', path: '/login' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' },
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms of Service', path: '/terms' }
  ];

  const socialLinks = [
    { icon: <FacebookIcon />, label: 'Facebook', url: '#' },
    { icon: <TwitterIcon />, label: 'Twitter', url: '#' },
    { icon: <InstagramIcon />, label: 'Instagram', url: '#' },
    { icon: <LinkedInIcon />, label: 'LinkedIn', url: '#' }
  ];

  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #2c3e50 100%)',
        color: '#fff',
        pt: 8,
        pb: 4,
        mt: 'auto',
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
          background: 'url("data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Cpolygon points="10,0 20,10 10,20 0,10"/%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.5
        }
      }}
    >
      <Container maxWidth={false} sx={{ position: 'relative', zIndex: 1, px: { xs: 3, md: 6 }, mx: 0, width: '100%' }}>
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ReportProblemIcon sx={{ fontSize: 32, mr: 2, color: '#3498db' }} />
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: '#fff'
                  }}
                >
                  Citizen Grievance Portal
                </Typography>
              </Box>
              <Typography
                variant="body1"
                sx={{
                  mb: 3,
                  opacity: 0.9,
                  lineHeight: 1.7,
                  fontSize: '1rem'
                }}
              >
                A comprehensive platform connecting citizens with local authorities to resolve civic issues efficiently and transparently.
              </Typography>
              
              <Stack direction="row" spacing={1}>
                {socialLinks.map((social, index) => (
                  <IconButton
                    key={index}
                    href={social.url}
                    sx={{
                      color: '#bdc3c7',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        color: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        borderColor: '#3498db',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Stack>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 3,
                color: '#3498db',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -8,
                  left: 0,
                  width: 30,
                  height: 2,
                  backgroundColor: '#3498db',
                  borderRadius: 1
                }
              }}
            >
              Quick Links
            </Typography>
            <Stack spacing={2}>
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  component="button"
                  onClick={() => navigate(link.path)}
                  sx={{
                    color: '#bdc3c7',
                    textDecoration: 'none',
                    textAlign: 'left',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    paddingLeft: 0,
                    '&:hover': {
                      color: '#3498db',
                      paddingLeft: '8px'
                    },
                    '&::before': {
                      content: '"›"',
                      position: 'absolute',
                      left: -15,
                      opacity: 0,
                      transition: 'all 0.3s ease'
                    },
                    '&:hover::before': {
                      opacity: 1,
                      left: -8
                    }
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Services */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 3,
                color: '#3498db',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -8,
                  left: 0,
                  width: 30,
                  height: 2,
                  backgroundColor: '#3498db',
                  borderRadius: 1
                }
              }}
            >
              Our Services
            </Typography>
            <Stack spacing={2}>
              {[
                'Report Civic Issues',
                'Track Complaints',
                'Government Connect',
                'Real-time Updates',
                'Mobile Support',
                'Community Forum'
              ].map((service, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    color: '#bdc3c7',
                    fontSize: '0.95rem',
                    transition: 'color 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      color: '#3498db'
                    }
                  }}
                >
                  {service}
                </Typography>
              ))}
            </Stack>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 3,
                color: '#3498db',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -8,
                  left: 0,
                  width: 30,
                  height: 2,
                  backgroundColor: '#3498db',
                  borderRadius: 1
                }
              }}
            >
              Contact Us
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <LocationOnIcon sx={{ color: '#3498db', mr: 2, mt: 0.5, fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: '#bdc3c7', fontSize: '0.95rem' }}>
                  123 Government Plaza<br />
                  City Center, State 12345<br />
                  India
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EmailIcon sx={{ color: '#3498db', mr: 2, fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: '#bdc3c7', fontSize: '0.95rem' }}>
                  support@grievanceportal.gov.in
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PhoneIcon sx={{ color: '#3498db', mr: 2, fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: '#bdc3c7', fontSize: '0.95rem' }}>
                  +91 1234567890
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: '#bdc3c7',
              mb: { xs: 2, sm: 0 }
            }}
          >
            © {new Date().getFullYear()} Citizen Grievance Portal. All rights reserved.
          </Typography>
          
          <Typography
            variant="body2"
            sx={{
              color: '#bdc3c7',
              fontSize: '0.85rem'
            }}
          >
            Made with ❤️ for better governance
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
