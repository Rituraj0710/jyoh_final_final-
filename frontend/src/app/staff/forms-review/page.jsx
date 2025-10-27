"use client";
import React, { useState, useEffect } from "react";
import { adminFetch } from "@/lib/services/admin";

export default function FormsReviewPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [forms, setForms] = useState([]);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    assignedForms: 0,
    completedForms: 0,
    pendingForms: 0,
    submittedReports: 0
  });
  const [selectedForm, setSelectedForm] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState({
    verificationStatus: 'pending',
    remarks: '',
    stampCalculation: {
      calculatedAmount: 0,
      calculationMethod: '',
      applicableRules: [],
      notes: ''
    },
    verificationNotes: ''
  });
  const [editingForm, setEditingForm] = useState(null);
  const [formChanges, setFormChanges] = useState({});

  useEffect(() => {
    fetchUserInfo();
    fetchAssignedForms();
    fetchStaffReports();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const data = await adminFetch('/api/staff/staff-profile');
      setUserInfo(data.user);
    } catch (error) {
      console.error('Error fetching user info:', error);
      setError(error.message || 'Failed to fetch user information');
    }
  };

  const fetchAssignedForms = async () => {
    try {
      const data = await adminFetch('/api/staff-reports/assigned-forms?limit=50');
      setForms(data.data.forms);
      
      // Calculate stats
      const assignedForms = data.data.forms.length;
      const completedForms = data.data.forms.filter(form => form.status === 'verified').length;
      const pendingForms = data.data.forms.filter(form => form.status === 'submitted').length;
      
      setStats(prev => ({
        ...prev,
        assignedForms,
        completedForms,
        pendingForms
      }));
    } catch (error) {
      console.error('Error fetching assigned forms:', error);
      setError(error.message || 'Failed to fetch assigned forms');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffReports = async () => {
    try {
      const data = await adminFetch('/api/staff-reports/staff?limit=50');
      setReports(data.data.reports);
      
      const submittedReports = data.data.reports.filter(report => report.isSubmitted).length;
      setStats(prev => ({
        ...prev,
        submittedReports
      }));
    } catch (error) {
      console.error('Error fetching staff reports:', error);
    }
  };

  const handleViewForm = (form) => {
    setSelectedForm(form);
    setEditingForm({ ...form.fields });
    setFormChanges({});
    setShowFormModal(true);
  };

  const handleEditForm = (field, value) => {
    setEditingForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Track changes
    const originalValue = selectedForm.fields[field];
    if (originalValue !== value) {
      setFormChanges(prev => ({
        ...prev,
        [field]: { oldValue: originalValue, newValue: value }
      }));
    } else {
      setFormChanges(prev => {
        const newChanges = { ...prev };
        delete newChanges[field];
        return newChanges;
      });
    }
  };

  const handleCreateReport = () => {
    setReportData({
      verificationStatus: 'pending',
      remarks: '',
      stampCalculation: {
        calculatedAmount: 0,
        calculationMethod: '',
        applicableRules: [],
        notes: ''
      },
      verificationNotes: ''
    });
    setShowReportModal(true);
  };

  const handleSubmitReport = async () => {
    try {
      const reportPayload = {
        formId: selectedForm._id,
        verificationStatus: reportData.verificationStatus,
        editedData: editingForm,
        remarks: reportData.remarks,
        stampCalculation: reportData.stampCalculation,
        verificationNotes: reportData.verificationNotes
      };

      await adminFetch('/api/staff-reports/create', {
        method: 'POST',
        body: JSON.stringify(reportPayload)
      });

      setShowFormModal(false);
      setShowReportModal(false);
      fetchAssignedForms();
      fetchStaffReports();
      alert('Report created successfully!');
    } catch (error) {
      console.error('Error creating report:', error);
      setError(error.message || 'Failed to create report');
    }
  };

  const handleSubmitFinalReport = async (reportId) => {
    try {
      await adminFetch(`/api/staff-reports/${reportId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ finalRemarks: 'Report submitted for review' })
      });

      fetchStaffReports();
      alert('Report submitted successfully!');
    } catch (error) {
      console.error('Error submitting report:', error);
      setError(error.message || 'Failed to submit report');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'verified': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerificationStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'verified': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'needs_revision': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
            Forms Review & Stamp Calculation
          </h1>
          <p className="mt-2 text-gray-600">
            Review, edit, and verify forms submitted by users
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
                <p className="text-sm font-medium text-gray-600">Assigned Forms</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.assignedForms}</p>
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
                <p className="text-sm font-medium text-gray-600">Completed Forms</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.completedForms}</p>
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
                <p className="text-sm font-medium text-gray-600">Pending Forms</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingForms}</p>
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
                <p className="text-sm font-medium text-gray-600">Submitted Reports</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.submittedReports}</p>
              </div>
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

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button className="py-2 px-1 border-b-2 border-blue-500 font-medium text-sm text-blue-600">
                Assigned Forms
              </button>
              <button className="py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700">
                My Reports
              </button>
            </nav>
          </div>
        </div>

        {/* Assigned Forms Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Assigned Forms</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Form Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
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
                {forms.map((form) => (
                  <tr key={form._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {form.formTitle || form.serviceType}
                      </div>
                      <div className="text-sm text-gray-500">
                        {form.serviceType}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {form.userId?.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {form.userId?.email || 'No email'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(form.status)}`}>
                        {form.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(form.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewForm(form)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View & Edit
                      </button>
                      <button
                        onClick={() => handleCreateReport()}
                        className="text-green-600 hover:text-green-900"
                      >
                        Create Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form Modal */}
        {showFormModal && selectedForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Review Form: {selectedForm.formTitle || selectedForm.serviceType}
                  </h3>
                  <button
                    onClick={() => setShowFormModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {Object.entries(editingForm).map(([key, value]) => (
                    <div key={key} className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </label>
                      <input
                        type="text"
                        value={value || ''}
                        onChange={(e) => handleEditForm(key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {formChanges[key] && (
                        <div className="mt-1 text-xs text-orange-600">
                          Changed from: {formChanges[key].oldValue} to: {formChanges[key].newValue}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowFormModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowFormModal(false);
                      setShowReportModal(true);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Continue to Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Create Verification Report
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

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Verification Status
                    </label>
                    <select
                      value={reportData.verificationStatus}
                      onChange={(e) => setReportData(prev => ({ ...prev, verificationStatus: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="verified">Verified</option>
                      <option value="rejected">Rejected</option>
                      <option value="needs_revision">Needs Revision</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stamp Calculation Amount
                    </label>
                    <input
                      type="number"
                      value={reportData.stampCalculation.calculatedAmount}
                      onChange={(e) => setReportData(prev => ({
                        ...prev,
                        stampCalculation: {
                          ...prev.stampCalculation,
                          calculatedAmount: parseFloat(e.target.value) || 0
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter calculated stamp duty amount"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Calculation Method
                    </label>
                    <input
                      type="text"
                      value={reportData.stampCalculation.calculationMethod}
                      onChange={(e) => setReportData(prev => ({
                        ...prev,
                        stampCalculation: {
                          ...prev.stampCalculation,
                          calculationMethod: e.target.value
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe the calculation method used"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Verification Notes
                    </label>
                    <textarea
                      value={reportData.verificationNotes}
                      onChange={(e) => setReportData(prev => ({ ...prev, verificationNotes: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter detailed verification notes"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Remarks
                    </label>
                    <textarea
                      value={reportData.remarks}
                      onChange={(e) => setReportData(prev => ({ ...prev, remarks: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter any additional remarks"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitReport}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                  >
                    Create Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

