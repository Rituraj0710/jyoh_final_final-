"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import PrivateRoute from '@/components/PrivateRoute';

export default function UserDeliveryPage() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [email, setEmail] = useState('');
  const { getAuthHeaders } = useAuth();

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(`${API_BASE}/api/user/delivery/forms`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setForms(data.data.forms || []);
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

  const openPreferenceModal = (form) => {
    setSelectedForm(form);
    setDeliveryMethod(form.delivery?.userPreference?.method || '');
    setDeliveryAddress(form.delivery?.userPreference?.deliveryAddress || '');
    setContactPhone(form.delivery?.userPreference?.contactPhone || '');
    setEmail(form.delivery?.userPreference?.email || '');
    setShowModal(true);
  };

  const handleSetPreference = async () => {
    if (!deliveryMethod) {
      alert('Please select a delivery method');
      return;
    }

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(`${API_BASE}/api/user/delivery/forms/${selectedForm._id}/preference`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          method: deliveryMethod,
          deliveryAddress,
          contactPhone,
          email
        })
      });

      if (response.ok) {
        alert('Delivery preference set successfully');
        setShowModal(false);
        fetchForms();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to set delivery preference');
      }
    } catch (error) {
      console.error('Error setting delivery preference:', error);
      alert('Error setting delivery preference');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending_user_selection': 'bg-yellow-100 text-yellow-800',
      'user_selected': 'bg-blue-100 text-blue-800',
      'staff4_decided': 'bg-purple-100 text-purple-800',
      'dispatched': 'bg-indigo-100 text-indigo-800',
      'delivered': 'bg-green-100 text-green-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.replace(/_/g, ' ').toUpperCase() || 'PENDING'}
      </span>
    );
  };

  if (loading) {
    return (
      <PrivateRoute allowedRoles={['user1', 'user2', 'normal_user', 'agent_user']}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading delivery forms...</p>
          </div>
        </div>
      </PrivateRoute>
    );
  }

  return (
    <PrivateRoute allowedRoles={['user1', 'user2', 'normal_user', 'agent_user']}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Delivery Preferences</h1>
                <p className="text-gray-600">Select how you want to receive your completed documents</p>
              </div>
              <Link
                href="/user/dashboard"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Forms List */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Forms Ready for Delivery ({forms.length})</h2>
            </div>

            {forms.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No forms ready for delivery</h3>
                <p className="text-gray-500">Your completed forms will appear here when they are ready for delivery.</p>
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
                        </div>
                        
                        <div className="mt-2 text-sm text-gray-500">
                          <p>Form ID: {form._id}</p>
                          {form.delivery?.readyForDeliveryAt && (
                            <p>Ready since: {new Date(form.delivery.readyForDeliveryAt).toLocaleDateString()}</p>
                          )}
                          {form.delivery?.userPreference?.method && (
                            <p className="text-blue-600 font-medium">Your preference: {form.delivery.userPreference.method}</p>
                          )}
                          {form.delivery?.staff4Decision?.method && (
                            <p className="text-purple-600">Delivery method: {form.delivery.staff4Decision.method}</p>
                          )}
                          {form.delivery?.status === 'dispatched' && form.delivery?.staff4Decision?.trackingNumber && (
                            <p className="text-indigo-600">Tracking: {form.delivery.staff4Decision.trackingNumber}</p>
                          )}
                          {form.delivery?.status === 'delivered' && (
                            <p className="text-green-600 font-medium">✓ Delivered on {new Date(form.delivery.deliveredAt).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {form.delivery?.status === 'pending_user_selection' && (
                          <button
                            onClick={() => openPreferenceModal(form)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                          >
                            Select Preference
                          </button>
                        )}
                        {form.delivery?.status === 'user_selected' && (
                          <span className="text-sm text-gray-500">Waiting for Staff4...</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Set Preference Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowModal(false)}></div>
              <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Select Delivery Method</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Method *</label>
                    <select
                      value={deliveryMethod}
                      onChange={(e) => setDeliveryMethod(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Method</option>
                      <option value="pickup">Pickup (Collect from office)</option>
                      <option value="courier">Courier Delivery</option>
                      <option value="email">Email (Digital copy)</option>
                      <option value="postal">Postal Mail</option>
                    </select>
                  </div>

                  {(deliveryMethod === 'courier' || deliveryMethod === 'postal') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address *</label>
                      <textarea
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your complete delivery address"
                        required
                      />
                    </div>
                  )}

                  {deliveryMethod === 'email' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone *</label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your contact phone number"
                      required
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-xs text-blue-800">
                      <strong>Note:</strong> If you don't select a preference within 1 week, Staff4 will decide the delivery method for you.
                    </p>
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
                    onClick={handleSetPreference}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Save Preference
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PrivateRoute>
  );
}

