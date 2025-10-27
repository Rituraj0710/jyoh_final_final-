"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AgentProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/agent/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001'}/api/auth/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (response.ok && data.success && data.data && data.data.user) {
        setUser(data.data.user);
      } else {
        // Fallback to localStorage if API fails
        const name = localStorage.getItem('user_name');
        const email = localStorage.getItem('user_email');
        const id = localStorage.getItem('user_id');
        const role = localStorage.getItem('role');
        setUser({ name, email, _id: id, role });
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      setError("Failed to load profile data");
      // Fallback to localStorage
      const name = localStorage.getItem('user_name');
      const email = localStorage.getItem('user_email');
      const id = localStorage.getItem('user_id');
      const role = localStorage.getItem('role');
      setUser({ name, email, _id: id, role });
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role) => {
    const roleLabels = {
      'user1': 'Regular User',
      'user2': 'Agent',
      'admin': 'Administrator',
      'staff1': 'Form Review & Stamp Calculation',
      'staff2': 'Trustee Details Validation',
      'staff3': 'Land/Plot Details Verification',
      'staff4': 'Approval & Review',
      'staff5': 'Final Approval & Lock'
    };
    return roleLabels[role] || role;
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('role');
    localStorage.removeItem('user_name');
    localStorage.removeItem('is_auth');
    
    // Redirect to login
    window.location.href = '/agent/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">Unable to load your profile information.</p>
          <Link
            href="/agent/login"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <Link
          href="/agent/dashboard"
          className="inline-flex items-center text-green-600 hover:text-green-800 mb-6"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>

        {/* Profile Card */}
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-8">
            <div className="flex items-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-green-600">
                {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="ml-6">
                <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                <p className="text-green-100">{getRoleLabel(user.role)}</p>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="px-6 py-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
            
            {error && (
              <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Full Name */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                </div>
                <div className="md:col-span-2">
                  <div className="bg-gray-50 px-4 py-3 rounded-lg border">
                    <p className="text-gray-900">{user.name || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Email Address */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                </div>
                <div className="md:col-span-2">
                  <div className="bg-gray-50 px-4 py-3 rounded-lg border">
                    <p className="text-gray-900">{user.email || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Role */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Type
                  </label>
                </div>
                <div className="md:col-span-2">
                  <div className="bg-green-50 px-4 py-3 rounded-lg border border-green-200">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                </div>
              </div>

              {/* User ID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User ID
                  </label>
                </div>
                <div className="md:col-span-2">
                  <div className="bg-gray-50 px-4 py-3 rounded-lg border">
                    <p className="text-gray-900 font-mono text-sm">{user._id || user.id || 'Not available'}</p>
                  </div>
                </div>
              </div>

              {/* Department (if available) */}
              {user.department && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <div className="bg-gray-50 px-4 py-3 rounded-lg border">
                      <p className="text-gray-900">{user.department}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Employee ID (if available) */}
              {user.employeeId && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employee ID
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <div className="bg-gray-50 px-4 py-3 rounded-lg border">
                      <p className="text-gray-900">{user.employeeId}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Last Login (if available) */}
              {user.lastLogin && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Login
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <div className="bg-gray-50 px-4 py-3 rounded-lg border">
                      <p className="text-gray-900">{new Date(user.lastLogin).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/agent/dashboard"
                className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                </svg>
                Back to Dashboard
              </Link>
              
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Agent Capabilities Info */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-lg">🤝</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-green-900">Agent Capabilities</h3>
              <p className="mt-2 text-sm text-green-700">
                As an agent, you have enhanced access to assist users with form completion, 
                data verification, and document submission. You can help users navigate the 
                entire document management process and provide expert guidance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
