"use client";
import React, { useEffect, useState } from "react";
import { adminFetch } from "@/lib/services/admin";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalStampDuty: 45231.89,
    totalUserCharge: 15231.89,
    totalUsers: 0,
    totalAgents: 0,
    pendingAgents: 0,
    approvedAgents: 0,
    rejectedAgents: 0,
    totalStaff: 0,
    activeStaff: 0,
    totalForms: 0,
    pendingForms: 0,
    completedForms: 0
  });

  const [recentTransactions, setRecentTransactions] = useState([
    { id: 1, customer: "Liam Johnson", email: "liam@example.com", amount: 250.00 },
    { id: 2, customer: "Olivia Smith", email: "olivia@example.com", amount: 150.00 },
    { id: 3, customer: "Noah Williams", email: "noah@example.com", amount: 320.00 },
    { id: 4, customer: "Emma Brown", email: "emma@example.com", amount: 180.00 },
    { id: 5, customer: "Lucas Davis", email: "lucas@example.com", amount: 290.00 }
  ]);

  const [recentSales, setRecentSales] = useState([
    { id: 1, initials: "OM", name: "Olivia Martin", email: "olivia.martin@email.com" },
    { id: 2, initials: "JL", name: "Jackson Lee", email: "jackson.lee@email.com" },
    { id: 3, initials: "IN", name: "Isabella Nguyen", email: "isabella.nguyen@email.com" },
    { id: 4, initials: "WK", name: "William Kim", email: "will@email.com" },
    { id: 5, initials: "SD", name: "Sofia Davis", email: "sofia.davis@email.com" }
  ]);

  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('Fetching admin dashboard stats...');
        
        // Fetch user stats
        const userStatsResponse = await adminFetch('/api/admin/users/stats');
        console.log('User stats response:', userStatsResponse);
        
        // Fetch agent stats
        const agentStatsResponse = await adminFetch('/api/admin/agents/stats');
        console.log('Agent stats response:', agentStatsResponse);
        
        // Fetch dashboard stats
        const data = await adminFetch('/api/admin/dashboard/stats');
        console.log('Dashboard stats response:', data);
        
        setStats(prev => ({
          ...prev,
          totalUsers: userStatsResponse.stats?.totalUsers || 0,
          totalAgents: agentStatsResponse.stats?.totalAgents || 0,
          pendingAgents: agentStatsResponse.stats?.pendingAgents || 0,
          approvedAgents: agentStatsResponse.stats?.approvedAgents || 0,
          rejectedAgents: agentStatsResponse.stats?.rejectedAgents || 0,
          totalStaff: data.stats?.totalStaff || 0,
          activeStaff: data.stats?.activeStaff || 0,
          totalForms: data.stats?.totalForms || 0,
          pendingForms: data.stats?.pendingForms || 0,
          completedForms: data.stats?.completedForms || 0
        }));
      } catch (e) {
        console.error('Dashboard stats error:', e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchRecentActivities = async () => {
      try {
        const data = await adminFetch('/api/logs/recent?limit=10');
        setRecentActivities(data.data || []);
      } catch (error) {
        console.error('Error fetching recent activities:', error);
      }
    };

    fetchStats();
    fetchRecentActivities();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-600 font-medium">Error loading dashboard</div>
        <div className="text-red-500 text-sm mt-1">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Stamp Duty"
          value={`₹${stats.totalStampDuty.toLocaleString()}`}
          change="+20.1% from last month"
          changeType="positive"
          icon="₹"
        />
        <StatCard
          title="Total User Charge"
          value={`₹${stats.totalUserCharge.toLocaleString()}`}
          change="+180.1% from last month"
          changeType="positive"
          icon="👥"
        />
        <StatCard
          title="Total User"
          value={stats.totalUsers.toLocaleString()}
          change="+19% from last month"
          changeType="positive"
          icon="👤"
        />
        <StatCard
          title="Total Agent"
          value={stats.totalAgents.toLocaleString()}
          change="+201 since last hour"
          changeType="positive"
          icon="💼"
        />
      </div>

      {/* Agent Management Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/admin/agent-requests?status=pending" className="block">
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Agents</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingAgents}</p>
                <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/admin/agent-requests?status=approved" className="block">
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved Agents</p>
                <p className="text-2xl font-bold text-green-600">{stats.approvedAgents}</p>
                <p className="text-xs text-gray-500 mt-1">Can login</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/admin/agent-requests?status=rejected" className="block">
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected Agents</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejectedAgents}</p>
                <p className="text-xs text-gray-500 mt-1">Cannot login</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/admin/agent-requests" className="block">
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">All Agents</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalAgents}</p>
                <p className="text-xs text-gray-500 mt-1">Total registered</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transactions Table */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Transactions</h3>
              <p className="text-sm text-gray-500">Recent transactions from your store.</p>
            </div>
            <Link href="/admin/transactions" className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              View All
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{transaction.customer}</div>
                        <div className="text-sm text-gray-500">{transaction.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      ₹{transaction.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Sales</h3>
          </div>
          <div className="space-y-4">
            {recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">{sale.initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{sale.name}</div>
                  <div className="text-sm text-gray-500 truncate">{sale.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
            <Link 
              href="/admin/activity-logs"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              View All Logs
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.status === 'success' ? 'bg-green-500' :
                    activity.status === 'failure' ? 'bg-red-500' :
                    activity.status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {activity.userName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 truncate">
                      {activity.action}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        activity.status === 'success' ? 'bg-green-100 text-green-800' :
                        activity.status === 'failure' ? 'bg-red-100 text-red-800' :
                        activity.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {activity.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {activity.userType}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p>No recent activities</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, changeType, icon }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
          <p className={`text-sm mt-1 ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </p>
        </div>
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
          <span className="text-xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}