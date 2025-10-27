const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';

// Helper function to get auth headers
const getAuthHeaders = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }
  return { 'Content-Type': 'application/json' };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

// User Forms API service
export const userFormsAPI = {
  // Get user's forms
  getUserForms: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_BASE}/api/user/forms?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get single form by ID
  getFormById: async (formId) => {
    const response = await fetch(`${API_BASE}/api/user/forms/${formId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Download form as PDF
  downloadForm: async (formId) => {
    const response = await fetch(`${API_BASE}/api/user/forms/${formId}/download`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Download failed');
    }
    
    // Return blob for download
    const blob = await response.blob();
    return blob;
  }
};

// Form utilities
export const userFormUtils = {
  // Get service type display name
  getServiceTypeName: (serviceType) => {
    const names = {
      'sale-deed': 'Sale Deed',
      'will-deed': 'Will Deed',
      'trust-deed': 'Trust Deed',
      'property-registration': 'Property Registration',
      'power-of-attorney': 'Power of Attorney',
      'adoption-deed': 'Adoption Deed',
      'contact-form': 'Contact Form'
    };
    return names[serviceType] || serviceType;
  },

  // Get status badge color
  getStatusBadgeColor: (status) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  },

  // Format date
  formatDate: (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Download file helper
  downloadFile: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};

export default userFormsAPI;
