"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { adminFetch } from "@/lib/services/admin";

export default function FormDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id;

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Form data for editing
  const [formData, setFormData] = useState({
    status: "",
    adminNotes: "",
    fields: {}
  });

  // Load form details
  const loadForm = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await adminFetch(`/api/forms/${formId}`);
      
      if (response.success) {
        setForm(response.data.formData);
        setFormData({
          status: response.data.formData.status,
          adminNotes: response.data.formData.adminNotes || "",
          fields: response.data.formData.fields || {}
        });
      } else {
        setError(response.message || "Failed to load form");
      }
    } catch (err) {
      setError(err.message || "Error loading form");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formId) {
      loadForm();
    }
  }, [formId]);

  // Handle form update
  const handleUpdateForm = async () => {
    try {
      setSaving(true);
      
      const response = await adminFetch(`/api/forms/${formId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.success) {
        setForm(response.data.formData);
        setEditMode(false);
        alert("Form updated successfully!");
      } else {
        alert(response.message || "Failed to update form");
      }
    } catch (err) {
      alert(err.message || "Error updating form");
    } finally {
      setSaving(false);
    }
  };

  // Handle field change
  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [fieldName]: value
      }
    }));
  };

  // Handle form deletion
  const handleDeleteForm = async () => {
    if (!confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      
      const response = await adminFetch(`/api/forms/${formId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        alert("Form deleted successfully!");
        router.push('/admin/forms-data');
      } else {
        alert(response.message || "Failed to delete form");
      }
    } catch (err) {
      alert(err.message || "Error deleting form");
    } finally {
      setSaving(false);
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'submitted': return 'bg-purple-100 text-purple-800';
      case 'under_review': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get service type display name and icon
  const getServiceTypeInfo = (serviceType) => {
    const types = {
      'sale-deed': { name: 'Sale Deed', icon: '🏠', color: 'bg-blue-50 border-blue-200' },
      'will-deed': { name: 'Will Deed', icon: '📜', color: 'bg-green-50 border-green-200' },
      'trust-deed': { name: 'Trust Deed', icon: '🤝', color: 'bg-purple-50 border-purple-200' },
      'property-registration': { name: 'Property Registration', icon: '📋', color: 'bg-orange-50 border-orange-200' },
      'power-of-attorney': { name: 'Power of Attorney', icon: '⚖️', color: 'bg-red-50 border-red-200' },
      'adoption-deed': { name: 'Adoption Deed', icon: '👶', color: 'bg-pink-50 border-pink-200' },
      'contact-form': { name: 'Contact Form', icon: '📞', color: 'bg-gray-50 border-gray-200' }
    };
    return types[serviceType] || { name: serviceType, icon: '📄', color: 'bg-gray-50 border-gray-200' };
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render form field
  const renderFormField = (fieldName, fieldValue, fieldType = 'text') => {
    const displayName = fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    
    if (editMode) {
      switch (fieldType) {
        case 'textarea':
          return (
            <textarea
              value={fieldValue || ''}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          );
        case 'select':
          return (
            <select
              value={fieldValue || ''}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select an option</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          );
        case 'checkbox':
          return (
            <input
              type="checkbox"
              checked={fieldValue === true || fieldValue === 'true'}
              onChange={(e) => handleFieldChange(fieldName, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          );
        default:
          return (
            <input
              type={fieldType}
              value={fieldValue || ''}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          );
      }
    } else {
      if (fieldType === 'checkbox') {
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            fieldValue === true || fieldValue === 'true' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {fieldValue === true || fieldValue === 'true' ? 'Yes' : 'No'}
          </span>
        );
      }
      return (
        <p className="text-sm text-gray-900 break-words">
          {fieldValue || 'Not provided'}
        </p>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading form details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Form</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-4">
            <button
              onClick={loadForm}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
            <Link
              href="/admin/forms-data"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Back to Forms
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-400 text-4xl mb-4">📄</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Form Not Found</h2>
          <p className="text-gray-600 mb-4">The requested form could not be found.</p>
          <Link
            href="/admin/forms-data"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Forms
          </Link>
        </div>
      </div>
    );
  }

  const serviceInfo = getServiceTypeInfo(form.serviceType);
  const progress = form.progressPercentage || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  href="/admin/forms-data"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{serviceInfo.icon}</span>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {serviceInfo.name}
                    </h1>
                    <p className="text-sm text-gray-500 font-mono">
                      Form ID: {form._id}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeColor(form.status)}`}>
                  {form.status}
                </span>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    editMode 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {editMode ? 'View Mode' : 'Edit Mode'}
                </button>
                <button
                  onClick={handleDeleteForm}
                  disabled={saving}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                >
                  {saving ? 'Deleting...' : 'Delete Form'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Form Information */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Form Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Form Title
                  </label>
                  <p className="text-sm text-gray-900">{form.formTitle || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Type
                  </label>
                  <p className="text-sm text-gray-900">{serviceInfo.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  {editMode ? (
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="draft">Draft</option>
                      <option value="submitted">Submitted</option>
                      <option value="in-progress">In Progress</option>
                      <option value="under_review">Under Review</option>
                      <option value="completed">Completed</option>
                    </select>
                  ) : (
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(form.status)}`}>
                      {form.status}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Progress
                  </label>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{progress}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Form Data</h2>
              <div className="space-y-4">
                {Object.entries(formData.fields).map(([fieldName, fieldValue]) => (
                  <div key={fieldName} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </label>
                    {renderFormField(fieldName, fieldValue, 
                      fieldName.toLowerCase().includes('message') || fieldName.toLowerCase().includes('description') ? 'textarea' :
                      fieldName.toLowerCase().includes('email') ? 'email' :
                      fieldName.toLowerCase().includes('phone') || fieldName.toLowerCase().includes('number') ? 'tel' :
                      fieldName.toLowerCase().includes('date') ? 'date' :
                      fieldName.toLowerCase().includes('newsletter') || fieldName.toLowerCase().includes('agree') ? 'checkbox' :
                      'text'
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Notes */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Notes</h2>
              {editMode ? (
                <textarea
                  value={formData.adminNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, adminNotes: e.target.value }))}
                  placeholder="Add notes about this form..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
              ) : (
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {formData.adminNotes || 'No notes added yet.'}
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Information */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {form.userId?.name ? form.userId.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {form.userId?.name || 'Unknown User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {form.userId?.email || 'No email'}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    User ID
                  </label>
                  <p className="text-xs text-gray-500 font-mono">
                    {form.userId?._id || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <p className="text-xs text-gray-500">
                    {form.userId?.role || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Form Timeline */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Form Timeline</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Created
                  </label>
                  <p className="text-xs text-gray-500">
                    {formatDate(form.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Last Updated
                  </label>
                  <p className="text-xs text-gray-500">
                    {formatDate(form.lastActivityAt || form.updatedAt)}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Last Activity By
                  </label>
                  <p className="text-xs text-gray-500">
                    {form.lastActivityBy ? 'User' : 'System'}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            {editMode && (
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleUpdateForm}
                    disabled={saving}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
