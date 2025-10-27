"use client";
import React, { useState, useEffect } from 'react';
import { formsAPI, formUtils } from '@/lib/services/forms';

const FormWrapper = ({ 
  children, 
  serviceType, 
  formTitle, 
  formDescription, 
  requiredFields = [],
  onFormSubmit,
  onFormSave,
  initialData = {}
}) => {
  const [formData, setFormData] = useState(initialData);
  const [isDraft, setIsDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastSaved, setLastSaved] = useState(null);
  const [error, setError] = useState('');

  // Calculate progress whenever form data changes
  useEffect(() => {
    const newProgress = formUtils.calculateProgress(formData, requiredFields);
    setProgress(newProgress);
    
    // Auto-save as draft if form has some data
    if (newProgress > 0 && newProgress < 100) {
      setIsDraft(true);
    }
  }, [formData, requiredFields]);

  // Auto-save functionality
  useEffect(() => {
    if (isDraft && progress > 0) {
      const timeoutId = setTimeout(() => {
        handleSaveDraft();
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [formData, isDraft, progress]);

  // Handle form field changes
  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    setError('');
  };

  // Save form as draft
  const handleSaveDraft = async () => {
    try {
      setIsSaving(true);
      const response = await formsAPI.saveForm({
        serviceType,
        formTitle,
        formDescription,
        fields: formData
      });

      if (response.success) {
        setLastSaved(new Date());
        setIsDraft(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  // Submit form
  const handleSubmit = async () => {
    try {
      setError('');
      
      // Validate form
      const validation = formUtils.validateForm(formData, requiredFields);
      if (!validation.isValid) {
        setError('Please fill in all required fields');
        return;
      }

      setIsSubmitting(true);
      
      // Call custom submit handler if provided
      if (onFormSubmit) {
        const customResult = await onFormSubmit(formData);
        if (!customResult) return; // Stop if custom handler returns false
      }

      // Submit to forms API
      const response = await formsAPI.submitForm({
        serviceType,
        formTitle,
        formDescription,
        fields: formData
      });

      if (response.success) {
        setIsDraft(false);
        setLastSaved(new Date());
        // You can add success notification here
        alert('Form submitted successfully!');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit form');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Continue later (save as draft)
  const handleContinueLater = async () => {
    try {
      setIsSaving(true);
      await handleSaveDraft();
      alert('Form saved as draft. You can continue later.');
    } catch (err) {
      setError(err.message || 'Failed to save form');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Header */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{formTitle}</h1>
            <p className="text-sm text-gray-500 mt-1">{formDescription}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Progress</div>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-700">{progress}%</span>
            </div>
          </div>
        </div>

        {/* Status indicators */}
        <div className="mt-4 flex items-center space-x-4 text-sm">
          {isDraft && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Draft
            </span>
          )}
          {lastSaved && (
            <span className="text-gray-500">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          {isSaving && (
            <span className="text-blue-600">Saving...</span>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className="bg-white border rounded-lg p-6">
        {React.cloneElement(children, {
          formData,
          onFieldChange: handleFieldChange,
          isSubmitting,
          isSaving
        })}
      </div>

      {/* Form Actions */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleContinueLater}
              disabled={isSaving || isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Draft & Continue Later'}
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSaveDraft}
              disabled={isSaving || isSubmitting}
              className="px-4 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isSaving || progress < 100}
              className="px-6 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Form'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormWrapper;
