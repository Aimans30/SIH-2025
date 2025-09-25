import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ResponsiveComplaintList.module.css';

// Icon components
const VisibilityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
  </svg>
);

const TypeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z" />
  </svg>
);

const ForwardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" />
  </svg>
);

/**
 * Responsive complaint list component that switches between table and card views
 * based on screen size
 */
const ResponsiveComplaintList = ({ complaints, onRefresh, refreshing, onAddNew }) => {
  const navigate = useNavigate();
  
  // Empty state when no complaints
  if (complaints.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyStateIcon}>
          <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" />
          </svg>
        </div>
        <p className={styles.emptyStateText}>
          You haven't submitted any complaints yet.
        </p>
        <button 
          className={styles.primaryButton}
          onClick={onAddNew}
        >
          Report Your First Issue
        </button>
      </div>
    );
  }
  
  return (
    <>
      {/* Desktop Table View - Hidden on mobile */}
      <div className={styles.desktopTable}>
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th className={styles.tableHeaderCell}>ID</th>
              <th className={styles.tableHeaderCell}>Type</th>
              <th className={styles.tableHeaderCell}>Description</th>
              <th className={styles.tableHeaderCell}>Date</th>
              <th className={styles.tableHeaderCell}>Status</th>
              <th className={styles.tableHeaderCell}>Actions</th>
            </tr>
          </thead>
          
          <tbody>
            {complaints.map(complaint => (
              <tr key={complaint.id} className={styles.tableRow}>
                <td className={styles.tableCell}>{complaint.id && complaint.id.substring(0, 8)}...</td>
                <td className={styles.tableCell}>{complaint.type}</td>
                <td className={styles.tableCell} style={{ maxWidth: '300px' }}>
                  <div className={styles.truncatedText}>
                    {complaint.description}
                  </div>
                </td>
                <td className={styles.tableCell}>
                  {new Date(complaint.createdAt).toLocaleDateString()}
                </td>
                <td className={styles.tableCell}>
                  <div className={styles.statusContainer}>
                    <span className={`${styles.statusBadge} ${
                      complaint.status === 'Submitted' ? styles.statusSubmitted :
                      complaint.status === 'In Progress' ? styles.statusInProgress :
                      styles.statusResolved
                    }`}>
                      {complaint.status}
                    </span>
                    {complaint.transferred_to_head && (
                      <span className={`${styles.statusBadge} ${styles.transferredBadge}`}>
                        <ForwardIcon /> Transferred
                      </span>
                    )}
                  </div>
                </td>
                <td className={styles.tableCell}>
                  <button 
                    className={styles.viewButton}
                    onClick={() => navigate(`/complaint/${complaint.id}`)}
                  >
                    <VisibilityIcon /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Mobile Card View - Hidden on desktop */}
      <div className={styles.mobileCards}>
        {complaints.map(complaint => (
          <div key={complaint.id} className={styles.complaintCard} onClick={() => navigate(`/complaint/${complaint.id}`)}>
            <div className={styles.cardHeader}>
              <div className={styles.statusContainer}>
                <span className={`${styles.statusBadge} ${
                  complaint.status === 'Submitted' ? styles.statusSubmitted :
                  complaint.status === 'In Progress' ? styles.statusInProgress :
                  styles.statusResolved
                }`}>
                  {complaint.status}
                </span>
                {complaint.transferred_to_head && (
                  <span className={`${styles.statusBadge} ${styles.transferredBadge}`}>
                    <ForwardIcon /> Transferred
                  </span>
                )}
              </div>
              <span className={styles.cardDate}>
                <CalendarIcon /> {new Date(complaint.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <div className={styles.cardType}>
              <TypeIcon /> {complaint.type}
            </div>
            
            <div className={styles.cardDescription}>
              {complaint.description.length > 100 
                ? `${complaint.description.substring(0, 100)}...` 
                : complaint.description}
            </div>
            
            <div className={styles.cardFooter}>
              <span className={styles.cardId}>ID: {complaint.id && complaint.id.substring(0, 8)}...</span>
              <button className={styles.viewButtonSmall}>
                <VisibilityIcon /> View
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ResponsiveComplaintList;
