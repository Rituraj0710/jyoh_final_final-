"use client"
import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const UserSelectionContent = () => {
  const searchParams = useSearchParams();
  const action = searchParams.get('action') || 'login'; // Default to login

  const getTitle = () => {
    return action === 'signup' ? 'Choose Account Type' : 'Choose Login Type';
  };

  const getSubtitle = () => {
    return action === 'signup' 
      ? 'Select your account type to create an account' 
      : 'Select your account type to continue';
  };

  const getButtonText = () => {
    return action === 'signup' ? 'Create Account' : 'Login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{getTitle()}</h1>
          <p className="text-gray-600">{getSubtitle()}</p>
        </div>

        <div className="space-y-4">
          {/* User Button */}
          <Link href={action === 'signup' ? '/account/register?type=user' : '/user/login'}>
            <div className="w-full p-6 bg-blue-50 rounded-lg border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-100 transition-all duration-200 cursor-pointer group">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-blue-900">Normal User</h3>
                  <p className="text-blue-700 text-sm">
                    {action === 'signup' ? 'Create a personal account' : 'Access your personal account'}
                  </p>
                </div>
                <svg className="w-5 h-5 text-blue-500 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Agent Button */}
          <Link href={action === 'signup' ? '/agent/register' : '/agent/login'}>
            <div className="w-full p-6 bg-green-50 rounded-lg border-2 border-green-200 hover:border-green-400 hover:bg-green-100 transition-all duration-200 cursor-pointer group">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center group-hover:bg-green-600 transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-green-900">Agent</h3>
                  <p className="text-green-700 text-sm">
                    {action === 'signup' ? 'Create an agent account' : 'Access your agent account'}
                  </p>
                </div>
                <svg className="w-5 h-5 text-green-500 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-gray-600 hover:text-gray-800 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function UserSelection() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-2xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <UserSelectionContent />
    </Suspense>
  );
}