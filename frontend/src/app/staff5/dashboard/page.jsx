"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Staff5Dashboard() {
  const [stats, setStats] = useState({
    pendingFinalApproval: 0,
    formsLocked: 0,
    formsApproved: 0,
    formsRejected: 0,
    finalReportsGenerated: 0,
    todayTasks: 0,
    weeklyProgress: 0
  });
  const [recentForms, setRecentForms] = useState([]);
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
      const statsResponse = await fetch(`${API_BASE}/api/staff/5/dashboard-stats`, {
        headers: getAuthHeaders()
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data || stats);
      }

      // Fetch recent forms
      const formsResponse = await fetch(`${API_BASE}/api/staff/5/forms?limit=5`, {
        headers: getAuthHeaders()
      });

      if (formsResponse.ok) {
        const formsData = await formsResponse.json();
        setRecentForms(formsData.data?.forms || []);
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
      title: 'Pending Final Approval',
      value: stats.pendingFinalApproval,
      icon: '⏳',
      color: 'yellow',
      href: '/staff5/forms/pending'
    },
    {
      title: 'Forms Locked',
      value: stats.formsLocked,
      icon: '🔒',
      color: 'red',
      href: '/staff5/forms/locked'
    },
    {
      title: 'Forms Approved',
      value: stats.formsApproved,
      icon: '✅',
      color: 'green',
      href: '/staff5/forms/locked'
    },
    {
      title: 'Forms Rejected',
      value: stats.formsRejected,
      icon: '❌',
      color: 'red',
      href: '/staff5/forms'
    },
    {
      title: 'Final Reports',
      value: stats.finalReportsGenerated,
      icon: '📋',
      color: 'indigo',
      href: '/staff5/reports'
    },
    {
      title: 'Today\'s Tasks',
      value: stats.todayTasks,
      icon: '📅',
      color: 'blue',
      href: '/staff5/forms'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      blue: 'bg-blue-50 text-blue-600 border-blue-200'
    };
    return colors[color] || colors.red;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Staff5 Dashboard...</p>
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
                Staff5 Dashboard
              </h1>
              <p className="text-gray-600">Welcome, {user?.name} - Final Authority & Lock</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Role</p>
                <p className="text-sm font-medium text-red-600">
                  STAFF5
                </p>
              </div>
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
              <h3 className="text-lg font-medium text-gray-900">Staff5 Final Authority</h3>
              <p className="text-sm text-gray-600">
                Final review and approval authority. Cross-verify all work from Staff1-4, 
                make final decisions, and lock forms for completion. Generate final reports for permanent record.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {dashboardCards.map((card, index) => (
            <Link
              key={index}
              href={card.href}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 p-6 border-l-4 border-red-500"
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
                href="/staff5/forms/pending"
                className="flex items-center p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                <span className="text-red-600 mr-3">🔍</span>
                <span className="text-sm font-medium text-gray-900">Review Pending Forms</span>
              </Link>
              <Link
                href="/staff5/forms"
                className="flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <span className="text-blue-600 mr-3">📝</span>
                <span className="text-sm font-medium text-gray-900">Final Review All Forms</span>
              </Link>
              <Link
                href="/staff5/reports"
                className="flex items-center p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                <span className="text-indigo-600 mr-3">📋</span>
                <span className="text-sm font-medium text-gray-900">Generate Final Reports</span>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Forms</h3>
            {recentForms.length > 0 ? (
              <div className="space-y-3">
                {recentForms.map((form, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{form.formType || 'Form'}</p>
                      <p className="text-xs text-gray-500">ID: {form._id}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      form.status === 'locked_by_staff5' ? 'bg-red-100 text-red-800' :
                      form.status === 'approved' ? 'bg-green-100 text-green-800' :
                      form.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {form.status || 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No recent forms</p>
            )}
          </div>
        </div>

        {/* Final Authority Tools */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Final Authority Tools
            </h2>
            <p className="text-sm text-gray-500">
              Specialized tools for final review, approval, and report generation
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-red-600 text-sm">🔍</span>
                  </div>
                  <h3 className="ml-3 text-sm font-medium text-gray-900">Final Review Engine</h3>
                </div>
                <p className="text-xs text-gray-600">
                  Comprehensive review of all work completed by Staff1-4 with complete verification history.
                </p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-red-600 text-sm">🔒</span>
                  </div>
                  <h3 className="ml-3 text-sm font-medium text-gray-900">Final Lock System</h3>
                </div>
                <p className="text-xs text-gray-600">
                  Lock forms permanently after final approval. Once locked, no further edits are possible.
                </p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-sm">📄</span>
                  </div>
                  <h3 className="ml-3 text-sm font-medium text-gray-900">Final Report Generator</h3>
                </div>
                <p className="text-xs text-gray-600">
                  Generate comprehensive final reports with complete verification history and decisions.
                </p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <span className="text-indigo-600 text-sm">📊</span>
                  </div>
                  <h3 className="ml-3 text-sm font-medium text-gray-900">Decision Analytics</h3>
                </div>
                <p className="text-xs text-gray-600">
                  Track approval patterns, quality metrics, and decision analytics for process improvement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
