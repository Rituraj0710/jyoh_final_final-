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
        // Initialize editable fields with verification data (sellers, buyers, witnesses, payment)
        const verificationData = data.data.form.verificationData || {};
        setEditableFields({
          sellers: verificationData.sellers || [],
          buyers: verificationData.buyers || [],
          witnesses: verificationData.witnesses || [],
          paymentInfo: verificationData.paymentInfo || {}
        });
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

  const handleSellerChange = (index, field, value) => {
    setEditableFields(prev => {
      const sellers = [...(prev.sellers || [])];
      if (!sellers[index]) sellers[index] = {};
      sellers[index] = { ...sellers[index], [field]: value };
      return { ...prev, sellers };
    });
  };

  const handleBuyerChange = (index, field, value) => {
    setEditableFields(prev => {
      const buyers = [...(prev.buyers || [])];
      if (!buyers[index]) buyers[index] = {};
      buyers[index] = { ...buyers[index], [field]: value };
      return { ...prev, buyers };
    });
  };

  const handleWitnessChange = (index, field, value) => {
    setEditableFields(prev => {
      const witnesses = [...(prev.witnesses || [])];
      if (!witnesses[index]) witnesses[index] = {};
      witnesses[index] = { ...witnesses[index], [field]: value };
      return { ...prev, witnesses };
    });
  };

  const handlePaymentChange = (field, value) => {
    setEditableFields(prev => ({
      ...prev,
      paymentInfo: {
        ...(prev.paymentInfo || {}),
        [field]: value
      }
    }));
  };

  const handleVerification = async (approved) => {
    try {
      setVerificationLoading(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const headers = {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      };
      
      const requestBody = {
        approved,
        verificationType: 'seller-buyer-witness-payment' // Staff2 verifies all these
      };
      
      // Only include fields that have values
      if (verificationNotes && verificationNotes.trim()) {
        requestBody.verificationNotes = verificationNotes.trim();
      }
      
      if (isEditing && approved && editableFields && Object.keys(editableFields).length > 0) {
        requestBody.updatedFields = editableFields;
      }

      const response = await fetch(`${API_BASE}/api/staff/2/forms/${params.id}/verify`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(requestBody)
      });

      const responseData = await response.json().catch(() => ({ 
        status: 'failed', 
        message: 'Failed to parse server response' 
      }));

      if (!response.ok) {
        console.error('Verification error response:', responseData);
        throw new Error(responseData.message || responseData.error || `HTTP ${response.status}: Verification failed`);
      }

      if (responseData.status === 'success') {
        alert(responseData.message || 'Form verified by Staff2 successfully. Form will proceed to Staff3.');
        router.push('/staff2/forms');
      } else {
        throw new Error(responseData.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Error during verification:', error);
      alert(error.message || 'Verification failed. Please try again.');
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
                {/* Seller Details Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                    Seller Details Verification
                  </h3>
                  {(editableFields.sellers || form.verificationData?.sellers) && (editableFields.sellers || form.verificationData.sellers).length > 0 ? (
                    <div className="space-y-4">
                      {(editableFields.sellers || form.verificationData.sellers).map((seller, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <h4 className="font-medium text-gray-900 mb-3">Seller {index + 1}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={seller.name || ''}
                                  onChange={(e) => handleSellerChange(index, 'name', e.target.value)}
                                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                              ) : (
                                <p className="text-sm text-gray-900">{seller.name || 'Not provided'}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Relation</label>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={seller.relation || ''}
                                  onChange={(e) => handleSellerChange(index, 'relation', e.target.value)}
                                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                              ) : (
                                <p className="text-sm text-gray-900">{seller.relation || 'Not provided'}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Mobile</label>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={seller.mobile || ''}
                                  onChange={(e) => handleSellerChange(index, 'mobile', e.target.value)}
                                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                              ) : (
                                <p className="text-sm text-gray-900">{seller.mobile || 'Not provided'}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">ID Type</label>
                              {isEditing ? (
                                <select
                                  value={seller.idType || ''}
                                  onChange={(e) => handleSellerChange(index, 'idType', e.target.value)}
                                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                  <option value="">Select ID Type</option>
                                  <option value="aadhaar">Aadhaar</option>
                                  <option value="pan">PAN</option>
                                  <option value="voter">Voter ID</option>
                                  <option value="driving_license">Driving License</option>
                                  <option value="passport">Passport</option>
                                </select>
                              ) : (
                                <p className="text-sm text-gray-900">{seller.idType || 'Not provided'}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">ID Number</label>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={seller.idNo || ''}
                                  onChange={(e) => handleSellerChange(index, 'idNo', e.target.value)}
                                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                              ) : (
                                <p className="text-sm text-gray-900">{seller.idNo || 'Not provided'}</p>
                              )}
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                              {isEditing ? (
                                <textarea
                                  value={seller.address || ''}
                                  onChange={(e) => handleSellerChange(index, 'address', e.target.value)}
                                  rows={2}
                                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                              ) : (
                                <p className="text-sm text-gray-900">{seller.address || 'Not provided'}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No seller details available</p>
                  )}
                </div>

                {/* Buyer Details Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                    Buyer Details Verification
                  </h3>
                  {(editableFields.buyers || form.verificationData?.buyers) && (editableFields.buyers || form.verificationData.buyers).length > 0 ? (
                    <div className="space-y-4">
                      {(editableFields.buyers || form.verificationData.buyers).map((buyer, index) => (
                        <div key={index} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <h4 className="font-medium text-gray-900 mb-3">Buyer {index + 1}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={buyer.name || ''}
                                  onChange={(e) => handleBuyerChange(index, 'name', e.target.value)}
                                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                              ) : (
                                <p className="text-sm text-gray-900">{buyer.name || 'Not provided'}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Relation</label>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={buyer.relation || ''}
                                  onChange={(e) => handleBuyerChange(index, 'relation', e.target.value)}
                                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                              ) : (
                                <p className="text-sm text-gray-900">{buyer.relation || 'Not provided'}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Mobile</label>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={buyer.mobile || ''}
                                  onChange={(e) => handleBuyerChange(index, 'mobile', e.target.value)}
                                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                              ) : (
                                <p className="text-sm text-gray-900">{buyer.mobile || 'Not provided'}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">ID Type</label>
                              {isEditing ? (
                                <select
                                  value={buyer.idType || ''}
                                  onChange={(e) => handleBuyerChange(index, 'idType', e.target.value)}
                                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                  <option value="">Select ID Type</option>
                                  <option value="aadhaar">Aadhaar</option>
                                  <option value="pan">PAN</option>
                                  <option value="voter">Voter ID</option>
                                  <option value="driving_license">Driving License</option>
                                  <option value="passport">Passport</option>
                                </select>
                              ) : (
                                <p className="text-sm text-gray-900">{buyer.idType || 'Not provided'}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">ID Number</label>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={buyer.idNo || ''}
                                  onChange={(e) => handleBuyerChange(index, 'idNo', e.target.value)}
                                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                              ) : (
                                <p className="text-sm text-gray-900">{buyer.idNo || 'Not provided'}</p>
                              )}
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                              {isEditing ? (
                                <textarea
                                  value={buyer.address || ''}
                                  onChange={(e) => handleBuyerChange(index, 'address', e.target.value)}
                                  rows={2}
                                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                              ) : (
                                <p className="text-sm text-gray-900">{buyer.address || 'Not provided'}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No buyer details available</p>
                  )}
                </div>

                {/* Witness Details Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                    Witness Details Verification
                  </h3>
                  {(editableFields.witnesses || form.verificationData?.witnesses) && (editableFields.witnesses || form.verificationData.witnesses).length > 0 ? (
                    <div className="space-y-4">
                      {(editableFields.witnesses || form.verificationData.witnesses).map((witness, index) => (
                        <div key={index} className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <h4 className="font-medium text-gray-900 mb-3">Witness {index + 1}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={witness.name || ''}
                                  onChange={(e) => handleWitnessChange(index, 'name', e.target.value)}
                                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                              ) : (
                                <p className="text-sm text-gray-900">{witness.name || 'Not provided'}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Relation</label>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={witness.relation || ''}
                                  onChange={(e) => handleWitnessChange(index, 'relation', e.target.value)}
                                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                              ) : (
                                <p className="text-sm text-gray-900">{witness.relation || 'Not provided'}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Mobile</label>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={witness.mobile || ''}
                                  onChange={(e) => handleWitnessChange(index, 'mobile', e.target.value)}
                                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                              ) : (
                                <p className="text-sm text-gray-900">{witness.mobile || 'Not provided'}</p>
                              )}
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                              {isEditing ? (
                                <textarea
                                  value={witness.address || ''}
                                  onChange={(e) => handleWitnessChange(index, 'address', e.target.value)}
                                  rows={2}
                                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                              ) : (
                                <p className="text-sm text-gray-900">{witness.address || 'Not provided'}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No witness details available</p>
                  )}
                </div>

                {/* Payment and Stamp Amount Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                    Payment & Stamp Amount Verification
                  </h3>
                  {(editableFields.paymentInfo || form.verificationData?.paymentInfo) ? (
                    <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Sale Price</label>
                          {isEditing ? (
                            <input
                              type="number"
                              value={editableFields.paymentInfo?.salePrice || form.verificationData?.paymentInfo?.salePrice || '0'}
                              onChange={(e) => handlePaymentChange('salePrice', parseFloat(e.target.value) || 0)}
                              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          ) : (
                            <p className="text-lg font-semibold text-gray-900">₹{(editableFields.paymentInfo?.salePrice || form.verificationData?.paymentInfo?.salePrice || 0).toLocaleString('en-IN')}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Circle Rate Amount</label>
                          {isEditing ? (
                            <input
                              type="number"
                              value={editableFields.paymentInfo?.circleRateAmount || form.verificationData?.paymentInfo?.circleRateAmount || '0'}
                              onChange={(e) => handlePaymentChange('circleRateAmount', parseFloat(e.target.value) || 0)}
                              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          ) : (
                            <p className="text-lg font-semibold text-gray-900">₹{(editableFields.paymentInfo?.circleRateAmount || form.verificationData?.paymentInfo?.circleRateAmount || 0).toLocaleString('en-IN')}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Stamp Duty</label>
                          {isEditing ? (
                            <input
                              type="number"
                              value={editableFields.paymentInfo?.stampDuty || form.verificationData?.paymentInfo?.stampDuty || '0'}
                              onChange={(e) => handlePaymentChange('stampDuty', parseFloat(e.target.value) || 0)}
                              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm font-semibold text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          ) : (
                            <p className="text-lg font-semibold text-green-700">₹{(editableFields.paymentInfo?.stampDuty || form.verificationData?.paymentInfo?.stampDuty || 0).toLocaleString('en-IN')}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Registration Charge</label>
                          {isEditing ? (
                            <input
                              type="number"
                              value={editableFields.paymentInfo?.registrationCharge || form.verificationData?.paymentInfo?.registrationCharge || '0'}
                              onChange={(e) => handlePaymentChange('registrationCharge', parseFloat(e.target.value) || 0)}
                              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm font-semibold text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          ) : (
                            <p className="text-lg font-semibold text-green-700">₹{(editableFields.paymentInfo?.registrationCharge || form.verificationData?.paymentInfo?.registrationCharge || 0).toLocaleString('en-IN')}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Court Fee</label>
                          {isEditing ? (
                            <input
                              type="number"
                              value={editableFields.paymentInfo?.courtFee || form.verificationData?.paymentInfo?.courtFee || '0'}
                              onChange={(e) => handlePaymentChange('courtFee', parseFloat(e.target.value) || 0)}
                              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          ) : (
                            <p className="text-lg font-semibold text-gray-900">₹{(editableFields.paymentInfo?.courtFee || form.verificationData?.paymentInfo?.courtFee || 0).toLocaleString('en-IN')}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Total Payable</label>
                          {isEditing ? (
                            <input
                              type="number"
                              value={editableFields.paymentInfo?.totalPayable || form.verificationData?.paymentInfo?.totalPayable || '0'}
                              onChange={(e) => handlePaymentChange('totalPayable', parseFloat(e.target.value) || 0)}
                              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          ) : (
                            <p className="text-lg font-bold text-blue-700">₹{(editableFields.paymentInfo?.totalPayable || form.verificationData?.paymentInfo?.totalPayable || 0).toLocaleString('en-IN')}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Payment Status</label>
                          {isEditing ? (
                            <select
                              value={editableFields.paymentInfo?.paymentStatus || form.verificationData?.paymentInfo?.paymentStatus || 'pending'}
                              onChange={(e) => handlePaymentChange('paymentStatus', e.target.value)}
                              className="w-full border border-gray-300 rounded-md px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                              <option value="pending">PENDING</option>
                              <option value="paid">PAID</option>
                              <option value="failed">FAILED</option>
                            </select>
                          ) : (
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                              (editableFields.paymentInfo?.paymentStatus || form.verificationData?.paymentInfo?.paymentStatus) === 'paid' ? 'bg-green-100 text-green-800' :
                              (editableFields.paymentInfo?.paymentStatus || form.verificationData?.paymentInfo?.paymentStatus) === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {(editableFields.paymentInfo?.paymentStatus || form.verificationData?.paymentInfo?.paymentStatus || 'PENDING').toUpperCase()}
                            </span>
                          )}
                        </div>
                        {(editableFields.paymentInfo?.paymentTransactionId || form.verificationData?.paymentInfo?.paymentTransactionId) && (
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Transaction ID</label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editableFields.paymentInfo?.paymentTransactionId || form.verificationData?.paymentInfo?.paymentTransactionId || ''}
                                onChange={(e) => handlePaymentChange('paymentTransactionId', e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
                              />
                            ) : (
                              <p className="text-sm text-gray-900 font-mono">{editableFields.paymentInfo?.paymentTransactionId || form.verificationData?.paymentInfo?.paymentTransactionId}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No payment information available</p>
                  )}
                </div>


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
