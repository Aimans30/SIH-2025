import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CivicLogo from '../common/CivicLogo';
import styles from './Navbar.module.css';

// Menu icon SVG component
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
  </svg>
);

const Navbar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
    { label: 'Login', path: '/login', isLogin: true }
  ];

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.toolbar}>
          {/* Logo Section */}
          <div 
            className={styles.logoSection}
            onClick={() => navigate('/')}
          >
            <CivicLogo size="medium" color="light" />
          </div>

          {/* Desktop Navigation */}
          <div className={styles.navItems}>
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`${styles.navButton} ${item.isLogin ? styles.loginButton : ''}`}
              >
                <span className={styles.navButtonText}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={styles.mobileMenuButton}
            onClick={handleMenuToggle}
            aria-label="menu"
          >
            <MenuIcon />
          </button>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className={styles.mobileMenu}>
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavigation(item.path)}
                  className={`${styles.mobileMenuItem} ${item.isLogin ? styles.login : ''}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
