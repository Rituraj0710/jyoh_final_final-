'use client';

import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';

const PropertySaleCertificateForm = () => {
  const router = useRouter();
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
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/property-sale-certificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('संपत्ति बिक्री प्रमाणपत्र सफलतापूर्वक जमा हो गया!');
        resetForm();
        router.push('/user');
      } else {
        const error = await response.json();
        toast.error(error.message || 'प्रमाणपत्र जमा करने में त्रुटि हुई।');
      }
    } catch (error) {
      console.error('Certificate submission error:', error);
      toast.error('नेटवर्क त्रुटि। कृपया पुनः प्रयास करें।');
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
              <h1 className="text-2xl font-bold text-gray-900">संपत्ति बिक्री प्रमाणपत्र (Property Sale Certificate)</h1>
              <p className="text-sm text-gray-600 mt-1">Complete property sale certificate documentation for bank property transactions.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button 
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                disabled={isSubmitting}
                form="property-sale-certificate-form"
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
              <Form id="property-sale-certificate-form" className="space-y-6">
                {/* Bank Information */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    बैंक की जानकारी (Bank Information)
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        बैंक का नाम <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="text"
                        name="bank_name"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="बैंक का नाम"
                      />
                      <ErrorMessage name="bank_name" component="div" className="text-red-500 text-sm mt-1" />
  </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        PAN नंबर <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="text"
                        name="bank_pan"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="PAN नंबर"
                      />
                      <ErrorMessage name="bank_pan" component="div" className="text-red-500 text-sm mt-1" />
      </div>

                    <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        पंजीकृत कार्यालय <span className="text-red-500">*</span>
                      </label>
                      <Field
                        as="textarea"
                        name="bank_reg_office"
                        rows="2"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="पंजीकृत कार्यालय का पता"
                      />
                      <ErrorMessage name="bank_reg_office" component="div" className="text-red-500 text-sm mt-1" />
        </div>

                    <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        मुख्य कार्यालय <span className="text-red-500">*</span>
                      </label>
                      <Field
                        as="textarea"
                        name="bank_head_office"
                        rows="2"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="मुख्य कार्यालय का पता"
                      />
                      <ErrorMessage name="bank_head_office" component="div" className="text-red-500 text-sm mt-1" />
        </div>
        </div>
      </div>

                {/* Bank Representative Information */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    बैंक प्रतिनिधि की जानकारी (Bank Representative Information)
        </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        शीर्षक
                      </label>
                      <Field
            as="select"
                        name="bank_rep_title"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="श्री">श्री</option>
                        <option value="श्रीमती">श्रीमती</option>
                        <option value="कुमारी">कुमारी</option>
                      </Field>
        </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        नाम <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="text"
                        name="bank_rep_name"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="प्रतिनिधि का नाम"
                      />
                      <ErrorMessage name="bank_rep_name" component="div" className="text-red-500 text-sm mt-1" />
        </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        संबंध
                      </label>
                      <Field
                        as="select"
                        name="bank_rep_relation"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="पुत्र">पुत्र</option>
                        <option value="पुत्री">पुत्री</option>
                        <option value="पत्नी">पत्नी</option>
                        <option value="पति">पति</option>
                      </Field>
        </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        पिता का नाम <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="text"
                        name="bank_rep_father_name"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="पिता का नाम"
                      />
                      <ErrorMessage name="bank_rep_father_name" component="div" className="text-red-500 text-sm mt-1" />
            </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        व्यवसाय
                      </label>
                      <Field
                        type="text"
                        name="bank_rep_occupation"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="व्यवसाय"
                      />
            </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        मोबाइल नंबर <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="text"
                        name="bank_rep_mobile"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="10 अंकों का मोबाइल नंबर"
                      />
                      <ErrorMessage name="bank_rep_mobile" component="div" className="text-red-500 text-sm mt-1" />
          </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ईमेल <span className="text-red-500">*</span>
            </label>
                      <Field
                        type="email"
                        name="bank_rep_email"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="ईमेल पता"
                      />
                      <ErrorMessage name="bank_rep_email" component="div" className="text-red-500 text-sm mt-1" />
        </div>

                    <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        पता <span className="text-red-500">*</span>
                      </label>
                      <Field
                        as="textarea"
                        name="bank_rep_address"
                        rows="3"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="प्रतिनिधि का पूरा पता"
                      />
                      <ErrorMessage name="bank_rep_address" component="div" className="text-red-500 text-sm mt-1" />
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
                        क्षेत्रफल <span className="text-red-500">*</span>
                      </label>
                      <Field
            type="number"
                        name="property_area"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="क्षेत्रफल"
                      />
                      <ErrorMessage name="property_area" component="div" className="text-red-500 text-sm mt-1" />
      </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        इकाई
                      </label>
                      <Field
            as="select"
                        name="property_unit"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="sq_meters">वर्ग मीटर</option>
                        <option value="sq_feet">वर्ग फीट</option>
                        <option value="sq_yards">वर्ग गज</option>
                        <option value="acre">एकड़</option>
                      </Field>
                    </div>

          <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        संपत्ति का मूल्य (₹) <span className="text-red-500">*</span>
                </label>
                      <Field
                        type="number"
                        name="property_value"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="संपत्ति का मूल्य"
                      />
                      <ErrorMessage name="property_value" component="div" className="text-red-500 text-sm mt-1" />
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

                {/* Sale Information */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    बिक्री की जानकारी (Sale Information)
        </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        बिक्री राशि (₹) <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="number"
                        name="sale_amount"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="बिक्री राशि"
                      />
                      <ErrorMessage name="sale_amount" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        बिक्री तिथि <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="date"
                        name="sale_date"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <ErrorMessage name="sale_date" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        बिक्री का तरीका
                      </label>
                      <Field
                        as="select"
                        name="sale_mode"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">चुनें</option>
                        <option value="auction">नीलामी (Auction)</option>
                        <option value="direct">प्रत्यक्ष बिक्री (Direct Sale)</option>
                        <option value="negotiation">बातचीत (Negotiation)</option>
                      </Field>
                </div>

                    <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        बिक्री राशि शब्दों में <span className="text-red-500">*</span>
                      </label>
                      <Field
                  type="text"
                        name="sale_amount_words"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="बिक्री राशि शब्दों में"
                      />
                      <ErrorMessage name="sale_amount_words" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              </div>
                </div>

                {/* Purchaser Information */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    खरीदार की जानकारी (Purchaser Information)
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        नाम <span className="text-red-500">*</span>
                      </label>
                      <Field
                    type="text"
                        name="purchaser_name"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="खरीदार का नाम"
                      />
                      <ErrorMessage name="purchaser_name" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        पिता का नाम <span className="text-red-500">*</span>
                      </label>
                      <Field
                    type="text"
                        name="purchaser_father_name"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="पिता का नाम"
                      />
                      <ErrorMessage name="purchaser_father_name" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        मोबाइल नंबर <span className="text-red-500">*</span>
                      </label>
                      <Field
                    type="text"
                        name="purchaser_mobile"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="10 अंकों का मोबाइल नंबर"
                      />
                      <ErrorMessage name="purchaser_mobile" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        आधार नंबर <span className="text-red-500">*</span>
                      </label>
                      <Field
                    type="text"
                        name="purchaser_aadhaar"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="12 अंकों का आधार नंबर"
                      />
                      <ErrorMessage name="purchaser_aadhaar" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        PAN नंबर
                      </label>
                      <Field
                        type="text"
                        name="purchaser_pan"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="PAN नंबर"
                  />
                </div>

                    <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        पता <span className="text-red-500">*</span>
                      </label>
                      <Field
                        as="textarea"
                        name="purchaser_address"
                        rows="3"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="खरीदार का पूरा पता"
                      />
                      <ErrorMessage name="purchaser_address" component="div" className="text-red-500 text-sm mt-1" />
            </div>
        </div>
      </div>

                {/* Witness Information */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    गवाहों की जानकारी (Witness Information)
        </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Witness 1 */}
                <div>
                      <h3 className="text-md font-medium text-gray-800 mb-3">पहला गवाह (Witness 1)</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            नाम <span className="text-red-500">*</span>
                          </label>
                          <Field
                    type="text"
                            name="witness1_name"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="गवाह का नाम"
                          />
                          <ErrorMessage name="witness1_name" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            पिता का नाम <span className="text-red-500">*</span>
                          </label>
                          <Field
                    type="text"
                            name="witness1_father_name"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="पिता का नाम"
                          />
                          <ErrorMessage name="witness1_father_name" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            मोबाइल नंबर <span className="text-red-500">*</span>
                          </label>
                          <Field
                    type="text"
                            name="witness1_mobile"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="10 अंकों का मोबाइल नंबर"
                          />
                          <ErrorMessage name="witness1_mobile" component="div" className="text-red-500 text-sm mt-1" />
      </div>

                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            पता <span className="text-red-500">*</span>
                          </label>
                          <Field
            as="textarea"
                            name="witness1_address"
                            rows="2"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="गवाह का पता"
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
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            नाम <span className="text-red-500">*</span>
                          </label>
                          <Field
                    type="text"
                            name="witness2_name"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="गवाह का नाम"
                          />
                          <ErrorMessage name="witness2_name" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            पिता का नाम <span className="text-red-500">*</span>
                          </label>
                          <Field
                  type="text"
                            name="witness2_father_name"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="पिता का नाम"
                          />
                          <ErrorMessage name="witness2_father_name" component="div" className="text-red-500 text-sm mt-1" />
              </div>

                <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            मोबाइल नंबर <span className="text-red-500">*</span>
                          </label>
                          <Field
                    type="text"
                            name="witness2_mobile"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="10 अंकों का मोबाइल नंबर"
                          />
                          <ErrorMessage name="witness2_mobile" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            पता <span className="text-red-500">*</span>
                          </label>
                          <Field
                            as="textarea"
                            name="witness2_address"
                            rows="2"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="गवाह का पता"
                          />
                          <ErrorMessage name="witness2_address" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                </div>
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

export default PropertySaleCertificateForm;
