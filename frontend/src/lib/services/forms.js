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

// Forms API service
export const formsAPI = {
  // Save form as draft
  saveForm: async (formData) => {
    const response = await fetch(`${API_BASE}/api/forms/save`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(formData)
    });
    return handleResponse(response);
  },

  // Submit form (mark as completed)
  submitForm: async (formData) => {
    const response = await fetch(`${API_BASE}/api/forms/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(formData)
    });
    return handleResponse(response);
  },

  // Get user's forms
  getUserForms: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_BASE}/api/forms/user-forms?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get single form by ID
  getFormById: async (formId) => {
    const response = await fetch(`${API_BASE}/api/forms/${formId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get form statistics
  getFormStats: async () => {
    const response = await fetch(`${API_BASE}/api/forms/stats`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Admin forms API service
export const adminFormsAPI = {
  // Get all forms for admin
  getAdminForms: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_BASE}/api/admin/forms?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get single form by ID (admin)
  getFormById: async (formId) => {
    const response = await fetch(`${API_BASE}/api/admin/forms/${formId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Update form (admin)
  updateForm: async (formId, formData) => {
    const response = await fetch(`${API_BASE}/api/admin/forms/${formId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(formData)
    });
    return handleResponse(response);
  },

  // Delete form (admin)
  deleteForm: async (formId) => {
    const response = await fetch(`${API_BASE}/api/admin/forms/${formId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get form statistics (admin)
  getFormStats: async () => {
    const response = await fetch(`${API_BASE}/api/admin/forms/stats`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Form utilities
export const formUtils = {
  // Get service type display name
  getServiceTypeName: (serviceType) => {
    const names = {
      'sale-deed': 'Sale Deed',
      'will-deed': 'Will Deed',
      'trust-deed': 'Trust Deed',
      'property-registration': 'Property Registration',
      'power-of-attorney': 'Power of Attorney',
      'adoption-deed': 'Adoption Deed'
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

  // Calculate form progress
  calculateProgress: (fields, requiredFields) => {
    if (!fields || !requiredFields) return 0;
    const filledFields = Object.keys(fields).filter(key => 
      fields[key] !== null && fields[key] !== undefined && fields[key] !== ''
    ).length;
    return Math.round((filledFields / requiredFields.length) * 100);
  },

  // Validate form fields
  validateForm: (fields, requiredFields) => {
    const errors = {};
    requiredFields.forEach(field => {
      if (!fields[field] || fields[field] === '') {
        errors[field] = `${field} is required`;
      }
    });
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};

export default formsAPI;
