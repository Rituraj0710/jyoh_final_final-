"use client"
import React, { useState, useEffect } from 'react';
import { useGetStaffQuery } from '@/lib/services/auth';
import PrivateRoute from '@/components/PrivateRoute';

const StaffDashboard3 = () => {
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
    <PrivateRoute allowedRoles={['staff3']}>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Staff Dashboard 3
              </h1>
              <p className="text-gray-600">Welcome, {user.name} - Land/Plot Details Verification</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Role</p>
                <p className="text-sm font-medium text-yellow-600">
                  STAFF3
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
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow p-6 mb-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-xl">🏞️</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Staff3 Responsibilities</h3>
              <p className="text-sm text-gray-600">
                Verify land and plot related information. Check plot size, boundaries, and verify secondary important details.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 text-sm font-bold">🏞️</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Plots</p>
                <p className="text-2xl font-bold text-gray-900">6</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm font-bold">✅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Verified Today</p>
                <p className="text-2xl font-bold text-gray-900">9</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-bold">📐</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Area</p>
                <p className="text-2xl font-bold text-gray-900">2.5 acres</p>
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
                <p className="text-sm font-medium text-gray-500">Avg. Verification Time</p>
                <p className="text-2xl font-bold text-gray-900">12m</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Land Verifications */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Land/Plot Details Pending Verification
            </h2>
            <p className="text-sm text-gray-500">
              Verify land details, plot size, and boundaries
            </p>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {/* Sample land entries */}
              <div className="border border-gray-200 rounded-lg p-4 hover:border-yellow-300 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Plot: Residential Block A-12</h3>
                    <p className="text-sm text-gray-500">Size: 0.5 acres | Location: Suburb District</p>
                    <p className="text-xs text-gray-400">Submitted: 2 hours ago</p>
                    <p className="text-xs text-gray-400">Boundaries: North-South-East-West verified</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-xs font-medium">
                      Verify
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium">
                      View Map
                    </button>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 hover:border-yellow-300 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Plot: Commercial Zone B-8</h3>
                    <p className="text-sm text-gray-500">Size: 1.2 acres | Location: Business District</p>
                    <p className="text-xs text-gray-400">Submitted: 4 hours ago</p>
                    <p className="text-xs text-gray-400">Boundaries: Survey pending</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-xs font-medium">
                      Verify
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium">
                      View Map
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
              Staff3 Tools
            </h2>
            <p className="text-sm text-gray-500">
              Specialized tools for land and plot verification
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-yellow-600 text-sm">📐</span>
                  </div>
                  <h3 className="ml-3 text-sm font-medium text-gray-900">Plot Calculator</h3>
                </div>
                <p className="text-xs text-gray-600">
                  Calculate plot area, boundaries, and verify measurements against official records.
                </p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-sm">🗺️</span>
                  </div>
                  <h3 className="ml-3 text-sm font-medium text-gray-900">Map Viewer</h3>
                </div>
                <p className="text-xs text-gray-600">
                  View plot maps, boundaries, and surrounding areas for verification.
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

export default StaffDashboard3;
