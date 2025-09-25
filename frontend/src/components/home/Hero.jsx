import { useNavigate } from 'react-router-dom';
import CivicLogo from '../common/CivicLogo';
import styles from './Hero.module.css';

// Arrow icon SVG component
const ArrowForwardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z" />
  </svg>
);

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className={styles.heroContainer}>
      <div className={styles.contentContainer}>
        <div className={styles.grid}>
          <div className={styles.leftColumn}>
            <div className={styles.fadeIn}>
              <h1 className={styles.heading}>
                Efficient Civic Issue Resolution Platform
              </h1>
              
              <div className={styles.divider}></div>

              <p className={styles.subheading}>
                A sophisticated platform that bridges the gap between citizens and local authorities, enabling streamlined reporting, monitoring, and resolution of civic issues through a secure and transparent process.
              </p>
              
              <div className={styles.buttonContainer}>
                <button 
                  className={styles.primaryButton}
                  onClick={() => navigate('/login')}
                >
                  <ArrowForwardIcon /> Get Started
                </button>

                <button
                  className={styles.secondaryButton}
                  onClick={() => navigate('/signup')}
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
          
          {/* Right side with modern visual */}
          <div className={styles.rightColumn}>
            <div className={styles.heroVisual}>
              <div className={styles.logoSection}>
                <CivicLogo size="large" color="light" />
              </div>
              
              <div>
                <h2 className={styles.visualTitle}>
                  Governance Excellence Network
                </h2>
                <div className={styles.visualDivider}></div>
              </div>
              
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>98%</div>
                  <div className={styles.statLabel}>Resolution Rate</div>
                </div>
                
                <div className={styles.statCard}>
                  <div className={styles.statValue}>24h</div>
                  <div className={styles.statLabel}>Avg. Response</div>
                </div>
                
                <div className={styles.statCard}>
                  <div className={styles.statValue}>15K+</div>
                  <div className={styles.statLabel}>Citizens Served</div>
                </div>
                
                <div className={styles.statCard}>
                  <div className={styles.statValue}>99.9%</div>
                  <div className={styles.statLabel}>Uptime</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;