"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Staff3FormDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getAuthHeaders } = useAuth();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [verificationType, setVerificationType] = useState('land'); // 'land' or 'plot'
  const [editableFields, setEditableFields] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchFormDetails();
    }
  }, [params.id]);

  const fetchFormDetails = async () => {
    try {
      setLoading(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(`${API_BASE}/api/staff/3/forms/${params.id}`, {
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

  const handleVerification = async (approved) => {
    try {
      setVerificationLoading(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(`${API_BASE}/api/staff/3/forms/${params.id}/verify`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          approved,
          verificationNotes,
          verificationType,
          updatedFields: isEditing ? editableFields : null
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || 'Verification completed successfully');
        router.push('/staff3/forms');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Error during verification:', error);
      alert(error.message || 'Verification failed');
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setVerificationLoading(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(`${API_BASE}/api/staff/3/forms/${params.id}/update`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          updatedFields: editableFields,
          verificationType,
          updateNotes: verificationNotes
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
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
            <Link href="/staff3/forms" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
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
          <Link href="/staff3/forms" className="text-blue-600 hover:text-blue-800">
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
              <h1 className="text-2xl font-bold text-gray-900">Land Verification</h1>
              <p className="text-gray-600">Form ID: {form._id}</p>
            </div>
            <Link
              href="/staff3/forms"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Back to Forms
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">
                    {form.formType?.replace('_', ' ').toUpperCase() || 'FORM'} Details
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

              <div className="px-6 py-4">
                {/* Verification Type Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Type
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="land"
                        checked={verificationType === 'land'}
                        onChange={(e) => setVerificationType(e.target.value)}
                        className="mr-2"
                      />
                      Land Details
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="plot"
                        checked={verificationType === 'plot'}
                        onChange={(e) => setVerificationType(e.target.value)}
                        className="mr-2"
                      />
                      Plot Details
                    </label>
                  </div>
                </div>

                {/* Land Details Section */}
                {verificationType === 'land' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Land Information</h3>
                    
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
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{form.data?.landOwner || 'Not provided'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Land Type
                        </label>
                        {isEditing ? (
                          <select
                            value={editableFields.landType || ''}
                            onChange={(e) => handleFieldChange('landType', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          >
                            <option value="">Select Land Type</option>
                            <option value="residential">Residential</option>
                            <option value="commercial">Commercial</option>
                            <option value="agricultural">Agricultural</option>
                            <option value="industrial">Industrial</option>
                            <option value="mixed_use">Mixed Use</option>
                          </select>
                        ) : (
                          <p className="text-sm text-gray-900">{form.data?.landType || 'Not provided'}</p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Land Location
                        </label>
                        {isEditing ? (
                          <textarea
                            value={editableFields.landLocation || ''}
                            onChange={(e) => handleFieldChange('landLocation', e.target.value)}
                            rows={3}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{form.data?.surveyNumber || 'Not provided'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Land Area (sq ft)
                        </label>
                        {isEditing ? (
                          <input
                            type="number"
                            value={editableFields.landArea || ''}
                            onChange={(e) => handleFieldChange('landArea', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{form.data?.landArea || 'Not provided'} sq ft</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Plot Details Section */}
                {verificationType === 'plot' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Plot Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Plot Number
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editableFields.plotNumber || ''}
                            onChange={(e) => handleFieldChange('plotNumber', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{form.data?.plotNumber || 'Not provided'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Plot Size
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editableFields.plotSize || ''}
                            onChange={(e) => handleFieldChange('plotSize', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{form.data?.plotSize || 'Not provided'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Plot Length (ft)
                        </label>
                        {isEditing ? (
                          <input
                            type="number"
                            value={editableFields.plotLength || ''}
                            onChange={(e) => handleFieldChange('plotLength', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{form.data?.plotLength || 'Not provided'} ft</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Plot Width (ft)
                        </label>
                        {isEditing ? (
                          <input
                            type="number"
                            value={editableFields.plotWidth || ''}
                            onChange={(e) => handleFieldChange('plotWidth', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{form.data?.plotWidth || 'Not provided'} ft</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Plot Area (sq ft)
                        </label>
                        {isEditing ? (
                          <input
                            type="number"
                            value={editableFields.plotArea || ''}
                            onChange={(e) => handleFieldChange('plotArea', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{form.data?.plotArea || 'Not provided'} sq ft</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Plot Boundaries
                        </label>
                        {isEditing ? (
                          <textarea
                            value={editableFields.plotBoundaries || ''}
                            onChange={(e) => handleFieldChange('plotBoundaries', e.target.value)}
                            rows={2}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{form.data?.plotBoundaries || 'Not provided'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Verification Notes */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Notes
                  </label>
                  <textarea
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    rows={4}
                    placeholder="Add notes about your verification..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
                    form.status === 'verified' ? 'bg-green-100 text-green-800' :
                    form.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    form.status === 'needs_correction' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {form.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                  </span>
                </div>

                {/* Form Info */}
                <div className="text-sm text-gray-600">
                  <p><strong>Form Type:</strong> {form.formType?.replace('_', ' ').toUpperCase()}</p>
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
                      className="w-full bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {verificationLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => handleVerification(true)}
                      disabled={verificationLoading}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {verificationLoading ? 'Processing...' : '✓ Approve Verification'}
                    </button>
                    
                    <button
                      onClick={() => handleVerification(false)}
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
