import { getBaseURL } from '../utils/env.js';

const baseURL = getBaseURL();

export const supportTicketService = {
  /**
   * Create a new support ticket
   */
  createTicket: async (ticketData, files = []) => {
    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      
      formData.append('category', ticketData.category || 'general');
      formData.append('priority', ticketData.priority || 'medium');
      formData.append('subject', ticketData.subject);
      formData.append('description', ticketData.description);
      
      // Add attachments if any
      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append('attachments', file);
        });
      }

      const response = await fetch(`${baseURL}/api/support/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating support ticket:', error);
      throw error;
    }
  },

  /**
   * Get user's tickets
   */
  getUserTickets: async (filters = {}) => {
    try {
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`${baseURL}/api/support/user/list?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user tickets:', error);
      throw error;
    }
  },

  /**
   * Get all tickets (Admin/Staff)
   */
  getAllTickets: async (filters = {}) => {
    try {
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`${baseURL}/api/support/admin/all?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching all tickets:', error);
      throw error;
    }
  },

  /**
   * Get ticket by ID
   */
  getTicketById: async (ticketId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${baseURL}/api/support/user/${ticketId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching ticket:', error);
      throw error;
    }
  },

  /**
   * Add response to ticket
   */
  addResponse: async (ticketId, message, files = []) => {
    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      
      formData.append('message', message);
      
      // Add attachments if any
      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append('attachments', file);
        });
      }

      const response = await fetch(`${baseURL}/api/support/${ticketId}/response`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding response:', error);
      throw error;
    }
  },

  /**
   * Assign ticket
   */
  assignTicket: async (ticketId, assignedTo) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${baseURL}/api/support/${ticketId}/assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ assignedTo })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error assigning ticket:', error);
      throw error;
    }
  },

  /**
   * Resolve ticket
   */
  resolveTicket: async (ticketId, resolutionNotes = '') => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${baseURL}/api/support/${ticketId}/resolve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ resolutionNotes })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error resolving ticket:', error);
      throw error;
    }
  },

  /**
   * Update ticket status
   */
  updateTicketStatus: async (ticketId, status) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${baseURL}/api/support/${ticketId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating ticket status:', error);
      throw error;
    }
  },

  /**
   * Add rating and feedback
   */
  addRating: async (ticketId, rating, feedback = '') => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${baseURL}/api/support/${ticketId}/rating`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rating, feedback })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding rating:', error);
      throw error;
    }
  }
};
