"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Staff1FormCorrectionPage() {
  const params = useParams();
  const router = useRouter();
  const { getAuthHeaders } = useAuth();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formFields, setFormFields] = useState({});
  const [correctionNotes, setCorrectionNotes] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchFormDetails();
    }
  }, [params.id]);

  const fetchFormDetails = async () => {
    try {
      setLoading(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(`${API_BASE}/api/staff/1/forms/${params.id}`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setForm(data.data.form);
        setFormFields(data.data.form.fields || {});
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

  const handleFieldChange = (fieldName, value) => {
    setFormFields(prev => ({
      ...prev,
      [fieldName]: value
    }));
    setHasChanges(true);
  };

  const handleSaveCorrections = async () => {
    try {
      setSaving(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(`${API_BASE}/api/staff/1/forms/${params.id}/correct`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          fields: formFields,
          correctionNotes,
          isLegacyForm: form?.isLegacyForm || false,
          originalCollection: form?.originalCollection || form?.serviceType
        })
      });

      if (response.ok) {
        const data = await response.json();
        setForm(data.data.form);
        setHasChanges(false);
        setCorrectionNotes('');
        
        // Show success message
        alert('Form corrections saved successfully!');
        
        // Redirect back to form detail
        router.push(`/staff1/forms/${params.id}`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save corrections');
      }
    } catch (error) {
      console.error('Error saving corrections:', error);
      alert('Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const renderFieldInput = (fieldName, value, type = 'text') => {
    const commonClasses = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent";
    
    switch (type) {
      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            rows={3}
            className={commonClasses}
            placeholder={`Enter ${fieldName.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            className={commonClasses}
            placeholder={`Enter ${fieldName.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
          />
        );
      
      case 'email':
        return (
          <input
            type="email"
            value={value || ''}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            className={commonClasses}
            placeholder={`Enter ${fieldName.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
          />
        );
      
      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            className={commonClasses}
          />
        );
      
      case 'select':
        // This would need to be customized based on the field
        return (
          <select
            value={value || ''}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            className={commonClasses}
          >
            <option value="">Select an option</option>
            {/* Add options based on field type */}
          </select>
        );
      
      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            className={commonClasses}
            placeholder={`Enter ${fieldName.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
          />
        );
    }
  };

  const getFieldType = (fieldName, value) => {
    const lowerFieldName = fieldName.toLowerCase();
    
    if (lowerFieldName.includes('email')) return 'email';
    if (lowerFieldName.includes('date') || lowerFieldName.includes('dob')) return 'date';
    if (lowerFieldName.includes('age') || lowerFieldName.includes('amount') || lowerFieldName.includes('price') || lowerFieldName.includes('value')) return 'number';
    if (lowerFieldName.includes('address') || lowerFieldName.includes('description') || lowerFieldName.includes('details')) return 'textarea';
    
    return 'text';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="bg-white rounded-lg border p-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">Error Loading Form</h3>
        <p className="text-red-600">{error}</p>
        <div className="mt-4 space-x-4">
          <button 
            onClick={fetchFormDetails}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
          <Link 
            href="/staff1/forms"
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Back to Forms
          </Link>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-yellow-800 font-semibold mb-2">Form Not Found</h3>
        <p className="text-yellow-600">The requested form could not be found.</p>
        <Link 
          href="/staff1/forms"
          className="mt-4 inline-block px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          Back to Forms
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Edit/Correct Form
            </h1>
            <p className="text-gray-600">
              {form.formTitle || form.serviceType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} - ID: {form._id}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href={`/staff1/forms/${form._id}`}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </Link>
            <button
              onClick={handleSaveCorrections}
              disabled={!hasChanges || saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save Corrections</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Form Meta Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Submitted By</h3>
            <p className="text-sm font-semibold text-gray-900">{form.userId?.name}</p>
            <p className="text-xs text-gray-600">{form.userId?.email}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Service Type</h3>
            <p className="text-sm font-semibold text-gray-900">
              {form.serviceType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Current Status</h3>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
              {form.status}
            </span>
          </div>
        </div>
      </div>

      {/* Correction Notes */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Correction Notes</h2>
        <textarea
          value={correctionNotes}
          onChange={(e) => setCorrectionNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Add notes about the corrections made to this form..."
        />
        <p className="text-sm text-gray-500 mt-2">
          These notes will be added to the form's history and visible to other staff members.
        </p>
      </div>

      {/* Form Fields Editor */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Form Fields</h2>
          <p className="text-sm text-gray-600 mt-1">
            Edit the form fields below. Changes will be tracked and saved to the database.
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(formFields).map(([fieldName, value]) => {
              const fieldType = getFieldType(fieldName, value);
              return (
                <div key={fieldName} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </label>
                  {renderFieldInput(fieldName, value, fieldType)}
                  {form.fields && form.fields[fieldName] !== formFields[fieldName] && (
                    <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                      <strong>Original:</strong> {form.fields[fieldName] || 'Empty'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add New Field */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-md font-semibold text-gray-900 mb-4">Add New Field</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Field name"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const fieldName = e.target.value.trim();
                    if (fieldName && !formFields[fieldName]) {
                      handleFieldChange(fieldName, '');
                      e.target.value = '';
                    }
                  }
                }}
              />
              <input
                type="text"
                placeholder="Field value"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={(e) => {
                  const fieldNameInput = e.target.parentElement.children[0];
                  const fieldValueInput = e.target.parentElement.children[1];
                  const fieldName = fieldNameInput.value.trim();
                  const fieldValue = fieldValueInput.value.trim();
                  
                  if (fieldName && !formFields[fieldName]) {
                    handleFieldChange(fieldName, fieldValue);
                    fieldNameInput.value = '';
                    fieldValueInput.value = '';
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Add Field
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Changes Summary */}
      {hasChanges && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-blue-800 font-semibold mb-2">Unsaved Changes</h3>
          <p className="text-blue-600 mb-4">
            You have made changes to this form. Don't forget to save your corrections.
          </p>
          <div className="flex space-x-4">
            <button
              onClick={handleSaveCorrections}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => {
                setFormFields(form.fields || {});
                setHasChanges(false);
                setCorrectionNotes('');
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Discard Changes
            </button>
          </div>
        </div>
      )}

      {/* Previous Notes */}
      {form.adminNotes && form.adminNotes.length > 0 && (
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Previous Notes & Comments</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {form.adminNotes.map((note, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {note.addedBy?.name || 'System'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(note.addedAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{note.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
