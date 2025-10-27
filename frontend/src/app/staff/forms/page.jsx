'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminFetch } from '@/lib/services/admin';

export default function StaffFormsPage() {
  const router = useRouter();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    serviceType: "",
    status: "",
    search: ""
  });

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // View mode
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Verification modal
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState('');

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

  // Load forms
  const loadForms = async () => {
    try {
      setLoading(true);
      setError('');

      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });

      const response = await adminFetch(`/api/forms/staff/forms?${queryParams}`);
      
      if (response.status === "success") {
        setForms(response.data.forms || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination?.total || 0,
          pages: response.data.pagination?.pages || 0
        }));
      } else {
        setError(response.message || 'Failed to load forms');
      }
    } catch (err) {
      console.error('Error loading forms:', err);
      setError(err.message || 'Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  // Load forms when component mounts or filters change
  useEffect(() => {
    if (userInfo) {
      loadForms();
    }
  }, [pagination.page, pagination.limit, filters, userInfo]);

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      serviceType: "",
      status: "",
      search: ""
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle form verification
  const handleVerifyForm = async () => {
    if (!selectedForm) return;

    try {
      await adminFetch(`/api/forms/forms/${selectedForm._id}/verify`, {
        method: 'POST',
        body: JSON.stringify({
          notes: verificationNotes
        })
      });

      setShowVerifyModal(false);
      setSelectedForm(null);
      setVerificationNotes('');
      loadForms(); // Reload forms
    } catch (err) {
      console.error('Error verifying form:', err);
      setError(err.message || 'Failed to verify form');
    }
  };

  // Open verification modal
  const openVerifyModal = (form) => {
    setSelectedForm(form);
    setVerificationNotes('');
    setShowVerifyModal(true);
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

  if (loading && forms.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your assigned forms...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">My Assigned Forms</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage forms assigned to you for review and verification
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Welcome, <span className="font-medium text-gray-900">{userInfo?.name}</span>
              </div>
              <div className="text-xs text-gray-400">
                Role: {userInfo?.role}
              </div>
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

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
              <select
                value={filters.serviceType}
                onChange={(e) => handleFilterChange('serviceType', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Services</option>
                {Object.entries(serviceTypes).map(([key, value]) => (
                  <option key={key} value={key}>{value.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search forms..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">View:</span>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
          <div className="text-sm text-gray-500">
            {pagination.total} forms found
          </div>
        </div>

        {/* Forms List */}
        {forms.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No forms assigned</h3>
            <p className="mt-1 text-sm text-gray-500">You don't have any forms assigned to you yet.</p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {forms.map((form) => (
                  <div key={form._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {form.formTitle || 'Untitled Form'}
                          </h3>
                          <p className="text-sm text-gray-500 mb-3">
                            {getServiceTypeInfo(form.serviceType).name}
                          </p>
                          <div className="flex items-center space-x-2 mb-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(form.status)}`}>
                              {form.status}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 space-y-1">
                            <p>Created: {formatDate(form.createdAt)}</p>
                            <p>Updated: {formatDate(form.updatedAt)}</p>
                            {form.verifiedAt && (
                              <p>Verified: {formatDate(form.verifiedAt)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <button
                          onClick={() => router.push(`/staff/forms/${form._id}`)}
                          className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          View Details
                        </button>
                        {form.status === 'submitted' && (
                          <button
                            onClick={() => openVerifyModal(form)}
                            className="flex-1 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            Verify
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {forms.map((form) => (
                    <li key={form._id}>
                      <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className={`w-3 h-3 rounded-full ${getServiceTypeInfo(form.serviceType).color === 'blue' ? 'bg-blue-500' : 
                              getServiceTypeInfo(form.serviceType).color === 'green' ? 'bg-green-500' :
                              getServiceTypeInfo(form.serviceType).color === 'purple' ? 'bg-purple-500' :
                              getServiceTypeInfo(form.serviceType).color === 'orange' ? 'bg-orange-500' :
                              getServiceTypeInfo(form.serviceType).color === 'red' ? 'bg-red-500' :
                              getServiceTypeInfo(form.serviceType).color === 'pink' ? 'bg-pink-500' :
                              getServiceTypeInfo(form.serviceType).color === 'indigo' ? 'bg-indigo-500' :
                              getServiceTypeInfo(form.serviceType).color === 'yellow' ? 'bg-yellow-500' :
                              getServiceTypeInfo(form.serviceType).color === 'teal' ? 'bg-teal-500' :
                              getServiceTypeInfo(form.serviceType).color === 'cyan' ? 'bg-cyan-500' : 'bg-gray-500'}`}></div>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-gray-900">
                                {form.formTitle || 'Untitled Form'}
                              </p>
                              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(form.status)}`}>
                                {form.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              {getServiceTypeInfo(form.serviceType).name}
                            </p>
                            <p className="text-xs text-gray-400">
                              Created: {formatDate(form.createdAt)} • Updated: {formatDate(form.updatedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => router.push(`/staff/forms/${form._id}`)}
                            className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            View
                          </button>
                          {form.status === 'submitted' && (
                            <button
                              onClick={() => openVerifyModal(form)}
                              className="px-3 py-1 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                              Verify
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Verify Form
              </h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Form: {selectedForm?.formTitle || 'Untitled Form'}
                </p>
                <p className="text-xs text-gray-500">
                  Service: {getServiceTypeInfo(selectedForm?.serviceType).name}
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Notes (Optional)
                </label>
                <textarea
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="Add any notes about your verification..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleVerifyForm}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                >
                  Verify Form
                </button>
                <button
                  onClick={() => {
                    setShowVerifyModal(false);
                    setSelectedForm(null);
                    setVerificationNotes('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
