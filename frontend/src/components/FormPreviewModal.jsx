"use client";
import React from 'react';
import { userFormUtils } from '@/lib/services/userForms';

const FormPreviewModal = ({ form, onClose }) => {
  if (!form) return null;

  const renderFormFields = () => {
    const fields = form.fields || {};
    
    return Object.entries(fields).map(([key, value]) => {
      if (value === null || value === undefined || value === '') return null;
      
      // Format field name for display
      const fieldName = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
      
      return (
        <div key={key} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {fieldName}
          </label>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
            {typeof value === 'boolean' ? (
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {value ? 'Yes' : 'No'}
              </span>
            ) : Array.isArray(value) ? (
              <div className="space-y-1">
                {value.map((item, index) => (
                  <div key={index} className="text-sm text-gray-900">
                    {typeof item === 'object' ? JSON.stringify(item, null, 2) : item}
                  </div>
                ))}
              </div>
            ) : typeof value === 'object' ? (
              <pre className="text-sm text-gray-900 whitespace-pre-wrap">
                {JSON.stringify(value, null, 2)}
              </pre>
            ) : (
              <span className="text-sm text-gray-900">{value}</span>
            )}
          </div>
        </div>
      );
    }).filter(Boolean);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Form Preview: {userFormUtils.getServiceTypeName(form.serviceType)}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Form ID: {form._id}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form Status and Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${userFormUtils.getStatusBadgeColor(form.status)}`}>
                  {form.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Progress
                </label>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${form.progressPercentage || 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-700">{form.progressPercentage || 0}%</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Updated
                </label>
                <span className="text-sm text-gray-900">
                  {userFormUtils.formatDate(form.lastActivityAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="max-h-96 overflow-y-auto">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Form Details</h4>
            <div className="space-y-4">
              {renderFormFields()}
            </div>
          </div>

          {/* Admin Notes (if any) */}
          {form.adminNotes && form.adminNotes.length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Admin Notes</h4>
              <div className="space-y-3">
                {form.adminNotes.map((note, index) => (
                  <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <div className="text-sm text-gray-900">{note.note}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Added by: {note.addedBy?.name || 'Admin'} on {userFormUtils.formatDate(note.addedAt)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors text-sm"
            >
              Close
            </button>
            {form.status === 'completed' && (
              <button
                onClick={() => {
                  // This would trigger download
                  window.open(`/api/user/forms/${form._id}/download`, '_blank');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Download PDF
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormPreviewModal;
