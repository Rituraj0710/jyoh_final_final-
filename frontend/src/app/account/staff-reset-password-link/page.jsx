"use client"
import React from 'react'
import { useFormik } from 'formik'
import { useState } from 'react'
import { useRouter } from 'next/navigation';
import { useResetStaffPasswordLinkMutation } from '@/lib/services/auth';

const initialValues = {
  email: "",
};

const StaffResetPasswordLink = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [serverErrorMessage, setServerErrorMessage] = useState('');
  const [serverSuccessMessage, setServerSuccessMessage] = useState('');
  const [resetPasswordLink] = useResetStaffPasswordLinkMutation()
  
  const {values,errors, handleChange, handleSubmit} = useFormik({
    initialValues,
    validationSchema: {
      email: {
        required: "Email is required",
        email: "Please enter a valid email"
      }
    },
    onSubmit: async(values, action) => {
      setLoading(true);
      try {
        const response = await resetPasswordLink(values);
        if(response.data && response.data.status === 'success'){
         setServerSuccessMessage(response.data.message);
         setServerErrorMessage('')
         action.resetForm();
         setLoading(false);
        }
        if(response.error && response.error.data.status === 'failed'){
         setServerErrorMessage(response.error.data.message);
         setServerSuccessMessage('')
         setLoading(false);
        }
      } catch (error) {
       console.log(error);
       setLoading(false);
      }
    }
  })
  
  return (
    <div className='flex items-center justify-center h-screen bg-slate-400'>
      <div className='w-full max-w-md p-8 bg-white rounded-lg shadow-lg'>
        <h2 className='text-2xl font-bold mb-6 text-center'>Reset Password</h2>
        <p className='text-sm text-gray-600 mb-6 text-center'>
          Enter your email address and we'll send you a link to reset your password.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className='mb-4'>
            <label htmlFor="email" className='block font-medium mb-2'>Email</label>
            <input 
              type="email" 
              id='email' 
              name='email' 
              value={values.email} 
              onChange={handleChange} 
              className='w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2' 
              placeholder='Enter your email'
            />
            {errors.email && <div className='text-sm text-red-500 px-2'>{errors.email}</div>}
          </div>
          
          <button 
            type='submit' 
            className='w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2 disabled:bg-gray-400' 
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className='mt-6 text-center'>
          <p className='text-sm text-gray-600'>
            Remember your password? 
            <a href="/account/staff-login" className='text-indigo-500 hover:text-indigo-600 transition duration-300 ease-in-out ml-1'>
              Back to Login
            </a>
          </p>
        </div>

        {serverSuccessMessage && <div className='text-lg text-green-500 font-semibold text-center px-2 mt-4'>{serverSuccessMessage}</div>}
        {serverErrorMessage && <div className='text-lg text-red-500 font-semibold text-center px-2 mt-4'>{serverErrorMessage}</div>}
      </div>
    </div>
  )
}

export default StaffResetPasswordLink;
