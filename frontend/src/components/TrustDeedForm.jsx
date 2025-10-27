'use client'
import React, { useState, useCallback } from 'react';
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FormWorkflowProvider, useFormWorkflow } from './FormWorkflow/FormWorkflowProvider';
import FormWorkflow from './FormWorkflow/FormWorkflow';
import FormPreview from './FormWorkflow/FormPreview';
import ProcessingState from './FormWorkflow/ProcessingState';
import PaymentGateway from './FormWorkflow/PaymentGateway';
import LanguageSelectorDropdown from './LanguageSelectorDropdown';
import ClientOnly from './ClientOnly';
import { useTranslation } from 'react-i18next';

// // Validation schema
// const validationSchema = Yup.object({
//   trustName: Yup.string().required('ट्रस्ट का नाम आवश्यक है').max(100, 'अधिकतम 100 अक्षर'),
//   trustAddress: Yup.string().required('ट्रस्ट का पता आवश्यक है').max(500, 'अधिकतम 500 अक्षर'),
//   startingAmount_number: Yup.string().required('प्रारंभिक राशि आवश्यक है').matches(/^\d+$/, 'केवल संख्या दर्ज करें'),
//   startingAmount_words: Yup.string().required('राशि शब्दों में आवश्यक है'),
//   trustees: Yup.array().of(
//     Yup.object({
//       salutation: Yup.string().required('सलूटेशन आवश्यक है'),
//       position: Yup.string().required('पद आवश्यक है'),
//       name: Yup.string().required('नाम आवश्यक है').max(100, 'अधिकतम 100 अक्षर'),
//       relation: Yup.string().required('पिता/पति का नाम आवश्यक है').max(100, 'अधिकतम 100 अक्षर'),
//       address: Yup.string().required('पता आवश्यक है').max(500, 'अधिकतम 500 अक्षर'),
//       mobile: Yup.string().required('मोबाइल नंबर आवश्यक है').matches(/^[6-9]\d{9}$/, 'वैध मोबाइल नंबर दर्ज करें'),
//       idType: Yup.string().required('पहचान पत्र का प्रकार आवश्यक है'),
//       idNumber: Yup.string().required('पहचान पत्र संख्या आवश्यक है').max(20, 'अधिकतम 20 अक्षर')
//     })
//   ).min(1, 'कम से कम एक ट्रस्टी आवश्यक है'),
//   functionalDomains: Yup.array().of(Yup.string().max(200, 'अधिकतम 200 अक्षर')),
//   purposes: Yup.array().of(Yup.string().max(200, 'अधिकतम 200 अक्षर')),
//   otherPurposes: Yup.array().of(Yup.string().max(200, 'अधिकतम 200 अक्षर')),
//   terms: Yup.array().of(Yup.string().max(200, 'अधिकतम 200 अक्षर')),
//   otherTerms: Yup.array().of(Yup.string().max(200, 'अधिकतम 200 अक्षर')),
//   witnesses: Yup.array().of(
//     Yup.object({
//       name: Yup.string().max(100, 'अधिकतम 100 अक्षर'),
//       relation: Yup.string().max(100, 'अधिकतम 100 अक्षर'),
//       address: Yup.string().max(500, 'अधिकतम 500 अक्षर'),
//       mobile: Yup.string().matches(/^[6-9]\d{9}$/, 'वैध मोबाइल नंबर दर्ज करें'),
//       idType: Yup.string(),
//       idNumber: Yup.string().max(20, 'अधिकतम 20 अक्षर')
//     })
//   )
// });

// // Convert number to Indian words
// const convertToIndianWords = (num) => {
//   if (num === 0) return 'शून्य';

//   const units = ['', 'हजार', 'लाख', 'करोड़', 'अरब', 'खरब'];
//   const digits = ['', 'एक', 'दो', 'तीन', 'चार', 'पांच', 'छह', 'सात', 'आठ', 'नौ'];
//   const tens = ['', '', 'बीस', 'तीस', 'चालीस', 'पचास', 'साठ', 'सत्तर', 'अस्सी', 'नब्बे'];
//   const specialTens = ['दस', 'ग्यारह', 'बारह', 'तेरह', 'चौदह', 'पंद्रह', 'सोलह', 'सत्रह', 'अठारह', 'उन्नीस'];

//   const processChunk = (n) => {
//     let word = '';
//     const h = Math.floor(n / 100);
//     const rem = n % 100;

//     if (h > 0) {
//       word += digits[h] + ' सौ ';
//     }

//     if (rem > 0) {
//       if (rem < 20) {
//         word += specialTens[rem - 10] || digits[rem];
//       } else {
//         word += tens[Math.floor(rem / 10)];
//         if (rem % 10 > 0) {
//           word += ' ' + digits[rem % 10];
//         }
//       }
//     }

//     return word.trim();
//   };

//   const numStr = num.toString().replace(/,/g, '');
//   const crore = Math.floor(numStr / 10000000);
//   let remaining = numStr % 10000000;
//   const lakh = Math.floor(remaining / 100000);
//   remaining %= 100000;
//   const thousand = Math.floor(remaining / 1000);
//   remaining %= 1000;

//   let result = '';
//   if (crore > 0) result += processChunk(crore) + ' करोड़ ';
//   if (lakh > 0) result += processChunk(lakh) + ' लाख ';
//   if (thousand > 0) result += processChunk(thousand) + ' हजार ';
//   if (remaining > 0) result += processChunk(remaining);

//   return result.trim() + ' रुपये';
// };

// const TrustDeedForm = () => {
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [submitStatus, setSubmitStatus] = useState(null);

//   const initialValues = {
//     trustName: '',
//     trustAddress: '',
//     startingAmount_number: '',
//     startingAmount_words: '',
//     trustees: [
//       {
//         salutation: 'श्री',
//         position: '',
//         name: '',
//         relation: '',
//         address: '',
//         mobile: '',
//         idType: 'आधार कार्ड',
//         idNumber: '',
//         idCardFile: null,
//         photoFile: null
//       }
//     ],
//     functionalDomains: [''],
//     purposes: [],
//     otherPurposes: [''],
//     terms: [],
//     otherTerms: [''],
//     witnesses: [
//       { name: '', relation: '', address: '', mobile: '', idType: 'आधार कार्ड', idNumber: '', idCardFile: null, photoFile: null },
//       { name: '', relation: '', address: '', mobile: '', idType: 'आधार कार्ड', idNumber: '', idCardFile: null, photoFile: null }
//     ]
//   };

//   const handleAmountChange = useCallback((value, setFieldValue) => {
//     if (!isNaN(value) && value.trim() !== '') {
//       const words = convertToIndianWords(parseInt(value.replace(/,/g, ''), 10));
//       setFieldValue('startingAmount_words', words);
//     } else {
//       setFieldValue('startingAmount_words', '');
//     }
//   }, []);

//   const onSubmit = async (values, { setSubmitting, resetForm }) => {
//     setIsSubmitting(true);
//     setSubmitStatus(null);

//     try {
//       const formData = new FormData();

