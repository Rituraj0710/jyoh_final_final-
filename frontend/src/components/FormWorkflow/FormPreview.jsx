"use client"

import React from 'react';
import { useFormWorkflow } from './FormWorkflowProvider';
import SubmitButton from '../ui/SubmitButton';

const FormPreview = ({ formTitle, fields }) => {
  const { formData, goToEdit, submitForm, formType } = useFormWorkflow();

  const handleConfirm = () => {
    // Determine endpoint based on form type
    const endpoints = {
      'will-deed': '/api/will-deed',
      'sale-deed': '/api/sale-deed',
      'trust-deed': '/api/trust-deed',
      'property-registration': '/api/property-registration',
      'property-sale-certificate': '/api/property-sale-certificate'
    };

    const endpoint = endpoints[formType] || '/api/form';
    submitForm(endpoint, formData);
  };

  const formatFieldValue = (value) => {
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return value || 'Not provided';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Review Your {formTitle}
          </h1>
          <p className="text-gray-600">
            Please review all the information below before confirming your submission.
          </p>
        </div>

        {/* Preview Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-blue-600 text-white">
            <h2 className="text-xl font-semibold">Form Details</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fields.map((field, index) => (
                <div key={index} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-gray-900 break-words">
                      {formatFieldValue(formData?.[field.name])}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* File Uploads Preview */}
            {formData?.files && formData.files.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Uploaded Files</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {formData.files.map((file, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 bg-gray-50 border-t flex flex-col sm:flex-row gap-3">
            <button
              onClick={goToEdit}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200"
            >
              Edit Details
            </button>
            <SubmitButton
              onClick={handleConfirm}
              variant="primary"
              className="flex-1"
            >
              Confirm & Submit
            </SubmitButton>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Important Notice
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  By confirming this submission, you agree that all information provided is accurate and complete. 
                  Once submitted, you will be redirected to the payment gateway to complete your transaction.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormPreview;
