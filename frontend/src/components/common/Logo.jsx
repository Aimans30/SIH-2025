import React from 'react';
import styles from './Logo.module.css';

// Briefcase icon SVG component
const BusinessCenterIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
  </svg>
);

/**
 * Professional logo component for CivicOne
 * Can be used in various sizes throughout the application
 */
const Logo = ({ size = 'medium', color = 'primary', withText = true, onClick }) => {
  // Size configurations
  const sizes = {
    small: {
      iconSize: 24,
      primaryFontSize: '1rem',
      secondaryFontSize: '0.6rem',
      spacing: 1
    },
    medium: {
      iconSize: 32,
      primaryFontSize: '1.4rem',
      secondaryFontSize: '0.7rem',
      spacing: 1.5
    },
    large: {
      iconSize: 48,
      primaryFontSize: '2rem',
      secondaryFontSize: '0.9rem',
      spacing: 2
    }
  };

  // Color configurations
  const colors = {
    primary: {
      main: '#2c3e50',
      accent: '#3498db',
      text: '#2c3e50'
    },
    light: {
      main: '#ffffff',
      accent: '#ffffff',
      text: '#ffffff'
    },
    dark: {
      main: '#1a252f',
      accent: '#2980b9',
      text: '#1a252f'
    }
  };

  const selectedSize = sizes[size] || sizes.medium;
  const selectedColor = colors[color] || colors.primary;

  return (
    <div 
      className={`${styles.logoContainer} ${onClick ? styles.clickable : ''}`}
      onClick={onClick}
    >
      {/* Logo Icon */}
      <div className={`${styles.logoIcon} ${styles[size]} ${styles[color]}`}>
        <BusinessCenterIcon 
          className={`${styles.icon} ${styles[`icon${size.charAt(0).toUpperCase() + size.slice(1)}`]}`} 
        />
      </div>

      {/* Logo Text */}
      {withText && (
        <div className={`${styles.textContainer} ${styles[`spacing${size.charAt(0).toUpperCase() + size.slice(1)}`]}`}>
          <div
            className={`${styles.primaryText} ${styles[`primaryText${size.charAt(0).toUpperCase() + size.slice(1)}`]} ${styles[`text${color.charAt(0).toUpperCase() + color.slice(1)}`]}`}
          >
            CivicOne
          </div>
          <div
            className={`${styles.secondaryText} ${styles[`secondaryText${size.charAt(0).toUpperCase() + size.slice(1)}`]} ${styles[`accent${color.charAt(0).toUpperCase() + color.slice(1)}`]}`}
          >
            Citizen Services Portal
          </div>
        </div>
      )}
    </div>
  );
};

export default Logo;
