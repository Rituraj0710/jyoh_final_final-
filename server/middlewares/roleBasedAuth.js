import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../config/logger.js';

const JWT_SECRET = process.env.JWT_ACCESS_TOKEN_SECRECT_KEY || process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-document-management-system-2024';

/**
 * Middleware to authenticate and authorize users based on roles
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database to ensure they still exist and are active
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Add user info to request
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      department: user.department,
      employeeId: user.employeeId
    };

    next();
  } catch (error) {
    logger.error('Token authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

/**
 * Middleware to check if user has required role(s)
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(`Access denied for role ${req.user.role} to endpoint ${req.path}`, {
        userId: req.user.id,
        role: req.user.role,
        allowedRoles,
        endpoint: req.path
      });
      
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

/**
 * Middleware specifically for Staff1 access
 */
export const authorizeStaff1 = (req, res, next) => {
  return authorizeRoles('admin', 'staff1')(req, res, next);
};

/**
 * Middleware for admin-only access
 */
export const authorizeAdmin = (req, res, next) => {
  return authorizeRoles('admin')(req, res, next);
};

/**
 * Middleware for any staff member
 */
export const authorizeStaff = (req, res, next) => {
  return authorizeRoles('admin', 'staff1', 'staff2', 'staff3', 'staff4')(req, res, next);
};

export default {
  authenticateToken,
  authorizeRoles,
  authorizeStaff1,
  authorizeAdmin,
  authorizeStaff
};
