"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Staff4DeliveryPage() {
  const router = useRouter();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: '',
    search: ''
  });
  const [pagination, setPagination] = useState({});
  const [selectedForm, setSelectedForm] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');
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
      const response = await fetch(`${API_BASE}/api/staff/4/delivery/forms?${queryParams}`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setForms(data.data.forms);
        setPagination(data.data.pagination);
        setError(null);
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

  const openSetMethodModal = (form) => {
    setSelectedForm(form);
    setDeliveryMethod(form.delivery?.userPreference?.method || form.delivery?.staff4Decision?.method || '');
    setDeliveryAddress(form.delivery?.userPreference?.deliveryAddress || form.delivery?.staff4Decision?.deliveryAddress || '');
    setContactPhone(form.delivery?.userPreference?.contactPhone || form.delivery?.staff4Decision?.contactPhone || form.userId?.phone || '');
    setTrackingNumber(form.delivery?.staff4Decision?.trackingNumber || '');
    setNotes(form.delivery?.staff4Decision?.notes || '');
    setShowModal(true);
  };

  const handleSetDeliveryMethod = async () => {
    if (!deliveryMethod) {
      alert('Please select a delivery method');
      return;
    }

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(`${API_BASE}/api/staff/4/delivery/forms/${selectedForm._id}/set-method`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          method: deliveryMethod,
          deliveryAddress,
          contactPhone,
          trackingNumber,
          notes
        })
      });

      if (response.ok) {
        alert('Delivery method set successfully');
        setShowModal(false);
        fetchForms();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to set delivery method');
      }
    } catch (error) {
      console.error('Error setting delivery method:', error);
      alert('Error setting delivery method');
    }
  };

  const handleMarkDispatched = async (formId) => {
    const tracking = prompt('Enter tracking number (optional):');
    const notes = prompt('Enter notes (optional):');
    
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(`${API_BASE}/api/staff/4/delivery/forms/${formId}/dispatch`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          trackingNumber: tracking || null,
          notes: notes || null
        })
      });

      if (response.ok) {
        alert('Form marked as dispatched');
        fetchForms();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to mark as dispatched');
      }
    } catch (error) {
      console.error('Error marking as dispatched:', error);
      alert('Error marking as dispatched');
    }
  };

  const handleMarkDelivered = async (formId) => {
    const notes = prompt('Enter delivery notes (optional):');
    
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(`${API_BASE}/api/staff/4/delivery/forms/${formId}/delivered`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notes: notes || null
        })
      });

      if (response.ok) {
        alert('Form marked as delivered');
        fetchForms();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to mark as delivered');
      }
    } catch (error) {
      console.error('Error marking as delivered:', error);
      alert('Error marking as delivered');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending_user_selection': 'bg-yellow-100 text-yellow-800',
      'user_selected': 'bg-blue-100 text-blue-800',
      'staff4_decided': 'bg-purple-100 text-purple-800',
      'dispatched': 'bg-indigo-100 text-indigo-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.replace(/_/g, ' ').toUpperCase() || 'PENDING'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading delivery forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Delivery Management</h1>
          <p className="text-gray-600">Manage document delivery for completed forms</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Status</option>
                <option value="pending_user_selection">Pending User Selection</option>
                <option value="user_selected">User Selected</option>
                <option value="staff4_decided">Staff4 Decided</option>
                <option value="dispatched">Dispatched</option>
                <option value="delivered">Delivered</option>
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
            <h2 className="text-lg font-medium text-gray-900">Forms Ready for Delivery ({pagination.total || 0})</h2>
          </div>

          {error && (
            <div className="px-6 py-4 bg-red-50 border-l-4 border-red-400">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {forms.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No forms found</h3>
              <p className="text-gray-500">No forms require delivery management at this time.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {forms.map((form) => (
                <div key={form._id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-sm font-medium text-gray-900">
                          {form.serviceType?.replace(/-/g, ' ').toUpperCase() || 'FORM'}
                        </h3>
                        {getStatusBadge(form.delivery?.status)}
                        {form.needsStaff4Decision && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            ⚠️ Needs Decision ({form.daysSinceReady} days)
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-500">
                        <p>Form ID: {form._id}</p>
                        {form.userId && (
                          <p>User: {form.userId.name || form.userId.email}</p>
                        )}
                        {form.delivery?.readyForDeliveryAt && (
                          <p>Ready since: {new Date(form.delivery.readyForDeliveryAt).toLocaleDateString()}</p>
                        )}
                        {form.delivery?.userPreference?.method && (
                          <p className="text-blue-600">User preference: {form.delivery.userPreference.method}</p>
                        )}
                        {form.delivery?.staff4Decision?.method && (
                          <p className="text-purple-600">Staff4 decision: {form.delivery.staff4Decision.method}</p>
                        )}
                        {form.delivery?.finalMethod && (
                          <p className="font-medium">Final method: {form.delivery.finalMethod}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {form.delivery?.status !== 'delivered' && (
                        <>
                          {(!form.delivery?.finalMethod || form.needsStaff4Decision) && (
                            <button
                              onClick={() => openSetMethodModal(form)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                            >
                              Set Method
                            </button>
                          )}
                          {form.delivery?.status === 'staff4_decided' && (
                            <button
                              onClick={() => handleMarkDispatched(form._id)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                              Mark Dispatched
                            </button>
                          )}
                          {form.delivery?.status === 'dispatched' && (
                            <button
                              onClick={() => handleMarkDelivered(form._id)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                            >
                              Mark Delivered
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.current - 1) * pagination.limit) + 1} to {Math.min(pagination.current * pagination.limit, pagination.total)} of {pagination.total} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleFilterChange('page', pagination.current - 1)}
                    disabled={pagination.current <= 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handleFilterChange('page', pagination.current + 1)}
                    disabled={pagination.current >= pagination.pages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Set Delivery Method Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowModal(false)}></div>
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Set Delivery Method</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Method *</label>
                  <select
                    value={deliveryMethod}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Method</option>
                    <option value="pickup">Pickup</option>
                    <option value="courier">Courier</option>
                    <option value="email">Email</option>
                    <option value="postal">Postal</option>
                  </select>
                </div>

                {(deliveryMethod === 'courier' || deliveryMethod === 'postal') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
                    <textarea
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter delivery address"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Contact phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Number (optional)</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Tracking number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Additional notes"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSetDeliveryMethod}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
                >
                  Set Method
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

