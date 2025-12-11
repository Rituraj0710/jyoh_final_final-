"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Staff4FinalDocumentPage() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'ready', 'pending'
  const [generating, setGenerating] = useState({}); // Track which form is being generated
  const { getAuthHeaders, user } = useAuth();

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      setLoading(true);
      setError(null);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      
      const response = await fetch(`${API_BASE}/api/staff/4/forms?limit=100`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success' && data.data) {
          setForms(data.data.forms || []);
        } else {
          console.error('Forms response error:', data);
          setForms([]);
        }
      } else {
        console.error('Failed to fetch forms:', response.status);
        setForms([]);
      }
    } catch (error) {
      console.error('Error fetching forms:', error);
      setError(error.message);
      setForms([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'verified':
      case 'cross_verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
      case 'needs_correction':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isFormReadyForFinal = (form) => {
    // Check if all staff approvals are complete
    const staff1Approved = form.approvals?.staff1?.approved || false;
    const staff2Approved = form.approvals?.staff2?.approved || false;
    const staff3Approved = form.approvals?.staff3?.approved || false;
    const staff4Approved = form.approvals?.staff4?.approved || false;
    
    return staff1Approved && staff2Approved && staff3Approved && staff4Approved;
  };

  const handleGenerateFinalDocument = async (formId) => {
    if (!isFormReadyForFinal(forms.find(f => f._id === formId))) {
      alert('This form is not ready for final document generation. All staff approvals must be complete.');
      return;
    }

    try {
      setGenerating(prev => ({ ...prev, [formId]: true }));
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      
      const response = await fetch(`${API_BASE}/api/staff/4/forms/${formId}/final-document`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `final-document-${formId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Show success message
        alert('Final document PDF downloaded successfully!');
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to generate final document' }));
        alert(errorData.message || 'Failed to generate final document');
      }
    } catch (error) {
      console.error('Error generating final document:', error);
      alert(`Error: ${error.message || 'Failed to generate final document. Please try again.'}`);
    } finally {
      setGenerating(prev => ({ ...prev, [formId]: false }));
    }
  };

  const filteredForms = forms.filter(form => {
    if (filter === 'ready') {
      return isFormReadyForFinal(form);
    } else if (filter === 'pending') {
      return !isFormReadyForFinal(form);
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading final documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Final Document</h1>
              <p className="text-gray-600">Create and generate final documents for verified forms</p>
            </div>
            <Link
              href="/staff4/dashboard"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-blue-600 text-xl">ℹ️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-900">About Final Documents</h3>
              <p className="mt-1 text-sm text-blue-700">
                Final documents are generated from forms that have been verified and approved by all staff members (Staff1, Staff2, Staff3, and Staff4). 
                These documents contain all verified information and are ready to be provided to users. Click the <strong>"Download PDF"</strong> button to generate and download the final document in PDF format.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">✗</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Forms ({forms.length})
            </button>
            <button
              onClick={() => setFilter('ready')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'ready'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Ready for Final ({forms.filter(f => isFormReadyForFinal(f)).length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending Approval ({forms.filter(f => !isFormReadyForFinal(f)).length})
            </button>
          </div>
        </div>

        {/* Forms List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Documents ({filteredForms.length})
            </h2>
          </div>
          
          {filteredForms.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredForms.map((form) => (
                <div
                  key={form._id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-sm font-medium text-gray-900">
                          {form.serviceType?.replace(/-/g, ' ').replace(/_/g, ' ').toUpperCase() || 
                           form.formType?.replace(/_/g, ' ').toUpperCase() || 
                           'Form'}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(form.status)}`}>
                          {form.status?.replace(/_/g, ' ') || 'Pending'}
                        </span>
                        {isFormReadyForFinal(form) && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            ✓ Ready for Final
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>ID: {form._id?.substring(0, 12)}...</p>
                        {form.createdAt && (
                          <p>Created: {new Date(form.createdAt).toLocaleDateString()}</p>
                        )}
                        {form.data?.applicantName && (
                          <p>Applicant: {form.data.applicantName}</p>
                        )}
                      </div>
                      {/* Staff Approval Status */}
                      <div className="mt-2 flex items-center space-x-4 text-xs">
                        <div className="flex items-center">
                          <span className={`w-2 h-2 rounded-full mr-1 ${
                            form.approvals?.staff1?.approved ? 'bg-green-500' : 'bg-gray-300'
                          }`}></span>
                          <span className="text-gray-600">S1</span>
                        </div>
                        <div className="flex items-center">
                          <span className={`w-2 h-2 rounded-full mr-1 ${
                            form.approvals?.staff2?.approved ? 'bg-green-500' : 'bg-gray-300'
                          }`}></span>
                          <span className="text-gray-600">S2</span>
                        </div>
                        <div className="flex items-center">
                          <span className={`w-2 h-2 rounded-full mr-1 ${
                            form.approvals?.staff3?.approved ? 'bg-green-500' : 'bg-gray-300'
                          }`}></span>
                          <span className="text-gray-600">S3</span>
                        </div>
                        <div className="flex items-center">
                          <span className={`w-2 h-2 rounded-full mr-1 ${
                            form.approvals?.staff4?.approved ? 'bg-green-500' : 'bg-gray-300'
                          }`}></span>
                          <span className="text-gray-600">S4</span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex items-center space-x-3">
                      {isFormReadyForFinal(form) ? (
                        <button
                          onClick={() => handleGenerateFinalDocument(form._id)}
                          disabled={generating[form._id]}
                          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                          title="Generate and download final document as PDF"
                        >
                          {generating[form._id] ? (
                            <>
                              <span className="animate-spin">⏳</span>
                              <span>Generating PDF...</span>
                            </>
                          ) : (
                            <>
                              <span>📥</span>
                              <span>Download PDF</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">Pending Approvals</span>
                      )}
                      <Link
                        href={`/staff4/forms/${form._id}`}
                        className="text-purple-600 text-sm font-medium hover:text-purple-700"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-400 text-4xl mb-4">📄</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-500 text-sm mb-4">
                {filter === 'ready' 
                  ? 'No forms are ready for final document processing at this time.'
                  : filter === 'pending'
                  ? 'All forms have been approved by all staff members.'
                  : 'No forms are available at this time.'}
              </p>
              <Link
                href="/staff4/forms"
                className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                View All Forms
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

