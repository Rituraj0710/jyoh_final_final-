"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { AVAILABLE_FORMS } from '@/lib/constants/forms';

export default function Staff1DraftingPage() {
  const router = useRouter();
  const { getAuthHeaders, user } = useAuth();
  const [step, setStep] = useState(1); // 1: Select form type, 2: Select template (optional), 3: Create draft
  const [selectedFormType, setSelectedFormType] = useState(null);
  const [existingForms, setExistingForms] = useState([]);
  const [selectedTemplateForm, setSelectedTemplateForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingForms, setLoadingForms] = useState(false);
  const [error, setError] = useState(null);
  const [draftCreated, setDraftCreated] = useState(false);
  const [createdDraftId, setCreatedDraftId] = useState(null);

  // Fetch existing forms when form type is selected
  useEffect(() => {
    if (selectedFormType && step === 2) {
      fetchExistingForms();
    }
  }, [selectedFormType, step]);

  const fetchExistingForms = async () => {
    try {
      setLoadingForms(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(
        `${API_BASE}/api/staff/1/forms?serviceType=${selectedFormType.serviceType}&limit=50`,
        {
          headers: getAuthHeaders()
        }
      );

      if (response.ok) {
        const data = await response.json();
        setExistingForms(data.data?.forms || []);
      } else {
        throw new Error('Failed to fetch existing forms');
      }
    } catch (error) {
      console.error('Error fetching existing forms:', error);
      setError(error.message);
    } finally {
      setLoadingForms(false);
    }
  };

  const handleFormTypeSelect = (form) => {
    setSelectedFormType(form);
    setStep(2);
    setError(null);
  };

  const handleSkipTemplate = () => {
    // Skip template selection and go directly to create draft
    setSelectedTemplateForm(null);
    createDraft();
  };

  const handleTemplateSelect = (form) => {
    setSelectedTemplateForm(form);
  };

  const createDraft = async () => {
    try {
      setLoading(true);
      setError(null);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';

      // Prepare form data - use template data if available, otherwise empty
      const formFields = selectedTemplateForm 
        ? (selectedTemplateForm.allFields || selectedTemplateForm.fields || selectedTemplateForm.data || {})
        : {};

      // Create a new draft form
      // Note: formId is not provided, so a new form will be created
      const response = await fetch(`${API_BASE}/api/forms-data/save`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          serviceType: selectedFormType.serviceType,
          fields: formFields,
          formTitle: `${selectedFormType.name} - Draft`,
          formDescription: selectedTemplateForm 
            ? `Draft created from template: ${selectedTemplateForm._id?.substring(0, 8)}...` 
            : 'New draft form'
        })
      });

      if (response.ok) {
        const data = await response.json();
        // The formData._id is the FormsData document ID
        const draftId = data.data?.formData?._id || data.data?.formData?.id;
        if (!draftId) {
          throw new Error('Draft created but no ID returned');
        }
        setCreatedDraftId(draftId);
        setDraftCreated(true);
        setStep(3);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Failed to create draft');
      }
    } catch (error) {
      console.error('Error creating draft:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToForm = () => {
    if (createdDraftId) {
      // Store form info in sessionStorage for the form page to use
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('staff1_filling_form', 'true');
        sessionStorage.setItem('staff1_form_serviceType', selectedFormType.serviceType);
        sessionStorage.setItem('staff1_formId', createdDraftId);
        sessionStorage.setItem('staff1_onBehalfOfUserId', '');
      }
      router.push(selectedFormType.path);
    }
  };

  const handleStartOver = () => {
    setStep(1);
    setSelectedFormType(null);
    setSelectedTemplateForm(null);
    setExistingForms([]);
    setDraftCreated(false);
    setCreatedDraftId(null);
    setError(null);
  };

  const getServiceTypeIcon = (serviceType) => {
    const form = AVAILABLE_FORMS.find(f => f.serviceType === serviceType);
    return form?.icon || '📄';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Form Drafting</h1>
            <p className="text-green-100">Create draft forms with pre-filled data from existing forms</p>
          </div>
          <Link
            href="/staff1/dashboard"
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <div className={`flex items-center ${step >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="ml-2 font-medium">Select Form Type</span>
          </div>
          <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${step >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="ml-2 font-medium">Select Template (Optional)</span>
          </div>
          <div className={`flex-1 h-1 mx-4 ${step >= 3 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${step >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="ml-2 font-medium">Draft Created</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Step 1: Select Form Type */}
      {step === 1 && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Form Type</h2>
          <p className="text-sm text-gray-600 mb-6">
            Choose the type of form you want to create a draft for.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AVAILABLE_FORMS.map((form, index) => (
              <button
                key={index}
                onClick={() => handleFormTypeSelect(form)}
                className="text-left p-6 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all duration-200 bg-white"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">{form.icon}</span>
                  </div>
                  <h3 className="ml-4 text-lg font-semibold text-gray-900">
                    {form.name}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {form.description}
                </p>
                <div className="flex items-center text-green-600 text-sm font-medium">
                  Select Form
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Select Template (Optional) */}
      {step === 2 && (
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Select Template Form (Optional)</h2>
              <p className="text-sm text-gray-600 mt-1">
                Choose an existing form to pre-fill the draft, or skip to create an empty draft.
              </p>
            </div>
            <button
              onClick={handleStartOver}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Change Form Type
            </button>
          </div>

          {loadingForms ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading existing forms...</p>
            </div>
          ) : existingForms.length > 0 ? (
            <>
              <div className="mb-4 max-h-96 overflow-y-auto">
                <div className="space-y-3">
                  {existingForms.map((form) => (
                    <div
                      key={form._id}
                      onClick={() => handleTemplateSelect(form)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedTemplateForm?._id === form._id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getServiceTypeIcon(form.serviceType)}</span>
                          <div>
                            <p className="font-medium text-gray-900">
                              {form.formTitle || form.serviceType?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </p>
                            <p className="text-sm text-gray-500">
                              ID: {form._id?.substring(0, 8)}... | Status: {form.status}
                            </p>
                            {form.userId && (
                              <p className="text-xs text-gray-400">
                                User: {form.userId?.name || 'N/A'}
                              </p>
                            )}
                          </div>
                        </div>
                        {selectedTemplateForm?._id === form._id && (
                          <div className="text-green-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={createDraft}
                  disabled={loading || !selectedTemplateForm}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Creating Draft...' : 'Create Draft with Template'}
                </button>
                <button
                  onClick={handleSkipTemplate}
                  disabled={loading}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Creating Draft...' : 'Skip & Create Empty Draft'}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No existing forms found for this type.</p>
              <button
                onClick={handleSkipTemplate}
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating Draft...' : 'Create Empty Draft'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Draft Created */}
      {step === 3 && draftCreated && (
        <div className="bg-white rounded-lg border p-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Draft Created Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your draft form has been created with {selectedTemplateForm ? 'pre-filled data from the template' : 'empty fields'}.
            </p>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={handleContinueToForm}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Continue to Form
              </button>
              <Link
                href="/staff1/forms"
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                View All Forms
              </Link>
              <button
                onClick={handleStartOver}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Another Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

