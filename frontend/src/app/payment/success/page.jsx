"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('pending'); // pending, success, error

  useEffect(() => {
    // Get payment details from URL parameters
    const txnid = searchParams.get('txnid');
    const amount = searchParams.get('amount');
    const status = searchParams.get('status');
    const productinfo = searchParams.get('productinfo');

    setPaymentDetails({
      txnid,
      amount,
      status,
      productinfo
    });

    // Submit form data to backend after successful payment
    if (status === 'success' && txnid) {
      submitFormDataToBackend(txnid, amount, productinfo);
    }
  }, [searchParams]);

  const submitFormDataToBackend = async (txnid, amount, productinfo) => {
    setIsSubmitting(true);
    
    try {
      // Get form data from localStorage
      const formData = localStorage.getItem('formData');
      const draftData = localStorage.getItem('draftData');
      
      if (!formData && !draftData) {
        console.warn('No form data found in localStorage - data may already be submitted');
        // Check if this is a case where data was already submitted before payment
        setSubmitStatus('success');
        setIsSubmitting(false);
        return;
      }

      // Parse form data
      const parsedFormData = formData ? JSON.parse(formData) : JSON.parse(draftData);
      
      // Check if data was already submitted to database
      if (parsedFormData.submittedToDatabase) {
        console.log('Form data already submitted to database');
        setSubmitStatus('success');
        setIsSubmitting(false);
        return;
      }
      
      // Determine form type and endpoint
      const formType = parsedFormData.formType || 'sale-deed';
      const endpoint = getEndpointForFormType(formType);
      
      // Prepare submission data
      const submissionData = {
        ...parsedFormData,
        paymentDetails: {
          txnid,
          amount,
          productinfo,
          status: 'success',
          paidAt: new Date().toISOString()
        }
      };

      // Get authentication token
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      
      // Submit to backend
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error(`Backend submission failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('Form submitted successfully:', result);
      
      setSubmitStatus('success');
      
      // Clear form data only after successful backend submission
      localStorage.removeItem('formData');
      localStorage.removeItem('draftData');
      
    } catch (error) {
      console.error('Error submitting form data:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEndpointForFormType = (formType) => {
    const endpoints = {
      'sale-deed': '/api/sale-deed',
      'will-deed': '/api/will-deed',
      'trust-deed': '/api/trust-deed',
      'property-registration': '/api/property-registration',
      'property-sale-certificate': '/api/property-sale-certificate',
      'power-of-attorney': '/api/power-of-attorney',
      'adoption-deed': '/api/adoption-deed'
    };
    return endpoints[formType] || '/api/sale-deed';
  };

  const getStatusMessage = () => {
    if (isSubmitting) {
      return 'Submitting your form data...';
    }
    
    switch (submitStatus) {
      case 'success':
        return 'Your form has been submitted successfully!';
      case 'error':
        return 'Payment successful, but there was an issue submitting your form. Please contact support.';
      default:
        return 'Processing your payment...';
    }
  };

  const getStatusIcon = () => {
    if (isSubmitting) {
      return (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      );
    }
    
    switch (submitStatus) {
      case 'success':
        return (
          <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              {getStatusIcon()}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-600">
              {getStatusMessage()}
            </p>
          </div>
          
          {paymentDetails && (
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Transaction ID:</strong> {paymentDetails.txnid}
                </p>
                <p className="text-sm text-green-800">
                  <strong>Amount:</strong> ₹{paymentDetails.amount}
                </p>
                <p className="text-sm text-green-800">
                  <strong>Service:</strong> {paymentDetails.productinfo}
                </p>
                <p className="text-sm text-green-800">
                  <strong>Status:</strong> {paymentDetails.status}
                </p>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            {submitStatus === 'success' && (
              <p className="text-sm text-gray-600">
                You will receive a confirmation email shortly with your document details.
              </p>
            )}
            
            {submitStatus === 'error' && (
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Note:</strong> Your payment was successful, but we encountered an issue saving your form data. 
                  Please contact our support team with your transaction ID for assistance.
                </p>
              </div>
            )}
            
            <div className="flex flex-col space-y-3">
              <Link
                href="/"
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Home
              </Link>
              
              <Link
                href="/user/profile"
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View My Documents
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}