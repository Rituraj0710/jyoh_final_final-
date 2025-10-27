"use client"
import React, { useState, useEffect } from 'react';
import { useGetStaffQuery } from '@/lib/services/auth';
import PrivateRoute from '@/components/PrivateRoute';

const StaffFinalCheck = () => {
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
    <PrivateRoute allowedRoles={['staff5']}>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Final Check & Lock
              </h1>
              <p className="text-gray-600">Welcome, {user.name} - Final Approval & Form Locking</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Role</p>
                <p className="text-sm font-medium text-red-600">
                  STAFF5
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
        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg shadow p-6 mb-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-xl">🔒</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Staff5 Responsibilities</h3>
              <p className="text-sm text-gray-600">
                Final cross-check and approval. Lock forms after final verification. This is the last step in the approval process.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-sm font-bold">🔍</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Final Check</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm font-bold">🔒</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Locked Today</p>
                <p className="text-2xl font-bold text-gray-900">5</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-bold">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Processed</p>
                <p className="text-2xl font-bold text-gray-900">127</p>
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
                <p className="text-sm font-medium text-gray-500">Avg. Final Check Time</p>
                <p className="text-2xl font-bold text-gray-900">25m</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Final Checks */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Forms Pending Final Check & Lock
            </h2>
            <p className="text-sm text-gray-500">
              Final cross-check and lock forms after all approvals
            </p>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {/* Sample final check entries */}
              <div className="border border-gray-200 rounded-lg p-4 hover:border-red-300 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Sale Deed - Property Registration</h3>
                    <p className="text-sm text-gray-500">All stages completed: Staff1 ✓ Staff2 ✓ Staff3 ✓ Staff4 ✓</p>
                    <p className="text-xs text-gray-400">Ready for final check: 30 minutes ago</p>
                    <div className="flex space-x-2 mt-2">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Stamp: ₹2,450</span>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Trustee: Verified</span>
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Plot: 0.5 acres</span>
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Staff4: Approved</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium">
                      Final Check
                    </button>
                    <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium">
                      Lock Form
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium">
                      Review All
                    </button>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 hover:border-red-300 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Will Deed - Estate Planning</h3>
                    <p className="text-sm text-gray-500">All stages completed: Staff1 ✓ Staff2 ✓ Staff3 ✓ Staff4 ✓</p>
                    <p className="text-xs text-gray-400">Ready for final check: 1 hour ago</p>
                    <div className="flex space-x-2 mt-2">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Stamp: ₹1,200</span>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Trustee: Verified</span>
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Plot: 0.3 acres</span>
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Staff4: Approved</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium">
                      Final Check
                    </button>
                    <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium">
                      Lock Form
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium">
                      Review All
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Locked Forms */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Recently Locked Forms
            </h2>
            <p className="text-sm text-gray-500">
              Forms that have been locked after final approval
            </p>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Trust Deed - Family Trust</h3>
                    <p className="text-sm text-gray-500">Locked: 2 hours ago</p>
                    <p className="text-xs text-green-600">Status: Completed & Locked</p>
                  </div>
                  <div className="flex items-center">
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">🔒 LOCKED</span>
                  </div>
                </div>
              </div>

              <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Power of Attorney - Business</h3>
                    <p className="text-sm text-gray-500">Locked: 4 hours ago</p>
                    <p className="text-xs text-green-600">Status: Completed & Locked</p>
                  </div>
                  <div className="flex items-center">
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">🔒 LOCKED</span>
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
              Staff5 Tools
            </h2>
            <p className="text-sm text-gray-500">
              Specialized tools for final check and form locking
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-red-600 text-sm">🔍</span>
                  </div>
                  <h3 className="ml-3 text-sm font-medium text-gray-900">Final Cross-Checker</h3>
                </div>
                <p className="text-xs text-gray-600">
                  Comprehensive final review tool to cross-check all previous staff work and ensure complete accuracy.
                </p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-sm">🔒</span>
                  </div>
                  <h3 className="ml-3 text-sm font-medium text-gray-900">Form Locker</h3>
                </div>
                <p className="text-xs text-gray-600">
                  Lock forms after final approval to prevent further modifications and mark as completed.
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

export default StaffFinalCheck;
