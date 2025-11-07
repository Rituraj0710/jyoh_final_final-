'use client';

import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import { FormWorkflowProvider, useFormWorkflow } from './FormWorkflow/FormWorkflowProvider';
import FormWorkflow from './FormWorkflow/FormWorkflow';

const PropertySaleCertificateFormContent = () => {
  const router = useRouter();
  const { goToPreview } = useFormWorkflow();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initial form values
  const initialValues = {
    // Bank Information
    bank_name: '',
    bank_pan: '',
    bank_reg_office: '',
    bank_head_office: '',

    // Bank Representative Information
    bank_rep_title: 'श्री',
    bank_rep_name: '',
    bank_rep_relation: 'पुत्र',
    bank_rep_father_name: '',
    bank_rep_occupation: '',
    bank_rep_mobile: '',
    bank_rep_email: '',
    bank_rep_address: '',

    // Property Information
    property_address: '',
    property_type: '',
    property_area: '',
    property_unit: 'sq_meters',
    property_value: '',

    // Sale Information
    sale_amount: '',
    sale_amount_words: '',
    sale_date: '',
    sale_mode: '',

    // Purchaser Information
    purchaser_name: '',
    purchaser_father_name: '',
    purchaser_address: '',
    purchaser_mobile: '',
    purchaser_aadhaar: '',
    purchaser_pan: '',

    // Witness Information
    witness1_name: '',
    witness1_father_name: '',
    witness1_address: '',
    witness1_mobile: '',
    witness2_name: '',
    witness2_father_name: '',
    witness2_address: '',
    witness2_mobile: '',
  };

  // Validation schema
  const validationSchema = Yup.object().shape({
    bank_name: Yup.string().required('बैंक का नाम आवश्यक है।'),
    bank_pan: Yup.string()
      .required('बैंक का PAN नंबर आवश्यक है।')
      .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'PAN नंबर सही प्रारूप में होना चाहिए।'),
    bank_rep_name: Yup.string().required('बैंक प्रतिनिधि का नाम आवश्यक है।'),
    bank_rep_father_name: Yup.string().required('बैंक प्रतिनिधि के पिता का नाम आवश्यक है।'),
    bank_rep_mobile: Yup.string()
      .required('बैंक प्रतिनिधि का मोबाइल नंबर आवश्यक है।')
      .matches(/^[0-9]{10}$/, 'मोबाइल नंबर 10 अंकों का होना चाहिए।'),
    bank_rep_email: Yup.string()
      .email('सही ईमेल पता दर्ज करें।')
      .required('बैंक प्रतिनिधि का ईमेल आवश्यक है।'),
    bank_rep_address: Yup.string().required('बैंक प्रतिनिधि का पता आवश्यक है।'),
    property_address: Yup.string().required('संपत्ति का पता आवश्यक है।'),
    property_type: Yup.string().required('संपत्ति का प्रकार आवश्यक है।'),
    property_area: Yup.number()
      .required('संपत्ति का क्षेत्रफल आवश्यक है।')
      .positive('क्षेत्रफल सकारात्मक होना चाहिए।'),
    property_value: Yup.number()
      .required('संपत्ति का मूल्य आवश्यक है।')
      .positive('मूल्य सकारात्मक होना चाहिए।'),
    sale_amount: Yup.number()
      .required('बिक्री राशि आवश्यक है।')
      .positive('बिक्री राशि सकारात्मक होना चाहिए।'),
    sale_amount_words: Yup.string().required('बिक्री राशि शब्दों में आवश्यक है।'),
    sale_date: Yup.date()
      .required('बिक्री तिथि आवश्यक है।')
      .max(new Date(), 'बिक्री तिथि भविष्य में नहीं हो सकती।'),
    purchaser_name: Yup.string().required('खरीदार का नाम आवश्यक है।'),
    purchaser_father_name: Yup.string().required('खरीदार के पिता का नाम आवश्यक है।'),
    purchaser_address: Yup.string().required('खरीदार का पता आवश्यक है।'),
    purchaser_mobile: Yup.string()
      .required('खरीदार का मोबाइल नंबर आवश्यक है।')
      .matches(/^[0-9]{10}$/, 'मोबाइल नंबर 10 अंकों का होना चाहिए।'),
    purchaser_aadhaar: Yup.string()
      .required('खरीदार का आधार नंबर आवश्यक है।')
      .matches(/^[0-9]{12}$/, 'आधार नंबर 12 अंकों का होना चाहिए।'),
    witness1_name: Yup.string().required('पहले गवाह का नाम आवश्यक है।'),
    witness1_father_name: Yup.string().required('पहले गवाह के पिता का नाम आवश्यक है।'),
    witness1_address: Yup.string().required('पहले गवाह का पता आवश्यक है।'),
    witness1_mobile: Yup.string()
      .required('पहले गवाह का मोबाइल नंबर आवश्यक है।')
      .matches(/^[0-9]{10}$/, 'मोबाइल नंबर 10 अंकों का होना चाहिए।'),
    witness2_name: Yup.string().required('दूसरे गवाह का नाम आवश्यक है।'),
    witness2_father_name: Yup.string().required('दूसरे गवाह के पिता का नाम आवश्यक है।'),
    witness2_address: Yup.string().required('दूसरे गवाह का पता आवश्यक है।'),
    witness2_mobile: Yup.string()
      .required('दूसरे गवाह का मोबाइल नंबर आवश्यक है।')
      .matches(/^[0-9]{10}$/, 'मोबाइल नंबर 10 अंकों का होना चाहिए।'),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    // Instead of submitting directly, go to preview
    const dataToSave = {
      ...values,
      amount: 1500,
      formType: 'property-sale-certificate'
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
              <h1 className="text-2xl font-bold text-gray-900">संपत्ति बिक्री प्रमाणपत्र (Property Sale Certificate)</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">Complete property sale certificate documentation for bank property transactions.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button 
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-50"
                disabled={isSubmitting}
                form="property-sale-certificate-form"
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
              <Form id="property-sale-certificate-form" className="space-y-3">
                {/* Bank Information */}
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200">
                  <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3 pb-1.5 border-b border-gray-200">
                    बैंक की जानकारी (Bank Information)
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-2 sm:gap-3">
  <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        बैंक का नाम <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="text"
                        name="bank_name"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="बैंक नाम"
                      />
                      <ErrorMessage name="bank_name" component="div" className="text-red-500 text-xs mt-0.5" />
  </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        PAN नंबर <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="text"
                        name="bank_pan"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="PAN"
                      />
                      <ErrorMessage name="bank_pan" component="div" className="text-red-500 text-sm mt-1" />
      </div>

                    <div className="col-span-2 sm:col-span-4 md:col-span-5 lg:col-span-6 xl:col-span-8 2xl:col-span-10">
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        पंजीकृत कार्यालय <span className="text-red-500">*</span>
                      </label>
                      <Field
                        as="textarea"
                        name="bank_reg_office"
                        rows="1"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="पंजीकृत कार्यालय"
                      />
                      <ErrorMessage name="bank_reg_office" component="div" className="text-red-500 text-sm mt-1" />
        </div>

                    <div className="col-span-2 sm:col-span-4 md:col-span-5 lg:col-span-6 xl:col-span-8 2xl:col-span-10">
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        मुख्य कार्यालय <span className="text-red-500">*</span>
                      </label>
                      <Field
                        as="textarea"
                        name="bank_head_office"
                        rows="1"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="मुख्य कार्यालय"
                      />
                      <ErrorMessage name="bank_head_office" component="div" className="text-red-500 text-sm mt-1" />
        </div>
        </div>
      </div>

                {/* Bank Representative Information */}
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200">
                  <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3 pb-1.5 border-b border-gray-200">
                    बैंक प्रतिनिधि की जानकारी (Bank Representative Information)
        </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-2 sm:gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        शीर्षक
                      </label>
                      <Field
            as="select"
                        name="bank_rep_title"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="श्री">श्री</option>
                        <option value="श्रीमती">श्रीमती</option>
                        <option value="कुमारी">कुमारी</option>
                      </Field>
        </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        नाम <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="text"
                        name="bank_rep_name"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="प्रतिनिधि नाम"
                      />
                      <ErrorMessage name="bank_rep_name" component="div" className="text-red-500 text-sm mt-1" />
        </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        संबंध
                      </label>
                      <Field
                        as="select"
                        name="bank_rep_relation"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="पुत्र">पुत्र</option>
                        <option value="पुत्री">पुत्री</option>
                        <option value="पत्नी">पत्नी</option>
                        <option value="पति">पति</option>
                      </Field>
        </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        पिता का नाम <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="text"
                        name="bank_rep_father_name"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="पिता/पति"
                      />
                      <ErrorMessage name="bank_rep_father_name" component="div" className="text-red-500 text-sm mt-1" />
            </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        व्यवसाय
                      </label>
                      <Field
                        type="text"
                        name="bank_rep_occupation"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="व्यवसाय"
                      />
            </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        मोबाइल नंबर <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="text"
                        name="bank_rep_mobile"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="मोबाइल"
                      />
                      <ErrorMessage name="bank_rep_mobile" component="div" className="text-red-500 text-sm mt-1" />
          </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        ईमेल <span className="text-red-500">*</span>
            </label>
                      <Field
                        type="email"
                        name="bank_rep_email"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="ईमेल"
                      />
                      <ErrorMessage name="bank_rep_email" component="div" className="text-red-500 text-sm mt-1" />
        </div>

                    <div className="col-span-2 sm:col-span-4 md:col-span-5 lg:col-span-6 xl:col-span-8 2xl:col-span-10">
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        पता <span className="text-red-500">*</span>
                      </label>
                      <Field
                        as="textarea"
                        name="bank_rep_address"
                        rows="3"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="पता"
                      />
                      <ErrorMessage name="bank_rep_address" component="div" className="text-red-500 text-sm mt-1" />
          </div>
        </div>
      </div>

                {/* Property Information */}
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200">
                  <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3 pb-1.5 border-b border-gray-200">
                    संपत्ति की जानकारी (Property Information)
        </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-2 sm:gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        संपत्ति का प्रकार <span className="text-red-500">*</span>
                      </label>
                      <Field
                        as="select"
                        name="property_type"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        क्षेत्रफल <span className="text-red-500">*</span>
                      </label>
                      <Field
            type="number"
                        name="property_area"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="क्षेत्रफल"
                      />
                      <ErrorMessage name="property_area" component="div" className="text-red-500 text-sm mt-1" />
      </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        इकाई
                      </label>
                      <Field
            as="select"
                        name="property_unit"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="sq_meters">वर्ग मीटर</option>
                        <option value="sq_feet">वर्ग फीट</option>
                        <option value="sq_yards">वर्ग गज</option>
                        <option value="acre">एकड़</option>
                      </Field>
                    </div>

          <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        संपत्ति का मूल्य (₹) <span className="text-red-500">*</span>
                </label>
                      <Field
                        type="number"
                        name="property_value"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="मूल्य"
                      />
                      <ErrorMessage name="property_value" component="div" className="text-red-500 text-sm mt-1" />
            </div>

                    <div className="col-span-2 sm:col-span-4 md:col-span-5 lg:col-span-6 xl:col-span-8 2xl:col-span-10">
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        संपत्ति का पता <span className="text-red-500">*</span>
                      </label>
                      <Field
                        as="textarea"
                        name="property_address"
                        rows="3"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="संपत्ति पता"
                      />
                      <ErrorMessage name="property_address" component="div" className="text-red-500 text-sm mt-1" />
          </div>
        </div>
      </div>

                {/* Sale Information */}
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200">
                  <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3 pb-1.5 border-b border-gray-200">
                    बिक्री की जानकारी (Sale Information)
        </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-2 sm:gap-3">
                <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        बिक्री राशि (₹) <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="number"
                        name="sale_amount"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="राशि"
                      />
                      <ErrorMessage name="sale_amount" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        बिक्री तिथि <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="date"
                        name="sale_date"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <ErrorMessage name="sale_date" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        बिक्री का तरीका
                      </label>
                      <Field
                        as="select"
                        name="sale_mode"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">चुनें</option>
                        <option value="auction">नीलामी (Auction)</option>
                        <option value="direct">प्रत्यक्ष बिक्री (Direct Sale)</option>
                        <option value="negotiation">बातचीत (Negotiation)</option>
                      </Field>
                </div>

                    <div className="col-span-2 sm:col-span-4 md:col-span-5 lg:col-span-6 xl:col-span-8 2xl:col-span-10">
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        बिक्री राशि शब्दों में <span className="text-red-500">*</span>
                      </label>
                      <Field
                  type="text"
                        name="sale_amount_words"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="शब्दों में"
                      />
                      <ErrorMessage name="sale_amount_words" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              </div>
                </div>

                {/* Purchaser Information */}
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200">
                  <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3 pb-1.5 border-b border-gray-200">
                    खरीदार की जानकारी (Purchaser Information)
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-2 sm:gap-3">
                <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        नाम <span className="text-red-500">*</span>
                      </label>
                      <Field
                    type="text"
                        name="purchaser_name"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="खरीदार का नाम"
                      />
                      <ErrorMessage name="purchaser_name" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        पिता का नाम <span className="text-red-500">*</span>
                      </label>
                      <Field
                    type="text"
                        name="purchaser_father_name"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="पिता/पति"
                      />
                      <ErrorMessage name="purchaser_father_name" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        मोबाइल नंबर <span className="text-red-500">*</span>
                      </label>
                      <Field
                    type="text"
                        name="purchaser_mobile"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="मोबाइल"
                      />
                      <ErrorMessage name="purchaser_mobile" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        आधार नंबर <span className="text-red-500">*</span>
                      </label>
                      <Field
                    type="text"
                        name="purchaser_aadhaar"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="आधार"
                      />
                      <ErrorMessage name="purchaser_aadhaar" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        PAN नंबर
                      </label>
                      <Field
                        type="text"
                        name="purchaser_pan"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="PAN"
                  />
                </div>

                    <div className="col-span-2 sm:col-span-4 md:col-span-5 lg:col-span-6 xl:col-span-8 2xl:col-span-10">
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        पता <span className="text-red-500">*</span>
                      </label>
                      <Field
                        as="textarea"
                        name="purchaser_address"
                        rows="3"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="पता"
                      />
                      <ErrorMessage name="purchaser_address" component="div" className="text-red-500 text-sm mt-1" />
            </div>
        </div>
      </div>

                {/* Witness Information */}
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200">
                  <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3 pb-1.5 border-b border-gray-200">
                    गवाहों की जानकारी (Witness Information)
        </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Witness 1 */}
                <div>
                      <h3 className="text-md font-medium text-gray-800 mb-3">पहला गवाह (Witness 1)</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                          <label className="block text-xs font-medium text-gray-700 mb-0.5">
                            नाम <span className="text-red-500">*</span>
                          </label>
                          <Field
                    type="text"
                            name="witness1_name"
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="गवाह नाम"
                          />
                          <ErrorMessage name="witness1_name" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div>
                          <label className="block text-xs font-medium text-gray-700 mb-0.5">
                            पिता का नाम <span className="text-red-500">*</span>
                          </label>
                          <Field
                    type="text"
                            name="witness1_father_name"
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="पिता/पति"
                          />
                          <ErrorMessage name="witness1_father_name" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div>
                          <label className="block text-xs font-medium text-gray-700 mb-0.5">
                            मोबाइल नंबर <span className="text-red-500">*</span>
                          </label>
                          <Field
                    type="text"
                            name="witness1_mobile"
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="मोबाइल"
                          />
                          <ErrorMessage name="witness1_mobile" component="div" className="text-red-500 text-sm mt-1" />
      </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-0.5">
                            पता <span className="text-red-500">*</span>
                          </label>
                          <Field
            as="textarea"
                            name="witness1_address"
                            rows="1"
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="पता"
          />
                          <ErrorMessage name="witness1_address" component="div" className="text-red-500 text-sm mt-1" />
        </div>
      </div>
              </div>

                    {/* Witness 2 */}
                <div>
                      <h3 className="text-md font-medium text-gray-800 mb-3">दूसरा गवाह (Witness 2)</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                          <label className="block text-xs font-medium text-gray-700 mb-0.5">
                            नाम <span className="text-red-500">*</span>
                          </label>
                          <Field
                    type="text"
                            name="witness2_name"
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="गवाह नाम"
                          />
                          <ErrorMessage name="witness2_name" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div>
                          <label className="block text-xs font-medium text-gray-700 mb-0.5">
                            पिता का नाम <span className="text-red-500">*</span>
                          </label>
                          <Field
                  type="text"
                            name="witness2_father_name"
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="पिता/पति"
                          />
                          <ErrorMessage name="witness2_father_name" component="div" className="text-red-500 text-sm mt-1" />
              </div>

                <div>
                          <label className="block text-xs font-medium text-gray-700 mb-0.5">
                            मोबाइल नंबर <span className="text-red-500">*</span>
                          </label>
                          <Field
                    type="text"
                            name="witness2_mobile"
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="मोबाइल"
                          />
                          <ErrorMessage name="witness2_mobile" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-0.5">
                            पता <span className="text-red-500">*</span>
                          </label>
                          <Field
                            as="textarea"
                            name="witness2_address"
                            rows="1"
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="पता"
                          />
                          <ErrorMessage name="witness2_address" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                </div>
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
                    {isSubmitting ? 'जमा हो रहा है...' : 'संपत्ति बिक्री प्रमाणपत्र जमा करें'}
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

const PropertySaleCertificateForm = () => {
  return (
    <FormWorkflowProvider formType="property-sale-certificate">
      <FormWorkflow 
        formTitle="Property Sale Certificate"
        formType="property-sale-certificate"
        fields={[
          { name: 'bank_name', label: 'Bank Name' },
          { name: 'bank_rep_name', label: 'Bank Representative Name' },
          { name: 'property_address', label: 'Property Address' },
          { name: 'sale_amount', label: 'Sale Amount' },
        ]}
      >
        <PropertySaleCertificateFormContent />
      </FormWorkflow>
    </FormWorkflowProvider>
  );
};

export default PropertySaleCertificateForm;
