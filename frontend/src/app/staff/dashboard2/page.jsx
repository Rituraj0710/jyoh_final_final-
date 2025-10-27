"use client"
import React, { useState, useEffect } from 'react';
import { useGetStaffQuery } from '@/lib/services/auth';
import PrivateRoute from '@/components/PrivateRoute';

const StaffDashboard2 = () => {
  const [user, setUser] = useState({});
  const { data, isSuccess } = useGetStaffQuery();

  useEffect(() => {
    if (data && isSuccess) {
      setUser(data.user);
    } else if (typeof window !== 'undefined') {
      const name = localStorage.getItem('user_name');
      const email = localStorage.getItem('user_email');
      const id = localStorage.getItem('user_id');
      const role = localStorage.getItem('role');
      setUser({ name, email, _id: id, role });
    }
  }, [data, isSuccess]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('is_auth');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_id');
    window.location.href = '/staff/login';
  };

  return (
    <PrivateRoute allowedRoles={['staff2']}>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Staff Dashboard 2
              </h1>
              <p className="text-gray-600">Welcome, {user.name} - Trustee Details Validation</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Role</p>
                <p className="text-sm font-medium text-green-600">
                  STAFF2
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Role Description */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow p-6 mb-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl">👤</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Staff2 Responsibilities</h3>
              <p className="text-sm text-gray-600">
                Validate trustee information and details. Verify trustee identity, address, and other important details before proceeding.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm font-bold">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Trustees</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-bold">✅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Validated Today</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 text-sm font-bold">⚠️</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Issues Found</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-sm font-bold">⏱️</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg. Validation Time</p>
                <p className="text-2xl font-bold text-gray-900">8m</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Trustee Validations */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Trustee Details Pending Validation
            </h2>
            <p className="text-sm text-gray-500">
              Validate trustee information and verify details
            </p>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {/* Sample trustee entries */}
              <div className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Trustee: Michael Brown</h3>
                    <p className="text-sm text-gray-500">Trust: Family Estate Trust</p>
                    <p className="text-xs text-gray-400">Submitted: 1 hour ago</p>
                    <p className="text-xs text-gray-400">Address: 123 Main St, City, State</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium">
                      Validate
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Trustee: Sarah Wilson</h3>
                    <p className="text-sm text-gray-500">Trust: Business Succession Trust</p>
                    <p className="text-xs text-gray-400">Submitted: 3 hours ago</p>
                    <p className="text-xs text-gray-400">Address: 456 Oak Ave, City, State</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium">
                      Validate
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Trustee: David Lee</h3>
                    <p className="text-sm text-gray-500">Trust: Charitable Foundation</p>
                    <p className="text-xs text-gray-400">Submitted: 5 hours ago</p>
                    <p className="text-xs text-gray-400">Address: 789 Pine St, City, State</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium">
                      Validate
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tools */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Staff2 Tools
            </h2>
            <p className="text-sm text-gray-500">
              Specialized tools for trustee validation
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-sm">🔍</span>
                  </div>
                  <h3 className="ml-3 text-sm font-medium text-gray-900">Identity Verifier</h3>
                </div>
                <p className="text-xs text-gray-600">
                  Verify trustee identity documents and cross-reference with official records.
                </p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-sm">📍</span>
                  </div>
                  <h3 className="ml-3 text-sm font-medium text-gray-900">Address Validator</h3>
                </div>
                <p className="text-xs text-gray-600">
                  Validate trustee addresses and contact information for accuracy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </PrivateRoute>
  );
};

export default StaffDashboard2;
