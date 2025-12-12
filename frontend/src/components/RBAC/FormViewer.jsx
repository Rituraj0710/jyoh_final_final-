import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';

const FormViewer = ({ formId }) => {
  const { user, getAuthHeaders, canAccessForm } = useAuth();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    if (formId) {
      fetchForm();
    }
  }, [formId]);

  const fetchForm = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/rbac/forms/${formId}`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setForm(data.data);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch form');
      }
    } catch (error) {
      console.error('Form fetch failed:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setApproving(true);
      const response = await fetch(`${API_BASE}/api/rbac/forms/${formId}/approve`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          comments: `Approved by ${user.role}`,
          validationData: getValidationDataForRole()
        })
      });

      if (response.ok) {
        alert('Form approved successfully!');
        fetchForm(); // Refresh form data
      } else {
        const errorData = await response.json();
        alert('Approval failed: ' + errorData.message);
      }
    } catch (error) {
      console.error('Approval failed:', error);
      alert('Approval failed');
    } finally {
      setApproving(false);
    }
  };

  const handleLock = async () => {
    if (user.role !== 'admin') {
      alert('Only Admin can lock forms');
      return;
    }

    try {
      setApproving(true);
      const response = await fetch(`${API_BASE}/api/rbac/forms/${formId}/lock`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          comments: 'Form locked by Admin'
        })
      });

      if (response.ok) {
        alert('Form locked successfully!');
        fetchForm(); // Refresh form data
      } else {
        const errorData = await response.json();
        alert('Lock failed: ' + errorData.message);
      }
    } catch (error) {
      console.error('Lock failed:', error);
      alert('Lock failed');
    } finally {
      setApproving(false);
    }
  };

  const getValidationDataForRole = () => {
    const now = new Date();
    switch (user.role) {
      case 'staff1':
        return {
          stampPaperAmount: form?.data?.stampPaperAmount || 0,
          calculationNotes: 'Calculated by staff1'
        };
      case 'staff2':
        return {
          trusteeValidation: {
            nameVerified: true,
            addressVerified: true,
            amountVerified: true,
            positionVerified: true
          }
        };
      case 'staff3':
        return {
          landValidation: {
            plotSizeVerified: true,
            mapVerified: true,
            documentsVerified: true
          }
        };
      case 'staff4':
        return {
          overallAssessment: 'All validations completed successfully'
        };
      default:
        return {};
    }
  };

  const getRoleSpecificFields = () => {
    if (!form?.data) return [];

    const roleFields = {
      staff1: [
        'formSummary', 'stampPaperAmount', 'totalValue', 'formType', 'submissionDate'
      ],
      staff2: [
        'trusteeDetails', 'trusteeName', 'trusteeAddress', 'moneyAmount', 'position'
      ],
      staff3: [
        'landDetails', 'plotSize', 'plotMap', 'landDocuments', 'propertyAddress'
      ],
      staff4: [
        'approvals', 'staff1Approval', 'staff2Approval', 'staff3Approval'
      ],
    };

    const allowedFields = roleFields[user.role] || [];
    return Object.entries(form.data).filter(([key]) => 
      user.role === 'admin' || allowedFields.includes(key)
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
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
    );
  }

  if (!form) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Form not found</p>
      </div>
    );
  }

  const canAccess = canAccessForm(form);
  const roleFields = getRoleSpecificFields();

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {form.formType?.replace('-', ' ').toUpperCase()} Form
            </h2>
            <p className="text-sm text-gray-500">
              Form ID: {form._id}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              form.locked 
                ? 'bg-red-100 text-red-800' 
                : form.status === 'approved' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
            }`}>
              {form.locked ? 'Locked' : form.status}
            </span>
          </div>
        </div>
      </div>

      {/* Access Control Message */}
      {!canAccess && (
        <div className="px-6 py-4 bg-yellow-50 border-b border-yellow-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Access Restricted
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                You cannot access this form at this stage. Please wait for the previous approval steps to complete.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Data */}
      <div className="px-6 py-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Form Data (Filtered for {user.role})
        </h3>
        
        {roleFields.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No data available for your role</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roleFields.map(([key, value]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
                <div className="text-sm text-gray-900">
                  {typeof value === 'object' ? (
                    <pre className="whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>
                  ) : (
                    String(value)
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      {canAccess && !form.locked && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            {user.role === 'admin' && (
              <button
                onClick={handleLock}
                disabled={approving}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {approving ? 'Locking...' : 'Lock Form'}
              </button>
            )}
            
            <button
              onClick={handleApprove}
              disabled={approving}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {approving ? 'Approving...' : 'Approve Form'}
            </button>
          </div>
        </div>
      )}

      {/* Approval Status */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Approval Status</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['staff1', 'staff2', 'staff3', 'staff4'].map((staff) => (
            <div key={staff} className="text-center">
              <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                form.approvals?.[staff]?.approved 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {form.approvals?.[staff]?.approved ? '✓' : '○'}
              </div>
              <p className="text-xs font-medium text-gray-700">
                Staff {staff.slice(-1)}
              </p>
              {form.approvals?.[staff]?.approvedAt && (
                <p className="text-xs text-gray-500">
                  {new Date(form.approvals[staff].approvedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FormViewer;
