"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { useFormik } from 'formik'
import { loginSchema } from "@/validations/schemas"
import { useRouter } from 'next/navigation';
import { getApiBaseUrl } from '@/lib/utils/env';

const initialValues = {
  email: "",
  password: "",
};

const AgentLogin = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [serverErrorMessage, setServerErrorMessage] = useState('');
  const [serverSuccessMessage, setServerSuccessMessage] = useState('');

  // Login form
  const { values, errors, handleChange, handleSubmit } = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: async (values, action) => {
      setLoading(true);
      setServerErrorMessage('');
      setServerSuccessMessage('');
      
      try {
        const API_BASE = getApiBaseUrl();
        const response = await fetch(`${API_BASE}/api/otp-auth/agent/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: values.email.toLowerCase().trim(),
            password: values.password,
          }),
        });

        const data = await response.json();
        
        if (response.ok && data.status === 'success') {
          // Store token and user info in localStorage
          localStorage.setItem('access_token', data.token);
          localStorage.setItem('role', data.user.role);
          localStorage.setItem('user_name', data.user.name);
          localStorage.setItem('user_email', data.user.email);
          localStorage.setItem('user_id', data.user.id);
          localStorage.setItem('is_auth', 'true');
          
          setServerSuccessMessage('Login successful! Redirecting to your dashboard...');

          // Redirect to Agent Dashboard
          router.replace('/agent/dashboard');
        } else {
          setServerErrorMessage(data.message || 'Login failed. Please check your credentials.');
        }
      } catch (error) {
        console.error('Agent login error:', error);
        setServerErrorMessage('Network error. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    },
  });


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Agent Login</h1>
          <p className="text-gray-600">Enter your credentials to continue</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {serverErrorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {serverErrorMessage}
            </div>
          )}
          
          {serverSuccessMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {serverSuccessMessage}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your email"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your password"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Signing In...' : 'Login'}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an agent account?{" "}
              <Link
                href="/agent/register"
                className="font-medium text-green-600 hover:text-green-500"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </form>

        <div className="mt-6 text-center">
          <Link href="/user" className="text-gray-600 hover:text-gray-800 transition-colors">
            ← Back to User Selection
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AgentLogin;