//       // Add basic fields
//       formData.append('trustName', values.trustName);
//       formData.append('trustAddress', values.trustAddress);
//       formData.append('startingAmount_number', values.startingAmount_number);
//       formData.append('startingAmount_words', values.startingAmount_words);

//       // Add trustees
//       values.trustees.forEach((trustee, index) => {
//         const prefix = `trustee`;
//         formData.append(`${prefix}Salutation_${index + 1}`, trustee.salutation);
//         formData.append(`${prefix}Position_${index + 1}`, trustee.position);
//         formData.append(`${prefix}Name_${index + 1}`, trustee.name);
//         formData.append(`${prefix}Relation_${index + 1}`, trustee.relation);
//         formData.append(`${prefix}Address_${index + 1}`, trustee.address);
//         formData.append(`${prefix}Mobile_${index + 1}`, trustee.mobile);
//         formData.append(`${prefix}IdType_${index + 1}`, trustee.idType);
//         formData.append(`${prefix}IdNumber_${index + 1}`, trustee.idNumber);

//         if (trustee.idCardFile) {
//           formData.append(`${prefix}IdCard_${index + 1}`, trustee.idCardFile);
//         }
//         if (trustee.photoFile) {
//           formData.append(`${prefix}Photo_${index + 1}`, trustee.photoFile);
//         }
//       });

//       // Add functional domains
//       values.functionalDomains.forEach((domain, index) => {
//         if (domain.trim()) {
//           formData.append(`functionalDomain_${index + 1}`, domain);
//         }
//       });

//       // Add purposes
//       values.purposes.forEach(purpose => {
//         formData.append('purpose', purpose);
//       });
//       values.otherPurposes.forEach((purpose, index) => {
//         if (purpose.trim()) {
//           formData.append(`otherPurpose_${index + 1}`, purpose);
//         }
//       });

//       // Add terms
//       values.terms.forEach(term => {
//         formData.append('terms', term);
//       });
//       values.otherTerms.forEach((term, index) => {
//         if (term.trim()) {
//           formData.append(`otherTerm_${index + 1}`, term);
//         }
//       });

//       // Add witnesses
//       values.witnesses.forEach((witness, index) => {
//         if (witness.name.trim()) {
//           formData.append(`witnessName_${index + 1}`, witness.name);
//           formData.append(`witnessRelation_${index + 1}`, witness.relation);
//           formData.append(`witnessAddress_${index + 1}`, witness.address);
//           formData.append(`witnessMobile_${index + 1}`, witness.mobile);
//           formData.append(`witnessIdType_${index + 1}`, witness.idType);
//           formData.append(`witnessIdNumber_${index + 1}`, witness.idNumber);

//           if (witness.idCardFile) {
//             formData.append(`witnessIdCard_${index + 1}`, witness.idCardFile);
//           }
//           if (witness.photoFile) {
//             formData.append(`witnessPhoto_${index + 1}`, witness.photoFile);
//           }
//         }
//       });

//       const response = await fetch('${process.env.NEXT_PUBLIC_API_BASE}/api/trust-deed', {
//         method: 'POST',
//         body: formData,
//         credentials: 'include'
//       });

//       const result = await response.json();

//       if (response.ok) {
//         setSubmitStatus({ type: 'success', message: 'ट्रस्ट डीड सफलतापूर्वक बनाया गया!' });
//         resetForm();
//       } else {
//         setSubmitStatus({ type: 'error', message: result.message || 'कुछ गलत हुआ। कृपया पुनः प्रयास करें।' });
//       }
//     } catch (error) {
//       console.error('Submission error:', error);
//       setSubmitStatus({ type: 'error', message: 'नेटवर्क त्रुटि। कृपया पुनः प्रयास करें।' });
//     } finally {
//       setIsSubmitting(false);
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="w-full min-h-screen bg-gray-50 py-4">
//       <div className="w-full px-2 sm:px-4 lg:px-6">
//         <div className="bg-white rounded-lg shadow-lg p-4 lg:p-6">
//           <h1 className="text-xl lg:text-2xl font-bold text-center mb-6 text-gray-800 border-b-2 border-blue-500 pb-3">
//             ट्रस्ट डीड फॉर्म
//           </h1>

//           {submitStatus && (
//             <div className={`mb-4 p-3 rounded-lg ${
//               submitStatus.type === 'success' 
//                 ? 'bg-green-100 text-green-800 border border-green-200' 
//                 : 'bg-red-100 text-red-800 border border-red-200'
//             }`}>
//               {submitStatus.message}
//             </div>
//           )}

//           <Formik
//             initialValues={initialValues}
//             validationSchema={validationSchema}
//             onSubmit={onSubmit}
//           >
//             {({ values, setFieldValue, errors, touched }) => (
//               <Form className="space-y-4">
//               {/* Trust Details Section */}
//               <div className="bg-gray-50 p-3 lg:p-4 rounded-lg">
//                 <h3 className="text-base lg:text-lg font-semibold mb-3 text-gray-700">ट्रस्ट का विवरण</h3>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
//                   <div className="sm:col-span-1 xl:col-span-1">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       ट्रस्ट का नाम *
//                     </label>
//                     <Field
//                       type="text"
//                       name="trustName"
//                       className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
//                       placeholder="ट्रस्ट का नाम दर्ज करें"
//                     />
//                     <ErrorMessage name="trustName" component="div" className="text-red-500 text-xs mt-1" />
//                   </div>
//                   <div className="sm:col-span-1 xl:col-span-2">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       ट्रस्ट का पता *
//                     </label>
//                     <Field
//                       as="textarea"
//                       name="trustAddress"
//                       rows="2"
//                       className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
//                       placeholder="ट्रस्ट का पूरा पता दर्ज करें"
//                     />
//                     <ErrorMessage name="trustAddress" component="div" className="text-red-500 text-xs mt-1" />
//                   </div>
//                 </div>
//               </div>

//               {/* Starting Amount Section */}
//               <div className="bg-gray-50 p-3 lg:p-4 rounded-lg">
//                 <h3 className="text-base lg:text-lg font-semibold mb-3 text-gray-700">ट्रस्ट की प्रारंभिक राशि</h3>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
//                   <div className="sm:col-span-1 xl:col-span-1">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       राशि (अंकों में) *
//                     </label>
//                     <Field
//                       type="text"
//                       name="startingAmount_number"
//                       className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
//                       placeholder="राशि दर्ज करें"
//                       onChange={(e) => {
//                         setFieldValue('startingAmount_number', e.target.value);
//                         handleAmountChange(e.target.value, setFieldValue);
//                       }}
//                     />
//                     <ErrorMessage name="startingAmount_number" component="div" className="text-red-500 text-xs mt-1" />
//                   </div>
//                   <div className="sm:col-span-1 xl:col-span-3">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       राशि (शब्दों में) *
//                     </label>
//                     <Field
//                       type="text"
//                       name="startingAmount_words"
//                       className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-100"
//                       readOnly
//                     />
//                     <ErrorMessage name="startingAmount_words" component="div" className="text-red-500 text-xs mt-1" />
//                   </div>
//                 </div>
//               </div>

