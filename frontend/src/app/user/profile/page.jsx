"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UserProfilePage() {
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
        router.push('/user/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001'}/api/user/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (response.ok && data.user) {
        setUser(data.user);
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
      user1: 'Normal User',
      user2: 'Agent',
      normal_user: 'Normal User',
      agent_user: 'Agent'
    };
    return roleLabels[role] || role;
  };

  const getAccountStatusBadge = (status) => {
    if (status === 'active') {
      return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Active</span>;
    } else if (status === 'blocked') {
      return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Blocked</span>;
    }
    return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Unknown</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">Failed to load profile</p>
          <Link href="/user/dashboard" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            Back to Dashboard
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
          href="/user/dashboard"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>

        {/* Profile Card */}
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8">
            <div className="flex items-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-blue-600">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="ml-6">
                <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                <p className="text-blue-100">{getRoleLabel(user.role)}</p>
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
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  <p className="text-lg text-gray-900 mt-1">{user.name || 'N/A'}</p>
                </div>
                <div className="text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-500">Email Address</p>
                  <p className="text-lg text-gray-900 mt-1">{user.email || 'N/A'}</p>
                </div>
                <div className="text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              {/* Phone */}
              {user.phone && (
                <div className="flex items-center justify-between py-4 border-b border-gray-200">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone Number</p>
                    <p className="text-lg text-gray-900 mt-1">{user.phone}</p>
                  </div>
                  <div className="text-blue-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Account Type */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-500">Account Type</p>
                  <p className="text-lg text-gray-900 mt-1">{getRoleLabel(user.role)}</p>
                </div>
                <div className="text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>

              {/* Account Status */}
              {user.accountStatus && (
                <div className="flex items-center justify-between py-4 border-b border-gray-200">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Account Status</p>
                    <div className="mt-2">
                      {getAccountStatusBadge(user.accountStatus)}
                    </div>
                  </div>
                </div>
              )}

              {/* Verification Status */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-500">Email Verification</p>
                  <div className="mt-2">
                    {user.is_verified ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        ✓ Verified
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                        ⚠ Not Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* User ID */}
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">User ID</p>
                  <p className="text-sm text-gray-600 mt-1 font-mono">{user._id || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-4">
            <Link
              href="/user/change-password"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-center"
            >
              Change Password
            </Link>
            <Link
              href="/user/dashboard"
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors text-center"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}