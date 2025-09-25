import React from 'react';
import styles from './LogoAnimation.module.css';

/**
 * Animated logo component for loading screens or hero sections
 */
const LogoAnimation = () => {
  return (
    <div className={styles.logoAnimation}>
      <div className={styles.logoBackground}></div>
      
      {/* Decorative rings */}
      <div className={styles.logoRing}></div>
      <div className={styles.logoRing}></div>
      <div className={styles.logoRing}></div>
      
      {/* Decorative particles */}
      <div className={styles.logoParticle}></div>
      <div className={styles.logoParticle}></div>
      <div className={styles.logoParticle}></div>
      <div className={styles.logoParticle}></div>
      <div className={styles.logoParticle}></div>
      
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
  );
};

export default LogoAnimation;