//               {/* Trustees Section */}
//               <div className="bg-gray-50 p-3 lg:p-4 rounded-lg">
//                 <h3 className="text-base lg:text-lg font-semibold mb-3 text-gray-700">ट्रस्टी/सदस्य का विवरण</h3>
//                 <FieldArray name="trustees">
//                   {({ push, remove }) => (
//                     <div className="space-y-3">
//                       {values.trustees.map((trustee, index) => (
//                         <div key={index} className="border border-gray-200 p-2 lg:p-3 rounded-lg bg-white">
//                           <div className="flex justify-between items-center mb-3">
//                             <h4 className="font-medium text-gray-700 text-sm">ट्रस्टी/सदस्य {index + 1}</h4>
//                             {values.trustees.length > 1 && (
//                               <button
//                                 type="button"
//                                 onClick={() => remove(index)}
//                                 className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
//                               >
//                                 हटाएँ
//                               </button>
//                             )}
//                           </div>
//                           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 lg:gap-3">
//                             <div>
//                               <label className="block text-xs font-medium text-gray-700 mb-1">श्री/श्रीमती</label>
//                               <Field as="select" name={`trustees.${index}.salutation`} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500">
//                                 <option value="श्री">श्री</option>
//                                 <option value="श्रीमती">श्रीमती</option>
//                               </Field>
//                             </div>
//                             <div>
//                               <label className="block text-xs font-medium text-gray-700 mb-1">पद *</label>
//                               <Field as="select" name={`trustees.${index}.position`} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500">
//                                 <option value="">पद चुनें</option>
//                                 <option value="अध्यक्ष">अध्यक्ष</option>
//                                 <option value="सचिव">सचिव</option>
//                                 <option value="कोषाध्यक्ष">कोषाध्यक्ष</option>
//                                 <option value="सदस्य">सदस्य</option>
//                               </Field>
//                               <ErrorMessage name={`trustees.${index}.position`} component="div" className="text-red-500 text-xs mt-1" />
//                             </div>
//                             <div>
//                               <label className="block text-xs font-medium text-gray-700 mb-1">नाम *</label>
//                               <Field type="text" name={`trustees.${index}.name`} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
//                               <ErrorMessage name={`trustees.${index}.name`} component="div" className="text-red-500 text-xs mt-1" />
//                             </div>
//                             <div>
//                               <label className="block text-xs font-medium text-gray-700 mb-1">पिता/पति का नाम *</label>
//                               <Field type="text" name={`trustees.${index}.relation`} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
//                               <ErrorMessage name={`trustees.${index}.relation`} component="div" className="text-red-500 text-xs mt-1" />
//                             </div>
//                             <div>
//                               <label className="block text-xs font-medium text-gray-700 mb-1">मोबाइल नंबर *</label>
//                               <Field type="tel" name={`trustees.${index}.mobile`} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
//                               <ErrorMessage name={`trustees.${index}.mobile`} component="div" className="text-red-500 text-xs mt-1" />
//                             </div>
//                             <div>
//                               <label className="block text-xs font-medium text-gray-700 mb-1">पहचान पत्र का प्रकार *</label>
//                               <Field as="select" name={`trustees.${index}.idType`} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500">
//                                 <option value="आधार कार्ड">आधार कार्ड</option>
//                                 <option value="पैन कार्ड">पैन कार्ड</option>
//                               </Field>
//                             </div>
//                             <div>
//                               <label className="block text-xs font-medium text-gray-700 mb-1">पहचान पत्र संख्या *</label>
//                               <Field type="text" name={`trustees.${index}.idNumber`} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
//                               <ErrorMessage name={`trustees.${index}.idNumber`} component="div" className="text-red-500 text-xs mt-1" />
//                             </div>
//                             <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-6">
//                               <label className="block text-xs font-medium text-gray-700 mb-1">पता *</label>
//                               <Field as="textarea" name={`trustees.${index}.address`} rows="2" className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
//                               <ErrorMessage name={`trustees.${index}.address`} component="div" className="text-red-500 text-xs mt-1" />
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                       <button
//                         type="button"
//                         onClick={() => push({
//                           salutation: 'श्री',
//                           position: '',
//                           name: '',
//                           relation: '',
//                           address: '',
//                           mobile: '',
//                           idType: 'आधार कार्ड',
//                           idNumber: '',
//                           idCardFile: null,
//                           photoFile: null
//                         })}
//                         className="bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600 text-sm"
//                       >
//                         + ट्रस्टी/सदस्य जोड़ें
//                       </button>
//                     </div>
//                   )}
//                 </FieldArray>
//               </div>

//               {/* Functional Domains Section */}
//               <div className="bg-gray-50 p-3 lg:p-4 rounded-lg">
//                 <h3 className="text-base lg:text-lg font-semibold mb-3 text-gray-700">ट्रस्ट का कार्य क्षेत्र</h3>
//                 <FieldArray name="functionalDomains">
//                   {({ push, remove }) => (
//                     <div className="space-y-2">
//                       {values.functionalDomains.map((domain, index) => (
//                         <div key={index} className="flex gap-2">
//                           <Field
//                             type="text"
//                             name={`functionalDomains.${index}`}
//                             className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
//                             placeholder={`कार्य क्षेत्र ${index + 1}`}
//                           />
//                           {values.functionalDomains.length > 1 && (
//                             <button
//                               type="button"
//                               onClick={() => remove(index)}
//                               className="bg-red-500 text-white px-2 py-1.5 rounded hover:bg-red-600 text-xs"
//                             >
//                               हटाएँ
//                             </button>
//                           )}
//                         </div>
//                       ))}
//                       <button
//                         type="button"
//                         onClick={() => push('')}
//                         className="bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600 text-sm"
//                       >
//                         + और क्षेत्र जोड़ें
//                       </button>
//                     </div>
//                   )}
//                 </FieldArray>
//               </div>

//               {/* Purposes Section */}
//               <div className="bg-gray-50 p-3 lg:p-4 rounded-lg">
//                 <h3 className="text-base lg:text-lg font-semibold mb-3 text-gray-700">ट्रस्ट के उद्देश्य</h3>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-3">
//                   {[
//                     'अनाथ बच्चों को स्कूल की शिक्षा देना',
//                     'स्वास्थ्य संबंधी लोगों की मदद करना',
//                     'गरीब लड़कियों की शादी में सहायता करना',
//                     'लोगों को सिलाई और अन्य कौशल सिखाना',
//                     'अस्पताल और वृद्धाश्रम बनवाना',
//                     'वृक्षारोपण और पर्यावरण संरक्षण को बढ़ावा देना'
//                   ].map((purpose, index) => (
//                     <label key={index} className="flex items-center p-2 bg-white rounded border text-xs">
//                       <Field
//                         type="checkbox"
//                         name="purposes"
//                         value={purpose}
//                         className="mr-2 flex-shrink-0"
//                       />
//                       <span className="text-gray-700">{purpose}</span>
//                     </label>
//                   ))}
//                 </div>

