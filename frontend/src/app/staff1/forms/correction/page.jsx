"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Staff1FormCorrectionListPage() {
  const router = useRouter();
  const { getAuthHeaders } = useAuth();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Form Correction</h1>
        <p className="text-gray-600">Select a form to correct and modify</p>
      </div>

      {/* Forms List */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Forms Available for Correction</h2>
        </div>
        <div className="p-6">
          {forms.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No forms available for correction</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {forms.map((form) => {
                const serviceInfo = getServiceTypeInfo(form.serviceType);
                
                return (
                  <div
                    key={form._id}
                    className={`border rounded-lg p-4 ${serviceInfo.color} hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{serviceInfo.icon}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">{serviceInfo.name}</h3>
                          <p className="text-xs text-gray-600">ID: {form._id?.slice(-8)}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        form.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                        form.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                        form.status === 'needs_correction' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {form.status}
                      </span>
                    </div>

                    <div className="mb-4 text-sm text-gray-600">
                      <p><strong>Submitted by:</strong> {form.userId?.name || form.userId?.email || 'Unknown'}</p>
                      <p><strong>Date:</strong> {new Date(form.createdAt).toLocaleDateString()}</p>
                    </div>

                    <div className="flex space-x-2">
                      <Link
                        href={`/staff1/forms/${form._id}/correct`}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors text-center"
                      >
                        Correct Form
                      </Link>
                      <Link
                        href={`/staff1/forms/${form._id}`}
                        className="px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                      >
                        View
                      </Link>
                    </div>
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

