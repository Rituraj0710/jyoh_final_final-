"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function Staff4ReportsPage() {
  const [report, setReport] = useState({
    date: new Date().toISOString().split('T')[0],
    formsCrossVerified: [],
    formsCorrected: [],
    formsRejected: [],
    totalFormsProcessed: 0,
    correctionsMade: [],
    verificationNotes: '',
    qualityScore: 0,
    recommendations: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const { getAuthHeaders, user } = useAuth();

  useEffect(() => {
    fetchTodayWorkData();
  }, []);

  const fetchTodayWorkData = async () => {
    try {
      setLoading(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      
      // Fetch today's work data
      const response = await fetch(`${API_BASE}/api/staff/4/work-data?date=${report.date}`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setReport(prev => ({
          ...prev,
          formsCrossVerified: data.data.formsCrossVerified || [],
          formsCorrected: data.data.formsCorrected || [],
          formsRejected: data.data.formsRejected || [],
          totalFormsProcessed: data.data.totalFormsProcessed || 0,
          correctionsMade: data.data.correctionsMade || []
        }));
      }
    } catch (error) {
      console.error('Error fetching work data:', error);
      setError('Failed to fetch work data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setReport(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFormToggle = (formId, type) => {
    if (type === 'cross_verified') {
      setReport(prev => ({
        ...prev,
        formsCrossVerified: prev.formsCrossVerified.includes(formId)
          ? prev.formsCrossVerified.filter(id => id !== formId)
          : [...prev.formsCrossVerified, formId]
      }));
    } else if (type === 'corrected') {
      setReport(prev => ({
        ...prev,
        formsCorrected: prev.formsCorrected.includes(formId)
          ? prev.formsCorrected.filter(id => id !== formId)
          : [...prev.formsCorrected, formId]
      }));
    } else if (type === 'rejected') {
      setReport(prev => ({
        ...prev,
        formsRejected: prev.formsRejected.includes(formId)
          ? prev.formsRejected.filter(id => id !== formId)
          : [...prev.formsRejected, formId]
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (report.formsCrossVerified.length === 0 && report.formsCorrected.length === 0 && report.formsRejected.length === 0) {
      alert('Please select at least one form that was processed today.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(`${API_BASE}/api/staff/4/cross-verification-report`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(report)
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(true);
        setReport({
          date: new Date().toISOString().split('T')[0],
          formsCrossVerified: [],
          formsCorrected: [],
          formsRejected: [],
          totalFormsProcessed: 0,
          correctionsMade: [],
          verificationNotes: '',
          qualityScore: 0,
          recommendations: ''
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit cross-verification report');
      }
    } catch (error) {
      console.error('Error submitting cross-verification report:', error);
      setError(error.message || 'Failed to submit cross-verification report');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading work data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Cross-Verification Report</h1>
          <p className="text-gray-600">Submit your daily cross-verification report</p>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-green-400">✓</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">Cross-verification report submitted successfully!</p>
              </div>
            </div>
          </div>
        )}

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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Report Date */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Report Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Date
                </label>
                <input
                  type="date"
                  value={report.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Staff Member
                </label>
                <input
                  type="text"
                  value={user?.name || 'Staff4 User'}
                  disabled
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Work Statistics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Cross-Verification Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{report.formsCrossVerified.length}</div>
                <div className="text-sm text-gray-600">Forms Cross-Verified</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{report.formsCorrected.length}</div>
                <div className="text-sm text-gray-600">Forms Corrected</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{report.formsRejected.length}</div>
                <div className="text-sm text-gray-600">Forms Rejected</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{report.totalFormsProcessed}</div>
                <div className="text-sm text-gray-600">Total Processed</div>
              </div>
            </div>
          </div>

          {/* Forms Processed */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Forms Processed Today</h2>
            
            {/* Cross-Verified Forms */}
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-700 mb-3">Cross-Verified Forms</h3>
              <div className="space-y-2">
                {report.formsCrossVerified.length > 0 ? (
                  report.formsCrossVerified.map((formId, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm text-gray-900">Form ID: {formId}</span>
                      <button
                        type="button"
                        onClick={() => handleFormToggle(formId, 'cross_verified')}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">No forms marked as cross-verified</p>
                )}
              </div>
            </div>

            {/* Corrected Forms */}
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-700 mb-3">Corrected Forms</h3>
              <div className="space-y-2">
                {report.formsCorrected.length > 0 ? (
                  report.formsCorrected.map((formId, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <span className="text-sm text-gray-900">Form ID: {formId}</span>
                      <button
                        type="button"
                        onClick={() => handleFormToggle(formId, 'corrected')}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">No forms marked as corrected</p>
                )}
              </div>
            </div>

            {/* Rejected Forms */}
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-700 mb-3">Rejected Forms</h3>
              <div className="space-y-2">
                {report.formsRejected.length > 0 ? (
                  report.formsRejected.map((formId, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <span className="text-sm text-gray-900">Form ID: {formId}</span>
                      <button
                        type="button"
                        onClick={() => handleFormToggle(formId, 'rejected')}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">No forms marked as rejected</p>
                )}
              </div>
            </div>
          </div>

          {/* Quality Assessment */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quality Assessment</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quality Score (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={report.qualityScore}
                  onChange={(e) => handleInputChange('qualityScore', parseInt(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Notes
                </label>
                <textarea
                  value={report.verificationNotes}
                  onChange={(e) => handleInputChange('verificationNotes', e.target.value)}
                  rows={4}
                  placeholder="Describe your cross-verification findings and any corrections made..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recommendations
                </label>
                <textarea
                  value={report.recommendations}
                  onChange={(e) => handleInputChange('recommendations', e.target.value)}
                  rows={3}
                  placeholder="Any recommendations for improving the verification process..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || (report.formsCrossVerified.length === 0 && report.formsCorrected.length === 0 && report.formsRejected.length === 0)}
              className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Cross-Verification Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
