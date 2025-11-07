"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Staff1FormVerificationPage() {
  const router = useRouter();
  const { getAuthHeaders } = useAuth();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(`${API_BASE}/api/staff/1/forms?status=submitted&limit=50`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setForms(data.data.forms || []);
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

  const handleVerification = async (formId, approved) => {
    try {
      setVerifying(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(`${API_BASE}/api/staff/1/forms/${formId}/verify`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          approved,
          verificationNotes: selectedForm?._id === formId ? verificationNotes : ''
        })
      });

      if (response.ok) {
        alert(`Form ${approved ? 'verified' : 'rejected'} successfully!`);
        setSelectedForm(null);
        setVerificationNotes('');
        fetchForms();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to verify form');
      }
    } catch (error) {
      console.error('Error verifying form:', error);
      alert('Error: ' + error.message);
    } finally {
      setVerifying(false);
    }
  };

  const renderFieldValue = (key, value) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400 italic">Not provided</span>;
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    if (Array.isArray(value)) {
      return (
        <div className="space-y-1">
          {value.map((item, idx) => (
            <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
              {typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)}
            </div>
          ))}
        </div>
      );
    }

    if (typeof value === 'object') {
      return (
        <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }

    return <span className="break-words">{String(value)}</span>;
  };

  const getServiceTypeInfo = (serviceType) => {
    const types = {
      'sale-deed': { name: 'Sale Deed', icon: '🏠', color: 'bg-blue-50 border-blue-200' },
      'will-deed': { name: 'Will Deed', icon: '📜', color: 'bg-green-50 border-green-200' },
      'trust-deed': { name: 'Trust Deed', icon: '🤝', color: 'bg-purple-50 border-purple-200' },
      'property-registration': { name: 'Property Registration', icon: '📋', color: 'bg-orange-50 border-orange-200' },
      'property-sale-certificate': { name: 'Property Sale Certificate', icon: '📄', color: 'bg-yellow-50 border-yellow-200' },
      'power-of-attorney': { name: 'Power of Attorney', icon: '⚖️', color: 'bg-red-50 border-red-200' },
      'adoption-deed': { name: 'Adoption Deed', icon: '👶', color: 'bg-pink-50 border-pink-200' }
    };
    return types[serviceType] || { name: serviceType, icon: '📄', color: 'bg-gray-50 border-gray-200' };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="bg-white rounded-lg border p-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">Error Loading Forms</h3>
        <p className="text-red-600">{error}</p>
        <div className="mt-4">
          <button 
            onClick={fetchForms}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Form Verification</h1>
        <p className="text-gray-600">Review and verify all submitted forms</p>
      </div>

      {/* Forms List */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Forms Pending Verification</h2>
        </div>
        <div className="p-6">
          {forms.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No forms pending verification</p>
            </div>
          ) : (
            <div className="space-y-4">
              {forms.map((form) => {
                const serviceInfo = getServiceTypeInfo(form.serviceType);
                const allFields = form.allFields || form.fields || form.data || {};
                
                return (
                  <div
                    key={form._id}
                    className={`border rounded-lg p-4 ${serviceInfo.color} ${selectedForm?._id === form._id ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{serviceInfo.icon}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">{serviceInfo.name}</h3>
                          <p className="text-sm text-gray-600">ID: {form._id}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          form.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                          form.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {form.status}
                        </span>
                        <button
                          onClick={() => setSelectedForm(selectedForm?._id === form._id ? null : form)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          {selectedForm?._id === form._id ? 'Hide Details' : 'Show Details'}
                        </button>
                        <Link
                          href={`/staff1/forms/${form._id}`}
                          className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                          View Full
                        </Link>
                      </div>
                    </div>

                    {selectedForm?._id === form._id && (
                      <div className="mt-4 pt-4 border-t border-gray-300">
                        <h4 className="font-semibold text-gray-900 mb-3">Form Data</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 max-h-96 overflow-y-auto">
                          {Object.entries(allFields).map(([key, value]) => {
                            if (key.startsWith('_') || key === '__v' || key === 'createdAt' || key === 'updatedAt' || 
                                key === 'userId' || key === 'formId' || key === 'serviceType' || key === 'status' ||
                                key === 'approvals' || key === 'adminNotes') {
                              return null;
                            }
                            return (
                              <div key={key} className="bg-white p-3 rounded border">
                                <h5 className="text-xs font-medium text-gray-500 mb-1">
                                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                </h5>
                                <div className="text-sm text-gray-900">
                                  {renderFieldValue(key, value)}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Verification Notes (Optional)
                          </label>
                          <textarea
                            value={verificationNotes}
                            onChange={(e) => setVerificationNotes(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Add any notes about the verification..."
                          />
                        </div>

                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleVerification(form._id, true)}
                            disabled={verifying}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Verify & Approve</span>
                          </button>
                          <button
                            onClick={() => handleVerification(form._id, false)}
                            disabled={verifying}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

