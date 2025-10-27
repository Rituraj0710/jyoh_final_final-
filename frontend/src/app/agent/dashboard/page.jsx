"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PrivateRoute from '@/components/PrivateRoute';

const AgentDashboard = () => {
  const [user, setUser] = useState({});
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    underReview: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const name = localStorage.getItem('user_name');
      const email = localStorage.getItem('user_email');
      const id = localStorage.getItem('user_id');
      const role = localStorage.getItem('role');
      setUser({ name, email, _id: id, role });
      
      // Load agent forms
      loadAgentForms(id);
    }
  }, []);

  const loadAgentForms = async (agentId) => {
    try {
      const token = localStorage.getItem('access_token');
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      
      const response = await fetch(`${API_BASE}/api/forms?agentId=${agentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setForms(data.forms || []);
        
        // Calculate stats
        const total = data.forms?.length || 0;
        const submitted = data.forms?.filter(f => f.status === 'submitted').length || 0;
        const underReview = data.forms?.filter(f => f.status === 'under_review').length || 0;
        const approved = data.forms?.filter(f => f.status === 'approved').length || 0;
        const rejected = data.forms?.filter(f => f.status === 'rejected').length || 0;
        
        setStats({ total, submitted, underReview, approved, rejected });
      }
    } catch (error) {
      console.error('Error loading agent forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('role');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_id');
    localStorage.removeItem('is_auth');
    
    // Redirect to login
    window.location.href = '/agent/login';
  };

  const getAvailableForms = () => {
    return [
      { name: 'Sale Deed', path: '/sale-deed', description: 'Create property sale deed documents' },
      { name: 'Will Deed', path: '/will-deed', description: 'Create will and testament documents' },
      { name: 'Trust Deed', path: '/trust-deed', description: 'Create trust deed documents' },
      { name: 'Property Registration', path: '/property-registration', description: 'Register property documents' },
      { name: 'Power of Attorney', path: '/power-of-attorney', description: 'Create power of attorney documents' },
      { name: 'Adoption Deed', path: '/adoption-deed', description: 'Create adoption deed documents' }
    ];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <PrivateRoute allowedRoles={['user2']}>
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
                  Agent Dashboard
                </h1>
              <p className="text-lg lg:text-xl text-gray-300">
                Welcome, {user.name} - Assist users with document processing
              </p>
              <div className="flex justify-center md:justify-start space-x-4">
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-red-700 transition"
                >
                  Logout
                </button>
                <Link href="/agent/profile">
                  <button className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-700 transition">
                    View Profile
                  </button>
                </Link>
              </div>
            </div>
            {/* Agent Info Card */}
            <div className="w-full md:w-1/2 mt-10 md:mt-0">
              <div className="card bg-white shadow-lg rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Agent Information</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Type:</span>
                    <span className="font-medium text-green-600">AGENT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-gray-800">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Forms:</span>
                    <span className="font-medium text-green-600">{stats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Approved:</span>
                    <span className="font-medium text-blue-600">{stats.approved}</span>
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
              Agent Performance Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              <div className="card bg-white shadow-lg rounded-lg p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Total Forms</h3>
                <p className="text-green-800 mt-2">All Time:</p>
                <div className="mt-4 flex items-center">
                  <span className="text-green-600 text-3xl mr-3">📋</span>
                  <span className="text-3xl font-bold text-gray-900">{stats.total}</span>
                  </div>
                </div>

              <div className="card bg-white shadow-lg rounded-lg p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Submitted</h3>
                <p className="text-blue-800 mt-2">Ready for Review:</p>
                <div className="mt-4 flex items-center">
                  <span className="text-blue-600 text-3xl mr-3">✅</span>
                  <span className="text-3xl font-bold text-gray-900">{stats.submitted}</span>
              </div>
            </div>

              <div className="card bg-white shadow-lg rounded-lg p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Under Review</h3>
                <p className="text-yellow-800 mt-2">In Progress:</p>
                <div className="mt-4 flex items-center">
                  <span className="text-yellow-600 text-3xl mr-3">⏳</span>
                  <span className="text-3xl font-bold text-gray-900">{stats.underReview}</span>
                  </div>
                </div>

              <div className="card bg-white shadow-lg rounded-lg p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Approved</h3>
                <p className="text-green-800 mt-2">Completed:</p>
                <div className="mt-4 flex items-center">
                  <span className="text-green-600 text-3xl mr-3">✓</span>
                  <span className="text-3xl font-bold text-gray-900">{stats.approved}</span>
              </div>
            </div>

              <div className="card bg-white shadow-lg rounded-lg p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Rejected</h3>
                <p className="text-red-800 mt-2">Need Revision:</p>
                <div className="mt-4 flex items-center">
                  <span className="text-red-600 text-3xl mr-3">✗</span>
                  <span className="text-3xl font-bold text-gray-900">{stats.rejected}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* New Form Section */}
        <section className="py-16 bg-gray-200">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="text-center md:text-left mb-6 md:mb-0">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Create New Form</h2>
                  <p className="text-lg text-gray-600">Submit a new form on behalf of a user</p>
                </div>
                <Link
                  href="/sale-deed"
                  className="inline-flex items-center px-8 py-4 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition-colors text-lg"
                >
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  + New Form
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Forms List Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6 lg:px-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 text-center mb-8">
              Your Submitted Forms
            </h2>
            <p className="text-center text-gray-600 mb-8">
              Track the status of all your form submissions
            </p>
            
            <div className="bg-white rounded-lg shadow-lg">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-4 text-lg text-gray-600">Loading forms...</p>
                </div>
              ) : forms.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-gray-400 text-6xl mb-6">📄</div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">No forms submitted yet</h3>
                  <p className="text-lg text-gray-600 mb-8">Start by creating your first form</p>
                  <Link
                    href="/sale-deed"
                    className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg shadow-lg hover:bg-green-700 transition-colors"
                  >
                    Create First Form
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Form ID
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Service Type
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Created Date
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {forms.map((form) => (
                        <tr key={form._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {form.formId || form._id.slice(-8)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {form.serviceType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(form.status)}`}>
                              {form.status?.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(form.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <Link
                              href={`/agent/forms/${form._id}`}
                              className="text-green-600 hover:text-green-900 font-medium"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            </div>
        </section>

        {/* Available Forms Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 lg:px-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 text-center">
              Available Document Forms
            </h2>
            <p className="text-center text-gray-600 mt-4 mb-8">
              Choose a form type to create and submit on behalf of users
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {getAvailableForms().map((form, index) => (
                <Link
                  key={index}
                  href={form.path}
                  className="block bg-gray-100 p-6 rounded-lg shadow hover:bg-gray-200 transition-all duration-200"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 text-xl">📄</span>
                        </div>
                    <h3 className="ml-4 text-xl font-semibold text-gray-800">
                      {form.name}
                    </h3>
                        </div>
                  <p className="text-gray-600 mb-4">
                    {form.description}
                  </p>
                  <div className="flex items-center text-green-600 font-medium">
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
      </main>
    </PrivateRoute>
  );
};

export default AgentDashboard;