//                 <h4 className="font-medium mb-2 text-gray-700 text-sm">अन्य उद्देश्य</h4>
//                 <FieldArray name="otherPurposes">
//                   {({ push, remove }) => (
//                     <div className="space-y-2">
//                       {values.otherPurposes.map((purpose, index) => (
//                         <div key={index} className="flex gap-2">
//                           <Field
//                             type="text"
//                             name={`otherPurposes.${index}`}
//                             className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
//                             placeholder={`उद्देश्य ${index + 1}`}
//                           />
//                           {values.otherPurposes.length > 1 && (
//                             <button
//                               type="button"
//                               onClick={() => remove(index)}
//                               className="bg-red-500 text-white px-2 py-1.5 rounded hover:bg-red-600 text-xs"
//                             >
//                               हटाएँ
//                             </button>
//                           )}
//                         </div>
//                       ))}
//                       <button
//                         type="button"
//                         onClick={() => push('')}
//                         className="bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600 text-sm"
//                       >
//                         + और उद्देश्य जोड़ें
//                       </button>
//                     </div>
//                   )}
//                 </FieldArray>
//               </div>

//               {/* Terms Section */}
//               <div className="bg-gray-50 p-3 lg:p-4 rounded-lg">
//                 <h3 className="text-base lg:text-lg font-semibold mb-3 text-gray-700">ट्रस्ट के महत्वपूर्ण नियम और शर्तें</h3>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-3">
//                   {[
//                     'ट्रस्ट केवल धर्मार्थ उद्देश्यों के लिए कार्य करेगा।',
//                     'ट्रस्टी को कोई वेतन या मानदेय नहीं दिया जाएगा।',
//                     'ट्रस्ट की बैठकों के लिए कम से कम तीन ट्रस्टियों की उपस्थिति अनिवार्य है।',
//                     'वार्षिक लेखा-जोखा (Annual Accounts) का ऑडिट किया जाएगा।',
//                     'नए ट्रस्टी की नियुक्ति मौजूदा ट्रस्टियों के बहुमत से होगी।',
//                     'ट्रस्ट को भंग करने पर, उसकी संपत्ति किसी अन्य धर्मार्थ संस्था को दान की जाएगी।',
//                     'ट्रस्ट को भारत के कानूनों के अनुसार ही संचालित किया जाएगा।'
//                   ].map((term, index) => (
//                     <label key={index} className="flex items-center p-2 bg-white rounded border text-xs">
//                       <Field
//                         type="checkbox"
//                         name="terms"
//                         value={term}
//                         className="mr-2 flex-shrink-0"
//                       />
//                       <span className="text-gray-700">{term}</span>
//                     </label>
//                   ))}
//                 </div>

//                 <h4 className="font-medium mb-2 text-gray-700 text-sm">अन्य महत्वपूर्ण बिंदु</h4>
//                 <FieldArray name="otherTerms">
//                   {({ push, remove }) => (
//                     <div className="space-y-2">
//                       {values.otherTerms.map((term, index) => (
//                         <div key={index} className="flex gap-2">
//                           <Field
//                             type="text"
//                             name={`otherTerms.${index}`}
//                             className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
//                             placeholder={`बिंदु ${index + 1}`}
//                           />
//                           {values.otherTerms.length > 1 && (
//                             <button
//                               type="button"
//                               onClick={() => remove(index)}
//                               className="bg-red-500 text-white px-2 py-1.5 rounded hover:bg-red-600 text-xs"
//                             >
//                               हटाएँ
//                             </button>
//                           )}
//                         </div>
//                       ))}
//                       <button
//                         type="button"
//                         onClick={() => push('')}
//                         className="bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600 text-sm"
//                       >
//                         + और बिंदु जोड़ें
//                       </button>
//                     </div>
//                   )}
//                 </FieldArray>
//               </div>

//               {/* Witnesses Section */}
//               <div className="bg-gray-50 p-3 lg:p-4 rounded-lg">
//                 <h3 className="text-base lg:text-lg font-semibold mb-3 text-gray-700">गवाहों का विवरण</h3>
//                 <FieldArray name="witnesses">
//                   {({ push, remove }) => (
//                     <div className="space-y-3">
//                       {values.witnesses.map((witness, index) => (
//                         <div key={index} className="border border-gray-200 p-2 lg:p-3 rounded-lg bg-white">
//                           <h4 className="font-medium mb-3 text-gray-700 text-sm">गवाह {index + 1}</h4>
//                           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 lg:gap-3">
//                             <div>
//                               <label className="block text-xs font-medium text-gray-700 mb-1">नाम</label>
//                               <Field type="text" name={`witnesses.${index}.name`} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
//                             </div>
//                             <div>
//                               <label className="block text-xs font-medium text-gray-700 mb-1">पिता/पति का नाम</label>
//                               <Field type="text" name={`witnesses.${index}.relation`} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
//                             </div>
//                             <div>
//                               <label className="block text-xs font-medium text-gray-700 mb-1">मोबाइल नंबर</label>
//                               <Field type="tel" name={`witnesses.${index}.mobile`} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
//                             </div>
//                             <div>
//                               <label className="block text-xs font-medium text-gray-700 mb-1">पहचान पत्र का प्रकार</label>
//                               <Field as="select" name={`witnesses.${index}.idType`} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500">
//                                 <option value="आधार कार्ड">आधार कार्ड</option>
//                                 <option value="पैन कार्ड">पैन कार्ड</option>
//                               </Field>
//                             </div>
//                             <div>
//                               <label className="block text-xs font-medium text-gray-700 mb-1">पहचान पत्र संख्या</label>
//                               <Field type="text" name={`witnesses.${index}.idNumber`} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
//                             </div>
//                             <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-6">
//                               <label className="block text-xs font-medium text-gray-700 mb-1">पता</label>
//                               <Field as="textarea" name={`witnesses.${index}.address`} rows="2" className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </FieldArray>
//               </div>

//               {/* Submit Button */}
//               <div className="flex justify-center pt-3">
//                 <button
//                   type="submit"
//                   disabled={isSubmitting}
//                   className={`px-6 py-2 rounded-lg font-medium text-white transition-colors text-sm ${
//                     isSubmitting
//                       ? 'bg-gray-400 cursor-not-allowed'
//                       : 'bg-green-600 hover:bg-green-700'
//                   }`}
//                 >
//                   {isSubmitting ? 'जमा हो रहा है...' : 'जमा करें'}
//                 </button>
//               </div>
//             </Form>
//           )}
//         </Formik>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TrustDeedForm;

