"use client"
import React from 'react'
import { useFormik } from 'formik'
import { useState } from 'react'
import { useRouter } from 'next/navigation';
import { useChangeStaffPasswordMutation } from '@/lib/services/auth';

const initialValues = {
  password: "",
  password_confirmation: "",
};

const ChangePassword = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [serverErrorMessage, setServerErrorMessage] = useState('');
  const [serverSuccessMessage, setServerSuccessMessage] = useState('');
  const [changePassword] = useChangeStaffPasswordMutation()
  
  const {values,errors, handleChange, handleSubmit} = useFormik({
    initialValues,
    validationSchema: {
      password: {
        required: "Password is required",
        minLength: {
          value: 6,
          message: "Password must be at least 6 characters"
        }
      },
      password_confirmation: {
        required: "Password confirmation is required",
        validate: (value) => {
          if (value !== values.password) {
            return "Passwords do not match";
          }
        }
      }
    },
    onSubmit: async(values, action) => {
      setLoading(true);
      try {
        const response = await changePassword(values);
        if(response.data && response.data.status === 'success'){
         setServerSuccessMessage(response.data.message);
         setServerErrorMessage('')
         action.resetForm();
         setLoading(false);
         // Redirect to profile after successful password change
         setTimeout(() => {
           router.push('/staff/staff-profile');
         }, 2000);
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
        <h2 className='text-2xl font-bold mb-6 text-center'>Change Password</h2>
        <form onSubmit={handleSubmit}>
          <div className='mb-4'>
            <label htmlFor="password" className='block font-medium mb-2'>New Password</label>
            <input 
              type="password" 
              id='password' 
              name='password' 
              value={values.password} 
              onChange={handleChange} 
              className='w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2' 
              placeholder='Enter new password'
            />
            {errors.password && <div className='text-sm text-red-500 px-2'>{errors.password}</div>}

            <label htmlFor="password_confirmation" className='block font-medium mb-2'>Confirm New Password</label>
            <input 
              type="password" 
              id='password_confirmation' 
              name='password_confirmation' 
              value={values.password_confirmation} 
              onChange={handleChange} 
              className='w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2' 
              placeholder='Confirm new password'
            />
            {errors.password_confirmation && <div className='text-sm text-red-500 px-2'>{errors.password_confirmation}</div>}
          </div>
          
          <button 
            type='submit' 
            className='w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2 disabled:bg-gray-400' 
            disabled={loading}
          >
            {loading ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>

        {serverSuccessMessage && <div className='text-lg text-green-500 font-semibold text-center px-2 mt-4'>{serverSuccessMessage}</div>}
        {serverErrorMessage && <div className='text-lg text-red-500 font-semibold text-center px-2 mt-4'>{serverErrorMessage}</div>}
      </div>
    </div>
  )
}

export default ChangePassword;
