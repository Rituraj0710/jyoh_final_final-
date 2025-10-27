"use client";
import React, { useState, useEffect } from 'react';
import { userFormsAPI, userFormUtils } from '@/lib/services/userForms';
import FormPreviewModal from './FormPreviewModal';

const UserFormsHistory = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Filters
  const [filters, setFilters] = useState({
    serviceType: '',
    status: ''
  });

  // Selected form for preview
  const [selectedForm, setSelectedForm] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Load forms data
  const loadForms = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };

      const response = await userFormsAPI.getUserForms(params);
      
      if (response.success) {
        setForms(response.data.forms);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || 'Failed to load forms');
      }
    } catch (err) {
      setError(err.message || 'Error loading forms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForms();
  }, [pagination.page, pagination.limit, filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  // Handle form preview
  const handlePreviewForm = async (formId) => {
    try {
      const response = await userFormsAPI.getFormById(formId);
      if (response.success) {
        setSelectedForm(response.data.formData);
        setShowPreviewModal(true);
      }
    } catch (err) {
      alert(err.message || 'Error loading form details');
    }
  };

  // Handle form download
  const handleDownloadForm = async (form) => {
    try {
      if (form.status !== 'completed') {
        alert('Only completed forms can be downloaded');
        return;
      }

      const blob = await userFormsAPI.downloadForm(form._id);
      const filename = `${userFormUtils.getServiceTypeName(form.serviceType)}-${form._id}.pdf`;
      userFormUtils.downloadFile(blob, filename);
    } catch (err) {
      alert(err.message || 'Error downloading form');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">My Forms History</h2>
            <p className="text-sm text-gray-500 mt-1">
              View and manage all your submitted forms
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Total: {pagination.total} forms
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Type
            </label>
            <select
              value={filters.serviceType}
              onChange={(e) => handleFilterChange('serviceType', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Services</option>
              <option value="sale-deed">Sale Deed</option>
              <option value="will-deed">Will Deed</option>
              <option value="trust-deed">Trust Deed</option>
              <option value="property-registration">Property Registration</option>
              <option value="power-of-attorney">Power of Attorney</option>
              <option value="adoption-deed">Adoption Deed</option>
              <option value="contact-form">Contact Form</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ serviceType: '', status: '' })}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Forms Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Forms History</h3>
            <div className="flex items-center space-x-2">
              <select
                value={pagination.limit}
                onChange={(e) => setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
              <button
                onClick={loadForms}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-500">Loading forms...</p>
          </div>
        )}

        {error && (
          <div className="p-6 text-center">
            <div className="text-red-600 text-sm">{error}</div>
            <button
              onClick={loadForms}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Form ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {forms.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        No forms found
                      </td>
                    </tr>
                  ) : (
                    forms.map((form) => (
                      <tr key={form._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {form._id.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {userFormUtils.getServiceTypeName(form.serviceType)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${userFormUtils.getStatusBadgeColor(form.status)}`}>
                            {form.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${form.progressPercentage || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">{form.progressPercentage || 0}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {userFormUtils.formatDate(form.lastActivityAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handlePreviewForm(form._id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Preview
                          </button>
                          {form.status === 'completed' && (
                            <button
                              onClick={() => handleDownloadForm(form)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Download PDF
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Form Preview Modal */}
      {showPreviewModal && selectedForm && (
        <FormPreviewModal
          form={selectedForm}
          onClose={() => {
            setShowPreviewModal(false);
            setSelectedForm(null);
          }}
        />
      )}
    </div>
  );
};

export default UserFormsHistory;
