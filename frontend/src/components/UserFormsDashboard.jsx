"use client";
import React, { useState, useEffect } from 'react';
import { formsAPI, formUtils } from '@/lib/services/forms';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const UserFormsDashboard = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const { getAuthHeaders } = useAuth();
  const [filters, setFilters] = useState({
    serviceType: '',
    status: ''
  });

  // Load user forms
  const loadForms = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: 1,
        limit: 10,
        ...filters
      };

      const response = await formsAPI.getUserForms(params);
      
      if (response.success) {
        setForms(response.data.forms);
      } else {
        setError(response.message || 'Failed to load forms');
      }
    } catch (err) {
      setError(err.message || 'Error loading forms');
    } finally {
      setLoading(false);
    }
  };

  // Load form statistics
  const loadStats = async () => {
    try {
      const response = await formsAPI.getFormStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  useEffect(() => {
    loadForms();
    loadStats();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Get service type display name
  const getServiceTypeName = (serviceType) => {
    return formUtils.getServiceTypeName(serviceType);
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    return formUtils.getStatusBadgeColor(status);
  };

  // Handle PDF download
  const handleViewPDF = async (formId) => {
    try {
      setDownloading(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      
      const response = await fetch(`${API_BASE}/api/user/forms/${formId}/download`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `form-${formId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        let errorMessage = 'Failed to download PDF';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }
        alert(errorMessage);
        console.error('Download error response:', response.status, errorMessage);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert(`Error: ${error.message || 'Failed to download PDF. Please try again.'}`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">My Forms</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage and track your submitted forms
            </p>
          </div>
          <Link
            href="/contact-form"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Create New Form
          </Link>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.statusStats.map((stat) => (
            <div key={stat._id} className="bg-white border rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    stat._id === 'completed' ? 'bg-green-100' :
                    stat._id === 'in-progress' ? 'bg-blue-100' :
                    'bg-yellow-100'
                  }`}>
                    <span className={`text-sm font-medium ${
                      stat._id === 'completed' ? 'text-green-600' :
                      stat._id === 'in-progress' ? 'text-blue-600' :
                      'text-yellow-600'
                    }`}>
                      {stat._id === 'completed' ? '✓' :
                       stat._id === 'in-progress' ? '⏳' : '📝'}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500 capitalize">
                    {stat._id.replace('-', ' ')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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

      {/* Forms List */}
      <div className="bg-white border rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Forms</h3>
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
          <div className="divide-y divide-gray-200">
            {forms.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-500 text-sm">No forms found</div>
                <Link
                  href="/contact-form"
                  className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Create Your First Form
                </Link>
              </div>
            ) : (
              forms.map((form) => (
                <div key={form._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-sm font-medium text-gray-900">
                          {getServiceTypeName(form.serviceType)}
                        </h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(form.status)}`}>
                          {form.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Created: {new Date(form.createdAt).toLocaleDateString()}
                      </p>
                      {form.progressPercentage > 0 && (
                        <div className="mt-2">
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${form.progressPercentage}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">{form.progressPercentage}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewPDF(form._id)}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!['submitted', 'under_review', 'in-progress', 'cross_verified', 'verified', 'approved', 'completed'].includes(form.status) || downloading}
                        title={!['submitted', 'under_review', 'in-progress', 'cross_verified', 'verified', 'approved', 'completed'].includes(form.status) ? 'Form must be submitted to view PDF' : 'Download PDF'}
                      >
                        {downloading ? 'Downloading...' : 'View'}
                      </button>
                      {form.status === 'draft' && (
                        <Link
                          href={`/${form.serviceType}?edit=${form._id}`}
                          className="text-green-600 hover:text-green-900 text-sm"
                        >
                          Continue
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserFormsDashboard;
