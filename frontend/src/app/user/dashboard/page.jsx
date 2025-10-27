"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useGetUserQuery } from '@/lib/services/auth';
import PrivateRoute from '@/components/PrivateRoute';
import UserFormsDashboard from '@/components/UserFormsDashboard';
import UserFormsHistory from '@/components/UserFormsHistory';

const UserDashboard = () => {
  const [user, setUser] = useState({});
  const { data, isSuccess } = useGetUserQuery();

  useEffect(() => {
    if (data && isSuccess && data.data && data.data.user) {
      setUser(data.data.user);
    } else if (typeof window !== 'undefined') {
      const name = localStorage.getItem('user_name');
      const email = localStorage.getItem('user_email');
      const id = localStorage.getItem('user_id');
      const role = localStorage.getItem('role');
      setUser({ name, email, _id: id, role });
    }
  }, [data, isSuccess]);

  const getRoleDescription = (role) => {
    const descriptions = {
      user1: 'Regular User - Fill forms and upload documents',
      user2: 'Agent - Assist users and verify data',
      normal_user: 'Regular User - Fill forms and upload documents',
      agent_user: 'Agent - Assist users and verify data'
    };
    return descriptions[role] || 'User';
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('role');
    localStorage.removeItem('user_name');
    localStorage.removeItem('is_auth');
    
    // Redirect to login
    window.location.href = '/user/login';
  };

  const getAvailableForms = (role) => {
    const forms = [
      { name: 'Sale Deed', path: '/sale-deed', description: 'Create property sale deed documents' },
      { name: 'Will Deed', path: '/will-deed', description: 'Create will and testament documents' },
      { name: 'Trust Deed', path: '/trust-deed', description: 'Create trust deed documents' },
      { name: 'Property Registration', path: '/property-registration', description: 'Register property documents' },
      { name: 'Power of Attorney', path: '/power-of-attorney', description: 'Create power of attorney documents' },
      { name: 'Adoption Deed', path: '/adoption-deed', description: 'Create adoption deed documents' }
    ];

    // user2 (agent) has access to all forms, user1 has access to all forms too
    return forms;
  };

  return (
    <PrivateRoute allowedRoles={['user1', 'user2', 'normal_user', 'agent_user']}>
      <main className="bg-gray-50 min-h-screen">
        {/* Hero Section */}
        <div
          className="hero min-h-[60vh] relative"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGFwZXIlMjBkb2N1bWVudCUyMGhlcm98ZW58MHx8MHx8fDA%3D)",
          }}
        >
          <div className="hero-overlay bg-opacity-60"></div>
          <div className="container mx-auto px-6 lg:px-12 py-16 flex flex-col md:flex-row items-center">
            {/* Text Content */}
            <div className="w-full md:w-1/2 space-y-6 text-center md:text-left">
              <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-800 leading-tight">
                Welcome, {user.name}
              </h1>
              <p className="text-lg lg:text-xl text-gray-300">
                {getRoleDescription(user.role)}
              </p>
              <div className="flex justify-center md:justify-start space-x-4">
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-red-700 transition"
                >
                  Logout
                </button>
                <Link href="/user/profile">
                  <button className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition">
                    View Profile
                  </button>
                </Link>
              </div>
            </div>
            {/* User Info Card */}
            <div className="w-full md:w-1/2 mt-10 md:mt-0">
              <div className="card bg-white shadow-lg rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Account Information</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Type:</span>
                    <span className="font-medium text-blue-600">{user.role?.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-gray-800">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available Forms:</span>
                    <span className="font-medium text-green-600">{getAvailableForms(user.role).length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-6 lg:px-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 text-center mb-8">
              Your Dashboard Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="card bg-white shadow-lg rounded-lg p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Available Forms</h3>
                <p className="text-blue-800 mt-2">Document Types:</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center">
                    <span className="text-blue-600 mr-2">📋</span>
                    <span className="text-blue-600 font-medium">{getAvailableForms(user.role).length} Forms Available</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-600 mr-2">✅</span>
                    <span className="text-green-600 font-medium">0 Completed</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-yellow-600 mr-2">⏳</span>
                    <span className="text-yellow-600 font-medium">0 Pending</span>
                  </div>
                </div>
              </div>

              <div className="card bg-white shadow-lg rounded-lg p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Quick Actions</h3>
                <p className="text-blue-800 mt-2">Get Started:</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center">
                    <span className="text-blue-600 mr-2">🚀</span>
                    <Link href="/sale-deed" className="text-blue-600 hover:underline">
                      Create Sale Deed
                    </Link>
                  </div>
                  <div className="flex items-center">
                    <span className="text-blue-600 mr-2">📄</span>
                    <Link href="/will-deed" className="text-blue-600 hover:underline">
                      Create Will Deed
                    </Link>
                  </div>
                </div>
              </div>

              <div className="card bg-white shadow-lg rounded-lg p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Account Status</h3>
                <p className="text-blue-800 mt-2">Your Information:</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center">
                    <span className="text-blue-600 mr-2">👤</span>
                    <span className="text-blue-600 font-medium">{user.role?.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-600 mr-2">✅</span>
                    <span className="text-green-600 font-medium">Account Active</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-blue-600 mr-2">📧</span>
                    <span className="text-blue-600 font-medium">{user.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Available Forms Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6 lg:px-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 text-center">
              Available Document Forms
            </h2>
            <p className="text-center text-gray-600 mt-4 mb-8">
              Choose a form to create and submit your documents
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {getAvailableForms(user.role).map((form, index) => (
                <Link
                  key={index}
                  href={form.path}
                  className="block bg-white p-6 rounded-lg shadow hover:bg-gray-100 transition-all duration-200"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 text-xl">📄</span>
                    </div>
                    <h3 className="ml-4 text-xl font-semibold text-gray-800">
                      {form.name}
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    {form.description}
                  </p>
                  <div className="flex items-center text-blue-600 font-medium">
                    Create Form
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* My Forms Dashboard */}
        <section className="py-16 bg-gray-200">
          <div className="container mx-auto px-6 lg:px-12">
            <UserFormsDashboard />
          </div>
        </section>

        {/* My Forms History */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6 lg:px-12">
            <UserFormsHistory />
          </div>
        </section>

        {/* Recent Activity Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 lg:px-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 text-center">
              Recent Activity
            </h2>
            <div className="mt-8">
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No recent activity</h3>
                <p className="text-gray-600 mb-6">Start by creating your first form</p>
                <Link href="/sale-deed">
                  <button className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition">
                    Get Started
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions Section */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-6 lg:px-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 text-center">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <Link
                href="/user/profile"
                className="block bg-white p-6 rounded-lg shadow hover:bg-gray-100 transition-all duration-200"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-xl">👤</span>
                  </div>
                  <h3 className="ml-4 text-xl font-semibold text-gray-800">View Profile</h3>
                </div>
                <p className="text-gray-600">Manage your account settings and personal information</p>
              </Link>

              <Link
                href="/user/change-password"
                className="block bg-white p-6 rounded-lg shadow hover:bg-gray-100 transition-all duration-200"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-xl">🔒</span>
                  </div>
                  <h3 className="ml-4 text-xl font-semibold text-gray-800">Change Password</h3>
                </div>
                <p className="text-gray-600">Update your password for better security</p>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PrivateRoute>
  );
};

export default UserDashboard;
