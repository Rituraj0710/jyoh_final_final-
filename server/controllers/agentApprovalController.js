import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import logger from '../config/logger.js';

class AgentApprovalController {
  /**
   * Get agent requests with filtering by status
   */
  static getAgentRequests = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';
      const status = req.query.status || 'pending';

      // Build search query
      const searchQuery = {
        role: 'user2',
        ...(status !== 'all' && { status: status })
      };

      if (search) {
        searchQuery.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      // Get total count
      const total = await User.countDocuments(searchQuery);

      // Get agents with pagination
      const agents = await User.find(searchQuery)
        .select('-password -otp -otpExpiry')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      res.status(200).json({
        success: true,
        data: {
          agents,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: limit
          }
        }
      });

    } catch (error) {
      logger.error('Error fetching pending agents:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch agent requests'
      });
    }
  };

  /**
   * Approve an agent
   */
  static approveAgent = async (req, res) => {
    try {
      const { id } = req.params;
      const adminId = req.user.id;

      // Find the agent
      const agent = await User.findById(id);
      if (!agent) {
        return res.status(404).json({
          success: false,
          message: 'Agent not found'
        });
      }

      if (agent.role !== 'user2') {
        return res.status(400).json({
          success: false,
          message: 'User is not an agent'
        });
      }

      if (agent.status === 'approved') {
        return res.status(400).json({
          success: false,
          message: 'Agent is already approved'
        });
      }

      // Update agent status
      agent.status = 'approved';
      agent.updatedBy = adminId;
      await agent.save();

      // Log the approval
      await AuditLog.logAction({
        userId: adminId,
        userRole: req.user.role,
        action: 'Agent Approved',
        resource: 'user',
        resourceId: agentId,
        details: {
          agentEmail: agent.email,
          agentName: agent.name,
          approvedBy: req.user.name
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: true
      });

      logger.info(`Agent approved: ${agent.email} by admin: ${req.user.email}`);

      res.status(200).json({
        success: true,
        message: 'Agent approved successfully',
        data: {
          agentId: agent._id,
          email: agent.email,
          name: agent.name,
          status: agent.status
        }
      });

    } catch (error) {
      logger.error('Error approving agent:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to approve agent'
      });
    }
  };

  /**
   * Reject an agent
   */
  static rejectAgent = async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const adminId = req.user.id;

      // Find the agent
      const agent = await User.findById(id);
      if (!agent) {
        return res.status(404).json({
          success: false,
          message: 'Agent not found'
        });
      }

      if (agent.role !== 'user2') {
        return res.status(400).json({
          success: false,
          message: 'User is not an agent'
        });
      }

      if (agent.status === 'rejected') {
        return res.status(400).json({
          success: false,
          message: 'Agent is already rejected'
        });
      }

      // Update agent status
      agent.status = 'rejected';
      agent.updatedBy = adminId;
      await agent.save();

      // Log the rejection
      await AuditLog.logAction({
        userId: adminId,
        userRole: req.user.role,
        action: 'Agent Rejected',
        resource: 'user',
        resourceId: agentId,
        details: {
          agentEmail: agent.email,
          agentName: agent.name,
          rejectedBy: req.user.name,
          reason: reason || 'No reason provided'
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: true
      });

      logger.info(`Agent rejected: ${agent.email} by admin: ${req.user.email}, reason: ${reason || 'No reason provided'}`);

      res.status(200).json({
        success: true,
        message: 'Agent rejected successfully',
        data: {
          agentId: agent._id,
          email: agent.email,
          name: agent.name,
          status: agent.status
        }
      });

    } catch (error) {
      logger.error('Error rejecting agent:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reject agent'
      });
    }
  };

  /**
   * Get agent approval statistics
   */
  static getAgentStats = async (req, res) => {
    try {
      const stats = await User.aggregate([
        { $match: { role: 'user2' } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const formattedStats = {
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0
      };

      stats.forEach(stat => {
        formattedStats[stat._id] = stat.count;
        formattedStats.total += stat.count;
      });

      res.status(200).json({
        success: true,
        data: formattedStats
      });

    } catch (error) {
      logger.error('Error fetching agent stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch agent statistics'
      });
    }
  };

  /**
   * Export agent requests to CSV
   */
  static exportAgentRequests = async (req, res) => {
    try {
      const status = req.query.status || 'all';
      
      // Build search query
      const searchQuery = {
        role: 'user2',
        ...(status !== 'all' && { status: status })
      };

      // Get all agents for export
      const agents = await User.find(searchQuery)
        .select('-password -otp -otpExpiry')
        .sort({ createdAt: -1 });

      // Create CSV content
      const csvHeader = 'Name,Email,Phone,Status,Created At\n';
      const csvRows = agents.map(agent => {
        const createdAt = new Date(agent.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
        return `"${agent.name}","${agent.email}","${agent.phone || 'N/A'}","${agent.status}","${createdAt}"`;
      }).join('\n');

      const csvContent = csvHeader + csvRows;

      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="agent-requests-${status}-${new Date().toISOString().split('T')[0]}.csv"`);
      
      res.status(200).send(csvContent);
    } catch (error) {
      logger.error('Error exporting agent requests:', error);
      res.status(500).json({
        success: false,
        message: 'Unable to export agent requests, please try again later'
      });
    }
  };
}

export default AgentApprovalController;
