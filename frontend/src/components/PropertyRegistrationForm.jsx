'use client';

import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import { FormWorkflowProvider, useFormWorkflow } from './FormWorkflow/FormWorkflowProvider';
import FormWorkflow from './FormWorkflow/FormWorkflow';

const PropertyRegistrationFormContent = () => {
  const router = useRouter();
  const { goToPreview } = useFormWorkflow();
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
    // Instead of submitting directly, go to preview
    const dataToSave = {
      ...values,
      amount: 2000,
      formType: 'property-registration'
    };
    
    goToPreview(dataToSave);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full px-2 sm:px-4 lg:px-6 py-3">
      <div className="w-full">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 sm:gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">संपत्ति पंजीकरण फॉर्म (Property Registration Form)</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">Complete property registration documentation for Uttar Pradesh property transactions.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button 
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-50"
                disabled={isSubmitting}
                form="property-registration-form"
              >
                {isSubmitting ? '⏳ Submitting...' : '✅ Submit Form'}
              </button>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form id="property-registration-form" className="space-y-3">
                {/* Seller Information */}
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200">
                  <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3 pb-1.5 border-b border-gray-200">
                    विक्रेता की जानकारी (Seller Information)
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        नाम <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="text"
                        name="seller_name"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="विक्रेता का नाम"
                      />
                      <ErrorMessage name="seller_name" component="div" className="text-red-500 text-xs mt-0.5" />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        पिता/पति का नाम <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="text"
                        name="seller_father_name"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="पिता/पति का नाम"
                      />
                      <ErrorMessage name="seller_father_name" component="div" className="text-red-500 text-xs mt-0.5" />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        आधार नंबर <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="text"
                        name="seller_aadhaar"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="12 अंकों का आधार नंबर"
                      />
                      <ErrorMessage name="seller_aadhaar" component="div" className="text-red-500 text-xs mt-0.5" />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        मोबाइल नंबर <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="text"
                        name="seller_mobile"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="10 अंकों का मोबाइल नंबर"
                      />
                      <ErrorMessage name="seller_mobile" component="div" className="text-red-500 text-xs mt-0.5" />
                    </div>

                    <div className="col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-5 xl:col-span-6">
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        पता <span className="text-red-500">*</span>
                      </label>
                      <Field
                        as="textarea"
                        name="seller_address"
                        rows="2"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="विक्रेता का पूरा पता"
                      />
                      <ErrorMessage name="seller_address" component="div" className="text-red-500 text-xs mt-0.5" />
                    </div>
                  </div>
                </div>

                {/* Buyer Information */}
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200">
                  <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3 pb-1.5 border-b border-gray-200">
                    खरीदार की जानकारी (Buyer Information)
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        नाम <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="text"
                        name="buyer_name"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="खरीदार का नाम"
                      />
                      <ErrorMessage name="buyer_name" component="div" className="text-red-500 text-xs mt-0.5" />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        पिता/पति का नाम <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="text"
                        name="buyer_father_name"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="पिता/पति का नाम"
                      />
                      <ErrorMessage name="buyer_father_name" component="div" className="text-red-500 text-xs mt-0.5" />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        आधार नंबर <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="text"
                        name="buyer_aadhaar"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="12 अंकों का आधार नंबर"
                      />
                      <ErrorMessage name="buyer_aadhaar" component="div" className="text-red-500 text-xs mt-0.5" />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        मोबाइल नंबर <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="text"
                        name="buyer_mobile"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="10 अंकों का मोबाइल नंबर"
                      />
                      <ErrorMessage name="buyer_mobile" component="div" className="text-red-500 text-xs mt-0.5" />
                    </div>

                    <div className="col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-5 xl:col-span-6">
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        पता <span className="text-red-500">*</span>
                      </label>
                      <Field
                        as="textarea"
                        name="buyer_address"
                        rows="2"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="खरीदार का पूरा पता"
                      />
                      <ErrorMessage name="buyer_address" component="div" className="text-red-500 text-xs mt-0.5" />
                    </div>
                  </div>
                </div>

                {/* Property Information */}
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200">
                  <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3 pb-1.5 border-b border-gray-200">
                    संपत्ति की जानकारी (Property Information)
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        संपत्ति का प्रकार <span className="text-red-500">*</span>
                      </label>
                      <Field
                        as="select"
                        name="property_type"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">चुनें</option>
                        <option value="residential">आवासीय (Residential)</option>
                        <option value="commercial">व्यावसायिक (Commercial)</option>
                        <option value="agricultural">कृषि (Agricultural)</option>
                        <option value="industrial">औद्योगिक (Industrial)</option>
                      </Field>
                      <ErrorMessage name="property_type" component="div" className="text-red-500 text-xs mt-0.5" />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        क्षेत्रफल (वर्ग मीटर) <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="number"
                        name="area_sqm"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="क्षेत्रफल"
                      />
                      <ErrorMessage name="area_sqm" component="div" className="text-red-500 text-xs mt-0.5" />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        बिक्री मूल्य (₹) <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="number"
                        name="sale_price"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="बिक्री मूल्य"
                      />
                      <ErrorMessage name="sale_price" component="div" className="text-red-500 text-xs mt-0.5" />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        पंजीकरण तिथि <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="date"
                        name="registration_date"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <ErrorMessage name="registration_date" component="div" className="text-red-500 text-xs mt-0.5" />
                    </div>

                    <div className="col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-5 xl:col-span-6">
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        संपत्ति का पता <span className="text-red-500">*</span>
                      </label>
                      <Field
                        as="textarea"
                        name="property_address"
                        rows="2"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="संपत्ति का पूरा पता"
                      />
                      <ErrorMessage name="property_address" component="div" className="text-red-500 text-xs mt-1" />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

const PropertyRegistrationForm = () => {
  return (
    <FormWorkflowProvider formType="property-registration">
      <FormWorkflow 
        formTitle="Property Registration"
        formType="property-registration"
        fields={[
          { name: 'seller_name', label: 'Seller Name' },
          { name: 'buyer_name', label: 'Buyer Name' },
          { name: 'property_address', label: 'Property Address' },
          { name: 'sale_price', label: 'Sale Price' },
        ]}
      >
        <PropertyRegistrationFormContent />
      </FormWorkflow>
    </FormWorkflowProvider>
  );
};

export default PropertyRegistrationForm;