// Validation schema
const validationSchema = Yup.object({
  trustName: Yup.string().required('ट्रस्ट का नाम आवश्यक है').max(100, 'अधिकतम 100 अक्षर'),
  trustAddress: Yup.string().required('ट्रस्ट का पता आवश्यक है').max(500, 'अधिकतम 500 अक्षर'),
  startingAmount_number: Yup.string().required('प्रारंभिक राशि आवश्यक है').matches(/^\d+$/, 'केवल संख्या दर्ज करें'),
  startingAmount_words: Yup.string().required('राशि शब्दों में आवश्यक है'),
  trustees: Yup.array()
    .of(
      Yup.object({
        salutation: Yup.string().required('सलूटेशन आवश्यक है'),
        position: Yup.string().required('पद आवश्यक है'),
        name: Yup.string().required('नाम आवश्यक है').max(100, 'अधिकतम 100 अक्षर'),
        relation: Yup.string().required('पिता/पति का नाम आवश्यक है').max(100, 'अधिकतम 100 अक्षर'),
        address: Yup.string().required('पता आवश्यक है').max(500, 'अधिकतम 500 अक्षर'),
        mobile: Yup.string()
          .required('मोबाइल नंबर आवश्यक है')
          .matches(/^[6-9]\d{9}$/, 'वैध मोबाइल नंबर दर्ज करें'),
        idType: Yup.string().required('पहचान पत्र का प्रकार आवश्यक है'),
        idNumber: Yup.string().required('पहचान पत्र संख्या आवश्यक है').max(20, 'अधिकतम 20 अक्षर'),
      })
    )
    .min(1, 'कम से कम एक ट्रस्टी आवश्यक है'),
  functionalDomains: Yup.array().of(Yup.string().max(200, 'अधिकतम 200 अक्षर')),
  purposes: Yup.array().of(Yup.string().max(200, 'अधिकतम 200 अक्षर')),
  otherPurposes: Yup.array().of(Yup.string().max(200, 'अधिकतम 200 अक्षर')),
  terms: Yup.array().of(Yup.string().max(200, 'अधिकतम 200 अक्षर')),
  otherTerms: Yup.array().of(Yup.string().max(200, 'अधिकतम 200 अक्षर')),
  witnesses: Yup.array().of(
    Yup.object({
      name: Yup.string().max(100, 'अधिकतम 100 अक्षर'),
      relation: Yup.string().max(100, 'अधिकतम 100 अक्षर'),
      address: Yup.string().max(500, 'अधिकतम 500 अक्षर'),
      mobile: Yup.string()
        .matches(/^[6-9]\d{9}$/, 'वैध मोबाइल नंबर दर्ज करें')
        .nullable(),
      idType: Yup.string(),
      idNumber: Yup.string().max(20, 'अधिकतम 20 अक्षर'),
    })
  ),
});

// Convert number to Indian words
const convertToIndianWords = (num) => {
  if (!num || num === '0') return 'शून्य';

  const units = ['', 'हजार', 'लाख', 'करोड़', 'अरब', 'खरब'];
  const digits = ['', 'एक', 'दो', 'तीन', 'चार', 'पांच', 'छह', 'सात', 'आठ', 'नौ'];
  const tens = ['', '', 'बीस', 'तीस', 'चालीस', 'पचास', 'साठ', 'सत्तर', 'अस्सी', 'नब्बे'];
  const specialTens = [
    'दस',
    'ग्यारह',
    'बारह',
    'तेरह',
    'चौदह',
    'पंद्रह',
    'सोलह',
    'सत्रह',
    'अठारह',
    'उन्नीस',
  ];

  const processChunk = (n) => {
    let word = '';
    const h = Math.floor(n / 100);
    const rem = n % 100;

    if (h > 0) {
      word += digits[h] + ' सौ ';
    }

    if (rem > 0) {
      if (rem < 20) {
        word += specialTens[rem - 10] || digits[rem];
      } else {
        word += tens[Math.floor(rem / 10)];
        if (rem % 10 > 0) {
          word += ' ' + digits[rem % 10];
        }
      }
    }

    return word.trim();
  };

  const numStr = num.toString().replace(/,/g, '');
  const crore = Math.floor(numStr / 10000000);
  let remaining = numStr % 10000000;
  const lakh = Math.floor(remaining / 100000);
  remaining %= 100000;
  const thousand = Math.floor(remaining / 1000);
  remaining %= 1000;

  let result = '';
  if (crore > 0) result += processChunk(crore) + ' करोड़ ';
  if (lakh > 0) result += processChunk(lakh) + ' लाख ';
  if (thousand > 0) result += processChunk(thousand) + ' हजार ';
  if (remaining > 0) result += processChunk(remaining);

  return result.trim() + ' रुपये';
};

