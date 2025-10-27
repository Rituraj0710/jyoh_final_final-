'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { adminFetch } from '@/lib/services/admin';

export default function StaffFormDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  // Service types mapping
  const serviceTypes = {
    'property_registration': { name: 'Property Registration', color: 'blue' },
    'property_transfer': { name: 'Property Transfer', color: 'green' },
    'property_mortgage': { name: 'Property Mortgage', color: 'purple' },
    'property_lease': { name: 'Property Lease', color: 'orange' },
    'property_sale': { name: 'Property Sale', color: 'red' },
    'property_gift': { name: 'Property Gift', color: 'pink' },
    'property_inheritance': { name: 'Property Inheritance', color: 'indigo' },
    'property_partition': { name: 'Property Partition', color: 'yellow' },
    'property_survey': { name: 'Property Survey', color: 'teal' },
    'property_valuation': { name: 'Property Valuation', color: 'cyan' }
  };

  // Get service type info
  const getServiceTypeInfo = (serviceType) => {
    return serviceTypes[serviceType] || { name: serviceType, color: 'gray' };
  };

  // Load user info
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/staff/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserInfo(payload);
    } catch (error) {
      console.error('Error parsing token:', error);
      router.push('/staff/login');
    }
  }, [router]);

  // Load form details
  const loadForm = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await adminFetch(`/api/forms/forms/${params.id}`);
      
      if (response.status === "success") {
        setForm(response.data);
        setFormData(response.data.formData || {});
      } else {
        setError(response.message || 'Failed to load form');
      }
    } catch (err) {
      console.error('Error loading form:', err);
      setError(err.message || 'Failed to load form');
    } finally {
      setLoading(false);
    }
  };

  // Load form when component mounts
  useEffect(() => {
    if (userInfo && params.id) {
      loadForm();
    }
  }, [userInfo, params.id]);

  // Handle form data change
  const handleFormDataChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      
      await adminFetch(`/api/forms/forms/${params.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          formData: formData
        })
      });

      setIsEditing(false);
      loadForm(); // Reload form to get updated data
    } catch (err) {
      console.error('Error saving form:', err);
      setError(err.message || 'Failed to save form');
    } finally {
      setSaving(false);
    }
  };

  // Handle verify form
  const handleVerifyForm = async () => {
    if (!confirm('Are you sure you want to verify this form? This action cannot be undone.')) {
      return;
    }

    try {
      await adminFetch(`/api/forms/forms/${params.id}/verify`, {
        method: 'POST',
        body: JSON.stringify({
          notes: 'Form verified by staff'
        })
      });

      loadForm(); // Reload form to get updated status
    } catch (err) {
      console.error('Error verifying form:', err);
      setError(err.message || 'Failed to verify form');
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'verified': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'under_review': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render form field
  const renderFormField = (key, value, label) => {
    if (isEditing) {
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label || key}
          </label>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleFormDataChange(key, e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      );
    } else {
      return (
        <div className="mb-4">
          <dt className="text-sm font-medium text-gray-500">{label || key}</dt>
          <dd className="mt-1 text-sm text-gray-900">{value || 'N/A'}</dd>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading form details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium mb-2">Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/staff/forms')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Forms
          </button>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-lg font-medium mb-2">Form not found</div>
          <button
            onClick={() => router.push('/staff/forms')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Forms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {form.formTitle || 'Untitled Form'}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {getServiceTypeInfo(form.serviceType).name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(form.status)}`}>
                {form.status}
              </span>
              <button
                onClick={() => router.push('/staff/forms')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Back to Forms
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Details */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Form Details</h3>
                  {form.status === 'submitted' && (
                    <div className="flex space-x-2">
                      {!isEditing ? (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
                        >
                          Edit Form
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={handleSaveChanges}
                            disabled={saving}
                            className="px-4 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 disabled:opacity-50"
                          >
                            {saving ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button
                            onClick={() => {
                              setIsEditing(false);
                              setFormData(form.formData || {});
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  {Object.entries(formData).map(([key, value]) => (
                    <div key={key}>
                      {renderFormField(key, value, key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()))}
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>

          {/* Form Information */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Form Information</h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Form ID</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-mono">{form._id}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Service Type</dt>
                    <dd className="mt-1 text-sm text-gray-900">{getServiceTypeInfo(form.serviceType).name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(form.status)}`}>
                        {form.status}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(form.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(form.updatedAt)}</dd>
                  </div>
                  {form.verifiedAt && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Verified At</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatDate(form.verifiedAt)}</dd>
                    </div>
                  )}
                  {form.verifiedBy && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Verified By</dt>
                      <dd className="mt-1 text-sm text-gray-900">{form.verifiedBy.name || 'Staff Member'}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
                <div className="space-y-3">
                  {form.status === 'submitted' && (
                    <button
                      onClick={handleVerifyForm}
                      className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      Verify Form
                    </button>
                  )}
                  <button
                    onClick={() => router.push('/staff/forms')}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Back to Forms
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
