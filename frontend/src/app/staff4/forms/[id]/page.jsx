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
  const [activeTab, setActiveTab] = useState('all'); // 'primary', 'trustee', 'land', 'all' - Default to 'all' to show all verifications

  useEffect(() => {
    if (params.id) {
      fetchFormDetails();
    }
  }, [params.id]);

  const fetchFormDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      
      console.log('Fetching form details for ID:', params.id);
      console.log('API URL:', `${API_BASE}/api/staff/4/forms/${params.id}`);
      
      const response = await fetch(`${API_BASE}/api/staff/4/forms/${params.id}`, {
        headers: getAuthHeaders()
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Form data received:', data);
        console.log('Staff sections available:', !!data.data?.form?.staffSections);
        
        setForm(data.data.form);
        // Initialize editable fields with current form data
        setEditableFields(data.data.form.data || {});
        // Also set staff sections if available
        if (data.data.form.staffSections) {
          console.log('Staff1 sections:', data.data.form.staffSections.staff1);
          console.log('Staff2 sections:', data.data.form.staffSections.staff2);
          console.log('Staff3 sections:', data.data.form.staffSections.staff3);
          
          // Merge all staff sections for editing
          const allSections = {
            ...data.data.form.staffSections.staff1,
            ...data.data.form.staffSections.staff2,
            ...data.data.form.staffSections.staff3
          };
          setEditableFields(prev => ({ ...prev, ...allSections }));
        } else {
          console.warn('No staffSections found in form data. Available keys:', Object.keys(data.data.form));
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        const errorMessage = errorData.message || `HTTP ${response.status}: Failed to fetch form details`;
        console.error('API Error:', errorData);
        console.error('Response status:', response.status);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error fetching form details:', error);
      setError(error.message || 'Failed to fetch form details. Please check the console for more information.');
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
    if (!params.id) {
      alert('Error: Form ID is missing');
      return;
    }

    // Confirm action
    const actionText = approved ? 'approve cross-verification' : 'mark for correction';
    if (!confirm(`Are you sure you want to ${actionText} this form?`)) {
      return;
    }

    try {
      setVerificationLoading(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      
      const requestBody = {
        approved,
        verificationNotes: verificationNotes || '',
        updatedFields: isEditing ? editableFields : null,
        corrections: isEditing ? getCorrectionsSummary() : null
      };

      console.log('Sending cross-verification request:', {
        url: `${API_BASE}/api/staff/4/forms/${params.id}/cross-verify`,
        method: 'PUT',
        body: requestBody,
        formId: params.id
      });

      const headers = getAuthHeaders();
      console.log('Request headers:', { hasAuth: !!headers.Authorization, contentType: headers['Content-Type'] });

      const response = await fetch(`${API_BASE}/api/staff/4/forms/${params.id}/cross-verify`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(requestBody)
      });

      console.log('Cross-verification response status:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('Cross-verification success:', data);
        alert(data.message || `Form ${approved ? 'cross-verified' : 'marked for correction'} successfully`);
        router.push('/staff4/forms');
      } else {
        const errorText = await response.text();
        console.error('Cross-verification error response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || 'Unknown error' };
        }
        const errorMessage = errorData.message || `HTTP ${response.status}: Cross-verification failed`;
        console.error('Cross-verification error:', errorData);
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error during cross-verification:', error);
      alert(error.message || 'Cross-verification failed. Please check the console for details.');
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

  // Render Staff1 Section
  const renderStaff1Section = () => {
    const staff1Data = form?.staffSections?.staff1 || {};
    const serviceType = form?.serviceType;

    if (serviceType === 'sale-deed') {
      return (
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
              <p className="text-sm text-gray-900">{staff1Data.documentType || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
              <p className="text-sm text-gray-900">{staff1Data.propertyType || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plot Type</label>
              <p className="text-sm text-gray-900">{staff1Data.plotType || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price</label>
              <p className="text-sm text-gray-900">{staff1Data.salePrice ? `₹${staff1Data.salePrice.toLocaleString()}` : 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Circle Rate Amount</label>
              <p className="text-sm text-gray-900">{staff1Data.circleRateAmount ? `₹${staff1Data.circleRateAmount.toLocaleString()}` : 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
              <p className="text-sm text-gray-900">{staff1Data.area ? `${staff1Data.area} ${staff1Data.areaUnit || 'sq_meters'}` : 'Not provided'}</p>
            </div>
          </div>

          {/* Sellers */}
          {staff1Data.sellers && staff1Data.sellers.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Sellers ({staff1Data.sellers.length})</h4>
              <div className="space-y-4">
                {staff1Data.sellers.map((seller, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                        <p className="text-sm text-gray-900">{seller.name || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Relation</label>
                        <p className="text-sm text-gray-900">{seller.relation || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Mobile</label>
                        <p className="text-sm text-gray-900">{seller.mobile || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                        <p className="text-sm text-gray-900">{seller.address || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buyers */}
          {staff1Data.buyers && staff1Data.buyers.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Buyers ({staff1Data.buyers.length})</h4>
              <div className="space-y-4">
                {staff1Data.buyers.map((buyer, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                        <p className="text-sm text-gray-900">{buyer.name || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Relation</label>
                        <p className="text-sm text-gray-900">{buyer.relation || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Mobile</label>
                        <p className="text-sm text-gray-900">{buyer.mobile || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                        <p className="text-sm text-gray-900">{buyer.address || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Witnesses */}
          {staff1Data.witnesses && staff1Data.witnesses.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Witnesses ({staff1Data.witnesses.length})</h4>
              <div className="space-y-4">
                {staff1Data.witnesses.map((witness, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                        <p className="text-sm text-gray-900">{witness.name || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Relation</label>
                        <p className="text-sm text-gray-900">{witness.relation || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Mobile</label>
                        <p className="text-sm text-gray-900">{witness.mobile || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                        <p className="text-sm text-gray-900">{witness.address || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // For other form types
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Applicant Name</label>
          <p className="text-sm text-gray-900">{staff1Data.applicantName || staff1Data.name || 'Not provided'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <p className="text-sm text-gray-900">{staff1Data.applicantEmail || staff1Data.email || 'Not provided'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <p className="text-sm text-gray-900">{staff1Data.phoneNumber || staff1Data.mobile || staff1Data.phone || 'Not provided'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
          <p className="text-sm text-gray-900">{staff1Data.serviceType || serviceType || 'Not provided'}</p>
        </div>
      </div>
    );
  };

  // Render Staff2 Section
  const renderStaff2Section = () => {
    const staff2Data = form?.staffSections?.staff2 || {};
    const serviceType = form?.serviceType;

    if (serviceType === 'sale-deed') {
      return (
        <div className="space-y-6">
          {/* Sellers with ID Verification */}
          {staff2Data.sellers && staff2Data.sellers.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Sellers - Detailed Verification ({staff2Data.sellers.length})</h4>
              <div className="space-y-4">
                {staff2Data.sellers.map((seller, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                        <p className="text-sm text-gray-900">{seller.name || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">ID Type</label>
                        <p className="text-sm text-gray-900">{seller.idType || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">ID Number</label>
                        <p className="text-sm text-gray-900">{seller.idNo || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Mobile</label>
                        <p className="text-sm text-gray-900">{seller.mobile || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                        <p className="text-sm text-gray-900">{seller.address || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buyers with ID Verification */}
          {staff2Data.buyers && staff2Data.buyers.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Buyers - Detailed Verification ({staff2Data.buyers.length})</h4>
              <div className="space-y-4">
                {staff2Data.buyers.map((buyer, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-green-50">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                        <p className="text-sm text-gray-900">{buyer.name || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">ID Type</label>
                        <p className="text-sm text-gray-900">{buyer.idType || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">ID Number</label>
                        <p className="text-sm text-gray-900">{buyer.idNo || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Mobile</label>
                        <p className="text-sm text-gray-900">{buyer.mobile || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                        <p className="text-sm text-gray-900">{buyer.address || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment/Stamp Information */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Payment & Stamp Information</h4>
            <div className="border border-gray-200 rounded-lg p-4 bg-yellow-50">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Sale Price</label>
                  <p className="text-sm font-semibold text-gray-900">{staff2Data.salePrice ? `₹${staff2Data.salePrice.toLocaleString()}` : 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Circle Rate Amount</label>
                  <p className="text-sm font-semibold text-gray-900">{staff2Data.circleRateAmount ? `₹${staff2Data.circleRateAmount.toLocaleString()}` : 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Stamp Duty</label>
                  <p className="text-sm font-semibold text-gray-900">{staff2Data.stampDuty ? `₹${staff2Data.stampDuty.toLocaleString()}` : 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Registration Charge</label>
                  <p className="text-sm font-semibold text-gray-900">{staff2Data.registrationCharge ? `₹${staff2Data.registrationCharge.toLocaleString()}` : 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Court Fee</label>
                  <p className="text-sm font-semibold text-gray-900">{staff2Data.courtFee ? `₹${staff2Data.courtFee.toLocaleString()}` : 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Total Payable</label>
                  <p className="text-sm font-semibold text-blue-900">{staff2Data.totalPayable ? `₹${staff2Data.totalPayable.toLocaleString()}` : 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Payment Status</label>
                  <p className={`text-sm font-semibold ${
                    staff2Data.paymentStatus === 'paid' ? 'text-green-600' : 
                    staff2Data.paymentStatus === 'pending' ? 'text-yellow-600' : 
                    'text-gray-600'
                  }`}>
                    {staff2Data.paymentStatus ? staff2Data.paymentStatus.toUpperCase() : 'PENDING'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // For other form types (Trustee Details)
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Trustee Name</label>
          <p className="text-sm text-gray-900">{staff2Data.trusteeName || 'Not provided'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Trustee Address</label>
          <p className="text-sm text-gray-900">{staff2Data.trusteeAddress || 'Not provided'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Trustee Phone</label>
          <p className="text-sm text-gray-900">{staff2Data.trusteePhone || 'Not provided'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Trustee ID Number</label>
          <p className="text-sm text-gray-900">{staff2Data.trusteeIdNumber || 'Not provided'}</p>
        </div>
      </div>
    );
  };

  // Render Staff3 Section
  const renderStaff3Section = () => {
    const staff3Data = form?.staffSections?.staff3 || {};
    const serviceType = form?.serviceType;

    if (serviceType === 'sale-deed') {
      return (
        <div className="space-y-6">
          {/* Property Description */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Property Description</h4>
            <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
                  <p className="text-sm text-gray-900">{staff3Data.state || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">District</label>
                  <p className="text-sm text-gray-900">{staff3Data.district || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tehsil</label>
                  <p className="text-sm text-gray-900">{staff3Data.tehsil || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Village</label>
                  <p className="text-sm text-gray-900">{staff3Data.village || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Khasra No.</label>
                  <p className="text-sm text-gray-900">{staff3Data.khasraNo || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Plot No.</label>
                  <p className="text-sm text-gray-900">{staff3Data.plotNo || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Colony Name</label>
                  <p className="text-sm text-gray-900">{staff3Data.colonyName || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Ward No.</label>
                  <p className="text-sm text-gray-900">{staff3Data.wardNo || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Street No.</label>
                  <p className="text-sm text-gray-900">{staff3Data.streetNo || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Road Size</label>
                  <p className="text-sm text-gray-900">{staff3Data.roadSize ? `${staff3Data.roadSize} ${staff3Data.roadUnit || 'meter'}` : 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Double Side Road</label>
                  <p className="text-sm text-gray-900">{staff3Data.doubleSideRoad ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Property Directions */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Property Directions</h4>
            <div className="border border-gray-200 rounded-lg p-4 bg-green-50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">North (उत्तर)</label>
                  <p className="text-sm text-gray-900">{staff3Data.directionNorth || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">East (पूर्व)</label>
                  <p className="text-sm text-gray-900">{staff3Data.directionEast || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">South (दक्षिण)</label>
                  <p className="text-sm text-gray-900">{staff3Data.directionSouth || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">West (पश्चिम)</label>
                  <p className="text-sm text-gray-900">{staff3Data.directionWest || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // For other form types
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Land Owner</label>
          <p className="text-sm text-gray-900">{staff3Data.landOwner || 'Not provided'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Plot Number</label>
          <p className="text-sm text-gray-900">{staff3Data.plotNumber || staff3Data.plotNo || 'Not provided'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Land Location</label>
          <p className="text-sm text-gray-900">{staff3Data.landLocation || 'Not provided'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Survey Number</label>
          <p className="text-sm text-gray-900">{staff3Data.surveyNumber || staff3Data.khasraNo || 'Not provided'}</p>
        </div>
      </div>
    );
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
                {/* Verification Summary - Show when viewing all sections */}
                {activeTab === 'all' && (
                  <div className="mb-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Cross-Verification Overview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Staff1 Status */}
                      <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Staff1 Verification</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            getStaffVerificationStatus('staff1').color === 'green' ? 'bg-green-100 text-green-800' :
                            getStaffVerificationStatus('staff1').color === 'red' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {getStaffVerificationStatus('staff1').status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">Primary Details: Basic form info, sellers, buyers, witnesses</p>
                        {form.approvals?.staff1?.verifiedAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Verified: {new Date(form.approvals.staff1.verifiedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      {/* Staff2 Status */}
                      <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Staff2 Verification</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            getStaffVerificationStatus('staff2').color === 'green' ? 'bg-green-100 text-green-800' :
                            getStaffVerificationStatus('staff2').color === 'red' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {getStaffVerificationStatus('staff2').status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          {form?.serviceType === 'sale-deed' 
                            ? 'Seller/Buyer ID Verification & Payment Details' 
                            : 'Trustee Details Verification'}
                        </p>
                        {form.approvals?.staff2?.verifiedAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Verified: {new Date(form.approvals.staff2.verifiedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      {/* Staff3 Status */}
                      <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Staff3 Verification</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            getStaffVerificationStatus('staff3').color === 'green' ? 'bg-green-100 text-green-800' :
                            getStaffVerificationStatus('staff3').color === 'red' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {getStaffVerificationStatus('staff3').status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          {form?.serviceType === 'sale-deed' 
                            ? 'Property Description & Directions Verification' 
                            : 'Land/Plot Details Verification'}
                        </p>
                        {form.approvals?.staff3?.verifiedAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Verified: {new Date(form.approvals.staff3.verifiedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Primary Details Section (Staff1) */}
                {(activeTab === 'primary' || activeTab === 'all') && (
                  <div className={`mb-8 ${activeTab === 'all' ? 'border-l-4 border-blue-500 pl-4' : ''}`}>
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
                    
                    {renderStaff1Section()}
                  </div>
                )}

                {/* Trustee Details Section (Staff2) */}
                {(activeTab === 'trustee' || activeTab === 'all') && (
                  <div className={`mb-8 ${activeTab === 'all' ? 'border-l-4 border-blue-500 pl-4' : ''}`}>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">👥</span>
                      {form?.serviceType === 'sale-deed' ? 'Seller/Buyer & Payment Details' : 'Trustee Details'} (Staff2 Verification)
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        getStaffVerificationStatus('staff2').color === 'green' ? 'bg-green-100 text-green-800' :
                        getStaffVerificationStatus('staff2').color === 'red' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {getStaffVerificationStatus('staff2').status.toUpperCase()}
                      </span>
                    </h3>
                    
                    {renderStaff2Section()}
                  </div>
                )}

                {/* Land Details Section (Staff3) */}
                {(activeTab === 'land' || activeTab === 'all') && (
                  <div className={`mb-8 ${activeTab === 'all' ? 'border-l-4 border-blue-500 pl-4' : ''}`}>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">🏞️</span>
                      Land/Plot Details (Staff3 Verification)
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        getStaffVerificationStatus('staff3').color === 'green' ? 'bg-green-100 text-green-800' :
                        getStaffVerificationStatus('staff3').color === 'red' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {getStaffVerificationStatus('staff3').status.toUpperCase()}
                      </span>
                    </h3>
                    
                    {renderStaff3Section()}
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
