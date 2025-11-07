"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Staff3CompletedFormsPage() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: '', // Don't filter by status for completed forms - show all verified forms
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
      // Always add completed=true to fetch verified forms
      queryParams.append('completed', 'true');
      
      // Add other filters (but override status if needed)
      Object.entries(filters).forEach(([key, value]) => {
        if (value && key !== 'status') {
          queryParams.append(key, value);
        }
      });
      
      // Add formType as serviceType for backend
      if (filters.formType) {
        queryParams.set('formType', filters.formType);
      }

      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(`${API_BASE}/api/staff/3/forms?${queryParams}`, {
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
      'verified': 'bg-green-100 text-green-800',
      'needs_correction': 'bg-red-100 text-red-800',
      'under_review': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
      </span>
    );
  };

  const getVerificationTypeBadge = (type) => {
    const typeConfig = {
      'land': 'bg-yellow-100 text-yellow-800',
      'plot': 'bg-blue-100 text-blue-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeConfig[type] || 'bg-gray-100 text-gray-800'}`}>
        {type?.toUpperCase() || 'LAND'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading completed forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Completed Verifications</h1>
          <p className="text-gray-600">View all forms that have been verified by Staff3</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Form Type</label>
              <select
                value={filters.formType}
                onChange={(e) => handleFilterChange('formType', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">All Types</option>
                <option value="sale-deed">Sale Deed</option>
                <option value="will-deed">Will Deed</option>
                <option value="trust-deed">Trust Deed</option>
                <option value="property-registration">Property Registration</option>
                <option value="property-sale-certificate">Property Sale Certificate</option>
                <option value="power-of-attorney">Power of Attorney</option>
                <option value="adoption-deed">Adoption Deed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search forms..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>
        </div>

        {/* Forms List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Completed Forms ({pagination.total || 0})</h2>
          </div>

          {error && (
            <div className="px-6 py-4 bg-red-50 border-l-4 border-red-400">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {forms.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">✅</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No completed forms found</h3>
              <p className="text-gray-500">No forms have been completed yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {forms.map((form) => (
                <div key={form._id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-sm font-medium text-gray-900">
                          {form.serviceType ? form.serviceType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : (form.formType?.replace('_', ' ').toUpperCase() || 'FORM')}
                        </h3>
                        {getStatusBadge(form.status)}
                        {getVerificationTypeBadge(form.approvals?.staff3?.verificationType || form.verificationType || 'land')}
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-500">
                        <p><strong>Form ID:</strong> {form._id}</p>
                        {form.userId && (
                          <p><strong>Submitted by:</strong> {form.userId.name || form.userId.email}</p>
                        )}
                        {form.approvals?.staff3?.verifiedAt && (
                          <p><strong>Verified at:</strong> {new Date(form.approvals.staff3.verifiedAt).toLocaleString()}</p>
                        )}
                        {form.data?.state && (
                          <p><strong>Location:</strong> {form.data.state}, {form.data.district}, {form.data.village}</p>
                        )}
                      </div>

                      {/* Property Description & Directions Preview (for sale-deed) */}
                      {form.serviceType === 'sale-deed' && form.data && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Property Description:</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                            {form.data.state && <div><strong>State:</strong> {form.data.state}</div>}
                            {form.data.district && <div><strong>District:</strong> {form.data.district}</div>}
                            {form.data.tehsil && <div><strong>Tehsil:</strong> {form.data.tehsil}</div>}
                            {form.data.village && <div><strong>Village:</strong> {form.data.village}</div>}
                            {form.data.khasraNo && <div><strong>Khasra No:</strong> {form.data.khasraNo}</div>}
                            {form.data.plotNo && <div><strong>Plot No:</strong> {form.data.plotNo}</div>}
                            {form.data.colonyName && <div><strong>Colony:</strong> {form.data.colonyName}</div>}
                            {form.data.wardNo && <div><strong>Ward:</strong> {form.data.wardNo}</div>}
                            {form.data.streetNo && <div><strong>Street:</strong> {form.data.streetNo}</div>}
                          </div>
                          {(form.data.directionNorth || form.data.directionEast || form.data.directionSouth || form.data.directionWest) && (
                            <div className="mt-2 pt-2 border-t border-blue-300">
                              <h4 className="text-sm font-semibold text-gray-900 mb-1">Property Directions:</h4>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                {form.data.directionNorth && <div><strong>North:</strong> {form.data.directionNorth}</div>}
                                {form.data.directionEast && <div><strong>East:</strong> {form.data.directionEast}</div>}
                                {form.data.directionSouth && <div><strong>South:</strong> {form.data.directionSouth}</div>}
                                {form.data.directionWest && <div><strong>West:</strong> {form.data.directionWest}</div>}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Form Details Preview for other forms */}
                      {form.serviceType !== 'sale-deed' && form.data && (
                        <div className="mt-3 text-sm">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Land Details */}
                            {form.data.landOwner && (
                              <div>
                                <span className="font-medium text-gray-700">Land Owner:</span>
                                <span className="ml-2 text-gray-600">{form.data.landOwner}</span>
                              </div>
                            )}
                            {form.data.landLocation && (
                              <div>
                                <span className="font-medium text-gray-700">Location:</span>
                                <span className="ml-2 text-gray-600">{form.data.landLocation}</span>
                              </div>
                            )}
                            
                            {/* Plot Details */}
                            {form.data.plotNumber && (
                              <div>
                                <span className="font-medium text-gray-700">Plot Number:</span>
                                <span className="ml-2 text-gray-600">{form.data.plotNumber}</span>
                              </div>
                            )}
                            {form.data.plotSize && (
                              <div>
                                <span className="font-medium text-gray-700">Plot Size:</span>
                                <span className="ml-2 text-gray-600">{form.data.plotSize}</span>
                              </div>
                            )}
                            {form.data.surveyNumber && (
                              <div>
                                <span className="font-medium text-gray-700">Survey Number:</span>
                                <span className="ml-2 text-gray-600">{form.data.surveyNumber}</span>
                              </div>
                            )}
                            {form.data.landArea && (
                              <div>
                                <span className="font-medium text-gray-700">Land Area:</span>
                                <span className="ml-2 text-gray-600">{form.data.landArea} sq ft</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Verification Notes */}
                      {form.approvals?.staff3?.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-700">Verification Notes:</p>
                          <p className="text-sm text-gray-600">{form.approvals.staff3.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/staff3/forms/${form._id}`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        View Details
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
