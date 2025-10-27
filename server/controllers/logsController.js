import ActivityLogger from '../services/activityLogger.js';
import ActivityLogs from '../models/ActivityLogs.js';

class LogsController {
  /**
   * Get all activity logs with filtering and pagination
   */
  static getAllLogs = async (req, res) => {
    try {
      const {
        page = 1,
        limit = 50,
        userType,
        action,
        status,
        userEmail,
        startDate,
        endDate,
        severity,
        search
      } = req.query;

      // Build filters
      const filters = {};
      
      if (userType) filters.userType = userType;
      if (action) filters.action = action;
      if (status) filters.status = status;
      if (userEmail) filters.userEmail = userEmail;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      if (severity) filters.severity = severity;

      // Add search functionality
      if (search) {
        filters.$or = [
          { userEmail: { $regex: search, $options: 'i' } },
          { userName: { $regex: search, $options: 'i' } },
          { action: { $regex: search, $options: 'i' } }
        ];
      }

      const result = await ActivityLogger.getFilteredActivities(
        filters,
        parseInt(page),
        parseInt(limit)
      );

      res.status(200).json({
        status: 'success',
        message: 'Activity logs retrieved successfully',
        data: result.logs,
        pagination: result.pagination
      });

    } catch (error) {
      console.error('Get all logs error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to retrieve activity logs, please try again later'
      });
    }
  };

  /**
   * Get recent activity logs
   */
  static getRecentLogs = async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      
      const logs = await ActivityLogger.getRecentActivities(parseInt(limit));

      res.status(200).json({
        status: 'success',
        message: 'Recent activity logs retrieved successfully',
        data: logs
      });

    } catch (error) {
      console.error('Get recent logs error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to retrieve recent activity logs, please try again later'
      });
    }
  };

  /**
   * Get activity statistics
   */
  static getLogStats = async (req, res) => {
    try {
      const stats = await ActivityLogger.getActivityStats();

      res.status(200).json({
        status: 'success',
        message: 'Activity statistics retrieved successfully',
        data: stats
      });

    } catch (error) {
      console.error('Get log stats error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to retrieve activity statistics, please try again later'
      });
    }
  };

  /**
   * Get logs by user
   */
  static getLogsByUser = async (req, res) => {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      const filters = { userId };
      const result = await ActivityLogger.getFilteredActivities(
        filters,
        parseInt(page),
        parseInt(limit)
      );

      res.status(200).json({
        status: 'success',
        message: 'User activity logs retrieved successfully',
        data: result.logs,
        pagination: result.pagination
      });

    } catch (error) {
      console.error('Get logs by user error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to retrieve user activity logs, please try again later'
      });
    }
  };

  /**
   * Export logs to CSV
   */
  static exportLogs = async (req, res) => {
    try {
      const {
        userType,
        action,
        status,
        startDate,
        endDate,
        format = 'csv'
      } = req.query;

      // Build filters
      const filters = {};
      if (userType) filters.userType = userType;
      if (action) filters.action = action;
      if (status) filters.status = status;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      // Get all logs matching filters (no pagination for export)
      const logs = await ActivityLogs.find(filters)
        .populate('userId', 'name email role department')
        .sort({ createdAt: -1 });

      if (format === 'csv') {
        // Generate CSV
        const csvHeader = 'Timestamp,User Type,User Email,User Name,Action,Status,Severity,Details,IP Address\n';
        const csvRows = logs.map(log => {
          const details = JSON.stringify(log.details).replace(/"/g, '""');
          return `"${log.createdAt.toISOString()}","${log.userType}","${log.userEmail}","${log.userName}","${log.action}","${log.status}","${log.severity}","${details}","${log.ipAddress || ''}"`;
        }).join('\n');

        const csvContent = csvHeader + csvRows;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=activity_logs.csv');
        res.send(csvContent);
      } else {
        // Return JSON
        res.status(200).json({
          status: 'success',
          message: 'Activity logs exported successfully',
          data: logs.map(log => log.formatForDisplay())
        });
      }

    } catch (error) {
      console.error('Export logs error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to export activity logs, please try again later'
      });
    }
  };

  /**
   * Get log details by ID
   */
  static getLogById = async (req, res) => {
    try {
      const { logId } = req.params;

      const log = await ActivityLogs.findById(logId)
        .populate('userId', 'name email role department employeeId');

      if (!log) {
        return res.status(404).json({
          status: 'failed',
          message: 'Activity log not found'
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'Activity log details retrieved successfully',
        data: log.formatForDisplay()
      });

    } catch (error) {
      console.error('Get log by ID error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to retrieve activity log details, please try again later'
      });
    }
  };

  /**
   * Get available filter options
   */
  static getFilterOptions = async (req, res) => {
    try {
      const [userTypes, actions, statuses, severities] = await Promise.all([
        ActivityLogs.distinct('userType'),
        ActivityLogs.distinct('action'),
        ActivityLogs.distinct('status'),
        ActivityLogs.distinct('severity')
      ]);

      res.status(200).json({
        status: 'success',
        message: 'Filter options retrieved successfully',
        data: {
          userTypes,
          actions,
          statuses,
          severities
        }
      });

    } catch (error) {
      console.error('Get filter options error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to retrieve filter options, please try again later'
      });
    }
  };
}

export default LogsController;
