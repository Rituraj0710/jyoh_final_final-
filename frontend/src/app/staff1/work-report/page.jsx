"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function Staff1WorkReportPage() {
  const { getAuthHeaders } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showNewReportForm, setShowNewReportForm] = useState(false);
  
  const [newReport, setNewReport] = useState({
    completedTasks: [],
    workSummary: '',
    issuesEncountered: '',
    recommendations: '',
    formsProcessed: 0
  });

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: ''
  });

  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(`${API_BASE}/api/staff/1/reports?${queryParams}`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setReports(data.data.reports);
        setPagination(data.data.pagination);
      } else {
        throw new Error('Failed to fetch reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async () => {
    try {
      setSubmitting(true);
      setError(null);

      if (!newReport.workSummary.trim()) {
        throw new Error('Work summary is required');
      }

      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const headers = {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      };
      const response = await fetch(`${API_BASE}/api/staff/1/reports`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(newReport)
      });

      if (response.ok) {
        const data = await response.json();
        
        // Reset form
        setNewReport({
          completedTasks: [],
          workSummary: '',
          issuesEncountered: '',
          recommendations: '',
          formsProcessed: 0
        });
        setShowNewReportForm(false);
        
        // Refresh reports list
        fetchReports();
        
        alert('Work report submitted successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTaskToggle = (task) => {
    setNewReport(prev => ({
      ...prev,
      completedTasks: prev.completedTasks.includes(task)
        ? prev.completedTasks.filter(t => t !== task)
        : [...prev.completedTasks, task]
    }));
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'verified': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'needs_revision': 'bg-orange-100 text-orange-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const commonTasks = [
    'Forms Review',
    'Form Correction',
    'Form Verification',
    'Stamp Calculation',
    'Data Entry',
    'Document Verification',
    'Quality Check',
    'Client Communication'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Work Reports</h1>
            <p className="text-gray-600">
              Submit and track your daily work reports and completed tasks
            </p>
          </div>
          <button
            onClick={() => setShowNewReportForm(!showNewReportForm)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Report</span>
          </button>
        </div>
      </div>

      {/* New Report Form */}
      {showNewReportForm && (
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Submit Work Report</h2>
            <p className="text-sm text-gray-600 mt-1">
              Fill out your daily work report with completed tasks and summary
            </p>
          </div>
          
          <div className="p-6">
            {/* Completed Tasks */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Completed Tasks
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {commonTasks.map((task) => (
                  <label key={task} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newReport.completedTasks.includes(task)}
                      onChange={() => handleTaskToggle(task)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{task}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Work Summary */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Summary *
              </label>
              <textarea
                value={newReport.workSummary}
                onChange={(e) => setNewReport(prev => ({ ...prev, workSummary: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Provide a detailed summary of your work today..."
              />
            </div>

            {/* Forms Processed */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Forms Processed
              </label>
              <input
                type="number"
                value={newReport.formsProcessed}
                onChange={(e) => setNewReport(prev => ({ ...prev, formsProcessed: parseInt(e.target.value) || 0 }))}
                className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                min="0"
              />
            </div>

            {/* Issues Encountered */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issues Encountered
              </label>
              <textarea
                value={newReport.issuesEncountered}
                onChange={(e) => setNewReport(prev => ({ ...prev, issuesEncountered: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe any issues or challenges faced today..."
              />
            </div>

            {/* Recommendations */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recommendations
              </label>
              <textarea
                value={newReport.recommendations}
                onChange={(e) => setNewReport(prev => ({ ...prev, recommendations: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any recommendations for process improvements..."
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-800 font-medium">Error</span>
                </div>
                <p className="text-red-600 mt-1">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleSubmitReport}
                disabled={submitting || !newReport.workSummary.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Submit Report</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setShowNewReportForm(false);
                  setError(null);
                  setNewReport({
                    completedTasks: [],
                    workSummary: '',
                    issuesEncountered: '',
                    recommendations: '',
                    formsProcessed: 0
                  });
                }}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="needs_revision">Needs Revision</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Per Page</label>
            <select
              value={filters.limit}
              onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchReports}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Your Work Reports ({pagination.total || 0})
          </h2>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-600 mb-4">You haven't submitted any work reports yet.</p>
            <button
              onClick={() => setShowNewReportForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit Your First Report
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {reports.map((report) => (
              <div key={report._id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        Work Report
                      </h3>
                      {getStatusBadge(report.verificationStatus)}
                    </div>
                    <p className="text-sm text-gray-600">
                      Submitted on {new Date(report.createdAt).toLocaleDateString()} at {new Date(report.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    {report.formId && (
                      <p className="text-sm text-gray-600">
                        Form: {report.formType}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Work Summary</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {report.remarks || 'No summary provided'}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Details</h4>
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      <pre className="whitespace-pre-wrap font-sans">
                        {report.verificationNotes || 'No additional details'}
                      </pre>
                    </div>
                  </div>
                </div>

                {report.reviewedBy && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Reviewed by: <span className="font-medium">{report.reviewedBy.name}</span>
                      </span>
                      <span className="text-gray-600">
                        {new Date(report.reviewedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {report.reviewNotes && (
                      <p className="text-sm text-gray-600 mt-2 bg-yellow-50 p-3 rounded-lg">
                        <strong>Review Notes:</strong> {report.reviewNotes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: pagination.page - 1 }))}
                  disabled={pagination.page <= 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm font-medium text-gray-700">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: pagination.page + 1 }))}
                  disabled={pagination.page >= pagination.pages}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
