"use client"

import React from 'react';
import { useFormWorkflow } from './FormWorkflowProvider';
import LoadingSpinner from '../ui/LoadingSpinner';

const ProcessingState = () => {
  const { processingMessage, formType } = useFormWorkflow();

  const getFormTitle = () => {
    const titles = {
      'will-deed': 'Will Deed',
      'sale-deed': 'Sale Deed',
      'trust-deed': 'Trust Deed',
      'property-registration': 'Property Registration',
      'property-sale-certificate': 'Property Sale Certificate'
    };
    return titles[formType] || 'Form';
  };

  const isError = processingMessage?.includes('❌') || processingMessage?.includes('Error');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`rounded-xl shadow-lg p-8 text-center ${isError ? 'bg-red-50 border border-red-200' : 'bg-white'}`}>
          {/* Processing Animation or Error Icon */}
          <div className="mb-6">
            {isError ? (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            ) : (
              <div className="relative">
                <LoadingSpinner size="xl" color="blue" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              </div>
            )}
          </div>

          {/* Processing Message */}
          <div className="mb-6">
            <h2 className={`text-2xl font-bold mb-2 ${isError ? 'text-red-900' : 'text-gray-900'}`}>
              {isError ? 'Error Processing Your Form' : `Processing Your ${getFormTitle()}`}
            </h2>
            <p className={isError ? 'text-red-700' : 'text-gray-600'}>
              {processingMessage}
            </p>
          </div>

          {/* Progress Steps */}
          {!isError && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-gray-600">Form validated</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-gray-600">Data submitted</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                  <LoadingSpinner size="sm" color="white" />
                </div>
                <span className="text-sm text-gray-600">Processing payment</span>
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className={`mt-8 p-4 rounded-lg ${isError ? 'bg-red-50' : 'bg-blue-50'}`}>
            <p className={`text-sm ${isError ? 'text-red-800' : 'text-blue-800'}`}>
              {isError ? (
                <>
                  <strong>Please try again...</strong> You will be redirected back to the form shortly. 
                  Make sure to fill in all required fields before submitting.
                </>
              ) : (
                <>
                  <strong>Please wait...</strong> This process usually takes 10-30 seconds. 
                  Do not close this window or refresh the page.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingState;
