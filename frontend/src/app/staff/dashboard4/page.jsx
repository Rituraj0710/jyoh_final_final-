"use client"
import React, { useState, useEffect } from 'react';
import { useGetStaffQuery } from '@/lib/services/auth';
import PrivateRoute from '@/components/PrivateRoute';

const StaffDashboard4 = () => {
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
    <PrivateRoute allowedRoles={['staff4']}>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Staff Dashboard 4
              </h1>
              <p className="text-gray-600">Welcome, {user.name} - Approval & Review</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Role</p>
                <p className="text-sm font-medium text-purple-600">
                  STAFF4
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
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg shadow p-6 mb-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-xl">🔍</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Staff4 Responsibilities</h3>
              <p className="text-sm text-gray-600">
                Review and approve work done by other staff members (Staff1, Staff2, Staff3). Final quality check before proceeding to Staff5.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-sm font-bold">📋</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Reviews</p>
                <p className="text-2xl font-bold text-gray-900">5</p>
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
                <p className="text-sm font-medium text-gray-500">Approved Today</p>
                <p className="text-2xl font-bold text-gray-900">7</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-sm font-bold">❌</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rejected Today</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-bold">⏱️</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg. Review Time</p>
                <p className="text-2xl font-bold text-gray-900">18m</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Reviews */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Forms Pending Review & Approval
            </h2>
            <p className="text-sm text-gray-500">
              Review work completed by Staff1, Staff2, and Staff3
            </p>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {/* Sample review entries */}
              <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Sale Deed - Property Registration</h3>
                    <p className="text-sm text-gray-500">Completed by: Staff1 ✓ Staff2 ✓ Staff3 ✓</p>
                    <p className="text-xs text-gray-400">Ready for review: 1 hour ago</p>
                    <div className="flex space-x-2 mt-2">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Stamp: ₹2,450</span>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Trustee: Verified</span>
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Plot: 0.5 acres</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium">
                      Approve
                    </button>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium">
                      Reject
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium">
                      Review
                    </button>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Will Deed - Estate Planning</h3>
                    <p className="text-sm text-gray-500">Completed by: Staff1 ✓ Staff2 ✓ Staff3 ✓</p>
                    <p className="text-xs text-gray-400">Ready for review: 3 hours ago</p>
                    <div className="flex space-x-2 mt-2">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Stamp: ₹1,200</span>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Trustee: Verified</span>
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Plot: 0.3 acres</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium">
                      Approve
                    </button>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium">
                      Reject
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium">
                      Review
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
              Staff4 Tools
            </h2>
            <p className="text-sm text-gray-500">
              Specialized tools for review and approval
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 text-sm">🔍</span>
                  </div>
                  <h3 className="ml-3 text-sm font-medium text-gray-900">Quality Checker</h3>
                </div>
                <p className="text-xs text-gray-600">
                  Comprehensive review tool to check all previous staff work and ensure quality standards.
                </p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-sm">✅</span>
                  </div>
                  <h3 className="ml-3 text-sm font-medium text-gray-900">Approval System</h3>
                </div>
                <p className="text-xs text-gray-600">
                  Approve or reject forms with detailed feedback and comments for improvement.
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

export default StaffDashboard4;
