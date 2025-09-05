// authMiddleware.js - Authentication middleware
const jwtUtils = require('../config/jwt');

/**
 * Middleware to protect routes that require authentication
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authMiddleware = {
  /**
   * Verify JWT token and add user to request object
   */
  verifyToken(req, res, next) {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
      }
      
      // Extract token from header
      const token = authHeader.split(' ')[1];
      
      // Verify token
      const decoded = jwtUtils.verifyToken(token);
      
      if (!decoded) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
      }
      
      // Add user data to request object
      req.user = decoded;
      
      // Continue to the next middleware or route handler
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  
  /**
   * Check if user has required role
   * @param {string|Array} roles - Required role(s)
   */
  hasRole(roles) {
    return (req, res, next) => {
      try {
        // First verify the token
        authMiddleware.verifyToken(req, res, () => {
          // Convert roles to array if it's a string
          const requiredRoles = Array.isArray(roles) ? roles : [roles];
          
          // Check if user has one of the required roles
          if (req.user && requiredRoles.includes(req.user.role)) {
            next();
          } else {
            res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
          }
        });
      } catch (error) {
        console.error('Role check error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    };
  },
  
  /**
   * Check if user belongs to a specific department
   * @param {string|null} departmentParam - Request parameter containing department ID (optional)
   */
  inDepartment(departmentParam = null) {
    return (req, res, next) => {
      try {
        // First verify the token
        authMiddleware.verifyToken(req, res, () => {
          // Get department from request parameter or user object
          const userDepartment = req.user.department;
          const targetDepartment = departmentParam ? req.params[departmentParam] : null;
          
          // Allow if user is admin or head of the department
          if (
            req.user.role === 'admin' || 
            (req.user.role === 'head' && (!targetDepartment || userDepartment === targetDepartment))
          ) {
            next();
          } else {
            res.status(403).json({ message: 'Access denied. Not authorized for this department.' });
          }
        });
      } catch (error) {
        console.error('Department check error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    };
  }
};

module.exports = authMiddleware;