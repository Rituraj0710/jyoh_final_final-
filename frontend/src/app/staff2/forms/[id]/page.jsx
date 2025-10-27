"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Staff2FormDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getAuthHeaders } = useAuth();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [verificationType, setVerificationType] = useState('trustee'); // 'trustee' or 'amount'
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
      const response = await fetch(`${API_BASE}/api/staff/2/forms/${params.id}`, {
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
      const response = await fetch(`${API_BASE}/api/staff/2/forms/${params.id}/verify`, {
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
        router.push('/staff2/forms');
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
      const response = await fetch(`${API_BASE}/api/staff/2/forms/${params.id}/update`, {
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
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
            <Link href="/staff2/forms" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
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
          <Link href="/staff2/forms" className="text-blue-600 hover:text-blue-800">
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
              <h1 className="text-2xl font-bold text-gray-900">Form Verification</h1>
              <p className="text-gray-600">Form ID: {form._id}</p>
            </div>
            <Link
              href="/staff2/forms"
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
                        value="trustee"
                        checked={verificationType === 'trustee'}
                        onChange={(e) => setVerificationType(e.target.value)}
                        className="mr-2"
                      />
                      Trustee Details
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="amount"
                        checked={verificationType === 'amount'}
                        onChange={(e) => setVerificationType(e.target.value)}
                        className="mr-2"
                      />
                      Amount Verification
                    </label>
                  </div>
                </div>

                {/* Trustee Details Section */}
                {verificationType === 'trustee' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Trustee Information</h3>
                    
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
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{form.data?.trusteeName || 'Not provided'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Trustee Phone
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editableFields.trusteePhone || ''}
                            onChange={(e) => handleFieldChange('trusteePhone', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{form.data?.trusteePhone || 'Not provided'}</p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Trustee Address
                        </label>
                        {isEditing ? (
                          <textarea
                            value={editableFields.trusteeAddress || ''}
                            onChange={(e) => handleFieldChange('trusteeAddress', e.target.value)}
                            rows={3}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{form.data?.trusteeAddress || 'Not provided'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Trustee ID Type
                        </label>
                        {isEditing ? (
                          <select
                            value={editableFields.trusteeIdType || ''}
                            onChange={(e) => handleFieldChange('trusteeIdType', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            <option value="">Select ID Type</option>
                            <option value="aadhar">Aadhar Card</option>
                            <option value="pan">PAN Card</option>
                            <option value="passport">Passport</option>
                            <option value="driving_license">Driving License</option>
                          </select>
                        ) : (
                          <p className="text-sm text-gray-900">{form.data?.trusteeIdType || 'Not provided'}</p>
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
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{form.data?.trusteeIdNumber || 'Not provided'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Amount Details Section */}
                {verificationType === 'amount' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Amount Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Property Value
                        </label>
                        {isEditing ? (
                          <input
                            type="number"
                            value={editableFields.propertyValue || ''}
                            onChange={(e) => handleFieldChange('propertyValue', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">₹{form.data?.propertyValue || 'Not provided'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Stamp Duty
                        </label>
                        {isEditing ? (
                          <input
                            type="number"
                            value={editableFields.stampDuty || ''}
                            onChange={(e) => handleFieldChange('stampDuty', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">₹{form.data?.stampDuty || 'Not provided'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Registration Fee
                        </label>
                        {isEditing ? (
                          <input
                            type="number"
                            value={editableFields.registrationFee || ''}
                            onChange={(e) => handleFieldChange('registrationFee', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">₹{form.data?.registrationFee || 'Not provided'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Total Amount
                        </label>
                        {isEditing ? (
                          <input
                            type="number"
                            value={editableFields.totalAmount || ''}
                            onChange={(e) => handleFieldChange('totalAmount', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">₹{form.data?.totalAmount || 'Not provided'}</p>
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
