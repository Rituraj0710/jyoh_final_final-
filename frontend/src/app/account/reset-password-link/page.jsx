"use client"
import React from 'react'
import Link from 'next/link'
import { useFormik } from 'formik'
import {resetPasswordLinkSchema} from "@/validations/schemas"
import { useResetPasswordLinkMutation } from '@/lib/services/auth';
import { useState } from 'react'
const initialValues = {
  email: "",
}
const ResetPasswordLink = () => {
    const [loading, setLoading] = useState(false);
    const [serverErrorMessage, setServerErrorMessage] = useState('');
    const [serverSuccessMessage, setServerSuccessMessage] = useState('');
    const [resetPasswordLink] = useResetPasswordLinkMutation()
  
   const {values,errors, handleChange, handleSubmit} = useFormik({
      initialValues,
      validationSchema: resetPasswordLinkSchema,
      onSubmit: async(values, action) => {
        setLoading(true);
        try {
          // console.log(values);
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
<div className='flex items-center justify-center h-screen bg-gray-100'>
      <div className='w-full max-w-md p-8 bg-white rounded-lg shadow-lg'>
        <h2 className='text-2xl font-bold mb-6 text-center'>Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <div className='mb-4'>

            <label htmlFor="email" className='block font-medium mb-2'>Email</label>
            <input type="email" id='email' name='email' value={values.email} onChange={handleChange} className='w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2' placeholder='Enter your Email'/>
            {errors.email && <div className='text-sm text-red-500 px-2'>{errors.email}</div>}

          </div>
         
          <button type='submit' className='w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2 disabled:bg-gray-400' disabled={loading}>
            {loading ? "Sending email..." : "Send"}
          </button>
        </form>

        <p className='text-sm text-gray-600 p-1'>Don't have an account? <Link href="/account/user-register" className='text-indigo-500 hover:text-indigo-600 transition duration-300 ease-in-out '>Create your account</Link> </p>
        {serverSuccessMessage && <div className='text-lg text-green-500 font-semibold text-center px-2'>{serverSuccessMessage}</div>}
        {serverErrorMessage && <div className='text-lg text-red-500 font-semibold text-center px-2'>{serverErrorMessage}</div>}

      </div>
    </div>  )
}

export default ResetPasswordLink;