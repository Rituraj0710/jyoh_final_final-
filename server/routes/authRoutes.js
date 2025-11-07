import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import EmailVerification from '../models/EmailVerification.js';
import logger from '../config/logger.js';
import sendSignupEmail from '../utils/sendSignupEmail.js';

const router = express.Router();

// JWT Secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_ACCESS_TOKEN_SECRECT_KEY || process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-document-management-system-2024';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '24h';


/**
 * Login endpoint - handles both admin and staff login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login request received:', { email, password: password ? '***' : 'undefined' });

    // Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email, isActive: true }).select('+password');
    console.log('User found:', user ? { email: user.email, role: user.role, isActive: user.isActive, is_verified: user.is_verified } : 'Not found');
    
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if email is verified (for regular users)
    if (!user.is_verified && (user.role === 'user1' || user.role === 'user2')) {
      console.log('Email not verified for user:', email);
      return res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in. Check your inbox for verification code.'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    console.log('Password valid:', isPasswordValid);
    console.log('User password hash exists:', !!user.password);
    console.log('User password hash length:', user.password?.length);
    
    if (!isPasswordValid) {
      console.log('Invalid password for user:', email);
      console.log('User details:', {
        id: user._id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        is_verified: user.is_verified,
        hasPassword: !!user.password,
        passwordHashPrefix: user.password?.substring(0, 20)
      });
      // Log failed login attempt
      await AuditLog.logAction({
        userId: user._id,
        userRole: user.role,
        action: 'login',
        resource: 'user',
        resourceId: user._id,
        details: 'Failed login attempt - invalid password',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        severity: 'medium',
        status: 'failure'
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password are correct.'
      });
    }

    // Check if user has admin, staff, or user role (including agents)
    const allowedRoles = ['admin', 'staff1', 'staff2', 'staff3', 'staff4', 'staff5', 'user1', 'user2'];
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Valid user access required.'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        role: user.role,
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );

    // Log successful login
    await AuditLog.logAction({
      userId: user._id,
      userRole: user.role,
      action: 'login',
      resource: 'user',
      resourceId: user._id,
      details: 'Successful login',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      severity: 'low',
      status: 'success'
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          employeeId: user.employeeId,
          permissions: user.getPermissions ? user.getPermissions() : []
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

/**
 * Register endpoint (admin only)
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department, employeeId } = req.body;

    // Validate input
    if (!name || !email || !password || !role || !department || !employeeId) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { employeeId }] 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or employee ID already exists'
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role,
      department,
      employeeId,
      createdBy: req.user?.id || null
    });

    // Log user creation
    await AuditLog.logAction({
      userId: req.user?.id || user._id,
      userRole: req.user?.role || 'admin',
      action: 'user_create',
      resource: 'user',
      resourceId: user._id,
      details: `Created user with role ${role}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      severity: 'medium'
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          employeeId: user.employeeId
        }
      }
    });

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
});

/**
 * Middleware to authenticate token for profile routes
 */
const authenticateToken = async (req, res, next) => {
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
    
    // Get user from database
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
 * Get current user profile
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          employeeId: user.employeeId,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          permissions: user.getPermissions(),
          createdAt: user.createdAt
        }
      }
    });

  } catch (error) {
    logger.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving profile'
    });
  }
});

/**
 * Update user profile
 */
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, department } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update allowed fields
    if (name) user.name = name;
    if (department) user.department = department;
    user.updatedBy = userId;

    await user.save();

    // Log profile update
    await AuditLog.logAction({
      userId: user._id,
      userRole: user.role,
      action: 'user_update',
      resource: 'user',
      resourceId: user._id,
      details: 'Updated profile information',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          employeeId: user.employeeId
        }
      }
    });

  } catch (error) {
    logger.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
});

/**
 * Change password
 */
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Log password change
    await AuditLog.logAction({
      userId: user._id,
      userRole: user.role,
      action: 'user_update',
      resource: 'user',
      resourceId: user._id,
      details: 'Password changed',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      severity: 'high'
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    logger.error('Password change error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password'
    });
  }
});

/**
 * Logout endpoint
 */
router.post('/logout', authenticateToken, async (req, res) => {
  try {

    // Check if user is authenticated
    if (req.user && req.user.id) {
      // Log logout for authenticated users
      await AuditLog.logAction({
        userId: req.user.id,
        userRole: req.user.role,
        action: 'logout',
        resource: 'user',
        resourceId: req.user.id,
        details: 'User logged out',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

/**
 * Verify OTP endpoint for email verification
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already verified
    if (user.is_verified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Check if OTP exists and matches
    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Check if OTP is expired
    if (user.otpExpiry && user.otpExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Update user verification status
    user.is_verified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // Remove verification record from EmailVerification collection
    await EmailVerification.findOneAndDelete({
      email: email.toLowerCase(),
      userType: 'user'
    });

    // Log email verification
    await AuditLog.logAction({
      userId: user._id,
      userRole: user.role,
      action: 'email_verification',
      resource: 'user',
      resourceId: user._id,
      details: 'Email verified successfully',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      status: 'success'
    });

    res.json({
      success: true,
      message: 'Email verified successfully. You can now login.'
    });

  } catch (error) {
    logger.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'OTP verification failed',
      error: error.message
    });
  }
});

/**
 * Resend OTP endpoint
 */
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already verified
    if (user.is_verified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Update user with new OTP
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send email with new OTP
    try {
      await sendSignupEmail(email, otp, user.name);
      logger.info(`New OTP sent to: ${email}`);
    } catch (emailError) {
      logger.error(`Failed to send OTP email to ${email}:`, emailError);
      // Return OTP in development even if email fails
      if (process.env.NODE_ENV === 'development') {
        return res.json({
          success: true,
          message: 'OTP generated (email sending failed in development)',
          otp: otp
        });
      }
    }

    res.json({
      success: true,
      message: 'OTP has been resent to your email',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined // Only return OTP in development
    });

  } catch (error) {
    logger.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP'
    });
  }
});

export default router;
