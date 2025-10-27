import { getBaseURL } from '../utils/env.js';

const baseURL = getBaseURL();

export const ledgerService = {
  /**
   * Get user's ledger entries
   */
  getUserLedger: async (filters = {}) => {
    try {
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`${baseURL}/api/ledger/user/ledger?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user ledger:', error);
      throw error;
    }
  },

  /**
   * Get all ledger entries (Admin/Staff)
   */
  getAllLedger: async (filters = {}) => {
    try {
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`${baseURL}/api/ledger/admin/all?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching all ledger:', error);
      throw error;
    }
  },

  /**
   * Get pending payments
   */
  getPendingPayments: async (filters = {}) => {
    try {
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`${baseURL}/api/ledger/admin/pending-payments?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      throw error;
    }
  },

  /**
   * Get credit report
   */
  getCreditReport: async (filters = {}) => {
    try {
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`${baseURL}/api/ledger/admin/credit-report?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching credit report:', error);
      throw error;
    }
  },

  /**
   * Verify payment
   */
  verifyPayment: async (transactionId, notes = '') => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${baseURL}/api/ledger/admin/verify-payment/${transactionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  },

  /**
   * Export ledger report
   */
  exportLedgerReport: async (filters = {}) => {
    try {
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`${baseURL}/api/ledger/admin/export?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ledger-report-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error exporting ledger report:', error);
      throw error;
    }
  }
};
