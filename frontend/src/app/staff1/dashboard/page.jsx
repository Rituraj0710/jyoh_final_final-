"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Staff1Dashboard() {
  const [stats, setStats] = useState({
    pendingReview: 0,
    formsCorrected: 0,
    formsVerified: 0,
    stampCalculations: 0,
    workReportsSubmitted: 0,
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
      const statsResponse = await fetch(`${API_BASE}/api/staff/1/dashboard-stats`, {
        headers: getAuthHeaders()
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data || stats);
      }

      // Fetch recent forms
      const formsResponse = await fetch(`${API_BASE}/api/staff/1/forms?limit=5`, {
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
      title: "Pending Review",
      value: stats.pendingReview,
      icon: "⏳",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700",
      borderColor: "border-yellow-200",
      link: "/staff1/forms?status=submitted"
    },
    {
      title: "Work Reports",
      value: stats.workReportsSubmitted,
      icon: "📋",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-700",
      borderColor: "border-indigo-200",
      link: "/staff1/work-report"
    },
    {
      title: "Drafting",
      value: "New",
      icon: "📝",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      borderColor: "border-green-200",
      link: "/staff1/drafting"
    }
  ];

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'verified': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getServiceTypeIcon = (serviceType) => {
    switch (serviceType) {
      case 'will-deed': return '📜';
      case 'sale-deed': return '🏠';
      case 'trust-deed': return '🤝';
      case 'property-registration': return '📋';
      case 'power-of-attorney': return '⚖️';
      case 'adoption-deed': return '👶';
      default: return '📄';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg border">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">Error Loading Dashboard</h3>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name || 'Staff Member'}!</h1>
            <p className="text-blue-100">Form Review & Stamp Calculation Dashboard</p>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm">Today's Date</p>
            <p className="text-xl font-semibold">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardCards.map((card, index) => (
          <Link key={index} href={card.link} className="block">
            <div className={`${card.bgColor} ${card.borderColor} border rounded-lg p-6 hover:shadow-lg transition-all duration-200 cursor-pointer`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${card.textColor}`}>{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
                <span className="text-4xl">{card.icon}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Forms Section */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Forms</h2>
          <Link 
            href="/staff1/forms" 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All →
          </Link>
        </div>
        
        {recentForms.length > 0 ? (
          <div className="space-y-3">
            {recentForms.map((form) => (
              <div key={form._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getServiceTypeIcon(form.serviceType)}</span>
                  <div>
                    <p className="font-medium text-gray-900">
                      {form.formTitle || form.serviceType?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    <p className="text-sm text-gray-500">ID: {form._id?.substring(0, 8)}...</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(form.status)}`}>
                    {form.status}
                  </span>
                  <Link 
                    href={`/staff1/forms/${form._id}`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Review
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No recent forms to display</p>
            <Link 
              href="/staff1/forms" 
              className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
            >
              Browse All Forms
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link 
            href="/staff1/forms?status=submitted"
            className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            <span className="text-2xl">⏳</span>
            <div>
              <p className="font-medium text-gray-900">Review Forms</p>
              <p className="text-sm text-gray-600">Check pending submissions</p>
            </div>
          </Link>
          
          <Link 
            href="/staff1/work-report"
            className="flex items-center space-x-3 p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <span className="text-2xl">📋</span>
            <div>
              <p className="font-medium text-gray-900">Submit Report</p>
              <p className="text-sm text-gray-600">Daily work report</p>
            </div>
          </Link>
          
          <Link 
            href="/staff1/drafting"
            className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <span className="text-2xl">📝</span>
            <div>
              <p className="font-medium text-gray-900">Create Draft</p>
              <p className="text-sm text-gray-600">Draft forms with pre-filled data</p>
            </div>
          </Link>
          
          <button 
            onClick={fetchDashboardData}
            className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="text-2xl">🔄</span>
            <div>
              <p className="font-medium text-gray-900">Refresh Data</p>
              <p className="text-sm text-gray-600">Update dashboard</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}