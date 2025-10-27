"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Staff4FormDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getAuthHeaders } = useAuth();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [editableFields, setEditableFields] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('primary'); // 'primary', 'trustee', 'land', 'all'

  useEffect(() => {
    if (params.id) {
      fetchFormDetails();
    }
  }, [params.id]);

  const fetchFormDetails = async () => {
    try {
      setLoading(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(`${API_BASE}/api/staff/4/forms/${params.id}`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setForm(data.data.form);
        // Initialize editable fields with current form data
        setEditableFields(data.data.form.data || {});
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

  const handleFieldChange = (field, value) => {
    setEditableFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCrossVerification = async (approved) => {
    try {
      setVerificationLoading(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(`${API_BASE}/api/staff/4/forms/${params.id}/cross-verify`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          approved,
          verificationNotes,
          updatedFields: isEditing ? editableFields : null,
          corrections: isEditing ? getCorrectionsSummary() : null
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || 'Cross-verification completed successfully');
        router.push('/staff4/forms');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Cross-verification failed');
      }
    } catch (error) {
      console.error('Error during cross-verification:', error);
      alert(error.message || 'Cross-verification failed');
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setVerificationLoading(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(`${API_BASE}/api/staff/4/forms/${params.id}/update`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          updatedFields: editableFields,
          updateNotes: verificationNotes,
          corrections: getCorrectionsSummary()
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || 'Changes saved successfully');
        setIsEditing(false);
        fetchFormDetails(); // Refresh form data
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save changes');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      alert(error.message || 'Failed to save changes');
    } finally {
      setVerificationLoading(false);
    }
  };

  const getCorrectionsSummary = () => {
    const corrections = [];
    const originalData = form?.data || {};
    
    Object.keys(editableFields).forEach(key => {
      if (editableFields[key] !== originalData[key]) {
        corrections.push({
          field: key,
          originalValue: originalData[key],
          correctedValue: editableFields[key],
          correctedBy: 'staff4'
        });
      }
    });
    
    return corrections;
  };

  const getStaffVerificationStatus = (staffLevel) => {
    const approval = form?.approvals?.[staffLevel];
    if (!approval) return { status: 'pending', color: 'gray' };
    
    if (approval.approved) {
      return { status: 'verified', color: 'green' };
    } else if (approval.status === 'needs_correction') {
      return { status: 'needs_correction', color: 'red' };
    } else {
      return { status: 'pending', color: 'yellow' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
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
            <Link href="/staff4/forms" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
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
          <Link href="/staff4/forms" className="text-blue-600 hover:text-blue-800">
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
              <h1 className="text-2xl font-bold text-gray-900">Cross-Verification</h1>
              <p className="text-gray-600">Form ID: {form._id}</p>
            </div>
            <Link
              href="/staff4/forms"
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
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className={`px-3 py-1 text-sm font-medium rounded-md ${
                        isEditing 
                          ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      {isEditing ? 'Cancel Edit' : 'Edit Fields'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="px-6 py-4 border-b border-gray-200">
                <nav className="flex space-x-8">
                  {[
                    { id: 'primary', label: 'Primary Details (Staff1)', icon: '📝' },
                    { id: 'trustee', label: 'Trustee Details (Staff2)', icon: '👥' },
                    { id: 'land', label: 'Land Details (Staff3)', icon: '🏞️' },
                    { id: 'all', label: 'All Sections', icon: '🔍' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        activeTab === tab.id
                          ? 'bg-purple-100 text-purple-700'
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
                {/* Primary Details Section (Staff1) */}
                {(activeTab === 'primary' || activeTab === 'all') && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">📝</span>
                      Primary Details (Staff1 Verification)
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        getStaffVerificationStatus('staff1').color === 'green' ? 'bg-green-100 text-green-800' :
                        getStaffVerificationStatus('staff1').color === 'red' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {getStaffVerificationStatus('staff1').status.toUpperCase()}
                      </span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Applicant Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editableFields.applicantName || ''}
                            onChange={(e) => handleFieldChange('applicantName', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{form.data?.applicantName || 'Not provided'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Applicant Email
                        </label>
                        {isEditing ? (
                          <input
                            type="email"
                            value={editableFields.applicantEmail || ''}
                            onChange={(e) => handleFieldChange('applicantEmail', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{form.data?.applicantEmail || 'Not provided'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={editableFields.phoneNumber || ''}
                            onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{form.data?.phoneNumber || 'Not provided'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Service Type
                        </label>
                        {isEditing ? (
                          <select
                            value={editableFields.serviceType || ''}
                            onChange={(e) => handleFieldChange('serviceType', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="">Select Service Type</option>
                            <option value="property_registration">Property Registration</option>
                            <option value="property_sale">Property Sale</option>
                            <option value="property_transfer">Property Transfer</option>
                            <option value="will_deed">Will Deed</option>
                            <option value="trust_deed">Trust Deed</option>
                          </select>
                        ) : (
                          <p className="text-sm text-gray-900">{form.data?.serviceType || 'Not provided'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Trustee Details Section (Staff2) */}
                {(activeTab === 'trustee' || activeTab === 'all') && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">👥</span>
                      Trustee Details (Staff2 Verification)
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        getStaffVerificationStatus('staff2').color === 'green' ? 'bg-green-100 text-green-800' :
                        getStaffVerificationStatus('staff2').color === 'red' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {getStaffVerificationStatus('staff2').status.toUpperCase()}
                      </span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Trustee Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editableFields.trusteeName || ''}
                            onChange={(e) => handleFieldChange('trusteeName', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{form.data?.trusteeName || 'Not provided'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Trustee Address
                        </label>
                        {isEditing ? (
                          <textarea
                            value={editableFields.trusteeAddress || ''}
                            onChange={(e) => handleFieldChange('trusteeAddress', e.target.value)}
                            rows={3}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{form.data?.trusteeAddress || 'Not provided'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Trustee Phone
                        </label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={editableFields.trusteePhone || ''}
                            onChange={(e) => handleFieldChange('trusteePhone', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{form.data?.trusteePhone || 'Not provided'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Trustee ID Number
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editableFields.trusteeIdNumber || ''}
                            onChange={(e) => handleFieldChange('trusteeIdNumber', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{form.data?.trusteeIdNumber || 'Not provided'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Land Details Section (Staff3) */}
                {(activeTab === 'land' || activeTab === 'all') && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">🏞️</span>
                      Land Details (Staff3 Verification)
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        getStaffVerificationStatus('staff3').color === 'green' ? 'bg-green-100 text-green-800' :
                        getStaffVerificationStatus('staff3').color === 'red' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {getStaffVerificationStatus('staff3').status.toUpperCase()}
                      </span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Land Owner
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editableFields.landOwner || ''}
                            onChange={(e) => handleFieldChange('landOwner', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{form.data?.landOwner || 'Not provided'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Plot Number
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editableFields.plotNumber || ''}
                            onChange={(e) => handleFieldChange('plotNumber', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{form.data?.plotNumber || 'Not provided'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Land Location
                        </label>
                        {isEditing ? (
                          <textarea
                            value={editableFields.landLocation || ''}
                            onChange={(e) => handleFieldChange('landLocation', e.target.value)}
                            rows={3}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{form.data?.landLocation || 'Not provided'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Survey Number
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editableFields.surveyNumber || ''}
                            onChange={(e) => handleFieldChange('surveyNumber', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{form.data?.surveyNumber || 'Not provided'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Cross-Verification Notes */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cross-Verification Notes
                  </label>
                  <textarea
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    rows={4}
                    placeholder="Add notes about your cross-verification findings..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Actions</h3>
              </div>
              
              <div className="px-6 py-4 space-y-4">
                {/* Form Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    form.status === 'cross_verified' ? 'bg-green-100 text-green-800' :
                    form.status === 'pending_cross_verification' ? 'bg-yellow-100 text-yellow-800' :
                    form.status === 'needs_correction' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {form.status?.replace(/_/g, ' ').toUpperCase() || 'PENDING'}
                  </span>
                </div>

                {/* Staff Verification Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Staff Verification Status</label>
                  <div className="space-y-2">
                    {['staff1', 'staff2', 'staff3'].map(staff => {
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

                {/* Form Info */}
                <div className="text-sm text-gray-600">
                  <p><strong>Form Type:</strong> {form.formType?.replace(/_/g, ' ').toUpperCase()}</p>
                  <p><strong>Created:</strong> {new Date(form.createdAt).toLocaleDateString()}</p>
                  {form.userId && (
                    <p><strong>Submitted by:</strong> {form.userId.name || form.userId.email}</p>
                  )}
                </div>

                {/* Action Buttons */}
                {isEditing ? (
                  <div className="space-y-2">
                    <button
                      onClick={handleSaveChanges}
                      disabled={verificationLoading}
                      className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {verificationLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => handleCrossVerification(true)}
                      disabled={verificationLoading}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {verificationLoading ? 'Processing...' : '✓ Approve Cross-Verification'}
                    </button>
                    
                    <button
                      onClick={() => handleCrossVerification(false)}
                      disabled={verificationLoading}
                      className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {verificationLoading ? 'Processing...' : '✗ Needs Correction'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
