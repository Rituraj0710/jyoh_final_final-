"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useGetUserQuery } from '@/lib/services/auth';
import PrivateRoute from '@/components/PrivateRoute';
import UserFormsDashboard from '@/components/UserFormsDashboard';

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

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('role');
    localStorage.removeItem('user_name');
    localStorage.removeItem('is_auth');
    window.location.href = '/user/login';
  };

  return (
    <PrivateRoute allowedRoles={['user1', 'user2', 'normal_user', 'agent_user']}>
      <main className="bg-gray-50 min-h-screen">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome, {user.name || 'User'}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {user.email || ''}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Link
                  href="/user/profile"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Recent Forms */}
        <section className="py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <UserFormsDashboard />
          </div>
        </section>
      </main>
    </PrivateRoute>
  );
};

export default UserDashboard;
