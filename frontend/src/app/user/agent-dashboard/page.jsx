"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useGetUserQuery } from '@/lib/services/auth';

const AgentDashboard = () => {
  const [user, setUser] = useState({});
  const { data, isSuccess } = useGetUserQuery();

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

  const getAvailableForms = () => {
    return [
      { name: 'Sale Deed', path: '/sale-deed', description: 'Assist with property sale deed documents' },
      { name: 'Will Deed', path: '/will-deed', description: 'Help create will and testament documents' },
      { name: 'Trust Deed', path: '/trust-deed', description: 'Assist with trust deed documents' },
      { name: 'Property Registration', path: '/property-registration', description: 'Help with property registration' },
      { name: 'Power of Attorney', path: '/power-of-attorney', description: 'Assist with power of attorney documents' },
      { name: 'Adoption Deed', path: '/adoption-deed', description: 'Help with adoption deed documents' }
    ];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Agent Dashboard
              </h1>
              <p className="text-gray-600">Welcome, {user.name} - Assist users with form completion</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Account Type</p>
              <p className="text-sm font-medium text-green-600">
                AGENT (USER2)
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Agent Info Card */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow p-6 mb-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl">🤝</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Agent Capabilities</h3>
              <p className="text-sm text-gray-600">
                As an agent, you can assist users with form completion, data verification, and document submission.
                You have access to all form types and can help users navigate the process.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-bold">📋</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Available Forms</p>
                <p className="text-2xl font-bold text-gray-900">
                  {getAvailableForms().length}
                </p>
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
                <p className="text-sm font-medium text-gray-500">Assisted Forms</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 text-sm font-bold">⏳</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Assistance</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-sm font-bold">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Users Helped</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Available Forms */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Forms You Can Assist With
            </h2>
            <p className="text-sm text-gray-500">
              Help users complete these forms and verify their data
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getAvailableForms().map((form, index) => (
                <Link
                  key={index}
                  href={form.path}
                  className="block p-6 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 text-lg">📄</span>
                    </div>
                    <h3 className="ml-3 text-lg font-medium text-gray-900">
                      {form.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    {form.description}
                  </p>
                  <div className="flex items-center text-green-600 text-sm font-medium">
                    Assist with Form
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Agent Tools */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Agent Tools
            </h2>
            <p className="text-sm text-gray-500">
              Special tools and features available to agents
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-sm">🔍</span>
                  </div>
                  <h3 className="ml-3 text-sm font-medium text-gray-900">Data Verification</h3>
                </div>
                <p className="text-xs text-gray-600">
                  Verify user-provided data for accuracy and completeness before submission.
                </p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-sm">📝</span>
                  </div>
                  <h3 className="ml-3 text-sm font-medium text-gray-900">Form Assistance</h3>
                </div>
                <p className="text-xs text-gray-600">
                  Guide users through form completion and help them understand requirements.
                </p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 text-sm">📋</span>
                  </div>
                  <h3 className="ml-3 text-sm font-medium text-gray-900">Document Review</h3>
                </div>
                <p className="text-xs text-gray-600">
                  Review uploaded documents and ensure they meet the required standards.
                </p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-yellow-600 text-sm">💬</span>
                  </div>
                  <h3 className="ml-3 text-sm font-medium text-gray-900">User Support</h3>
                </div>
                <p className="text-xs text-gray-600">
                  Provide support and answer questions about the form submission process.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Quick Actions
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/user/profile"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all duration-200"
              >
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-600 text-sm">👤</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">View Profile</p>
                  <p className="text-xs text-gray-500">Manage your agent account</p>
                </div>
              </Link>

              <Link
                href="/user/change-password"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all duration-200"
              >
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-600 text-sm">🔒</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Change Password</p>
                  <p className="text-xs text-gray-500">Update your password</p>
                </div>
              </Link>

              <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-600 text-sm">📊</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Agent Reports</p>
                  <p className="text-xs text-gray-500">View your assistance statistics</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
