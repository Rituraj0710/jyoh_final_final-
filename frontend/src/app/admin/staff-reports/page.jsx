"use client";
import React, { useState, useEffect } from "react";
import { adminFetch } from "@/lib/services/admin";

export default function StaffReportsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    totalReports: 0,
    submittedReports: 0,
    pendingReports: 0,
    verifiedReports: 0
  });
  const [filters, setFilters] = useState({
    staffId: '',
    formType: '',
    verificationStatus: '',
    isSubmitted: '',
    dateFrom: '',
    dateTo: ''
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalReports: 0,
    hasNext: false,
    hasPrev: false
  });

  useEffect(() => {
    fetchReports();
  }, [filters, pagination.currentPage]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      queryParams.append('page', pagination.currentPage);
      queryParams.append('limit', '20');

      const data = await adminFetch(`/api/staff-reports/admin/all?${queryParams.toString()}`);
      setReports(data.data.reports);
      setPagination(data.data.pagination);
      
      // Calculate stats
      const totalReports = data.data.pagination.totalReports;
      const submittedReports = data.data.reports.filter(report => report.isSubmitted).length;
      const pendingReports = data.data.reports.filter(report => report.verificationStatus === 'pending').length;
      const verifiedReports = data.data.reports.filter(report => report.verificationStatus === 'verified').length;
      
      setStats({
        totalReports,
        submittedReports,
        pendingReports,
        verifiedReports
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError(error.message || 'Failed to fetch staff reports');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowReportModal(true);
    setReviewNotes('');
  };

  const handleReviewReport = async (approved) => {
    if (!selectedReport) return;
    
    try {
      setReviewing(true);
      const response = await adminFetch(`/api/staff-reports/admin/${selectedReport._id}/review`, {
        method: 'PUT',
        body: JSON.stringify({
          approved,
          reviewNotes: reviewNotes.trim() || undefined
        })
      });

      if (response.status === 'success') {
        alert(`Report ${approved ? 'verified' : 'rejected'} successfully!`);
        setShowReportModal(false);
        setSelectedReport(null);
        setReviewNotes('');
        fetchReports(); // Refresh the list
      }
    } catch (error) {
      console.error('Error reviewing report:', error);
      alert('Error: ' + (error.message || 'Failed to review report'));
    } finally {
      setReviewing(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'verified': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'needs_revision': return 'bg-orange-100 text-orange-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFormTypeDisplayName = (formType) => {
    if (formType === 'work-report') {
      return 'Work Report';
    }
    if (formType === 'cross-verification-report') {
      return 'Cross-Verification Report';
    }
    if (formType === 'final-report') {
      return 'Final Report';
    }
    const formTypes = {
      'sale-deed': 'Sale Deed',
      'will-deed': 'Will Deed',
      'trust-deed': 'Trust Deed',
      'property-registration': 'Property Registration',
      'power-of-attorney': 'Power of Attorney',
      'adoption-deed': 'Adoption Deed'
    };
    return formTypes[formType] || formType;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Staff Reports
          </h1>
          <p className="mt-2 text-gray-600">
            View and manage staff verification reports
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalReports}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Submitted Reports</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.submittedReports}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Reports</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingReports}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Verified Reports</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.verifiedReports}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Form Type</label>
              <select
                value={filters.formType}
                onChange={(e) => handleFilterChange('formType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="sale-deed">Sale Deed</option>
                <option value="will-deed">Will Deed</option>
                <option value="trust-deed">Trust Deed</option>
                <option value="property-registration">Property Registration</option>
                <option value="power-of-attorney">Power of Attorney</option>
                <option value="adoption-deed">Adoption Deed</option>
                <option value="work-report">Work Report</option>
                <option value="cross-verification-report">Cross-Verification Report</option>
                <option value="final-report">Final Report</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.verificationStatus}
                onChange={(e) => handleFilterChange('verificationStatus', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="submitted">Submitted</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
                <option value="needs_revision">Needs Revision</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Submitted</label>
              <select
                value={filters.isSubmitted}
                onChange={(e) => handleFilterChange('isSubmitted', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="true">Submitted</option>
                <option value="false">Not Submitted</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({
                  staffId: '',
                  formType: '',
                  verificationStatus: '',
                  isSubmitted: '',
                  dateFrom: '',
                  dateTo: ''
                })}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Reports Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Staff Reports</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Form Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stamp Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {report.staffId?.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {report.staffId?.email || 'No email'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getFormTypeDisplayName(report.formType)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {report.formType === 'work-report' 
                          ? (report.remarks ? report.remarks.substring(0, 50) + '...' : 'Daily Work Report')
                          : report.formType === 'cross-verification-report'
                          ? (report.remarks ? report.remarks.substring(0, 50) + '...' : 'Cross-Verification Report')
                          : report.formType === 'final-report'
                          ? (report.remarks ? report.remarks.substring(0, 50) + '...' : 'Final Report')
                          : (report.formId?.formTitle || 'No title')
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.verificationStatus)}`}>
                        {report.verificationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{report.stampCalculation?.calculatedAmount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        report.isSubmitted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {report.isSubmitted ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewReport(report)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing page {pagination.currentPage} of {pagination.totalPages} 
                  ({pagination.totalReports} total reports)
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Report Details Modal */}
        {showReportModal && selectedReport && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Report Details
                  </h3>
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Staff Member</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedReport.staffId?.name} ({selectedReport.staffId?.email})
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Form Type</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {getFormTypeDisplayName(selectedReport.formType)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Verification Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedReport.verificationStatus)}`}>
                        {selectedReport.verificationStatus}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Submitted</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedReport.isSubmitted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedReport.isSubmitted ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>

                  {/* Stamp Calculation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stamp Calculation</label>
                    <div className="mt-1 bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-900">
                        <strong>Amount:</strong> ₹{selectedReport.stampCalculation?.calculatedAmount || 0}
                      </p>
                      <p className="text-sm text-gray-900">
                        <strong>Method:</strong> {selectedReport.stampCalculation?.calculationMethod || 'Not specified'}
                      </p>
                      <p className="text-sm text-gray-900">
                        <strong>Notes:</strong> {selectedReport.stampCalculation?.notes || 'No notes'}
                      </p>
                    </div>
                  </div>

                  {/* Verification Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Verification Notes</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-4 rounded-md">
                      {selectedReport.verificationNotes || 'No notes provided'}
                    </p>
                  </div>

                  {/* Remarks */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Remarks</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
                      {selectedReport.remarks || 'No remarks provided'}
                    </p>
                  </div>

                  {/* Work Report Details (for work-report type) */}
                  {selectedReport.formType === 'work-report' && selectedReport.verificationNotes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Work Report Details</label>
                      <pre className="mt-1 text-xs text-gray-900 bg-gray-50 p-4 rounded-md whitespace-pre-wrap font-sans max-h-60 overflow-y-auto">
                        {selectedReport.verificationNotes}
                      </pre>
                    </div>
                  )}

                  {/* Cross-Verification Report Details */}
                  {selectedReport.formType === 'cross-verification-report' && (
                    <div className="space-y-4">
                      {selectedReport.verificationNotes && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Cross-Verification Details</label>
                          <pre className="mt-1 text-xs text-gray-900 bg-gray-50 p-4 rounded-md whitespace-pre-wrap font-sans max-h-60 overflow-y-auto">
                            {selectedReport.verificationNotes}
                          </pre>
                        </div>
                      )}
                      {selectedReport.metadata && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Report Statistics</label>
                          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {selectedReport.metadata.formsCrossVerified && (
                              <div className="bg-purple-50 p-3 rounded-lg">
                                <div className="text-lg font-bold text-purple-600">
                                  {selectedReport.metadata.formsCrossVerified.length || 0}
                                </div>
                                <div className="text-xs text-gray-600">Forms Cross-Verified</div>
                              </div>
                            )}
                            {selectedReport.metadata.formsCorrected && (
                              <div className="bg-yellow-50 p-3 rounded-lg">
                                <div className="text-lg font-bold text-yellow-600">
                                  {selectedReport.metadata.formsCorrected.length || 0}
                                </div>
                                <div className="text-xs text-gray-600">Forms Corrected</div>
                              </div>
                            )}
                            {selectedReport.metadata.formsRejected && (
                              <div className="bg-red-50 p-3 rounded-lg">
                                <div className="text-lg font-bold text-red-600">
                                  {selectedReport.metadata.formsRejected.length || 0}
                                </div>
                                <div className="text-xs text-gray-600">Forms Rejected</div>
                              </div>
                            )}
                            {selectedReport.metadata.totalFormsProcessed !== undefined && (
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <div className="text-lg font-bold text-blue-600">
                                  {selectedReport.metadata.totalFormsProcessed || 0}
                                </div>
                                <div className="text-xs text-gray-600">Total Processed</div>
                              </div>
                            )}
                          </div>
                          {selectedReport.metadata.recommendations && (
                            <div className="mt-4">
                              <label className="block text-sm font-medium text-gray-700">Recommendations</label>
                              <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
                                {selectedReport.metadata.recommendations}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Final Report Details */}
                  {selectedReport.formType === 'final-report' && (
                    <div className="space-y-4">
                      {selectedReport.verificationNotes && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Final Report Details</label>
                          <pre className="mt-1 text-xs text-gray-900 bg-gray-50 p-4 rounded-md whitespace-pre-wrap font-sans max-h-60 overflow-y-auto">
                            {selectedReport.verificationNotes}
                          </pre>
                        </div>
                      )}
                      {selectedReport.metadata && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Report Statistics</label>
                          <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                            {selectedReport.metadata.formsApproved && (
                              <div className="bg-green-50 p-3 rounded-lg">
                                <div className="text-lg font-bold text-green-600">
                                  {selectedReport.metadata.formsApproved.length || 0}
                                </div>
                                <div className="text-xs text-gray-600">Forms Approved</div>
                              </div>
                            )}
                            {selectedReport.metadata.formsRejected && (
                              <div className="bg-red-50 p-3 rounded-lg">
                                <div className="text-lg font-bold text-red-600">
                                  {selectedReport.metadata.formsRejected.length || 0}
                                </div>
                                <div className="text-xs text-gray-600">Forms Rejected</div>
                              </div>
                            )}
                            {selectedReport.metadata.totalFormsProcessed !== undefined && (
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <div className="text-lg font-bold text-blue-600">
                                  {selectedReport.metadata.totalFormsProcessed || 0}
                                </div>
                                <div className="text-xs text-gray-600">Total Processed</div>
                              </div>
                            )}
                          </div>
                          {selectedReport.metadata.recommendations && (
                            <div className="mt-4">
                              <label className="block text-sm font-medium text-gray-700">Recommendations</label>
                              <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
                                {selectedReport.metadata.recommendations}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Review Section (only if pending/submitted and admin) */}
                  {(selectedReport.verificationStatus === 'pending' || selectedReport.verificationStatus === 'submitted') && (
                    <div className="border-t pt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Review Notes (Optional)
                      </label>
                      <textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Add review notes..."
                      />
                      <div className="flex space-x-3 mt-4">
                        <button
                          onClick={() => handleReviewReport(true)}
                          disabled={reviewing}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                          {reviewing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Verify Report</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleReviewReport(false)}
                          disabled={reviewing}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                          {reviewing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              <span>Reject Report</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Review Info (if already reviewed) */}
                  {selectedReport.reviewedBy && (
                    <div className="border-t pt-4">
                      <div className="bg-blue-50 p-4 rounded-md">
                        <p className="text-sm text-gray-700">
                          <strong>Reviewed by:</strong> {selectedReport.reviewedBy?.name || 'Admin'} on {new Date(selectedReport.reviewedAt).toLocaleString()}
                        </p>
                        {selectedReport.reviewNotes && (
                          <p className="text-sm text-gray-700 mt-2">
                            <strong>Review Notes:</strong> {selectedReport.reviewNotes}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Changes Made */}
                  {selectedReport.changes && selectedReport.changes.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Changes Made</label>
                      <div className="mt-1 bg-gray-50 p-4 rounded-md">
                        {selectedReport.changes.map((change, index) => (
                          <div key={index} className="mb-2 p-2 bg-white rounded border">
                            <p className="text-sm font-medium text-gray-900">{change.field}</p>
                            <p className="text-xs text-gray-600">
                              <strong>Old:</strong> {JSON.stringify(change.oldValue)} → 
                              <strong> New:</strong> {JSON.stringify(change.newValue)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {change.changeType} at {new Date(change.timestamp).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-6">
                  {selectedReport.verificationStatus !== 'pending' && (
                    <button
                      onClick={() => setShowReportModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

