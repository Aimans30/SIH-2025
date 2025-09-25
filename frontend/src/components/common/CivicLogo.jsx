import React from 'react';
import styles from './CivicLogo.module.css';

/**
 * Modern logo component for the civic platform
 * @param {Object} props - Component props
 * @param {string} props.size - Logo size: 'small', 'medium', or 'large'
 * @param {string} props.color - Color scheme: 'primary', 'light', or 'dark'
 * @param {boolean} props.withText - Whether to show text alongside the logo
 * @param {Function} props.onClick - Click handler function
 */
const CivicLogo = ({ 
  size = 'medium', 
  color = 'primary', 
  withText = true, 
  onClick 
}) => {
  // Build class names based on props
  const containerClasses = [
    styles.logoContainer,
    styles[size],
    styles[color],
    onClick ? styles.clickable : ''
  ].join(' ');

  return (
    <div className={containerClasses} onClick={onClick}>
      <div className={styles.logoMark}>
        {/* Building icon SVG */}
        <svg 
          className={styles.logoSymbol}
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <path d="M12,3L2,12h3v8h14v-8h3L12,3z M12,16c-1.1,0-2-0.9-2-2c0-1.1,0.9-2,2-2s2,0.9,2,2C14,15.1,13.1,16,12,16z" />
        </svg>
      </div>

      {withText && (
        <div className={styles.logoText}>
          <div className={styles.primaryText}>CivicOne</div>
          <div className={styles.secondaryText}>Governance Platform</div>
        </div>
      )}
    </div>
  );
};

export default CivicLogo;
