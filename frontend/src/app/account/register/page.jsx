"use client"
import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useFormik } from 'formik'
import { useRouter, useSearchParams } from 'next/navigation';
import { useCreateUserMutation } from '@/lib/services/auth';
import { registerSchema } from '@/validations/schemas';

const initialValues = {
  name: "",
  email: "",
  phone: "",
  password: "",
  password_confirmation: "",
  role: "user1"
};

const RegisterContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [serverErrorMessage, setServerErrorMessage] = useState('');
  const [serverSuccessMessage, setServerSuccessMessage] = useState('');
  const [selectedRole, setSelectedRole] = useState('user1');
  
  const [createUser] = useCreateUserMutation();

  // Set role based on URL parameter
  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'agent') {
      setSelectedRole('user2');
    } else {
      setSelectedRole('user1');
    }
  }, [searchParams]);

  const { values, errors, handleChange, handleSubmit } = useFormik({
    initialValues,
    validationSchema: registerSchema,
    onSubmit: async (values, action) => {
      setLoading(true);
      setServerErrorMessage('');
      setServerSuccessMessage('');
      
      try {
        console.log('Submitting registration with data:', { ...values, role: selectedRole });
        console.log('Environment check:', {
          NODE_ENV: process.env.NODE_ENV,
          NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE
        });
        const response = await createUser({ ...values, role: selectedRole });
        console.log('Registration response:', response);
        
        // Handle successful response
        if (response.data && response.data.status === 'success') {
          setServerSuccessMessage(response.data.message);
          setServerErrorMessage('');
          action.resetForm();
          
          // Redirect to appropriate login page based on role
          setTimeout(() => {
            if (selectedRole === 'user2') {
              router.push('/agent/login');
            } else {
              router.push('/user/login');
            }
          }, 2000);
        } 
        // Handle error response
        else if (response.error) {
          console.error('Registration error response:', response.error);
          console.error('Error details:', {
            error: response.error,
            data: response.error.data,
            message: response.error.message,
            status: response.error.status
          });
          
          let errorMessage = 'Registration failed';
          
          if (response.error.data?.message) {
            errorMessage = response.error.data.message;
          } else if (response.error.message) {
            errorMessage = response.error.message;
          } else if (response.error.status === 'FETCH_ERROR') {
            errorMessage = 'Unable to connect to server. Please check if the backend is running.';
          } else if (response.error.status === 'PARSING_ERROR') {
            errorMessage = 'Server returned invalid response.';
          }
          
          setServerErrorMessage(errorMessage);
          setServerSuccessMessage('');
        }
        // Handle unexpected response format
        else {
          console.error('Unexpected response format:', response);
          setServerErrorMessage('Unexpected response from server. Please try again.');
          setServerSuccessMessage('');
        }
      } catch (error) {
        console.error('Registration error:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          data: error.data,
          name: error.name,
          stack: error.stack
        });
        
        // Handle different types of errors
        let errorMessage = 'Registration failed. Please try again.';
        
        if (error.message === 'Failed to fetch') {
          errorMessage = 'Unable to connect to server. Please make sure the backend server is running on port 4000.';
        } else if (error.status === 'FETCH_ERROR') {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (error.status === 'PARSING_ERROR') {
          errorMessage = 'Server returned invalid response. Please try again.';
        } else if (error.data?.message) {
          errorMessage = error.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setServerErrorMessage(errorMessage);
        setServerSuccessMessage('');
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-100'>
      <div className='w-full max-w-md p-8 bg-white rounded-xl shadow-2xl'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Create Account</h1>
          <p className='text-gray-600'>Join us to get started</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className='space-y-4'>
            <div>
              <label htmlFor="name" className='block text-sm font-medium text-gray-700 mb-2'>
                Full Name
              </label>
              <input
                type="text"
                id='name'
                name='name'
                value={values.name}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-colors'
                placeholder='Enter your full name'
              />
              {errors.name && <div className='text-sm text-red-500 mt-1'>{errors.name}</div>}
            </div>

            <div>
              <label htmlFor="email" className='block text-sm font-medium text-gray-700 mb-2'>
                Email Address
              </label>
              <input
                type="email"
                id='email'
                name='email'
                value={values.email}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-colors'
                placeholder='Enter your email'
              />
              {errors.email && <div className='text-sm text-red-500 mt-1'>{errors.email}</div>}
            </div>

            <div>
              <label htmlFor="phone" className='block text-sm font-medium text-gray-700 mb-2'>
                Phone Number <span className="text-gray-500">(Optional)</span>
              </label>
              <input
                type="tel"
                id='phone'
                name='phone'
                value={values.phone}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-colors'
                placeholder='Enter your phone number (optional)'
              />
              {errors.phone && <div className='text-sm text-red-500 mt-1'>{errors.phone}</div>}
            </div>

            {/* Account Type Display */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Account Type
              </label>
              <div className={`p-3 rounded-lg border-2 ${
                selectedRole === 'user1' 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    selectedRole === 'user1' ? 'bg-blue-500' : 'bg-green-500'
                  }`}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {selectedRole === 'user1' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                      )}
                    </svg>
                  </div>
                  <div>
                    <p className={`font-semibold ${
                      selectedRole === 'user1' ? 'text-blue-900' : 'text-green-900'
                    }`}>
                      {selectedRole === 'user1' ? 'Normal User' : 'Agent'}
                    </p>
                    <p className={`text-sm ${
                      selectedRole === 'user1' ? 'text-blue-700' : 'text-green-700'
                    }`}>
                      {selectedRole === 'user1' 
                        ? 'Fill forms, upload documents, and submit applications' 
                        : 'Assist users, verify data, and perform limited actions'}
                    </p>
                  </div>
                </div>
              </div>
            </div>


            <div>
              <label htmlFor="password" className='block text-sm font-medium text-gray-700 mb-2'>
                Password
              </label>
              <input
                type="password"
                id='password'
                name='password'
                value={values.password}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-colors'
                placeholder='Enter your password'
              />
              {errors.password && <div className='text-sm text-red-500 mt-1'>{errors.password}</div>}
            </div>

            <div>
              <label htmlFor="password_confirmation" className='block text-sm font-medium text-gray-700 mb-2'>
                Confirm Password
              </label>
              <input
                type="password"
                id='password_confirmation'
                name='password_confirmation'
                value={values.password_confirmation}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-colors'
                placeholder='Confirm your password'
              />
              {errors.password_confirmation && <div className='text-sm text-red-500 mt-1'>{errors.password_confirmation}</div>}
            </div>
          </div>

          <button
            type='submit'
            className='w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg focus:outline-none focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className='mt-6 text-center'>
          <p className='text-sm text-gray-600'>
            Already have an account?{' '}
            <Link href="/user" className='text-indigo-600 hover:text-indigo-500 font-medium transition-colors'>
              Sign in
            </Link>
          </p>
        </div>

        {/* Success/Error Messages */}
        {serverSuccessMessage && (
          <div className='mt-4 p-3 bg-green-50 border border-green-200 rounded-lg'>
            <p className='text-sm text-green-800'>{serverSuccessMessage}</p>
          </div>
        )}
        
        {serverErrorMessage && (
          <div className='mt-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
            <p className='text-sm text-red-800'>{serverErrorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Register() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
