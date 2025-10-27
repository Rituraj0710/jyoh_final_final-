"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function PaymentFailureContent() {
  const searchParams = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    // Get payment details from URL parameters
    const txnid = searchParams.get('txnid');
    const amount = searchParams.get('amount');
    const status = searchParams.get('status');
    const productinfo = searchParams.get('productinfo');
    const error = searchParams.get('error');

    setPaymentDetails({
      txnid,
      amount,
      status,
      productinfo,
      error
    });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Failed
            </h2>
            <p className="text-gray-600">
              There was an error processing your payment.
            </p>
          </div>
          
          {paymentDetails && (
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Transaction ID:</strong> {paymentDetails.txnid}
                </p>
                <p className="text-sm text-red-800">
                  <strong>Amount:</strong> ₹{paymentDetails.amount}
                </p>
                <p className="text-sm text-red-800">
                  <strong>Service:</strong> {paymentDetails.productinfo}
                </p>
                <p className="text-sm text-red-800">
                  <strong>Status:</strong> {paymentDetails.status}
                </p>
                {paymentDetails.error && (
                  <p className="text-sm text-red-800">
                    <strong>Error:</strong> {paymentDetails.error}
                  </p>
                )}
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Don't worry, your form data is safe. You can try the payment again or contact support.
            </p>
            
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => window.history.back()}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Payment Again
              </button>
              
              <Link
                href="/contact"
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Contact Support
              </Link>
              
              <Link
                href="/"
                className="w-full px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailure() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    }>
      <PaymentFailureContent />
    </Suspense>
  );
}