const TrustDeedFormContent = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const { goToPreview, formData: workflowFormData } = useFormWorkflow();
  const { t } = useTranslation();

  const initialValues = {
    trustName: workflowFormData?.trustName || '',
    trustAddress: workflowFormData?.trustAddress || '',
    startingAmount_number: workflowFormData?.startingAmount_number || '',
    startingAmount_words: workflowFormData?.startingAmount_words || '',
    trustees: workflowFormData?.trustees || [
      {
        salutation: 'श्री',
        position: '',
        name: '',
        relation: '',
        address: '',
        mobile: '',
        idType: 'आधार कार्ड',
        idNumber: '',
        idCardFile: null,
        photoFile: null,
      },
    ],
    functionalDomains: workflowFormData?.functionalDomains || [''],
    purposes: workflowFormData?.purposes || [],
    otherPurposes: workflowFormData?.otherPurposes || [''],
    terms: workflowFormData?.terms || [],
    otherTerms: workflowFormData?.otherTerms || [''],
    witnesses: workflowFormData?.witnesses || [
      {
        name: '',
        relation: '',
        address: '',
        mobile: '',
        idType: 'आधार कार्ड',
        idNumber: '',
        idCardFile: null,
        photoFile: null,
      },
      {
        name: '',
        relation: '',
        address: '',
        mobile: '',
        idType: 'आधार कार्ड',
        idNumber: '',
        idCardFile: null,
        photoFile: null,
      },
    ],
  };

  const handleAmountChange = useCallback(
    (value, setFieldValue) => {
      if (!isNaN(value) && value.trim() !== '') {
        const words = convertToIndianWords(parseInt(value.replace(/,/g, ''), 10));
        setFieldValue('startingAmount_words', words);
      } else {
        setFieldValue('startingAmount_words', '');
      }
    },
    []
  );

  const onSubmit = async (values, { setSubmitting, resetForm }) => {
    // Basic validation before preview
    const errors = [];
    
    // Check if at least one trustee has required fields
    const hasValidTrustee = values.trustees?.some(trustee => 
      trustee.name && trustee.address && trustee.mobile
    );
    
    if (!hasValidTrustee) {
      errors.push('At least one trustee must have name, address, and mobile number filled');
    }
    
    // Check if at least one witness has required fields
    const hasValidWitness = values.witnesses?.some(witness => 
      witness.name && witness.address && witness.mobile
    );
    
    if (!hasValidWitness) {
      errors.push('At least one witness must have name, address, and mobile number filled');
    }
    
    if (errors.length > 0) {
      // Show user-friendly error message
      const errorMessage = 'Please fix the following errors before proceeding:\n\n' + errors.join('\n');
      
      // Create a more user-friendly error display
      const errorDiv = document.createElement('div');
      errorDiv.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50 max-w-md';
      errorDiv.innerHTML = `
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
          <div>
            <strong class="font-bold">Validation Error!</strong>
            <div class="text-sm mt-1">${errors.join('<br>')}</div>
          </div>
        </div>
      `;
      
      document.body.appendChild(errorDiv);
      
      // Remove after 8 seconds
      setTimeout(() => {
        if (errorDiv.parentNode) {
          errorDiv.parentNode.removeChild(errorDiv);
        }
      }, 8000);
      
      setSubmitting(false);
      return;
    }
    
    // Instead of submitting directly, go to preview
    const formData = {
      ...values,
      amount: 1000, // Base amount for trust deed
      formType: 'trust-deed'
    };
    
    goToPreview(formData);
    setSubmitting(false);
  };

  const onSubmitDirect = async (values, { setSubmitting, resetForm }) => {
    setIsSubmitting(true);
    setSubmitStatus(null);
    console.log('Form submission started:', values);

    try {
      const formData = new FormData();

      // Add basic fields
      formData.append('trustName', values.trustName);
      formData.append('trustAddress', values.trustAddress);
      formData.append('startingAmount_number', values.startingAmount_number);
      formData.append('startingAmount_words', values.startingAmount_words);

      // Add trustees
      values.trustees.forEach((trustee, index) => {
        const i = index + 1;
        formData.append(`trusteeSalutation_${i}`, trustee.salutation);
        formData.append(`trusteePosition_${i}`, trustee.position);
        formData.append(`trusteeName_${i}`, trustee.name);
        formData.append(`trusteeRelation_${i}`, trustee.relation);
        formData.append(`trusteeAddress_${i}`, trustee.address);
        formData.append(`trusteeMobile_${i}`, trustee.mobile);
        formData.append(`trusteeIdType_${i}`, trustee.idType);
        formData.append(`trusteeIdNumber_${i}`, trustee.idNumber);
        if (trustee.idCardFile) {
          console.log(`Appending trusteeIdCard_${i}:`, trustee.idCardFile.name);
          formData.append(`trusteeIdCard_${i}`, trustee.idCardFile);
        }
        if (trustee.photoFile) {
          console.log(`Appending trusteePhoto_${i}:`, trustee.photoFile.name);
          formData.append(`trusteePhoto_${i}`, trustee.photoFile);
        }
      });

      // Add functional domains
      values.functionalDomains.forEach((domain, index) => {
        if (domain.trim()) {
          formData.append(`functionalDomain_${index + 1}`, domain);
        }
      });

      // Add purposes
      values.purposes.forEach((purpose) => {
        formData.append('purpose', purpose);
      });
      values.otherPurposes.forEach((purpose, index) => {
        if (purpose.trim()) {
          formData.append(`otherPurpose_${index + 1}`, purpose);
        }
      });

      // Add terms
      values.terms.forEach((term) => {
        formData.append('terms', term);
      });
      values.otherTerms.forEach((term, index) => {
        if (term.trim()) {
          formData.append(`otherTerm_${index + 1}`, term);
        }
      });

      // Add witnesses
      values.witnesses.forEach((witness, index) => {
        const i = index + 1;
        if (witness.name.trim()) {
          formData.append(`witnessName_${i}`, witness.name);
          formData.append(`witnessRelation_${i}`, witness.relation);
          formData.append(`witnessAddress_${i}`, witness.address);
          formData.append(`witnessMobile_${i}`, witness.mobile);
          formData.append(`witnessIdType_${i}`, witness.idType);
          formData.append(`witnessIdNumber_${i}`, witness.idNumber);
          if (witness.idCardFile) {
            console.log(`Appending witnessIdCard_${i}:`, witness.idCardFile.name);
            formData.append(`witnessIdCard_${i}`, witness.idCardFile);
          }
          if (witness.photoFile) {
            console.log(`Appending witnessPhoto_${i}:`, witness.photoFile.name);
            formData.append(`witnessPhoto_${i}`, witness.photoFile);
          }
        }
      });

      // Log FormData entries for debugging
      for (let [key, value] of formData.entries()) {
        console.log(`FormData: ${key} =`, value);
      }

      const response = await fetch('http://localhost:4000/api/trust-deed', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      console.log('API response status:', response.status);

      const result = await response.json();
      console.log('API response:', result);

      if (response.ok) {
        setSubmitStatus({ type: 'success', message: 'ट्रस्ट डीड सफलतापूर्वक बनाया गया!' });
        resetForm();
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.message || 'कुछ गलत हुआ। कृपया पुनः प्रयास करें।',
        });
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus({
        type: 'error',
        message: `नेटवर्क त्रुटि: ${error.message}। कृपया पुनः प्रयास करें।`,
      });
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 py-4">
      <div className="w-full px-2 sm:px-4 lg:px-6">
        <div className="bg-white rounded-lg shadow-lg p-4 lg:p-6">
          {/* Language Selector */}
          <div className="flex justify-end mb-4">
            <ClientOnly fallback={
              <div className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm">
                <span className="text-lg">🌐</span>
                <span className="hidden sm:inline">Loading...</span>
              </div>
            }>
              <LanguageSelectorDropdown />
            </ClientOnly>
          </div>
          
          <h1 className="text-xl lg:text-2xl font-bold text-center mb-6 text-gray-800 border-b-2 border-blue-500 pb-3">
            {t('trustDeed.title')}
          </h1>

          {submitStatus && (
            <div
              className={`mb-4 p-3 rounded-lg ${submitStatus.type === 'success'
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-red-100 text-red-800 border border-red-200'
                }`}
            >
              {submitStatus.message}
            </div>
          )}

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            enableReinitialize
          >
            {({ values, setFieldValue, errors, touched }) => (
              <Form className="space-y-4">
                {/* Trust Details Section */}
                <div className="bg-gray-50 p-3 lg:p-4 rounded-lg">
                  <h3 className="text-base lg:text-lg font-semibold mb-3 text-gray-700">
                    {t('trustDeed.trustDetails')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
                    <div className="sm:col-span-1 xl:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('trustDeed.trustName')} *
                      </label>
                      <Field
                        type="text"
                        name="trustName"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder={t('trustDeed.placeholders.trustName')}
                      />
                      <ErrorMessage
                        name="trustName"
                        component="div"
                        className="text-red-500 text-xs mt-1"
                      />
                    </div>
                    <div className="sm:col-span-1 xl:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('trustDeed.trustAddress')} *
                      </label>
                      <Field
                        as="textarea"
                        name="trustAddress"
                        rows="2"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="ट्रस्ट का पूरा पता दर्ज करें"
                      />
                      <ErrorMessage
                        name="trustAddress"
                        component="div"
                        className="text-red-500 text-xs mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Starting Amount Section */}
                <div className="bg-gray-50 p-3 lg:p-4 rounded-lg">
                  <h3 className="text-base lg:text-lg font-semibold mb-3 text-gray-700">
                    ट्रस्ट की प्रारंभिक राशि
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
                    <div className="sm:col-span-1 xl:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        राशि (अंकों में) *
                      </label>
                      <Field
                        type="text"
                        name="startingAmount_number"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="राशि दर्ज करें"
                        onChange={(e) => {
                          setFieldValue('startingAmount_number', e.target.value);
                          handleAmountChange(e.target.value, setFieldValue);
                        }}
                      />
                      <ErrorMessage
                        name="startingAmount_number"
                        component="div"
                        className="text-red-500 text-xs mt-1"
                      />
                    </div>
                    <div className="sm:col-span-1 xl:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        राशि (शब्दों में) *
                      </label>
                      <Field
                        type="text"
                        name="startingAmount_words"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-100"
                        readOnly
                      />
                      <ErrorMessage
                        name="startingAmount_words"
                        component="div"
                        className="text-red-500 text-xs mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Trustees Section */}
                <div className="bg-gray-50 p-3 lg:p-4 rounded-lg">
                  <h3 className="text-base lg:text-lg font-semibold mb-3 text-gray-700">
                    ट्रस्टी/सदस्य का विवरण
                  </h3>
                  <FieldArray name="trustees">
                    {({ push, remove }) => (
                      <div className="space-y-3">
                        {values.trustees.map((trustee, index) => (
                          <div
                            key={index}
                            className="border border-gray-200 p-2 lg:p-3 rounded-lg bg-white"
                          >
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-medium text-gray-700 text-sm">
                                ट्रस्टी/सदस्य {index + 1}
                              </h4>
                              {values.trustees.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => remove(index)}
                                  className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                                >
                                  हटाएँ
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 lg:gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  श्री/श्रीमती
                                </label>
                                <Field
                                  as="select"
                                  name={`trustees.${index}.salutation`}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                  <option value="श्री">श्री</option>
                                  <option value="श्रीमती">श्रीमती</option>
                                </Field>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  पद *
                                </label>
                                <Field
                                  as="select"
                                  name={`trustees.${index}.position`}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                  <option value="">पद चुनें</option>
                                  <option value="अध्यक्ष">अध्यक्ष</option>
                                  <option value="सचिव">सचिव</option>
                                  <option value="कोषाध्यक्ष">कोषाध्यक्ष</option>
                                  <option value="सदस्य">सदस्य</option>
                                </Field>
                                <ErrorMessage
                                  name={`trustees.${index}.position`}
                                  component="div"
                                  className="text-red-500 text-xs mt-1"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  नाम *
                                </label>
                                <Field
                                  type="text"
                                  name={`trustees.${index}.name`}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <ErrorMessage
                                  name={`trustees.${index}.name`}
                                  component="div"
                                  className="text-red-500 text-xs mt-1"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  पिता/पति का नाम *
                                </label>
                                <Field
                                  type="text"
                                  name={`trustees.${index}.relation`}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <ErrorMessage
                                  name={`trustees.${index}.relation`}
                                  component="div"
                                  className="text-red-500 text-xs mt-1"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  मोबाइल नंबर *
                                </label>
                                <Field
                                  type="tel"
                                  name={`trustees.${index}.mobile`}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <ErrorMessage
                                  name={`trustees.${index}.mobile`}
                                  component="div"
                                  className="text-red-500 text-xs mt-1"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  पहचान पत्र का प्रकार *
                                </label>
                                <Field
                                  as="select"
                                  name={`trustees.${index}.idType`}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                  <option value="आधार कार्ड">आधार कार्ड</option>
                                  <option value="पैन कार्ड">पैन कार्ड</option>
                                </Field>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  पहचान पत्र संख्या *
                                </label>
                                <Field
                                  type="text"
                                  name={`trustees.${index}.idNumber`}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <ErrorMessage
                                  name={`trustees.${index}.idNumber`}
                                  component="div"
                                  className="text-red-500 text-xs mt-1"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  पहचान पत्र अपलोड
                                </label>
                                <input
                                  type="file"
                                  name={`trustees.${index}.idCardFile`}
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                                  onChange={(event) =>
                                    setFieldValue(
                                      `trustees.${index}.idCardFile`,
                                      event.currentTarget.files[0]
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  फोटो अपलोड
                                </label>
                                <input
                                  type="file"
                                  name={`trustees.${index}.photoFile`}
                                  accept="image/*"
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                                  onChange={(event) =>
                                    setFieldValue(
                                      `trustees.${index}.photoFile`,
                                      event.currentTarget.files[0]
                                    )
                                  }
                                />
                              </div>
                              <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-6">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  पता *
                                </label>
                                <Field
                                  as="textarea"
                                  name={`trustees.${index}.address`}
                                  rows="2"
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <ErrorMessage
                                  name={`trustees.${index}.address`}
                                  component="div"
                                  className="text-red-500 text-xs mt-1"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            push({
                              salutation: 'श्री',
                              position: '',
                              name: '',
                              relation: '',
                              address: '',
                              mobile: '',
                              idType: 'आधार कार्ड',
                              idNumber: '',
                              idCardFile: null,
                              photoFile: null,
                            })
                          }
                          className="bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600 text-sm"
                        >
                          + ट्रस्टी/सदस्य जोड़ें
                        </button>
                      </div>
                    )}
                  </FieldArray>
                </div>

                {/* Functional Domains Section */}
                <div className="bg-gray-50 p-3 lg:p-4 rounded-lg">
                  <h3 className="text-base lg:text-lg font-semibold mb-3 text-gray-700">
                    ट्रस्ट का कार्य क्षेत्र
                  </h3>
                  <FieldArray name="functionalDomains">
                    {({ push, remove }) => (
                      <div className="space-y-2">
                        {values.functionalDomains.map((domain, index) => (
                          <div key={index} className="flex gap-2">
                            <Field
                              type="text"
                              name={`functionalDomains.${index}`}
                              className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder={`कार्य क्षेत्र ${index + 1}`}
                            />
                            {values.functionalDomains.length > 1 && (
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="bg-red-500 text-white px-2 py-1.5 rounded hover:bg-red-600 text-xs"
                              >
                                हटाएँ
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => push('')}
                          className="bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600 text-sm"
                        >
                          + और क्षेत्र जोड़ें
                        </button>
                      </div>
                    )}
                  </FieldArray>
                </div>

                {/* Purposes Section */}
                <div className="bg-gray-50 p-3 lg:p-4 rounded-lg">
                  <h3 className="text-base lg:text-lg font-semibold mb-3 text-gray-700">
                    ट्रस्ट के उद्देश्य
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-3">
                    {[
                      'अनाथ बच्चों को स्कूल की शिक्षा देना',
                      'स्वास्थ्य संबंधी लोगों की मदद करना',
                      'गरीब लड़कियों की शादी में सहायता करना',
                      'लोगों को सिलाई और अन्य कौशल सिखाना',
                      'अस्पताल और वृद्धाश्रम बनवाना',
                      'वृक्षारोपण और पर्यावरण संरक्षण को बढ़ावा देना',
                    ].map((purpose, index) => (
                      <label
                        key={index}
                        className="flex items-center p-2 bg-white rounded border text-xs"
                      >
                        <Field
                          type="checkbox"
                          name="purposes"
                          value={purpose}
                          className="mr-2 flex-shrink-0"
                        />
                        <span className="text-gray-700">{purpose}</span>
                      </label>
                    ))}
                  </div>

                  <h4 className="font-medium mb-2 text-gray-700 text-sm">अन्य उद्देश्य</h4>
                  <FieldArray name="otherPurposes">
                    {({ push, remove }) => (
                      <div className="space-y-2">
                        {values.otherPurposes.map((purpose, index) => (
                          <div key={index} className="flex gap-2">
                            <Field
                              type="text"
                              name={`otherPurposes.${index}`}
                              className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder={`उद्देश्य ${index + 1}`}
                            />
                            {values.otherPurposes.length > 1 && (
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="bg-red-500 text-white px-2 py-1.5 rounded hover:bg-red-600 text-xs"
                              >
                                हटाएँ
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => push('')}
                          className="bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600 text-sm"
                        >
                          + और उद्देश्य जोड़ें
                        </button>
                      </div>
                    )}
                  </FieldArray>
                </div>

                {/* Terms Section */}
                <div className="bg-gray-50 p-3 lg:p-4 rounded-lg">
                  <h3 className="text-base lg:text-lg font-semibold mb-3 text-gray-700">
                    ट्रस्ट के महत्वपूर्ण नियम और शर्तें
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-3">
                    {[
                      'ट्रस्ट केवल धर्मार्थ उद्देश्यों के लिए कार्य करेगा।',
                      'ट्रस्टी को कोई वेतन या मानदेय नहीं दिया जाएगा।',
                      'ट्रस्ट की बैठकों के लिए कम से कम तीन ट्रस्टियों की उपस्थिति अनिवार्य है।',
                      'वार्षिक लेखा-जोखा (Annual Accounts) का ऑडिट किया जाएगा।',
                      'नए ट्रस्टी की नियुक्ति मौजूदा ट्रस्टियों के बहुमत से होगी।',
                      'ट्रस्ट को भंग करने पर, उसकी संपत्ति किसी अन्य धर्मार्थ संस्था को दान की जाएगी।',
                      'ट्रस्ट को भारत के कानूनों के अनुसार ही संचालित किया जाएगा।',
                    ].map((term, index) => (
                      <label
                        key={index}
                        className="flex items-center p-2 bg-white rounded border text-xs"
                      >
                        <Field
                          type="checkbox"
                          name="terms"
                          value={term}
                          className="mr-2 flex-shrink-0"
                        />
                        <span className="text-gray-700">{term}</span>
                      </label>
                    ))}
                  </div>

                  <h4 className="font-medium mb-2 text-gray-700 text-sm">अन्य महत्वपूर्ण बिंदु</h4>
                  <FieldArray name="otherTerms">
                    {({ push, remove }) => (
                      <div className="space-y-2">
                        {values.otherTerms.map((term, index) => (
                          <div key={index} className="flex gap-2">
                            <Field
                              type="text"
                              name={`otherTerms.${index}`}
                              className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder={`बिंदु ${index + 1}`}
                            />
                            {values.otherTerms.length > 1 && (
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="bg-red-500 text-white px-2 py-1.5 rounded hover:bg-red-600 text-xs"
                              >
                                हटाएँ
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => push('')}
                          className="bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600 text-sm"
                        >
                          + और बिंदु जोड़ें
                        </button>
                      </div>
                    )}
                  </FieldArray>
                </div>

                {/* Witnesses Section */}
                <div className="bg-gray-50 p-3 lg:p-4 rounded-lg">
                  <h3 className="text-base lg:text-lg font-semibold mb-3 text-gray-700">
                    गवाहों का विवरण
                  </h3>
                  <FieldArray name="witnesses">
                    {({ push, remove }) => (
                      <div className="space-y-3">
                        {values.witnesses.map((witness, index) => (
                          <div
                            key={index}
                            className="border border-gray-200 p-2 lg:p-3 rounded-lg bg-white"
                          >
                            <h4 className="font-medium mb-3 text-gray-700 text-sm">
                              गवाह {index + 1}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 lg:gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  नाम
                                </label>
                                <Field
                                  type="text"
                                  name={`witnesses.${index}.name`}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  पिता/पति का नाम
                                </label>
                                <Field
                                  type="text"
                                  name={`witnesses.${index}.relation`}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  मोबाइल नंबर
                                </label>
                                <Field
                                  type="tel"
                                  name={`witnesses.${index}.mobile`}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  पहचान पत्र का प्रकार
                                </label>
                                <Field
                                  as="select"
                                  name={`witnesses.${index}.idType`}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                  <option value="आधार कार्ड">आधार कार्ड</option>
                                  <option value="पैन कार्ड">पैन कार्ड</option>
                                </Field>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  पहचान पत्र संख्या
                                </label>
                                <Field
                                  type="text"
                                  name={`witnesses.${index}.idNumber`}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  पहचान पत्र अपलोड
                                </label>
                                <input
                                  type="file"
                                  name={`witnesses.${index}.idCardFile`}
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                                  onChange={(event) =>
                                    setFieldValue(
                                      `witnesses.${index}.idCardFile`,
                                      event.currentTarget.files[0]
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  फोटो अपलोड
                                </label>
                                <input
                                  type="file"
                                  name={`witnesses.${index}.photoFile`}
                                  accept="image/*"
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                                  onChange={(event) =>
                                    setFieldValue(
                                      `witnesses.${index}.photoFile`,
                                      event.currentTarget.files[0]
                                    )
                                  }
                                />
                              </div>
                              <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-6">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  पता
                                </label>
                                <Field
                                  as="textarea"
                                  name={`witnesses.${index}.address`}
                                  rows="2"
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </FieldArray>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-2 rounded-lg font-medium text-white transition-colors text-sm ${isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                      }`}
                  >
                    {isSubmitting ? 'जमा हो रहा है...' : 'जमा करें'}
                  </button>
                </div>

                {/* Debug: Display Form Errors */}
                {Object.keys(errors).length > 0 && touched && (
                  <div className="mt-4 p-3 bg-red-100 text-red-800 border border-red-200 rounded-lg">
                    <h4 className="font-semibold">प्रपत्र त्रुटियाँ:</h4>
                    <pre>{JSON.stringify(errors, null, 2)}</pre>
                  </div>
                )}
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

const TrustDeedForm = () => {
  return (
    <FormWorkflowProvider formType="trust-deed">
      <FormWorkflow 
        formTitle="Trust Deed"
        formType="trust-deed"
        fields={[
          { name: 'trustName', label: 'ट्रस्ट का नाम' },
          { name: 'trustAddress', label: 'ट्रस्ट का पता' },
          { name: 'startingAmount_number', label: 'प्रारंभिक राशि (संख्या में)' },
          { name: 'startingAmount_words', label: 'प्रारंभिक राशि (शब्दों में)' },
        ]}
      >
        <TrustDeedFormContent />
      </FormWorkflow>
    </FormWorkflowProvider>
  );
};

export default TrustDeedForm;