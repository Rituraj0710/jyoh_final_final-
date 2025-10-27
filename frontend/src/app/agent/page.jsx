"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const AgentHomePage = () => {
  const [user, setUser] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'user2') {
      router.push('/agent/login');
      return;
    }

    // Get user info from localStorage
    const name = localStorage.getItem('user_name');
    const email = localStorage.getItem('user_email');
    const id = localStorage.getItem('user_id');
    
    setUser({ name, email, _id: id, role });
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('role');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_id');
    localStorage.removeItem('is_auth');
    
    // Redirect to login
    router.push('/agent/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {user.name}
              </h1>
              <p className="text-gray-600">Agent Portal - Assist users with document management</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Account Type</p>
                <p className="text-sm font-medium text-green-600">
                  AGENT
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Agent Portal
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              As an agent, you can assist users with form completion, submit forms on their behalf, 
              and track all your submitted forms. Access your dashboard to manage your forms and 
              view submission history.
            </p>
            
            {/* Agent Dashboard Button */}
            <Link
              href="/agent/dashboard"
              className="inline-flex items-center px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Agent Dashboard
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Form Submission */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">📝</span>
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">
                Submit Forms
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Create and submit various legal documents on behalf of users
            </p>
            <Link
              href="/agent/dashboard"
              className="text-blue-600 font-medium hover:text-blue-700 flex items-center"
            >
              Go to Dashboard
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Track Submissions */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">📊</span>
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">
                Track Forms
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Monitor the status of all your submitted forms and documents
            </p>
            <Link
              href="/agent/dashboard"
              className="text-green-600 font-medium hover:text-green-700 flex items-center"
            >
              View Tracking
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* User Support */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-xl">🤝</span>
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">
                Assist Users
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Help users with form completion and document verification
            </p>
            <Link
              href="/agent/dashboard"
              className="text-purple-600 font-medium hover:text-purple-700 flex items-center"
            >
              Start Assisting
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Agent Information */}
        <div className="mt-12 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Agent Capabilities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">✅ What you can do:</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Submit multiple forms on behalf of users</li>
                  <li>• Track all your form submissions</li>
                  <li>• View form status and progress</li>
                  <li>• Access all available form types</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">📋 Available forms:</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Sale Deed</li>
                  <li>• Will Deed</li>
                  <li>• Trust Deed</li>
                  <li>• Property Registration</li>
                  <li>• Power of Attorney</li>
                  <li>• Adoption Deed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentHomePage;
