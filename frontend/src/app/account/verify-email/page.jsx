"use client"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useFormik } from "formik"
import {verifyEmailSchema} from "@/validations/schemas"
import { useVerifyEmailMutation } from "@/lib/services/auth";
const initialValues = {
  email: "",
  otp: "",
}

const verifyEmail = () => {

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [serverErrorMessage, setServerErrorMessage] = useState('');
  const [serverSuccessMessage, setServerSuccessMessage] = useState('');
  const [verifyEmail] = useVerifyEmailMutation();

  const {values, errors, handleChange, handleSubmit} = useFormik({
    initialValues,
    validationSchema: verifyEmailSchema,
    onSubmit: async (values, action) => {
      // console.log(values);
      setLoading(true);
      try {
        // console.log(values);
        const response = await verifyEmail(values);
        if(response.data && response.data.status === 'success'){
         setServerSuccessMessage(response.data.message);
         setServerErrorMessage('')
         action.resetForm();
         setLoading(false);
         router.push('/account/user-login')
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
        <h2 className='text-2xl font-bold mb-6 text-center'>Verify your account</h2>
        <p className="text-sm text-center mb-6 text-gray-400">Check your email for OTP. OTP is valid for 15 minutes.</p>
        {loading && <div className='text-lg text-green-500 font-semibold text-center px-2'>Verifying your email please wait...</div>}
        <form onSubmit={handleSubmit}>
          <div className='mb-4'>

            <label htmlFor="email" className='block font-medium mb-2'>Email</label>
            <input type="email" id='email' name='email' value={values.email} onChange={handleChange} className='w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2' placeholder='Enter your Email'/>
            {errors.email && <div className='text-sm text-red-500 px-2'>{errors.email}</div>}

            <label htmlFor="otp" className='block font-medium mb-2'>OTP</label>
            <input type="otp" id='otp' name='otp' value={values.otp} onChange={handleChange} className='w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2' placeholder='Enter your Password'/>
            {errors.password && <div className='text-sm text-red-500 px-2'>{errors.password}</div>}

          </div>
          
          <button type='submit' className='w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2 disabled:bg-gray-400' disabled={loading}>
            Verify
          </button>
        </form>

        <p className='text-sm text-gray-600 p-1'>Already an User? <Link href="/account/user-login" className='text-indigo-500 hover:text-indigo-600 transition duration-300 ease-in-out '>Login</Link> </p>
        {serverSuccessMessage && <div className='text-lg text-green-500 font-semibold text-center px-2'>{serverSuccessMessage}</div>}
        {serverErrorMessage && <div className='text-lg text-red-500 font-semibold text-center px-2'>{serverErrorMessage}</div>}

      </div>
    </div>  
  )
}

export default verifyEmail;