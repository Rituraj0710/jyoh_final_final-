import SupportTicket from '../models/SupportTicket.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import logger from '../config/logger.js';

class SupportTicketController {
  /**
   * Create a new support ticket
   */
  static async createTicket(req, res) {
    try {
      const userId = req.user.id;
      const { category, priority, subject, description, attachments } = req.body;

      if (!subject || !description) {
        return res.status(400).json({
          status: 'failed',
          message: 'Subject and description are required'
        });
      }

      // Generate unique ticket number
      const ticketNumber = await SupportTicket.generateTicketNumber();

      // Process uploaded files to Cloudinary
      const { processMultipleFiles } = await import('../utils/fileUploadHelper.js');
      let processedAttachments = [];
      
      if (req.files && req.files.length > 0) {
        processedAttachments = await processMultipleFiles(req.files, 'support-tickets');
        processedAttachments = processedAttachments.map(file => ({
          filename: file.filename,
          url: file.cloudinaryUrl,
          size: file.size,
          contentType: file.contentType,
          publicId: file.publicId
        }));
      } else if (attachments && Array.isArray(attachments)) {
        processedAttachments = attachments;
      }

      const ticketData = {
        ticketNumber,
        userId,
        category: category || 'general',
        priority: priority || 'medium',
        subject,
        description,
        attachments: processedAttachments,
        status: 'open'
      };

      const ticket = new SupportTicket(ticketData);
      await ticket.save();

      // Populate user info
      await ticket.populate('userId', 'name email role');

      // Log the action
      await AuditLog.create({
        userId,
        userRole: req.user.role,
        action: 'ticket_created',
        resource: 'support_ticket',
        resourceId: ticket._id,
        details: {
          ticketNumber,
          category,
          priority,
          subject
        },
        success: true
      });

      logger.info(`Support ticket created: ${ticketNumber}`, {
        userId,
        ticketNumber,
        subject
      });

      res.status(201).json({
        status: 'success',
        message: 'Support ticket created successfully',
        data: ticket
      });

    } catch (error) {
      logger.error('Error creating support ticket:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error creating support ticket',
        error: error.message
      });
    }
  }

  /**
   * Get user's tickets
   */
  static async getUserTickets(req, res) {
    try {
      const userId = req.user.id;
      const { status, category, priority, limit, skip } = req.query;

      const filters = {
        status,
        category,
        priority,
        limit: parseInt(limit) || 50,
        skip: parseInt(skip) || 0
      };

      const tickets = await SupportTicket.getUserTickets(userId, filters);

      res.status(200).json({
        status: 'success',
        message: 'Tickets retrieved successfully',
        data: tickets,
        count: tickets.length
      });

    } catch (error) {
      logger.error('Error fetching user tickets:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error fetching tickets',
        error: error.message
      });
    }
  }

  /**
   * Get all tickets (Admin/Staff)
   */
  static async getAllTickets(req, res) {
    try {
      const { status, category, priority, assignedTo, userId, limit, skip } = req.query;

      const filters = {
        status,
        category,
        priority,
        assignedTo,
        userId,
        limit: parseInt(limit) || 100,
        skip: parseInt(skip) || 0
      };

      const tickets = await SupportTicket.getAdminTickets(filters);

      // Get statistics
      const stats = await SupportTicket.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const statusCounts = {
        open: 0,
        in_progress: 0,
        resolved: 0,
        closed: 0
      };

      stats.forEach(stat => {
        statusCounts[stat._id] = stat.count;
      });

      res.status(200).json({
        status: 'success',
        message: 'Tickets retrieved successfully',
        data: tickets,
        statistics: statusCounts,
        count: tickets.length
      });

    } catch (error) {
      logger.error('Error fetching tickets:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error fetching tickets',
        error: error.message
      });
    }
  }

  /**
   * Get ticket by ID
   */
  static async getTicketById(req, res) {
    try {
      const { id } = req.params;

      const ticket = await SupportTicket.findById(id)
        .populate('userId', 'name email role phone')
        .populate('assignedTo', 'name email role')
        .populate('resolvedBy', 'name email role')
        .populate('responses.responseBy', 'name email role');

      if (!ticket) {
        return res.status(404).json({
          status: 'failed',
          message: 'Ticket not found'
        });
      }

      // Check if user has access (owner or admin/staff)
      if (ticket.userId._id.toString() !== req.user.id && !['admin', 'staff1', 'staff2', 'staff3', 'staff4', 'staff5'].includes(req.user.role)) {
        return res.status(403).json({
          status: 'failed',
          message: 'Access denied'
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'Ticket retrieved successfully',
        data: ticket
      });

    } catch (error) {
      logger.error('Error fetching ticket:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error fetching ticket',
        error: error.message
      });
    }
  }

  /**
   * Add response to ticket
   */
  static async addResponse(req, res) {
    try {
      const { id } = req.params;
      const { message, attachments } = req.body;
      const responseBy = req.user.id;

      if (!message) {
        return res.status(400).json({
          status: 'failed',
          message: 'Message is required'
        });
      }

      const ticket = await SupportTicket.findById(id);

      if (!ticket) {
        return res.status(404).json({
          status: 'failed',
          message: 'Ticket not found'
        });
      }

      // Check access
      if (ticket.userId.toString() !== req.user.id && !['admin', 'staff1', 'staff2', 'staff3', 'staff4', 'staff5'].includes(req.user.role)) {
        return res.status(403).json({
          status: 'failed',
          message: 'Access denied'
        });
      }

      // Add response
      await ticket.addResponse(responseBy, message, attachments || []);

      // Log the action
      await AuditLog.create({
        userId: responseBy,
        userRole: req.user.role,
        action: 'ticket_response_added',
        resource: 'support_ticket',
        resourceId: ticket._id,
        details: {
          ticketNumber: ticket.ticketNumber,
          message
        },
        success: true
      });

      logger.info(`Response added to ticket: ${ticket.ticketNumber}`, {
        responseBy,
        ticketId: ticket._id
      });

      res.status(200).json({
        status: 'success',
        message: 'Response added successfully',
        data: ticket
      });

    } catch (error) {
      logger.error('Error adding response:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error adding response',
        error: error.message
      });
    }
  }

  /**
   * Assign ticket
   */
  static async assignTicket(req, res) {
    try {
      const { id } = req.params;
      const { assignedTo } = req.body;
      const assignedBy = req.user.id;

      if (!assignedTo) {
        return res.status(400).json({
          status: 'failed',
          message: 'Assigned to user ID is required'
        });
      }

      // Check if user exists and is staff/admin
      const user = await User.findById(assignedTo);
      if (!user) {
        return res.status(404).json({
          status: 'failed',
          message: 'User not found'
        });
      }

      const ticket = await SupportTicket.findById(id);

      if (!ticket) {
        return res.status(404).json({
          status: 'failed',
          message: 'Ticket not found'
        });
      }

      // Update ticket
      ticket.assignedTo = assignedTo;
      ticket.assignedAt = new Date();
      ticket.status = 'in_progress';
      await ticket.save();

      // Log the action
      await AuditLog.create({
        userId: assignedBy,
        userRole: req.user.role,
        action: 'ticket_assigned',
        resource: 'support_ticket',
        resourceId: ticket._id,
        details: {
          ticketNumber: ticket.ticketNumber,
          assignedTo
        },
        success: true
      });

      logger.info(`Ticket assigned: ${ticket.ticketNumber}`, {
        assignedBy,
        assignedTo,
        ticketId: ticket._id
      });

      res.status(200).json({
        status: 'success',
        message: 'Ticket assigned successfully',
        data: ticket
      });

    } catch (error) {
      logger.error('Error assigning ticket:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error assigning ticket',
        error: error.message
      });
    }
  }

  /**
   * Resolve ticket
   */
  static async resolveTicket(req, res) {
    try {
      const { id } = req.params;
      const { resolutionNotes } = req.body;
      const resolvedBy = req.user.id;

      const ticket = await SupportTicket.findById(id);

      if (!ticket) {
        return res.status(404).json({
          status: 'failed',
          message: 'Ticket not found'
        });
      }

      // Resolve ticket
      await ticket.resolveTicket(resolvedBy, resolutionNotes);

      // Log the action
      await AuditLog.create({
        userId: resolvedBy,
        userRole: req.user.role,
        action: 'ticket_resolved',
        resource: 'support_ticket',
        resourceId: ticket._id,
        details: {
          ticketNumber: ticket.ticketNumber,
          resolutionNotes
        },
        success: true
      });

      logger.info(`Ticket resolved: ${ticket.ticketNumber}`, {
        resolvedBy,
        ticketId: ticket._id
      });

      res.status(200).json({
        status: 'success',
        message: 'Ticket resolved successfully',
        data: ticket
      });

    } catch (error) {
      logger.error('Error resolving ticket:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error resolving ticket',
        error: error.message
      });
    }
  }

  /**
   * Update ticket status
   */
  static async updateTicketStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updatedBy = req.user.id;

      if (!status) {
        return res.status(400).json({
          status: 'failed',
          message: 'Status is required'
        });
      }

      const ticket = await SupportTicket.findById(id);

      if (!ticket) {
        return res.status(404).json({
          status: 'failed',
          message: 'Ticket not found'
        });
      }

      // Update status
      ticket.status = status;
      if (status === 'resolved' && !ticket.resolvedAt) {
        ticket.resolvedAt = new Date();
        ticket.resolvedBy = updatedBy;
      }
      await ticket.save();

      // Log the action
      await AuditLog.create({
        userId: updatedBy,
        userRole: req.user.role,
        action: 'ticket_status_updated',
        resource: 'support_ticket',
        resourceId: ticket._id,
        details: {
          ticketNumber: ticket.ticketNumber,
          status
        },
        success: true
      });

      logger.info(`Ticket status updated: ${ticket.ticketNumber}`, {
        updatedBy,
        ticketId: ticket._id,
        status
      });

      res.status(200).json({
        status: 'success',
        message: 'Ticket status updated successfully',
        data: ticket
      });

    } catch (error) {
      logger.error('Error updating ticket status:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error updating ticket status',
        error: error.message
      });
    }
  }

  /**
   * Add rating and feedback
   */
  static async addRating(req, res) {
    try {
      const { id } = req.params;
      const { rating, feedback } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          status: 'failed',
          message: 'Valid rating (1-5) is required'
        });
      }

      const ticket = await SupportTicket.findById(id);

      if (!ticket) {
        return res.status(404).json({
          status: 'failed',
          message: 'Ticket not found'
        });
      }

      // Check if user is the ticket owner
      if (ticket.userId.toString() !== req.user.id) {
        return res.status(403).json({
          status: 'failed',
          message: 'Only ticket owner can add rating'
        });
      }

      ticket.rating = rating;
      ticket.feedback = feedback || '';
      await ticket.save();

      logger.info(`Rating added to ticket: ${ticket.ticketNumber}`, {
        userId: req.user.id,
        rating,
        ticketId: ticket._id
      });

      res.status(200).json({
        status: 'success',
        message: 'Rating added successfully',
        data: ticket
      });

    } catch (error) {
      logger.error('Error adding rating:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error adding rating',
        error: error.message
      });
    }
  }
}

export default SupportTicketController;
