"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { useFormik } from 'formik'
import { loginSchema } from "@/validations/schemas"
import { useRouter } from 'next/navigation';
import { useLoginStaffMutation } from '@/lib/services/auth';

const initialValues = {
  email: "",
  password: "",
};

const StaffLogin = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [serverErrorMessage, setServerErrorMessage] = useState('');
  const [serverSuccessMessage, setServerSuccessMessage] = useState('');
  const [loginStaff] = useLoginStaffMutation();

  const { values, errors, handleChange, handleSubmit } = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: async (values, action) => {
      setLoading(true);
      try {
        const response = await loginStaff(values);

        if (response.data && response.data.status === 'success') {
          setServerSuccessMessage(response.data.message);
          setServerErrorMessage('');
          action.resetForm();
          setLoading(false);

          // Store user data in localStorage
          if (typeof window !== 'undefined') {
            const user = response.data.user;
            localStorage.setItem('user_name', user.name);
            localStorage.setItem('user_email', user.email);
            localStorage.setItem('user_id', user.id);
            localStorage.setItem('role', user.role);
            
            // Store additional fields if available
            if (user.department) localStorage.setItem('user_department', user.department);
            if (user.employeeId) localStorage.setItem('user_employeeId', user.employeeId);
            if (user.phone) localStorage.setItem('user_phone', user.phone);
          }

          // Redirect based on staff role
          const role = response.data.user.role;
          switch (role) {
            case 'staff1':
              router.push('/staff/dashboard1');
              break;
            case 'staff2':
              router.push('/staff/dashboard2');
              break;
            case 'staff3':
              router.push('/staff/dashboard3');
              break;
            case 'staff4':
              router.push('/staff/dashboard4');
              break;
            case 'staff5':
              router.push('/staff/final-check');
              break;
            case 'admin':
              router.push('/admin/dashboard');
              break;
            default:
              router.push('/staff/dashboard1');
          }
        }

        if (response.error && response.error.data.status === 'failed') {
          setServerErrorMessage(response.error.data.message);
          setServerSuccessMessage('');
          setLoading(false);
        }
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    }
  });

  return (
    <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100'>
      <div className='w-full max-w-md p-8 bg-white rounded-xl shadow-2xl'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Staff Portal</h1>
          <p className='text-gray-600'>Sign in to your staff account</p>
        </div>

        {/* Staff Role Description */}
        <div className='mb-6 p-3 bg-purple-50 rounded-lg'>
          <p className='text-sm text-purple-800'>
            <strong>Staff Access:</strong> For staff members (staff1-5) and administrators to review, verify, and approve forms.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className='space-y-4'>
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
          </div>

          <div className='mt-4'>
            <Link 
              href="/account/staff-reset-password-link" 
              className='text-sm text-indigo-600 hover:text-indigo-500 transition-colors'
            >
              Forgot your password?
            </Link>
          </div>

          <button
            type='submit'
            className='w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg focus:outline-none focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Staff Note */}
        <div className='mt-6 p-3 bg-amber-50 rounded-lg'>
          <p className='text-sm text-amber-800'>
            <strong>Note:</strong> Staff accounts are created by administrators. If you need access, please contact your administrator.
          </p>
        </div>

        {/* Back to User Login */}
        <div className='mt-6 text-center'>
          <p className='text-sm text-gray-600'>
            Need user access?{' '}
            <Link href="/user/login" className='text-indigo-600 hover:text-indigo-500 font-medium transition-colors'>
              User Login
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

export default StaffLogin;
