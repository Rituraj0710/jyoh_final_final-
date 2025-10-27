import ActivityLogs from '../models/ActivityLogs.js';
import logger from '../config/logger.js';

class ActivityLogger {
  /**
   * Log an activity
   * @param {Object} logData - The log data
   * @param {string} logData.userId - User ID
   * @param {string} logData.userType - User type (staff, agent, admin)
   * @param {string} logData.userEmail - User email
   * @param {string} logData.userName - User name
   * @param {string} logData.action - Action performed
   * @param {Object} logData.details - Additional details
   * @param {string} logData.status - Status (success, failure, info, warning)
   * @param {string} logData.resourceType - Type of resource affected
   * @param {string} logData.resourceId - ID of resource affected
   * @param {string} logData.severity - Severity level
   * @param {Object} req - Express request object (optional)
   */
  static async logActivity(logData, req = null) {
    try {
      const logEntry = {
        userId: logData.userId,
        userType: logData.userType,
        userEmail: logData.userEmail,
        userName: logData.userName,
        action: logData.action,
        details: logData.details || {},
        status: logData.status || 'info',
        resourceType: logData.resourceType || null,
        resourceId: logData.resourceId || null,
        severity: logData.severity || 'low',
        ipAddress: req ? req.ip : null,
        userAgent: req ? req.get('User-Agent') : null,
        sessionId: req ? req.sessionID : null
      };

      const activityLog = new ActivityLogs(logEntry);
      await activityLog.save();

      // Also log to console for debugging
      logger.info(`Activity logged: ${logData.action} by ${logData.userEmail}`, {
        userId: logData.userId,
        action: logData.action,
        status: logData.status,
        severity: logData.severity
      });

      return activityLog;
    } catch (error) {
      logger.error('Failed to log activity:', error);
      // Don't throw error to prevent breaking the main flow
    }
  }

  /**
   * Log login attempt
   */
  static async logLogin(user, status, req = null) {
    return this.logActivity({
      userId: user._id,
      userType: this.getUserType(user.role),
      userEmail: user.email,
      userName: user.name,
      action: 'login',
      details: {
        role: user.role,
        department: user.department,
        employeeId: user.employeeId
      },
      status: status,
      severity: status === 'success' ? 'low' : 'medium'
    }, req);
  }

  /**
   * Log logout
   */
  static async logLogout(user, req = null) {
    return this.logActivity({
      userId: user._id,
      userType: this.getUserType(user.role),
      userEmail: user.email,
      userName: user.name,
      action: 'logout',
      details: {
        role: user.role,
        department: user.department
      },
      status: 'success',
      severity: 'low'
    }, req);
  }

  /**
   * Log form action
   */
  static async logFormAction(user, action, formId, formType, details = {}, req = null) {
    return this.logActivity({
      userId: user._id,
      userType: this.getUserType(user.role),
      userEmail: user.email,
      userName: user.name,
      action: `form_${action}`,
      details: {
        formId,
        formType,
        ...details
      },
      status: 'success',
      resourceType: 'form',
      resourceId: formId,
      severity: this.getFormActionSeverity(action)
    }, req);
  }

  /**
   * Log payment action
   */
  static async logPayment(user, action, paymentId, amount, details = {}, req = null) {
    return this.logActivity({
      userId: user._id,
      userType: this.getUserType(user.role),
      userEmail: user.email,
      userName: user.name,
      action: `payment_${action}`,
      details: {
        paymentId,
        amount,
        ...details
      },
      status: 'success',
      resourceType: 'payment',
      resourceId: paymentId,
      severity: 'medium'
    }, req);
  }

  /**
   * Log role/permission change
   */
  static async logRoleChange(adminUser, targetUser, action, details = {}, req = null) {
    return this.logActivity({
      userId: adminUser._id,
      userType: 'admin',
      userEmail: adminUser.email,
      userName: adminUser.name,
      action: `role_${action}`,
      details: {
        targetUserId: targetUser._id,
        targetUserEmail: targetUser.email,
        targetUserName: targetUser.name,
        oldRole: details.oldRole,
        newRole: details.newRole,
        ...details
      },
      status: 'success',
      resourceType: 'user',
      resourceId: targetUser._id,
      severity: 'high'
    }, req);
  }

  /**
   * Log staff management action
   */
  static async logStaffAction(adminUser, action, targetUser, details = {}, req = null) {
    return this.logActivity({
      userId: adminUser._id,
      userType: 'admin',
      userEmail: adminUser.email,
      userName: adminUser.name,
      action: `staff_${action}`,
      details: {
        targetUserId: targetUser._id,
        targetUserEmail: targetUser.email,
        targetUserName: targetUser.name,
        ...details
      },
      status: 'success',
      resourceType: 'staff',
      resourceId: targetUser._id,
      severity: 'medium'
    }, req);
  }

  /**
   * Log system action
   */
  static async logSystemAction(user, action, details = {}, req = null) {
    return this.logActivity({
      userId: user._id,
      userType: this.getUserType(user.role),
      userEmail: user.email,
      userName: user.name,
      action: `system_${action}`,
      details,
      status: 'success',
      severity: 'low'
    }, req);
  }

  /**
   * Get user type from role
   */
  static getUserType(role) {
    if (role === 'admin') return 'admin';
    if (['staff1', 'staff2', 'staff3', 'staff4', 'staff5'].includes(role)) return 'staff';
    if (['user1', 'user2'].includes(role)) return 'agent';
    return 'agent'; // default
  }

  /**
   * Get severity level for form actions
   */
  static getFormActionSeverity(action) {
    const severityMap = {
      'create': 'low',
      'edit': 'low',
      'view': 'low',
      'submit': 'medium',
      'approve': 'high',
      'reject': 'high',
      'lock': 'high',
      'delete': 'high'
    };
    return severityMap[action] || 'low';
  }

  /**
   * Get recent activities
   */
  static async getRecentActivities(limit = 10) {
    try {
      const logs = await ActivityLogs.getRecentLogs(limit);
      return logs.map(log => log.formatForDisplay());
    } catch (error) {
      logger.error('Failed to get recent activities:', error);
      return [];
    }
  }

  /**
   * Get filtered activities
   */
  static async getFilteredActivities(filters = {}, page = 1, limit = 50) {
    try {
      const logs = await ActivityLogs.getFilteredLogs(filters, page, limit);
      const total = await ActivityLogs.countDocuments(filters);
      
      return {
        logs: logs.map(log => log.formatForDisplay()),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Failed to get filtered activities:', error);
      return { logs: [], pagination: { page: 1, limit: 50, total: 0, pages: 0 } };
    }
  }

  /**
   * Get activity statistics
   */
  static async getActivityStats() {
    try {
      const stats = await ActivityLogs.getLogStats();
      return stats[0] || {
        totalLogs: 0,
        successLogs: 0,
        failureLogs: 0,
        staffLogs: 0,
        agentLogs: 0
      };
    } catch (error) {
      logger.error('Failed to get activity stats:', error);
      return {
        totalLogs: 0,
        successLogs: 0,
        failureLogs: 0,
        staffLogs: 0,
        agentLogs: 0
      };
    }
  }
}

export default ActivityLogger;
