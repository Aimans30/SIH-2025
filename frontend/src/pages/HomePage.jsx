import { Box } from '@mui/material';
import Navbar from '../components/home/Navbar';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import HowItWorks from '../components/home/HowItWorks';
import Footer from '../components/home/Footer';
import '../styles/HomePage.css';

const HomePage = () => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#ffffff',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        position: 'relative',
        left: 0,
        right: 0,
        top: 0
      }}
    >
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Footer />
    </Box>
  );
};

export default HomePage;
