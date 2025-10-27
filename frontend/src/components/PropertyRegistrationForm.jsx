'use client';

import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';

const PropertyRegistrationForm = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // Initial form values
  const initialValues = {
    seller_name: '',
    seller_father_name: '',
    seller_address: '',
    seller_aadhaar: '',
    seller_mobile: '',
    buyer_name: '',
    buyer_father_name: '',
    buyer_address: '',
    buyer_aadhaar: '',
    buyer_mobile: '',
    property_address: '',
    property_type: '',
    area_sqm: '',
    sale_price: '',
    registration_date: '',
  };

  // Validation schema
  const validationSchema = Yup.object().shape({
    seller_name: Yup.string().required('विक्रेता का नाम आवश्यक है।'),
    seller_father_name: Yup.string().required('विक्रेता के पिता/पति का नाम आवश्यक है।'),
    seller_address: Yup.string().required('विक्रेता का पता आवश्यक है।'),
    seller_aadhaar: Yup.string()
      .required('विक्रेता का आधार नंबर आवश्यक है।')
      .matches(/^[0-9]{12}$/, 'आधार नंबर 12 अंकों का होना चाहिए।'),
    seller_mobile: Yup.string()
      .required('विक्रेता का मोबाइल नंबर आवश्यक है।')
      .matches(/^[0-9]{10}$/, 'मोबाइल नंबर 10 अंकों का होना चाहिए।'),
    buyer_name: Yup.string().required('खरीदार का नाम आवश्यक है।'),
    buyer_father_name: Yup.string().required('खरीदार के पिता/पति का नाम आवश्यक है।'),
    buyer_address: Yup.string().required('खरीदार का पता आवश्यक है।'),
    buyer_aadhaar: Yup.string()
      .required('खरीदार का आधार नंबर आवश्यक है।')
      .matches(/^[0-9]{12}$/, 'आधार नंबर 12 अंकों का होना चाहिए।'),
    buyer_mobile: Yup.string()
      .required('खरीदार का मोबाइल नंबर आवश्यक है।')
      .matches(/^[0-9]{10}$/, 'मोबाइल नंबर 10 अंकों का होना चाहिए।'),
    property_address: Yup.string().required('संपत्ति का पता आवश्यक है।'),
    property_type: Yup.string().required('संपत्ति का प्रकार आवश्यक है।'),
    area_sqm: Yup.number()
      .required('क्षेत्रफल आवश्यक है।')
      .positive('क्षेत्रफल सकारात्मक होना चाहिए।'),
    sale_price: Yup.number()
      .required('बिक्री मूल्य आवश्यक है।')
      .positive('बिक्री मूल्य सकारात्मक होना चाहिए।'),
    registration_date: Yup.date()
      .required('पंजीकरण तिथि आवश्यक है।')
      .max(new Date(), 'पंजीकरण तिथि भविष्य में नहीं हो सकती।'),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setIsSubmitting(true);
    setSubmitStatus('submitting');

    try {
      const response = await fetch('/api/property-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('संपत्ति पंजीकरण सफलतापूर्वक जमा हो गया!');
        setSubmitStatus('success');
        resetForm();
        // Redirect to success page or dashboard
        router.push('/user');
      } else {
        const error = await response.json();
        toast.error(error.message || 'पंजीकरण में त्रुटि हुई।');
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('नेटवर्क त्रुटि। कृपया पुनः प्रयास करें।');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">संपत्ति पंजीकरण फॉर्म (Property Registration Form)</h1>
              <p className="text-sm text-gray-600 mt-1">Complete property registration documentation for Uttar Pradesh property transactions.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button 
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                disabled={isSubmitting}
                form="property-registration-form"
              >
                {isSubmitting ? '⏳ Submitting...' : '✅ Submit Form'}
              </button>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form id="property-registration-form" className="space-y-6">
                {/* Seller Information */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    विक्रेता की जानकारी (Seller Information)
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        नाम <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="text"
                        name="seller_name"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="विक्रेता का नाम"
                      />
                      <ErrorMessage name="seller_name" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        पिता/पति का नाम <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="text"
                        name="seller_father_name"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="पिता/पति का नाम"
                      />
                      <ErrorMessage name="seller_father_name" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        आधार नंबर <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="text"
                        name="seller_aadhaar"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="12 अंकों का आधार नंबर"
                      />
                      <ErrorMessage name="seller_aadhaar" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        मोबाइल नंबर <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="text"
                        name="seller_mobile"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="10 अंकों का मोबाइल नंबर"
                      />
                      <ErrorMessage name="seller_mobile" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        पता <span className="text-red-500">*</span>
                      </label>
                      <Field
                        as="textarea"
                        name="seller_address"
                        rows="3"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="विक्रेता का पूरा पता"
                      />
                      <ErrorMessage name="seller_address" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  </div>
                </div>

                {/* Buyer Information */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    खरीदार की जानकारी (Buyer Information)
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        नाम <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="text"
                        name="buyer_name"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="खरीदार का नाम"
                      />
                      <ErrorMessage name="buyer_name" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        पिता/पति का नाम <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="text"
                        name="buyer_father_name"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="पिता/पति का नाम"
                      />
                      <ErrorMessage name="buyer_father_name" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        आधार नंबर <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="text"
                        name="buyer_aadhaar"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="12 अंकों का आधार नंबर"
                      />
                      <ErrorMessage name="buyer_aadhaar" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        मोबाइल नंबर <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="text"
                        name="buyer_mobile"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="10 अंकों का मोबाइल नंबर"
                      />
                      <ErrorMessage name="buyer_mobile" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        पता <span className="text-red-500">*</span>
                      </label>
                      <Field
                        as="textarea"
                        name="buyer_address"
                        rows="3"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="खरीदार का पूरा पता"
                      />
                      <ErrorMessage name="buyer_address" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  </div>
                </div>

                {/* Property Information */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    संपत्ति की जानकारी (Property Information)
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        संपत्ति का प्रकार <span className="text-red-500">*</span>
                      </label>
                      <Field
                        as="select"
                        name="property_type"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">चुनें</option>
                        <option value="residential">आवासीय (Residential)</option>
                        <option value="commercial">व्यावसायिक (Commercial)</option>
                        <option value="agricultural">कृषि (Agricultural)</option>
                        <option value="industrial">औद्योगिक (Industrial)</option>
                      </Field>
                      <ErrorMessage name="property_type" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        क्षेत्रफल (वर्ग मीटर) <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="number"
                        name="area_sqm"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="क्षेत्रफल"
                      />
                      <ErrorMessage name="area_sqm" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        बिक्री मूल्य (₹) <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="number"
                        name="sale_price"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="बिक्री मूल्य"
                      />
                      <ErrorMessage name="sale_price" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        पंजीकरण तिथि <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="date"
                        name="registration_date"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <ErrorMessage name="registration_date" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        संपत्ति का पता <span className="text-red-500">*</span>
                      </label>
                      <Field
                        as="textarea"
                        name="property_address"
                        rows="3"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="संपत्ति का पूरा पता"
                      />
                      <ErrorMessage name="property_address" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'जमा हो रहा है...' : 'संपत्ति पंजीकरण जमा करें'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
};

export default PropertyRegistrationForm;