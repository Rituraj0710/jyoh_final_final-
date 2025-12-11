"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Staff3Dashboard() {
  const [stats, setStats] = useState({
    pendingLandVerification: 0,
    pendingPlotVerification: 0,
    pendingEStampMapVerification: 0,
    pendingStaff1Drafts: 0,
    pendingDeliveryVerification: 0,
    completedVerifications: 0,
    formsCorrected: 0,
    workReportsSubmitted: 0,
    todayTasks: 0,
    weeklyProgress: 0
  });
  const [recentForms, setRecentForms] = useState([]);
  const [staff1Drafts, setStaff1Drafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getAuthHeaders, user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      
      // Fetch dashboard stats
      const statsResponse = await fetch(`${API_BASE}/api/staff/3/dashboard-stats`, {
        headers: getAuthHeaders()
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data || stats);
      }

      // Fetch recent E-Stamp and Map Module forms
      const formsResponse = await fetch(`${API_BASE}/api/staff/3/forms?limit=5&serviceType=e-stamp,map-module`, {
        headers: getAuthHeaders()
      });

      if (formsResponse.ok) {
        const formsData = await formsResponse.json();
        // Filter to only show e-stamp and map-module forms
        const filteredForms = (formsData.data?.forms || []).filter(form => 
          form.serviceType === 'e-stamp' || form.serviceType === 'map-module'
        );
        setRecentForms(filteredForms);
      }

      // Fetch Staff 1 drafts
      const draftsResponse = await fetch(`${API_BASE}/api/staff/3/forms?limit=10&staff1Drafts=true`, {
        headers: getAuthHeaders()
      });

      if (draftsResponse.ok) {
        const draftsData = await draftsResponse.json();
        setStaff1Drafts(draftsData.data?.forms || []);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const dashboardCards = [
    {
      title: 'Staff 1 Drafts',
      value: stats.pendingStaff1Drafts,
      icon: '📝',
      color: 'blue',
      href: '/staff3/forms?staff1Drafts=true'
    },
    {
      title: 'Pending E-Stamp & Map Module',
      value: stats.pendingEStampMapVerification,
      icon: '📋',
      color: 'purple',
      href: '/staff3/e-stamp-map-verification'
    },
    {
      title: 'Delivery Verification',
      value: stats.pendingDeliveryVerification,
      icon: '🚚',
      color: 'green',
      href: '/staff3/forms?deliveryVerification=true'
    },
    {
      title: 'Forms Corrected',
      value: stats.formsCorrected,
      icon: '✏️',
      color: 'yellow',
      href: '/staff3/e-stamp-map-verification'
    },
    {
      title: 'Work Reports',
      value: stats.workReportsSubmitted,
      icon: '📋',
      color: 'indigo',
      href: '/staff3/work-report'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      pink: 'bg-pink-50 text-pink-600 border-pink-200'
    };
    return colors[color] || colors.yellow;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Staff3 Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Staff3 Dashboard
              </h1>
              <p className="text-gray-600">Welcome, {user?.name} - E-Stamp & Map Module Verification</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Role</p>
                <p className="text-sm font-medium text-yellow-600">
                  STAFF3
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Role Description */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow p-6 mb-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-xl">📋</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Staff3 Responsibilities</h3>
              <p className="text-sm text-gray-600">
                As a power of authority, Staff 3 verifies all drafting created by Staff 1, verifies Map Module and E-Stamp Module applications, 
                and verifies delivery options. Ensure all information is accurate and legally compliant.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {dashboardCards.map((card, index) => (
            <Link
              key={index}
              href={card.href}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 p-6 border-l-4 border-yellow-500"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(card.color)}`}>
                    <span className="text-2xl">{card.icon}</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href="/staff3/forms?staff1Drafts=true"
                className="flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <span className="text-blue-600 mr-3">📝</span>
                <span className="text-sm font-medium text-gray-900">Review Staff 1 Drafts</span>
              </Link>
              <Link
                href="/staff3/e-stamp-map-verification"
                className="flex items-center p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <span className="text-purple-600 mr-3">📋</span>
                <span className="text-sm font-medium text-gray-900">Verify E-Stamp & Map Module</span>
              </Link>
              <Link
                href="/staff3/forms?deliveryVerification=true"
                className="flex items-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <span className="text-green-600 mr-3">🚚</span>
                <span className="text-sm font-medium text-gray-900">Verify Delivery Options</span>
              </Link>
              <Link
                href="/staff3/work-report"
                className="flex items-center p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                <span className="text-indigo-600 mr-3">📋</span>
                <span className="text-sm font-medium text-gray-900">Submit Work Report</span>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent E-Stamp & Map Module Forms</h3>
            {recentForms.length > 0 ? (
              <div className="space-y-3">
                {recentForms.map((form, index) => (
                  <Link
                    key={index}
                    href={`/staff3/forms/${form._id}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {form.serviceType === 'e-stamp' ? 'E-Stamp Application' : form.serviceType === 'map-module' ? 'Map Module' : form.formType || 'Form'}
                      </p>
                      <p className="text-xs text-gray-500">ID: {form._id?.slice(-8)}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      form.status === 'verified' ? 'bg-green-100 text-green-800' :
                      form.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                      form.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {form.status || 'Pending'}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No recent E-Stamp or Map Module forms</p>
            )}
          </div>
        </div>

        {/* Staff 1 Drafts Section */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Staff 1 Drafts</h2>
              <p className="text-sm text-gray-500">All drafting created by Staff 1 requiring verification</p>
            </div>
            <Link
              href="/staff3/forms?staff1Drafts=true"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </Link>
          </div>
          
          {staff1Drafts.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {staff1Drafts.map((form) => (
                <Link
                  key={form._id}
                  href={`/staff3/forms/${form._id}`}
                  className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-sm font-medium text-gray-900">
                          {form.serviceType?.replace(/-/g, ' ').replace(/_/g, ' ').toUpperCase() || 
                           form.formType?.replace(/_/g, ' ').toUpperCase() || 
                           'Form'}
                        </h3>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          Staff 1 Draft
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          form.status === 'verified' || form.status === 'under_review' ? 'bg-green-100 text-green-800' :
                          form.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                          form.status === 'pending' || form.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {form.status?.replace(/_/g, ' ') || 'Draft'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>ID: {form._id?.substring(0, 12)}...</p>
                        {form.createdAt && (
                          <p>Created: {new Date(form.createdAt).toLocaleDateString()}</p>
                        )}
                        {form.filledByStaff1At && (
                          <p>Drafted by Staff 1: {new Date(form.filledByStaff1At).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className="text-blue-600 text-sm font-medium">Verify →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-400 text-4xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Staff 1 drafts found</h3>
              <p className="text-gray-500 text-sm">No drafts created by Staff 1 require verification at this time.</p>
            </div>
          )}
        </div>

        {/* Tools */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Staff3 Tools
            </h2>
            <p className="text-sm text-gray-500">
              Specialized tools for E-Stamp and Map Module verification
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 text-sm">📋</span>
                  </div>
                  <h3 className="ml-3 text-sm font-medium text-gray-900">E-Stamp Verifier</h3>
                </div>
                <p className="text-xs text-gray-600">
                  Verify E-Stamp application details, amounts, and party information.
                </p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <span className="text-indigo-600 text-sm">🗺️</span>
                  </div>
                  <h3 className="ml-3 text-sm font-medium text-gray-900">Map Module Verifier</h3>
                </div>
                <p className="text-xs text-gray-600">
                  Verify property maps, plot dimensions, and built-up area calculations.
                </p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-sm">📄</span>
                  </div>
                  <h3 className="ml-3 text-sm font-medium text-gray-900">Document Validator</h3>
                </div>
                <p className="text-xs text-gray-600">
                  Validate uploaded documents and check document authenticity.
                </p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-sm">✅</span>
                  </div>
                  <h3 className="ml-3 text-sm font-medium text-gray-900">Form Corrector</h3>
                </div>
                <p className="text-xs text-gray-600">
                  Make corrections to form data and update information as needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
