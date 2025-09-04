// escalationService.js - Service for handling complaint escalation
const complaintModel = require('../models/complaintModel');

/**
 * Escalation service functions
 */
const escalationService = {
  /**
   * Escalate complaints that are pending for more than specified days
   * @param {number} days - Number of days threshold (default: 7)
   */
  async escalateComplaints(days = 7) {
    try {
      console.log(`Running escalation job for complaints older than ${days} days...`);
      
      // Get complaints that need escalation
      const complaintsToEscalate = await complaintModel.getForEscalation(days);
      
      console.log(`Found ${complaintsToEscalate.length} complaints to escalate`);
      
      // Escalate each complaint
      for (const complaint of complaintsToEscalate) {
        const updatedHistory = [...complaint.history, {
          status: complaint.status,
          timestamp: new Date(),
          comment: 'Complaint escalated due to delay'
        }];
        
        const updatedComplaint = await complaintModel.update(complaint.id, {
          escalated: true,
          updated_at: new Date(),
          history: updatedHistory
        });
        
        if (updatedComplaint) {
          console.log(`Escalated complaint ${complaint.id}`);
        } else {
          console.error(`Error escalating complaint ${complaint.id}`);
        }
      }
      
      console.log('Escalation job completed');
    } catch (error) {
      console.error('Escalation job error:', error);
    }
  },
  
  /**
   * Start the escalation job to run at specified interval
   * @param {number} intervalHours - Interval in hours (default: 24)
   */
  startEscalationJob(intervalHours = 24) {
    console.log(`Starting escalation job to run every ${intervalHours} hours`);
    
    // Run immediately on startup
    this.escalateComplaints();
    
    // Then run at specified interval
    setInterval(() => this.escalateComplaints(), intervalHours * 60 * 60 * 1000);
  }
};

module.exports = escalationService;
