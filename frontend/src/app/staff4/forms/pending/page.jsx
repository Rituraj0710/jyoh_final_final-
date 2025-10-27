"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Staff4PendingFormsPage() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: 'pending_cross_verification',
    formType: '',
    search: ''
  });
  const [pagination, setPagination] = useState({});
  const { getAuthHeaders } = useAuth();

  useEffect(() => {
    fetchForms();
  }, [filters]);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(`${API_BASE}/api/staff/4/forms?${queryParams}`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setForms(data.data.forms);
        setPagination(data.data.pagination);
      } else {
        throw new Error('Failed to fetch forms');
      }
    } catch (error) {
      console.error('Error fetching forms:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending_cross_verification': 'bg-yellow-100 text-yellow-800',
      'cross_verified': 'bg-green-100 text-green-800',
      'needs_correction': 'bg-red-100 text-red-800',
      'under_review': 'bg-blue-100 text-blue-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.replace(/_/g, ' ').toUpperCase() || 'PENDING'}
      </span>
    );
  };

  const getVerificationStageBadge = (form) => {
    const staff1Complete = form.approvals?.staff1?.approved;
    const staff2Complete = form.approvals?.staff2?.approved;
    const staff3Complete = form.approvals?.staff3?.approved;

    if (staff1Complete && staff2Complete && staff3Complete) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Ready for Cross-Verification</span>;
    } else if (staff1Complete && staff2Complete) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Waiting for Staff3</span>;
    } else if (staff1Complete) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Waiting for Staff2</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Waiting for Staff1</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pending forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Pending Cross-Verification</h1>
          <p className="text-gray-600">Forms ready for Staff4 cross-verification</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Form Type</label>
              <select
                value={filters.formType}
                onChange={(e) => handleFilterChange('formType', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Types</option>
                <option value="property_registration">Property Registration</option>
                <option value="property_sale">Property Sale</option>
                <option value="property_transfer">Property Transfer</option>
                <option value="will_deed">Will Deed</option>
                <option value="trust_deed">Trust Deed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search forms..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Forms List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Pending Forms ({pagination.total || 0})</h2>
          </div>

          {error && (
            <div className="px-6 py-4 bg-red-50 border-l-4 border-red-400">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {forms.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">⏳</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending forms</h3>
              <p className="text-gray-500">No forms are currently pending cross-verification.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {forms.map((form) => (
                <div key={form._id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-sm font-medium text-gray-900">
                          {form.formType?.replace(/_/g, ' ').toUpperCase() || 'FORM'}
                        </h3>
                        {getStatusBadge(form.status)}
                        {getVerificationStageBadge(form)}
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-500">
                        <p>Form ID: {form._id}</p>
                        {form.userId && (
                          <p>Submitted by: {form.userId.name || form.userId.email}</p>
                        )}
                        <p>Created: {new Date(form.createdAt).toLocaleDateString()}</p>
                      </div>

                      {/* Staff Verification Status */}
                      <div className="mt-3">
                        <div className="flex items-center space-x-4 text-xs">
                          <div className="flex items-center">
                            <span className={`w-2 h-2 rounded-full mr-2 ${
                              form.approvals?.staff1?.approved ? 'bg-green-500' : 'bg-gray-300'
                            }`}></span>
                            <span className="text-gray-600">Staff1: {form.approvals?.staff1?.approved ? 'Complete' : 'Pending'}</span>
                          </div>
                          <div className="flex items-center">
                            <span className={`w-2 h-2 rounded-full mr-2 ${
                              form.approvals?.staff2?.approved ? 'bg-green-500' : 'bg-gray-300'
                            }`}></span>
                            <span className="text-gray-600">Staff2: {form.approvals?.staff2?.approved ? 'Complete' : 'Pending'}</span>
                          </div>
                          <div className="flex items-center">
                            <span className={`w-2 h-2 rounded-full mr-2 ${
                              form.approvals?.staff3?.approved ? 'bg-green-500' : 'bg-gray-300'
                            }`}></span>
                            <span className="text-gray-600">Staff3: {form.approvals?.staff3?.approved ? 'Complete' : 'Pending'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Form Data Preview */}
                      {form.data && (
                        <div className="mt-3 text-sm">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {form.data.applicantName && (
                              <div>
                                <span className="font-medium text-gray-700">Applicant:</span>
                                <span className="ml-2 text-gray-600">{form.data.applicantName}</span>
                              </div>
                            )}
                            {form.data.trusteeName && (
                              <div>
                                <span className="font-medium text-gray-700">Trustee:</span>
                                <span className="ml-2 text-gray-600">{form.data.trusteeName}</span>
                              </div>
                            )}
                            {form.data.landOwner && (
                              <div>
                                <span className="font-medium text-gray-700">Land Owner:</span>
                                <span className="ml-2 text-gray-600">{form.data.landOwner}</span>
                              </div>
                            )}
                            {form.data.plotNumber && (
                              <div>
                                <span className="font-medium text-gray-700">Plot Number:</span>
                                <span className="ml-2 text-gray-600">{form.data.plotNumber}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/staff4/forms/${form._id}`}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        Cross Verify
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
