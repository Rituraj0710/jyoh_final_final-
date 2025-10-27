import User from '../models/User.js';
import Form from '../models/Form.js';
import AuditLog from '../models/AuditLog.js';
import logger from '../config/logger.js';

class AgentManagementController {
  /**
   * Get all approved agents with work statistics
   */
  static getApprovedAgents = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';

      // Build search query for approved agents only
      const searchQuery = {
        role: 'user2',
        status: 'approved'
      };

      if (search) {
        searchQuery.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ];
      }

      // Get total count
      const total = await User.countDocuments(searchQuery);

      // Get agents with pagination and populate work data
      const agents = await User.find(searchQuery)
        .select('-password -otp -otpExpiry')
        .populate('transactions', 'amount status createdAt')
        .populate('formsHandled', 'formType status createdAt')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      // Calculate work statistics for each agent
      const agentsWithStats = agents.map(agent => ({
        _id: agent._id,
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        status: agent.status,
        commissionEarned: agent.commissionEarned,
        totalTransactions: agent.totalTransactions,
        totalFormsHandled: agent.totalFormsHandled,
        lastActivity: agent.lastActivity,
        isActive: agent.isActive,
        createdAt: agent.createdAt,
        updatedAt: agent.updatedAt,
        // Calculate additional stats
        recentTransactions: agent.transactions?.slice(0, 5) || [],
        recentForms: agent.formsHandled?.slice(0, 5) || []
      }));

      res.status(200).json({
        success: true,
        data: {
          agents: agentsWithStats,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: limit
          }
        }
      });

    } catch (error) {
      logger.error('Error fetching approved agents:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch approved agents'
      });
    }
  };

  /**
   * Get agent's detailed work information
   */
  static getAgentWork = async (req, res) => {
    try {
      const { id } = req.params;

      // Find the agent
      const agent = await User.findById(id)
        .populate('transactions', 'amount status createdAt description')
        .populate('formsHandled', 'formType status createdAt userId')
        .select('-password -otp -otpExpiry');

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

      // Calculate detailed statistics
      const totalCommission = agent.commissionEarned || 0;
      const totalTransactions = agent.transactions?.length || 0;
      const totalForms = agent.formsHandled?.length || 0;
      
      // Calculate monthly stats
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);
      
      const monthlyTransactions = agent.transactions?.filter(
        t => new Date(t.createdAt) >= currentMonth
      ) || [];
      
      const monthlyForms = agent.formsHandled?.filter(
        f => new Date(f.createdAt) >= currentMonth
      ) || [];

      const monthlyCommission = monthlyTransactions.reduce(
        (sum, t) => sum + (t.amount * 0.05), 0 // Assuming 5% commission
      );

      res.status(200).json({
        success: true,
        data: {
          agent: {
            _id: agent._id,
            name: agent.name,
            email: agent.email,
            phone: agent.phone,
            status: agent.status,
            createdAt: agent.createdAt,
            lastActivity: agent.lastActivity,
            isActive: agent.isActive
          },
          workStats: {
            totalCommission,
            totalTransactions,
            totalForms,
            monthlyCommission,
            monthlyTransactions: monthlyTransactions.length,
            monthlyForms: monthlyForms.length
          },
          transactions: agent.transactions || [],
          formsHandled: agent.formsHandled || []
        }
      });

    } catch (error) {
      logger.error('Error fetching agent work:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch agent work details'
      });
    }
  };

  /**
   * Update agent's work (commission, transactions, forms)
   */
  static updateAgentWork = async (req, res) => {
    try {
      const { id } = req.params;
      const { commissionEarned, transactionId, formId, action } = req.body;
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

      // Update based on action
      let updateData = {};
      
      if (action === 'update_commission') {
        updateData.commissionEarned = commissionEarned;
      } else if (action === 'add_transaction' && transactionId) {
        updateData.$addToSet = { transactions: transactionId };
        updateData.$inc = { totalTransactions: 1 };
      } else if (action === 'add_form' && formId) {
        updateData.$addToSet = { formsHandled: formId };
        updateData.$inc = { totalFormsHandled: 1 };
      } else if (action === 'reset_commission') {
        updateData.commissionEarned = 0;
      }

      updateData.lastActivity = new Date();

      // Update the agent
      const updatedAgent = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password -otp -otpExpiry');

      // Log the activity
      await AuditLog.create({
        userId: adminId,
        userRole: 'admin',
        action: 'Agent Work Updated',
        resource: 'user',
        resourceId: id,
        resourceModel: 'User',
        success: true,
        details: {
          agentEmail: agent.email,
          action: action,
          changes: updateData
        },
        timestamp: new Date()
      });

      res.status(200).json({
        success: true,
        message: 'Agent work updated successfully',
        data: updatedAgent
      });

    } catch (error) {
      logger.error('Error updating agent work:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update agent work'
      });
    }
  };

  /**
   * Get agent statistics for dashboard
   */
  static getAgentStats = async (req, res) => {
    try {
      // Get total approved agents
      const totalAgents = await User.countDocuments({
        role: 'user2',
        status: 'approved'
      });

      // Get active agents (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const activeAgents = await User.countDocuments({
        role: 'user2',
        status: 'approved',
        lastActivity: { $gte: thirtyDaysAgo }
      });

      // Get total commission distributed
      const totalCommission = await User.aggregate([
        { $match: { role: 'user2', status: 'approved' } },
        { $group: { _id: null, total: { $sum: '$commissionEarned' } } }
      ]);

      // Get monthly commission
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      const monthlyCommission = await User.aggregate([
        { 
          $match: { 
            role: 'user2', 
            status: 'approved',
            lastActivity: { $gte: currentMonth }
          } 
        },
        { $group: { _id: null, total: { $sum: '$commissionEarned' } } }
      ]);

      res.status(200).json({
        success: true,
        data: {
          totalAgents,
          activeAgents,
          totalCommission: totalCommission[0]?.total || 0,
          monthlyCommission: monthlyCommission[0]?.total || 0
        }
      });

    } catch (error) {
      logger.error('Error fetching agent stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch agent statistics'
      });
    }
  };
}

export default AgentManagementController;
