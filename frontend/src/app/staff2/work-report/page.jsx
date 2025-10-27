"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function Staff2WorkReportPage() {
  const [report, setReport] = useState({
    date: new Date().toISOString().split('T')[0],
    verifiedForms: [],
    correctedForms: [],
    trusteeVerifications: 0,
    amountVerifications: 0,
    totalFormsProcessed: 0,
    workNotes: '',
    challenges: '',
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
      const response = await fetch(`${API_BASE}/api/staff/2/work-data?date=${report.date}`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setReport(prev => ({
          ...prev,
          verifiedForms: data.data.verifiedForms || [],
          correctedForms: data.data.correctedForms || [],
          trusteeVerifications: data.data.trusteeVerifications || 0,
          amountVerifications: data.data.amountVerifications || 0,
          totalFormsProcessed: data.data.totalFormsProcessed || 0
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
    if (type === 'verified') {
      setReport(prev => ({
        ...prev,
        verifiedForms: prev.verifiedForms.includes(formId)
          ? prev.verifiedForms.filter(id => id !== formId)
          : [...prev.verifiedForms, formId]
      }));
    } else {
      setReport(prev => ({
        ...prev,
        correctedForms: prev.correctedForms.includes(formId)
          ? prev.correctedForms.filter(id => id !== formId)
          : [...prev.correctedForms, formId]
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (report.verifiedForms.length === 0 && report.correctedForms.length === 0) {
      alert('Please select at least one form that was processed today.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(`${API_BASE}/api/staff/2/work-report`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(report)
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(true);
        setReport({
          date: new Date().toISOString().split('T')[0],
          verifiedForms: [],
          correctedForms: [],
          trusteeVerifications: 0,
          amountVerifications: 0,
          totalFormsProcessed: 0,
          workNotes: '',
          challenges: '',
          recommendations: ''
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit work report');
      }
    } catch (error) {
      console.error('Error submitting work report:', error);
      setError(error.message || 'Failed to submit work report');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">Staff2 Work Report</h1>
          <p className="text-gray-600">Submit your daily work report for trustee verification and amount verification</p>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-green-400">✓</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">Work report submitted successfully!</p>
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
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Staff Member
                </label>
                <input
                  type="text"
                  value={user?.name || 'Staff2 User'}
                  disabled
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Work Statistics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Work Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{report.trusteeVerifications}</div>
                <div className="text-sm text-gray-600">Trustee Verifications</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{report.amountVerifications}</div>
                <div className="text-sm text-gray-600">Amount Verifications</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{report.verifiedForms.length}</div>
                <div className="text-sm text-gray-600">Forms Verified</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{report.correctedForms.length}</div>
                <div className="text-sm text-gray-600">Forms Corrected</div>
              </div>
            </div>
          </div>

          {/* Forms Processed */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Forms Processed Today</h2>
            
            {/* Verified Forms */}
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-700 mb-3">Verified Forms</h3>
              <div className="space-y-2">
                {report.verifiedForms.length > 0 ? (
                  report.verifiedForms.map((formId, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm text-gray-900">Form ID: {formId}</span>
                      <button
                        type="button"
                        onClick={() => handleFormToggle(formId, 'verified')}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">No forms marked as verified</p>
                )}
              </div>
            </div>

            {/* Corrected Forms */}
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-700 mb-3">Corrected Forms</h3>
              <div className="space-y-2">
                {report.correctedForms.length > 0 ? (
                  report.correctedForms.map((formId, index) => (
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
          </div>

          {/* Work Notes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Work Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Notes
                </label>
                <textarea
                  value={report.workNotes}
                  onChange={(e) => handleInputChange('workNotes', e.target.value)}
                  rows={4}
                  placeholder="Describe the work performed today..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Challenges Faced
                </label>
                <textarea
                  value={report.challenges}
                  onChange={(e) => handleInputChange('challenges', e.target.value)}
                  rows={3}
                  placeholder="Any challenges or issues encountered..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  placeholder="Any recommendations for process improvement..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || report.verifiedForms.length === 0 && report.correctedForms.length === 0}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Work Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
