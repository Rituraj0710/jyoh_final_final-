"use client";
import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { AVAILABLE_FORMS } from '@/lib/constants/forms';

export default function Staff1FillFormsPage() {
  const { user } = useAuth();

  const availableForms = AVAILABLE_FORMS;

  const handleFormClick = (form) => {
    // Store form info in sessionStorage for the form page to use
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('staff1_filling_form', 'true');
      sessionStorage.setItem('staff1_form_serviceType', form.serviceType);
      sessionStorage.setItem('staff1_onBehalfOfUserId', ''); // Always null for offline users
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Fill Forms</h1>
        <p className="text-blue-100">Fill forms on behalf of users who come offline</p>
      </div>

      {/* Available Forms Section */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Forms</h2>
        <p className="text-sm text-gray-600 mb-6">
          Select a form type to fill on behalf of users.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableForms.map((form, index) => (
            <Link
              key={index}
              href={form.path}
              onClick={() => handleFormClick(form)}
              className="block p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">{form.icon}</span>
                </div>
                <h3 className="ml-4 text-lg font-semibold text-gray-900">
                  {form.name}
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {form.description}
              </p>
              <div className="flex items-center text-blue-600 text-sm font-medium">
                Fill Form
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 rounded-lg border p-6">
        <h3 className="text-md font-semibold text-gray-900 mb-3">Instructions</h3>
        <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
          <li>Click on any form type above to start filling the form</li>
          <li>All forms filled by Staff 1 are tracked and can be reviewed later</li>
          <li>After submission, the form will appear in the Forms Review section</li>
          <li>Forms are created for offline users and can be associated with users later if needed</li>
        </ul>
      </div>
    </div>
  );
}

