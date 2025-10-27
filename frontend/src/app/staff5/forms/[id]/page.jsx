"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Staff5FormDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getAuthHeaders } = useAuth();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [finalApprovalLoading, setFinalApprovalLoading] = useState(false);
  const [finalRemarks, setFinalRemarks] = useState('');
  const [finalDecision, setFinalDecision] = useState('approved'); // 'approved' or 'rejected'
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'staff1', 'staff2', 'staff3', 'staff4', 'history'
  const [showLockConfirmation, setShowLockConfirmation] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchFormDetails();
    }
  }, [params.id]);

  const fetchFormDetails = async () => {
    try {
      setLoading(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(`${API_BASE}/api/staff/5/forms/${params.id}`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setForm(data.data.form);
      } else {
        throw new Error('Failed to fetch form details');
      }
    } catch (error) {
      console.error('Error fetching form details:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalApproval = async () => {
    try {
      setFinalApprovalLoading(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(`${API_BASE}/api/staff/5/forms/${params.id}/final-approval`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          decision: finalDecision,
          finalRemarks,
          lockForm: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || 'Final approval completed successfully');
        router.push('/staff5/forms');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Final approval failed');
      }
    } catch (error) {
      console.error('Error during final approval:', error);
      alert(error.message || 'Final approval failed');
    } finally {
      setFinalApprovalLoading(false);
      setShowLockConfirmation(false);
    }
  };

  const getStaffVerificationStatus = (staffLevel) => {
    const approval = form?.approvals?.[staffLevel];
    if (!approval) return { status: 'pending', color: 'gray' };
    
    if (approval.approved || approval.locked) {
      return { status: 'verified', color: 'green' };
    } else if (approval.status === 'needs_correction') {
      return { status: 'needs_correction', color: 'red' };
    } else {
      return { status: 'pending', color: 'yellow' };
    }
  };

  const isFormLocked = form?.approvals?.staff5?.locked;
  const isReadyForFinalApproval = form?.approvals?.staff1?.approved && 
                                 form?.approvals?.staff2?.approved && 
                                 form?.approvals?.staff3?.approved && 
                                 form?.approvals?.staff4?.approved;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading form details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <h2 className="text-lg font-semibold mb-2">Error</h2>
            <p>{error}</p>
            <Link href="/staff5/forms" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
              ← Back to Forms
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Form not found</h2>
          <Link href="/staff5/forms" className="text-blue-600 hover:text-blue-800">
            ← Back to Forms
          </Link>
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
              <h1 className="text-2xl font-bold text-gray-900">Final Review & Approval</h1>
              <p className="text-gray-600">Form ID: {form._id}</p>
              {isFormLocked && (
                <div className="mt-2">
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800">
                    🔒 LOCKED BY STAFF5
                  </span>
                </div>
              )}
            </div>
            <Link
              href="/staff5/forms"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Back to Forms
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Form Details */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">
                    {form.formType?.replace(/_/g, ' ').toUpperCase() || 'FORM'} Details
                  </h2>
                  {isFormLocked && (
                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800">
                      READ ONLY
                    </span>
                  )}
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="px-6 py-4 border-b border-gray-200">
                <nav className="flex space-x-8 overflow-x-auto">
                  {[
                    { id: 'overview', label: 'Overview', icon: '📋' },
                    { id: 'staff1', label: 'Staff1 Work', icon: '📝' },
                    { id: 'staff2', label: 'Staff2 Work', icon: '👥' },
                    { id: 'staff3', label: 'Staff3 Work', icon: '🏞️' },
                    { id: 'staff4', label: 'Staff4 Work', icon: '🔍' },
                    { id: 'history', label: 'History', icon: '📊' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'bg-red-100 text-red-700'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="px-6 py-4">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Form Information</h3>
                        <div className="space-y-3">
                          <div>
                            <span className="font-medium text-gray-700">Form Type:</span>
                            <span className="ml-2 text-gray-900">{form.formType?.replace(/_/g, ' ').toUpperCase()}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Status:</span>
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                              form.status === 'locked_by_staff5' ? 'bg-red-100 text-red-800' :
                              form.status === 'approved' ? 'bg-green-100 text-green-800' :
                              form.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {form.status?.replace(/_/g, ' ').toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Created:</span>
                            <span className="ml-2 text-gray-900">{new Date(form.createdAt).toLocaleString()}</span>
                          </div>
                          {form.userId && (
                            <div>
                              <span className="font-medium text-gray-700">Submitted by:</span>
                              <span className="ml-2 text-gray-900">{form.userId.name || form.userId.email}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Verification Status</h3>
                        <div className="space-y-2">
                          {['staff1', 'staff2', 'staff3', 'staff4', 'staff5'].map(staff => {
                            const status = getStaffVerificationStatus(staff);
                            return (
                              <div key={staff} className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">{staff.toUpperCase()}</span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  status.color === 'green' ? 'bg-green-100 text-green-800' :
                                  status.color === 'red' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {status.status.toUpperCase()}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Form Data Summary */}
                    {form.data && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Form Data Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {form.data.applicantName && (
                            <div>
                              <span className="font-medium text-gray-700">Applicant:</span>
                              <span className="ml-2 text-gray-900">{form.data.applicantName}</span>
                            </div>
                          )}
                          {form.data.trusteeName && (
                            <div>
                              <span className="font-medium text-gray-700">Trustee:</span>
                              <span className="ml-2 text-gray-900">{form.data.trusteeName}</span>
                            </div>
                          )}
                          {form.data.landOwner && (
                            <div>
                              <span className="font-medium text-gray-700">Land Owner:</span>
                              <span className="ml-2 text-gray-900">{form.data.landOwner}</span>
                            </div>
                          )}
                          {form.data.plotNumber && (
                            <div>
                              <span className="font-medium text-gray-700">Plot Number:</span>
                              <span className="ml-2 text-gray-900">{form.data.plotNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Staff Work Tabs */}
                {['staff1', 'staff2', 'staff3', 'staff4'].includes(activeTab) && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {activeTab.toUpperCase()} Verification Details
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-700">Status</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            getStaffVerificationStatus(activeTab).color === 'green' ? 'bg-green-100 text-green-800' :
                            getStaffVerificationStatus(activeTab).color === 'red' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {getStaffVerificationStatus(activeTab).status.toUpperCase()}
                          </span>
                        </div>
                        
                        {form.approvals?.[activeTab]?.verifiedAt && (
                          <div className="text-sm text-gray-600">
                            Verified: {new Date(form.approvals[activeTab].verifiedAt).toLocaleString()}
                          </div>
                        )}
                        
                        {form.approvals?.[activeTab]?.notes && (
                          <div className="mt-2">
                            <span className="font-medium text-gray-700">Notes:</span>
                            <p className="text-sm text-gray-600 mt-1">{form.approvals[activeTab].notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Verification History</h3>
                    {form.verificationHistory && form.verificationHistory.length > 0 ? (
                      <div className="space-y-3">
                        {form.verificationHistory.map((entry, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-medium text-gray-700">{entry.staffLevel.toUpperCase()}</span>
                                <span className="ml-2 text-gray-600">- {entry.action}</span>
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(entry.timestamp).toLocaleString()}
                              </span>
                            </div>
                            {entry.notes && (
                              <p className="text-sm text-gray-600 mt-2">{entry.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No verification history available</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Final Authority Actions</h3>
              </div>
              
              <div className="px-6 py-4 space-y-4">
                {/* Form Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    form.status === 'locked_by_staff5' ? 'bg-red-100 text-red-800' :
                    form.status === 'approved' ? 'bg-green-100 text-green-800' :
                    form.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {form.status?.replace(/_/g, ' ').toUpperCase() || 'PENDING'}
                  </span>
                </div>

                {/* Verification Readiness */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Verification Status</label>
                  <div className="space-y-1">
                    {isReadyForFinalApproval ? (
                      <span className="text-sm text-green-600">✅ Ready for Final Approval</span>
                    ) : (
                      <span className="text-sm text-yellow-600">⏳ Waiting for Staff1-4 completion</span>
                    )}
                  </div>
                </div>

                {/* Final Decision */}
                {!isFormLocked && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Final Decision</label>
                    <select
                      value={finalDecision}
                      onChange={(e) => setFinalDecision(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="approved">Approve</option>
                      <option value="rejected">Reject</option>
                    </select>
                  </div>
                )}

                {/* Final Remarks */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Final Remarks
                  </label>
                  <textarea
                    value={finalRemarks}
                    onChange={(e) => setFinalRemarks(e.target.value)}
                    rows={4}
                    placeholder="Add your final remarks and decision rationale..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    disabled={isFormLocked}
                  />
                </div>

                {/* Action Buttons */}
                {isFormLocked ? (
                  <div className="space-y-2">
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-700 font-medium">Form is locked</p>
                      <p className="text-xs text-red-600">No further changes allowed</p>
                    </div>
                    {form.approvals?.staff5?.lockedAt && (
                      <div className="text-xs text-gray-500">
                        Locked: {new Date(form.approvals.staff5.lockedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {isReadyForFinalApproval ? (
                      <button
                        onClick={() => setShowLockConfirmation(true)}
                        disabled={finalApprovalLoading}
                        className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {finalApprovalLoading ? 'Processing...' : '🔒 Final Lock & Approve'}
                      </button>
                    ) : (
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-yellow-700">Form not ready for final approval</p>
                        <p className="text-xs text-yellow-600">All previous staff levels must be complete</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Lock Confirmation Modal */}
        {showLockConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Final Lock</h3>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to lock this form? Once locked, no further changes will be possible.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowLockConfirmation(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFinalApproval}
                  disabled={finalApprovalLoading}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {finalApprovalLoading ? 'Locking...' : 'Lock & Approve'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
