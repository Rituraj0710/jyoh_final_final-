import UserModel from "../models/User.js";
import FormsData from "../models/FormsData.js";
import AuditLog from "../models/AuditLog.js";
import generateTokens from "../utils/generateTokens.js";
import setTokenCookies from "../utils/setTokenCookies.js";
import { successResponse, errorResponse } from "../utils/responseHelper.js";

class AdminController {
  // Create staff account
  static createStaff = async (req, res) => {
    try {
      const { name, email, phone, password, role, department, employeeId, status = "active" } = req.body;
      const adminUser = req.user;

      // Validate required fields
      if (!name || !email || !phone || !password || !role || !department || !employeeId) {
        return res.status(400).json({
          status: "failed",
          message: "All fields are required"
        });
      }

      // Validate status
      if (status && !["active", "inactive"].includes(status)) {
        return res.status(400).json({
          status: "failed",
          message: "Status must be either 'active' or 'inactive'"
        });
      }

      // Validate role exists and is active
      const Role = (await import('../models/Role.js')).default;
      const roleExists = await Role.findOne({ name: role, isActive: true });
      if (!roleExists) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid role. Role does not exist or is inactive"
        });
      }

      // Check if email already exists
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          status: "failed",
          message: "Email already exists"
        });
      }

      // Check if phone already exists
      const existingPhone = await UserModel.findOne({ phone });
      if (existingPhone) {
        return res.status(409).json({
          status: "failed",
          message: "Phone number already exists"
        });
      }

      // Check if employee ID already exists
      const existingEmployeeId = await UserModel.findOne({ employeeId });
      if (existingEmployeeId) {
        return res.status(409).json({
          status: "failed",
          message: "Employee ID already exists"
        });
      }

      // Create new staff user (password will be hashed by User model pre-save middleware)
      const newStaff = await UserModel.create({
        name,
        email,
        phone,
        password, // Let the User model handle password hashing
        role,
        department,
        employeeId,
        is_verified: true, // Admin creates verified accounts
        isActive: status === "active", // Set based on status field
        createdBy: adminUser._id
      });

      // Log the action
      await AuditLog.logAction({
        userId: adminUser._id,
        userRole: adminUser.role,
        action: 'staff_create',
        resource: 'staff',
        resourceId: newStaff._id,
        details: {
          staffName: name,
          staffEmail: email,
          staffRole: role,
          department,
          employeeId
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Log staff creation
      const ActivityLogger = (await import('../services/activityLogger.js')).default;
      await ActivityLogger.logStaffAction(adminUser, 'create', newStaff, {
        role: newStaff.role,
        department: newStaff.department,
        employeeId: newStaff.employeeId
      }, req);

      res.status(201).json({
        status: "success",
        message: "Staff account created successfully",
        staff: {
          id: newStaff._id,
          name: newStaff.name,
          email: newStaff.email,
          role: newStaff.role,
          department: newStaff.department,
          employeeId: newStaff.employeeId
        }
      });

    } catch (error) {
      console.error('Create staff error:', error);
      res.status(500).json({
        status: "failed",
        message: "Unable to create staff account, please try again later"
      });
    }
  };

  // Update staff account
  static updateStaff = async (req, res) => {
    try {
      const { staffId } = req.params;
      const { name, email, phone, role, department, employeeId, isActive, status, password } = req.body;
      const adminUser = req.user;

      // Find staff user
      const staff = await UserModel.findById(staffId);
      if (!staff) {
        return res.status(404).json({
          status: "failed",
          message: "Staff not found"
        });
      }

      // Check if staff is not admin
      if (staff.role === 'admin') {
        return res.status(403).json({
          status: "failed",
          message: "Cannot modify admin account"
        });
      }

      // Validate role if provided
      if (role) {
        const Role = (await import('../models/Role.js')).default;
        const roleExists = await Role.findOne({ name: role, isActive: true });
        if (!roleExists) {
          return res.status(400).json({
            status: "failed",
            message: "Invalid role. Role does not exist or is inactive"
          });
        }
      }

      // Check for duplicate email
      if (email && email !== staff.email) {
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
          return res.status(409).json({
            status: "failed",
            message: "Email already exists"
          });
        }
      }

      // Check for duplicate phone
      if (phone && phone !== staff.phone) {
        const existingPhone = await UserModel.findOne({ phone });
        if (existingPhone) {
          return res.status(409).json({
            status: "failed",
            message: "Phone number already exists"
          });
        }
      }

      // Check for duplicate employee ID
      if (employeeId && employeeId !== staff.employeeId) {
        const existingEmployeeId = await UserModel.findOne({ employeeId });
        if (existingEmployeeId) {
          return res.status(409).json({
            status: "failed",
            message: "Employee ID already exists"
          });
        }
      }

      // Update staff
      const updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (phone) updateData.phone = phone;
      if (role) updateData.role = role;
      if (department) updateData.department = department;
      if (employeeId) updateData.employeeId = employeeId;
      
      // Handle status/isActive - status takes precedence
      if (status) {
        updateData.isActive = status === "active";
      } else if (typeof isActive === 'boolean') {
        updateData.isActive = isActive;
      }
      
      if (password) updateData.password = password; // Will be hashed by User model pre-save middleware
      updateData.updatedBy = adminUser._id;

      const updatedStaff = await UserModel.findByIdAndUpdate(
        staffId,
        updateData,
        { new: true, runValidators: true }
      );

      // Log the action
      await AuditLog.logAction({
        userId: adminUser._id,
        userRole: adminUser.role,
        action: 'staff_update',
        resource: 'staff',
        resourceId: staffId,
        details: {
          updatedFields: Object.keys(updateData),
          staffName: updatedStaff.name,
          staffEmail: updatedStaff.email,
          staffRole: updatedStaff.role
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(200).json({
        status: "success",
        message: "Staff account updated successfully",
        staff: {
          id: updatedStaff._id,
          name: updatedStaff.name,
          email: updatedStaff.email,
          role: updatedStaff.role,
          department: updatedStaff.department,
          employeeId: updatedStaff.employeeId,
          isActive: updatedStaff.isActive
        }
      });

    } catch (error) {
      console.error('Update staff error:', error);
      res.status(500).json({
        status: "failed",
        message: "Unable to update staff account, please try again later"
      });
    }
  };

  // Get all staff
  static getAllStaff = async (req, res) => {
    try {
      // Get all staff roles (non-user roles)
      const Role = (await import('../models/Role.js')).default;
      const staffRoles = await Role.find({ 
        isActive: true,
        name: { $nin: ['user1', 'user2'] }
      }).select('name');
      let staffRoleNames = staffRoles.map(r => r.name);

      // Fallback if roles are not initialized in DB
      if (!staffRoleNames || staffRoleNames.length === 0) {
        staffRoleNames = ['staff1', 'staff2', 'staff3', 'staff4', 'staff5', 'admin'];
      }

      const staff = await UserModel.find({
        role: { $in: staffRoleNames }
      })
        .select('-password')
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        message: "Staff list retrieved successfully",
        data: { staff },
        staff // compatibility for clients reading top-level staff
      });

    } catch (error) {
      console.error('Get staff error:', error);
      res.status(500).json({
        success: false,
        message: "Unable to retrieve staff list, please try again later"
      });
    }
  };

  // Get staff by ID
  static getStaffById = async (req, res) => {
    try {
      const { staffId } = req.params;

      const staff = await UserModel.findById(staffId)
        .select('-password')
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email');

      if (!staff) {
        return res.status(404).json({
          status: "failed",
          message: "Staff not found"
        });
      }

      res.status(200).json({
        status: "success",
        message: "Staff details retrieved successfully",
        staff
      });

    } catch (error) {
      console.error('Get staff by ID error:', error);
      res.status(500).json({
        status: "failed",
        message: "Unable to retrieve staff details, please try again later"
      });
    }
  };

  // Deactivate staff
  static deactivateStaff = async (req, res) => {
    try {
      const { staffId } = req.params;
      const adminUser = req.user;

      const staff = await UserModel.findById(staffId);
      if (!staff) {
        return res.status(404).json({
          status: "failed",
          message: "Staff not found"
        });
      }

      if (staff.role === 'admin') {
        return res.status(403).json({
          status: "failed",
          message: "Cannot deactivate admin account"
        });
      }

      staff.isActive = false;
      staff.updatedBy = adminUser._id;
      await staff.save();

      // Log the action
      await AuditLog.logAction({
        userId: adminUser._id,
        userRole: adminUser.role,
        action: 'staff_deactivate',
        resource: 'staff',
        resourceId: staffId,
        details: {
          staffName: staff.name,
          staffEmail: staff.email,
          staffRole: staff.role
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(200).json({
        status: "success",
        message: "Staff account deactivated successfully"
      });

    } catch (error) {
      console.error('Deactivate staff error:', error);
      res.status(500).json({
        status: "failed",
        message: "Unable to deactivate staff account, please try again later"
      });
    }
  };

  // Delete staff
  static deleteStaff = async (req, res) => {
    try {
      const { staffId } = req.params;
      const adminUser = req.user;

      const staff = await UserModel.findById(staffId);
      if (!staff) {
        return res.status(404).json({
          status: "failed",
          message: "Staff not found"
        });
      }

      if (staff.role === 'admin') {
        return res.status(403).json({
          status: "failed",
          message: "Cannot delete admin account"
        });
      }

      // Store staff details for logging before deletion
      const staffDetails = {
        name: staff.name,
        email: staff.email,
        role: staff.role,
        department: staff.department,
        employeeId: staff.employeeId
      };

      await UserModel.findByIdAndDelete(staffId);

      // Log the action
      await AuditLog.logAction({
        userId: adminUser._id,
        userRole: adminUser.role,
        action: 'staff_delete',
        resource: 'staff',
        resourceId: staffId,
        details: staffDetails,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(200).json({
        status: "success",
        message: "Staff account deleted successfully"
      });

    } catch (error) {
      console.error('Delete staff error:', error);
      res.status(500).json({
        status: "failed",
        message: "Unable to delete staff account, please try again later"
      });
    }
  };

  // Reset staff password
  static resetStaffPassword = async (req, res) => {
    try {
      const { staffId } = req.params;
      const { password } = req.body;
      const adminUser = req.user;

      // Validate staffId format
      const mongoose = (await import('mongoose')).default;
      if (!mongoose.Types.ObjectId.isValid(staffId)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid staff ID"
        });
      }

      // Validate password
      if (!password) {
        return res.status(400).json({
          status: "failed",
          message: "Password is required"
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          status: "failed",
          message: "Password must be at least 8 characters long"
        });
      }

      const staff = await UserModel.findById(staffId);
      if (!staff) {
        return res.status(404).json({
          status: "failed",
          message: "Staff not found"
        });
      }

      if (staff.role === 'admin') {
        return res.status(403).json({
          status: "failed",
          message: "Cannot reset admin password"
        });
      }

      // Update password (will be hashed by User model pre-save middleware)
      staff.password = password;
      staff.updatedBy = adminUser?._id || adminUser?.id || undefined;
      await staff.save();

      // Log the action
      await AuditLog.logAction({
        userId: adminUser._id,
        userRole: adminUser.role,
        action: 'staff_reset_password',
        resource: 'staff',
        resourceId: staffId,
        details: {
          staffName: staff.name,
          staffEmail: staff.email,
          staffRole: staff.role
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(200).json({
        status: "success",
        message: "Staff password reset successfully"
      });

    } catch (error) {
      console.error('Reset staff password error:', error);
      res.status(500).json({
        status: "failed",
        message: "Unable to reset staff password, please try again later",
        ...(process.env.NODE_ENV !== 'production' ? { error: error.message } : {})
      });
    }
  };

  // Get audit logs
  static getAuditLogs = async (req, res) => {
    try {
      const { page = 1, limit = 50, action, userRole, startDate, endDate } = req.query;
      const skip = (page - 1) * limit;

      // Build query
      const query = {};
      if (action) query.action = action;
      if (userRole) query.userRole = userRole;
      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }

      const logs = await AuditLog.find(query)
        .populate('userId', 'name email role department employeeId')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await AuditLog.countDocuments(query);

      res.status(200).json({
        status: "success",
        message: "Audit logs retrieved successfully",
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('Get audit logs error:', error);
      res.status(500).json({
        status: "failed",
        message: "Unable to retrieve audit logs, please try again later"
      });
    }
  };

  // Get available roles for staff creation
  static getAvailableRoles = async (req, res) => {
    try {
      const Role = (await import('../models/Role.js')).default;
      
      const roles = await Role.find({ 
        isActive: true,
        name: { $nin: ['user1', 'user2'] } // Exclude user roles
      })
        .select('name displayName description level')
        .sort({ level: 1, name: 1 });

      res.status(200).json({
        status: "success",
        message: "Available roles retrieved successfully",
        roles
      });

    } catch (error) {
      console.error('Get available roles error:', error);
      res.status(500).json({
        status: "failed",
        message: "Unable to retrieve available roles, please try again later"
      });
    }
  };

  // Get dashboard statistics
  static getDashboardStats = async (req, res) => {
    try {
      const Form = (await import('../models/Form.js')).default;
      const Role = (await import('../models/Role.js')).default;
      
      // Get staff roles for counting
      const staffRoles = await Role.find({ 
        isActive: true,
        name: { $nin: ['user1', 'user2'] }
      }).select('name');
      const staffRoleNames = staffRoles.map(r => r.name);
      
      const [
        totalStaff,
        activeStaff,
        totalForms,
        pendingForms,
        completedForms,
        recentLogs
      ] = await Promise.all([
        UserModel.countDocuments({ role: { $in: staffRoleNames } }),
        UserModel.countDocuments({ role: { $in: staffRoleNames }, isActive: true }),
        Form.countDocuments(),
        Form.countDocuments({ status: { $in: ['draft', 'submitted', 'under_review'] } }),
        Form.countDocuments({ status: 'completed' }),
        AuditLog.find({})
          .populate('userId', 'name email role')
          .sort({ timestamp: -1 })
          .limit(10)
      ]);

      res.status(200).json({
        status: "success",
        message: "Dashboard statistics retrieved successfully",
        stats: {
          totalStaff,
          activeStaff,
          totalForms,
          pendingForms,
          completedForms,
          recentActivity: recentLogs
        }
      });

    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({
        status: "failed",
        message: "Unable to retrieve dashboard statistics, please try again later"
      });
    }
  };

  // Forms Management Methods
  static getAdminForms = async (req, res) => {
    try {
      const { 
        serviceType, 
        status, 
        userId, 
        search, 
        page = 1, 
        limit = 50,
        sortBy = 'lastActivityAt',
        sortOrder = 'desc'
      } = req.query;

      const filters = {
        serviceType,
        status,
        userId,
        search,
        limit: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit)
      };

      // Remove undefined filters
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined || filters[key] === '') {
          delete filters[key];
        }
      });

      const forms = await FormsData.getAdminForms(filters);
      const total = await FormsData.countDocuments(filters);

      return successResponse(res, 'Admin forms retrieved successfully', {
        forms,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get admin forms error:', error);
      return errorResponse(res, 'Error retrieving admin forms', error.message, 500);
    }
  };

  static getFormById = async (req, res) => {
    try {
      const { id } = req.params;

      const formData = await FormsData.findById(id)
        .populate('userId', 'name email role')
        .populate('lastActivityBy', 'name email role');

      if (!formData) {
        return errorResponse(res, 'Form not found', null, 404);
      }

      return successResponse(res, 'Form retrieved successfully', { formData });
    } catch (error) {
      console.error('Get form by ID error:', error);
      return errorResponse(res, 'Error retrieving form', error.message, 500);
    }
  };

  static updateForm = async (req, res) => {
    try {
      const { id } = req.params;
      const { fields, status, adminNotes } = req.body;
      const userId = req.user.id;

      const formData = await FormsData.findById(id);
      if (!formData) {
        return errorResponse(res, 'Form not found', null, 404);
      }

      // Save current version to history
      formData.previousVersions.push({
        fields: formData.fields,
        status: formData.status,
        savedAt: new Date(),
        savedBy: formData.lastActivityBy
      });

      // Update form
      if (fields) formData.fields = { ...formData.fields, ...fields };
      if (status) formData.status = status;
      if (adminNotes) {
        formData.adminNotes.push({
          note: adminNotes,
          addedBy: userId,
          addedAt: new Date()
        });
      }

      formData.lastActivityBy = userId;
      formData.lastActivityAt = new Date();
      formData.version += 1;

      await formData.save();

      return successResponse(res, 'Form updated successfully', { formData });
    } catch (error) {
      console.error('Update form error:', error);
      return errorResponse(res, 'Error updating form', error.message, 500);
    }
  };

  static deleteForm = async (req, res) => {
    try {
      const { id } = req.params;

      const formData = await FormsData.findById(id);
      if (!formData) {
        return errorResponse(res, 'Form not found', null, 404);
      }

      await FormsData.findByIdAndDelete(id);

      return successResponse(res, 'Form deleted successfully');
    } catch (error) {
      console.error('Delete form error:', error);
      return errorResponse(res, 'Error deleting form', error.message, 500);
    }
  };

  static getFormStats = async (req, res) => {
    try {
      const stats = await FormsData.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const serviceStats = await FormsData.aggregate([
        {
          $group: {
            _id: '$serviceType',
            count: { $sum: 1 }
          }
        }
      ]);

      return successResponse(res, 'Form statistics retrieved successfully', {
        statusStats: stats,
        serviceStats: serviceStats
      });
    } catch (error) {
      console.error('Get form stats error:', error);
      return errorResponse(res, 'Error retrieving form statistics', error.message, 500);
    }
  };

  // User Management Methods
  
  // Get all users (user1 and user2 roles only)
  static getAllUsers = async (req, res) => {
    try {
      const { page = 1, limit = 50, search, accountStatus, role } = req.query;
      const skip = (page - 1) * limit;

      // Build query for users only
      const query = { role: { $in: ['user1', 'user2'] } };
      
      if (accountStatus) {
        query.accountStatus = accountStatus;
      }
      
      if (role && ['user1', 'user2'].includes(role)) {
        query.role = role;
      }
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      const users = await UserModel.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await UserModel.countDocuments(query);

      // Log the action
      await AuditLog.logAction({
        userId: req.user._id,
        userRole: req.user.role,
        action: 'users_list_view',
        resource: 'users',
        resourceId: null,
        details: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalResults: total
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(200).json({
        status: "success",
        message: "Users retrieved successfully",
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        status: "failed",
        message: "Unable to retrieve users, please try again later"
      });
    }
  };

  // Get user by ID
  static getUserById = async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await UserModel.findById(userId)
        .select('-password -otp -otpExpiry');

      if (!user) {
        return res.status(404).json({
          status: "failed",
          message: "User not found"
        });
      }

      // Check if it's a regular user
      if (!['user1', 'user2'].includes(user.role)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid user type"
        });
      }

      // Get user's forms count
      const formsCount = await FormsData.countDocuments({ userId: user._id });

      // Log the action
      await AuditLog.logAction({
        userId: req.user._id,
        userRole: req.user.role,
        action: 'user_view',
        resource: 'user',
        resourceId: userId,
        details: {
          userName: user.name,
          userEmail: user.email
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(200).json({
        status: "success",
        message: "User details retrieved successfully",
        user: {
          ...user.toObject(),
          formsCount
        }
      });

    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({
        status: "failed",
        message: "Unable to retrieve user details, please try again later"
      });
    }
  };

  // Update user status (block/unblock)
  static updateUserStatus = async (req, res) => {
    try {
      const { userId } = req.params;
      const { accountStatus } = req.body;
      const adminUser = req.user;

      // Validate status
      if (!['active', 'blocked'].includes(accountStatus)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid status. Must be 'active' or 'blocked'"
        });
      }

      // Find user
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: "failed",
          message: "User not found"
        });
      }

      // Check if it's a regular user
      if (!['user1', 'user2'].includes(user.role)) {
        return res.status(400).json({
          status: "failed",
          message: "Cannot modify this user type"
        });
      }

      // Prevent blocking admin
      if (user.role === 'admin') {
        return res.status(403).json({
          status: "failed",
          message: "Cannot block admin account"
        });
      }

      const oldStatus = user.accountStatus;
      user.accountStatus = accountStatus;
      user.updatedBy = adminUser._id;
      await user.save();

      // Log the action
      await AuditLog.logAction({
        userId: adminUser._id,
        userRole: adminUser.role,
        action: 'user_status_update',
        resource: 'user',
        resourceId: userId,
        details: {
          userName: user.name,
          userEmail: user.email,
          oldStatus: oldStatus,
          newStatus: accountStatus
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(200).json({
        status: "success",
        message: `User ${accountStatus === 'blocked' ? 'blocked' : 'unblocked'} successfully`,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          accountStatus: user.accountStatus
        }
      });

    } catch (error) {
      console.error('Update user status error:', error);
      res.status(500).json({
        status: "failed",
        message: "Unable to update user status, please try again later"
      });
    }
  };

  // Get user statistics
  static getUserStats = async (req, res) => {
    try {
      const [
        totalUsers,
        activeUsers,
        blockedUsers,
        normalUsers,
        agents,
        verifiedUsers
      ] = await Promise.all([
        UserModel.countDocuments({ role: { $in: ['user1', 'user2'] } }),
        UserModel.countDocuments({ role: { $in: ['user1', 'user2'] }, accountStatus: 'active' }),
        UserModel.countDocuments({ role: { $in: ['user1', 'user2'] }, accountStatus: 'blocked' }),
        UserModel.countDocuments({ role: 'user1' }),
        UserModel.countDocuments({ role: 'user2' }),
        UserModel.countDocuments({ role: { $in: ['user1', 'user2'] }, is_verified: true })
      ]);

      res.status(200).json({
        status: "success",
        message: "User statistics retrieved successfully",
        stats: {
          totalUsers,
          activeUsers,
          blockedUsers,
          normalUsers,
          agents,
          verifiedUsers
        }
      });

    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({
        status: "failed",
        message: "Unable to retrieve user statistics, please try again later"
      });
    }
  };

  // Agent Management Methods

  // Get all agents with filtering
  static getAllAgents = async (req, res) => {
    try {
      const { page = 1, limit = 50, status, search } = req.query;
      const skip = (page - 1) * limit;

      // Build query for agents only
      const query = { role: 'user2' };

      if (status) {
        query.status = status;
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      const agents = await UserModel.find(query)
        .select('-password -otp -otpExpiry')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await UserModel.countDocuments(query);

      // Log the action
      await AuditLog.logAction({
        userId: req.user._id,
        userRole: req.user.role,
        action: 'agents_list_view',
        resource: 'agents',
        resourceId: null,
        details: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalResults: total,
          filters: { status, search }
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(200).json({
        status: "success",
        message: "Agents retrieved successfully",
        agents,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('Get all agents error:', error);
      res.status(500).json({
        status: "failed",
        message: "Unable to retrieve agents, please try again later"
      });
    }
  };

  // Get agent by ID
  static getAgentById = async (req, res) => {
    try {
      const { agentId } = req.params;

      const agent = await UserModel.findOne({ _id: agentId, role: 'user2' })
        .select('-password -otp -otpExpiry');

      if (!agent) {
        return res.status(404).json({
          status: "failed",
          message: "Agent not found"
        });
      }

      // Log the action
      await AuditLog.logAction({
        userId: req.user._id,
        userRole: req.user.role,
        action: 'agent_view',
        resource: 'agent',
        resourceId: agentId,
        details: {
          agentEmail: agent.email,
          agentStatus: agent.status
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(200).json({
        status: "success",
        message: "Agent retrieved successfully",
        agent
      });

    } catch (error) {
      console.error('Get agent by ID error:', error);
      res.status(500).json({
        status: "failed",
        message: "Unable to retrieve agent, please try again later"
      });
    }
  };

  // Approve or reject agent
  static updateAgentStatus = async (req, res) => {
    try {
      const { agentId } = req.params;
      const { status, adminNotes } = req.body;

      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid status. Must be 'approved' or 'rejected'"
        });
      }

      const agent = await UserModel.findOne({ _id: agentId, role: 'user2' });

      if (!agent) {
        return res.status(404).json({
          status: "failed",
          message: "Agent not found"
        });
      }

      // Update agent status
      agent.status = status;
      if (status === 'approved') {
        agent.is_verified = true; // Set as verified when approved
      }
      if (adminNotes) {
        agent.adminNotes = adminNotes;
      }
      await agent.save();

      // Send notification email to agent
      try {
        await this.sendAgentStatusNotification(agent, status);
      } catch (emailError) {
        console.warn(`Failed to send status notification to agent ${agent.email}:`, emailError.message);
      }

      // Log the action
      await AuditLog.logAction({
        userId: req.user._id,
        userRole: req.user.role,
        action: 'agent_status_update',
        resource: 'agent',
        resourceId: agentId,
        details: {
          agentEmail: agent.email,
          oldStatus: agent.status,
          newStatus: status,
          adminNotes
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(200).json({
        status: "success",
        message: `Agent ${status} successfully`,
        agent: {
          _id: agent._id,
          name: agent.name,
          email: agent.email,
          status: agent.status,
          adminNotes: agent.adminNotes
        }
      });

    } catch (error) {
      console.error('Update agent status error:', error);
      res.status(500).json({
        status: "failed",
        message: "Unable to update agent status, please try again later"
      });
    }
  };

  // Send agent status notification email
  static sendAgentStatusNotification = async (agent, status) => {
    try {
      const subject = status === 'approved' 
        ? 'Agent Account Approved - You Can Now Login'
        : 'Agent Account Status Update';

      const statusMessage = status === 'approved'
        ? 'Congratulations! Your agent account has been approved. You can now login to the platform.'
        : 'Your agent account has been rejected. Please contact support for more information.';

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: agent.email,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Hello ${agent.name}!</h2>
            <p>${statusMessage}</p>
            <div style="background-color: ${status === 'approved' ? '#d4edda' : '#f8d7da'}; padding: 20px; border-left: 4px solid ${status === 'approved' ? '#28a745' : '#dc3545'}; margin: 20px 0;">
              <h3 style="color: ${status === 'approved' ? '#28a745' : '#dc3545'}; margin-top: 0;">Status: ${status.charAt(0).toUpperCase() + status.slice(1)}</h3>
              ${status === 'approved' 
                ? '<p>You can now login to the platform and start using all agent features.</p>'
                : '<p>If you believe this is an error, please contact our support team.</p>'
              }
            </div>
            ${agent.adminNotes ? `<p><strong>Admin Notes:</strong> ${agent.adminNotes}</p>` : ''}
            <p>Best regards,<br>Document Management Team</p>
          </div>
        `
      });
      console.log(`Agent status notification sent to: ${agent.email}`);
    } catch (error) {
      console.error("Error sending agent status notification:", error);
      throw error;
    }
  };

  // Get agent statistics
  static getAgentStats = async (req, res) => {
    try {
      const [
        totalAgents,
        pendingAgents,
        approvedAgents,
        rejectedAgents
      ] = await Promise.all([
        UserModel.countDocuments({ role: 'user2' }),
        UserModel.countDocuments({ role: 'user2', status: 'pending' }),
        UserModel.countDocuments({ role: 'user2', status: 'approved' }),
        UserModel.countDocuments({ role: 'user2', status: 'rejected' })
      ]);

      res.status(200).json({
        status: "success",
        message: "Agent statistics retrieved successfully",
        stats: {
          totalAgents,
          pendingAgents,
          approvedAgents,
          rejectedAgents
        }
      });

    } catch (error) {
      console.error('Get agent stats error:', error);
      res.status(500).json({
        status: "failed",
        message: "Unable to retrieve agent statistics, please try again later"
      });
    }
  };

  // Verify payment
  static verifyPayment = async (req, res) => {
    try {
      const { formId, verified, paymentNotes } = req.body;
      const adminId = req.user.id;

      if (!formId) {
        return res.status(400).json({
          status: 'failed',
          message: 'Form ID is required'
        });
      }

      const formData = await FormsData.findById(formId);
      if (!formData) {
        return res.status(404).json({
          status: 'failed',
          message: 'Form not found'
        });
      }

      // Update payment verification
      formData.paymentInfo = formData.paymentInfo || {};
      formData.paymentInfo.paymentVerified = verified !== false;
      if (paymentNotes) formData.paymentInfo.paymentNotes = paymentNotes;
      formData.paymentInfo.verifiedBy = adminId;
      formData.paymentInfo.verifiedAt = new Date();

      // Update form status based on verification
      if (formData.paymentInfo.paymentVerified && formData.paymentInfo.paymentStatus === 'completed') {
        formData.status = 'approved';
        formData.approvedBy = adminId;
        formData.approvedAt = new Date();
      }

      await formData.save();

      // Log the action
      await AuditLog.logAction({
        userId: adminId,
        userRole: req.user.role,
        action: 'payment_verify',
        resource: 'form_payment',
        resourceId: formId,
        details: {
          verified,
          paymentAmount: formData.paymentInfo.paymentAmount,
          transactionId: formData.paymentInfo.paymentTransactionId
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(200).json({
        status: 'success',
        message: 'Payment verified successfully',
        data: {
          formData,
          paymentInfo: formData.paymentInfo
        }
      });

    } catch (error) {
      console.error('Verify payment error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to verify payment'
      });
    }
  };

  // Get sales and payment reports
  static getSalesAndPaymentReports = async (req, res) => {
    try {
      const { dateFrom, dateTo, groupBy = 'day' } = req.query;

      // Aggregate sales data
      const salesAggregation = [
        { $match: { 'paymentInfo.paymentStatus': 'completed' } }
      ];

      if (dateFrom || dateTo) {
        const dateFilter = {};
        if (dateFrom) dateFilter.$gte = new Date(dateFrom);
        if (dateTo) dateFilter.$lte = new Date(dateTo);
        salesAggregation.push({ $match: { 'paymentInfo.paymentDate': dateFilter } });
      }

      // Group by period
      let groupByExpr = {};
      switch (groupBy) {
        case 'day':
          groupByExpr = {
            year: { $year: '$paymentInfo.paymentDate' },
            month: { $month: '$paymentInfo.paymentDate' },
            day: { $dayOfMonth: '$paymentInfo.paymentDate' }
          };
          break;
        case 'week':
          groupByExpr = {
            year: { $year: '$paymentInfo.paymentDate' },
            week: { $week: '$paymentInfo.paymentDate' }
          };
          break;
        case 'month':
          groupByExpr = {
            year: { $year: '$paymentInfo.paymentDate' },
            month: { $month: '$paymentInfo.paymentDate' }
          };
          break;
      }

      salesAggregation.push(
        { $group: {
            _id: groupByExpr,
            totalRevenue: { $sum: '$paymentInfo.paymentAmount' },
            totalStampDuty: { $sum: '$paymentInfo.calculations.stampDuty' },
            totalRegistrationCharge: { $sum: '$paymentInfo.calculations.registrationCharge' },
            formCount: { $sum: 1 }
          }
        },
        { $sort: { '_id': -1 } }
      );

      const salesData = await FormsData.aggregate(salesAggregation);

      // Get total statistics
      const totalRevenue = await FormsData.aggregate([
        { $match: { 'paymentInfo.paymentStatus': 'completed' } },
        { $group: {
            _id: null,
            totalRevenue: { $sum: '$paymentInfo.paymentAmount' },
            totalStampDuty: { $sum: '$paymentInfo.calculations.stampDuty' },
            totalForms: { $sum: 1 }
          }
        }
      ]);

      res.status(200).json({
        status: 'success',
        message: 'Sales and payment reports retrieved successfully',
        data: {
          salesData,
          summary: totalRevenue[0] || { totalRevenue: 0, totalStampDuty: 0, totalForms: 0 }
        }
      });

    } catch (error) {
      console.error('Get sales and payment reports error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to retrieve sales and payment reports'
      });
    }
  };

  // Approve form document
  static approveFormDocument = async (req, res) => {
    try {
      const { formId, approved, remarks } = req.body;
      const adminId = req.user.id;

      if (!formId) {
        return res.status(400).json({
          status: 'failed',
          message: 'Form ID is required'
        });
      }

      const formData = await FormsData.findById(formId);
      if (!formData) {
        return res.status(404).json({
          status: 'failed',
          message: 'Form not found'
        });
      }

      if (approved !== undefined) {
        formData.status = approved ? 'approved' : 'rejected';
        if (approved) {
          formData.approvedBy = adminId;
          formData.approvedAt = new Date();
        } else if (remarks) {
          formData.rejectionReason = remarks;
        }
      }

      if (remarks) {
        formData.adminNotes.push({
          note: remarks,
          addedBy: adminId,
          addedAt: new Date()
        });
      }

      formData.lastActivityBy = adminId;
      formData.lastActivityAt = new Date();

      await formData.save();

      // Log the action
      await AuditLog.logAction({
        userId: adminId,
        userRole: req.user.role,
        action: 'form_document_approve',
        resource: 'form',
        resourceId: formId,
        details: {
          approved,
          remarks,
          status: formData.status
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(200).json({
        status: 'success',
        message: `Form ${approved ? 'approved' : 'rejected'} successfully`,
        data: { formData }
      });

    } catch (error) {
      console.error('Approve form document error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to approve form document'
      });
    }
  };
}

export default AdminController;
