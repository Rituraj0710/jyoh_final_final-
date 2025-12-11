"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const EStampApplication = () => {
  const { getAuthHeaders } = useAuth();
  const [language, setLanguage] = useState('en');
  const [formData, setFormData] = useState({
    article: '',
    property: '',
    consideredPrice: '',
    amount: '',
    f_name: '',
    f_gender: '',
    f_mobile: '',
    f_email: '',
    f_pan: '',
    f_aad: '',
    f_addr: '',
    s_name: '',
    s_gender: '',
    s_mobile: '',
    s_email: '',
    s_pan: '',
    s_aad: '',
    s_addr: '',
    paid_by: '',
    purchased_by: '',
    purchased_by_other: '',
    declaration: false
  });
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({
    propertyDocuments: [],
    firstParty: {
      photo: null,
      aadhaar: null,
      pan: null
    },
    secondParty: {
      photo: null,
      aadhaar: null,
      pan: null
    }
  });
  const [previewImages, setPreviewImages] = useState({});

  const texts = {
    en: {
      pageTitle: 'e-Stamp Application',
      previewTitle: 'Preview - Filled Data',
      sec1Title: '1. Stamp & Property Details',
      sec2Title: '2. First Party Details',
      sec3Title: '3. Second Party Details',
      sec4Title: '4. Stamp Payment & Submission',
      label_article: 'Article / Stamp Type',
      label_property: 'Property Description',
      label_considered: 'Considered Price',
      label_amount: 'Amount (Stamp)',
      label_f_name: 'Full Name',
      label_f_gender: 'Gender',
      label_f_mobile: 'Mobile',
      label_f_email: 'Email',
      label_f_pan: 'PAN',
      label_f_aad: 'Aadhaar',
      label_f_addr: 'Address (optional)',
      label_s_name: 'Full Name',
      label_s_gender: 'Gender',
      label_s_mobile: 'Mobile',
      label_s_email: 'Email',
      label_s_pan: 'PAN',
      label_s_aad: 'Aadhaar',
      label_s_addr: 'Address (optional)',
      label_paid_by: 'Stamp Duty Paid By',
      label_purchased_by: 'Stamp Purchased By',
      label_decl: 'I declare that information provided is true and correct.',
      purchasedDefault: 'Me Jyoh Service Pvt. Ltd.',
      both: 'Both',
      others: 'Others'
    },
    hi: {
      pageTitle: 'ई-स्टैम्प आवेदन',
      previewTitle: 'पूर्वावलोकन - भरी गई जानकारी',
      sec1Title: '1. स्टैम्प और संपत्ति विवरण',
      sec2Title: '2. पहली पार्टी विवरण',
      sec3Title: '3. दूसरी पार्टी विवरण',
      sec4Title: '4. स्टैम्प भुगतान और जमा',
      label_article: 'धारा / स्टैम्प प्रकार',
      label_property: 'संपत्ति का विवरण',
      label_considered: 'विचारित मूल्य',
      label_amount: 'राशि (स्टैम्प)',
      label_f_name: 'पूरा नाम',
      label_f_gender: 'लिंग',
      label_f_mobile: 'मोबाइल',
      label_f_email: 'ईमेल',
      label_f_pan: 'पैन',
      label_f_aad: 'आधार',
      label_f_addr: 'पता (वैकल्पिक)',
      label_s_name: 'पूरा नाम',
      label_s_gender: 'लिंग',
      label_s_mobile: 'मोबाइल',
      label_s_email: 'ईमेल',
      label_s_pan: 'पैन',
      label_s_aad: 'आधार',
      label_s_addr: 'पता (वैकल्पिक)',
      label_paid_by: 'स्टैम्प ड्यूटी किसने दी',
      label_purchased_by: 'स्टैम्प खरीदा',
      label_decl: 'मैं घोषणा करता हूं कि प्रदान की गई जानकारी सत्य और सही है।',
      purchasedDefault: 'Me Jyoh Service Pvt. Ltd.',
      both: 'दोनों',
      others: 'अन्य'
    }
  };

  const t = texts[language];

  // Number to words conversion
  const numberToWordsEn = (num) => {
    num = Math.floor(Number(num) || 0);
    if (num === 0) return 'Zero Rupees Only';
    const a = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    
    const inWords = (n) => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
      if (n < 1000) return a[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' and ' + inWords(n % 100) : '');
      return '';
    };
    
    let rem = num;
    let out = '';
    const crore = Math.floor(rem / 10000000);
    if (crore) { out += inWords(crore) + ' crore '; rem %= 10000000; }
    const lakh = Math.floor(rem / 100000);
    if (lakh) { out += inWords(lakh) + ' lakh '; rem %= 100000; }
    const thousand = Math.floor(rem / 1000);
    if (thousand) { out += inWords(thousand) + ' thousand '; rem %= 1000; }
    if (rem) out += inWords(rem);
    return out.trim().replace(/\s+/g, ' ') + ' Rupees Only';
  };

  const numberToWordsHi = (num) => {
    const eng = numberToWordsEn(num).toLowerCase();
    const map = {
      'crore': 'करोड़', 'lakh': 'लाख', 'thousand': 'हज़ार', 'hundred': 'सौ', 'and': 'और', 'zero': 'शून्य',
      'one': 'एक', 'two': 'दो', 'three': 'तीन', 'four': 'चार', 'five': 'पाँच', 'six': 'छह', 'seven': 'सात', 'eight': 'आठ', 'nine': 'नौ', 'ten': 'दस',
      'eleven': 'ग्यारह', 'twelve': 'बारह', 'thirteen': 'तेरह', 'fourteen': 'चौदह', 'fifteen': 'पंद्रह', 'sixteen': 'सोलह', 'seventeen': 'सत्रह', 'eighteen': 'अठारह', 'nineteen': 'उन्नीस',
      'twenty': 'बीस', 'thirty': 'तीस', 'forty': 'चालीस', 'fifty': 'पचास', 'sixty': 'साठ', 'seventy': 'सत्तर', 'eighty': 'अस्सी', 'ninety': 'नब्बे'
    };
    let out = eng;
    Object.keys(map).forEach(k => {
      out = out.replace(new RegExp('\\b' + k + '\\b', 'g'), map[k]);
    });
    out = out.charAt(0).toUpperCase() + out.slice(1);
    return out + ' मात्र';
  };

  // Validation functions
  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isValidMobile = (v) => /^\+?\d{7,15}$/.test(v);
  const isValidPAN = (v) => /^[A-Z]{5}\d{4}[A-Z]$/.test(v);
  const isValidAadhaar = (v) => /^\d{12}$/.test(v);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePANInput = (e) => {
    e.target.value = e.target.value.toUpperCase();
    handleChange(e);
  };

  // Dynamic options for paid_by and purchased_by
  const getPaidByOptions = () => {
    const fName = formData.f_name.trim() || 'First Party';
    const sName = formData.s_name.trim() || 'Second Party';
    return [
      { value: '', label: 'Select' },
      { value: 'first', label: fName },
      { value: 'second', label: sName },
      { value: 'both', label: t.both }
    ];
  };

  const getPurchasedByOptions = () => {
    const fName = formData.f_name.trim() || 'First Party';
    const sName = formData.s_name.trim() || 'Second Party';
    return [
      { value: '', label: 'Select' },
      { value: 'mejyoh', label: t.purchasedDefault },
      { value: 'first', label: fName },
      { value: 'second', label: sName },
      { value: 'others', label: t.others }
    ];
  };

  const preparePreview = () => {
    setShowPreview(true);
  };

  // File upload handlers
  const handleFileChange = (category, field, file, index = null) => {
    if (!file) return;

    const previewKey = index !== null ? `${category}_${field}_${index}` : `${category}_${field}`;
    let previewUrl = null;

    if (file.type.startsWith('image/')) {
      previewUrl = URL.createObjectURL(file);
      setPreviewImages(prev => ({
        ...prev,
        [previewKey]: previewUrl
      }));
    }

    if (category === 'propertyDocuments') {
      setUploadedFiles(prev => ({
        ...prev,
        propertyDocuments: [...prev.propertyDocuments, {
          id: Math.random().toString(36).substr(2, 9),
          file,
          name: file.name,
          preview: previewUrl
        }]
      }));
    } else {
      setUploadedFiles(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [field]: file
        }
      }));
    }
  };

  const removeFile = (category, field, fileId = null) => {
    if (category === 'propertyDocuments') {
      const fileToRemove = uploadedFiles.propertyDocuments.find(f => f.id === fileId);
      if (fileToRemove && fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      setUploadedFiles(prev => ({
        ...prev,
        propertyDocuments: prev.propertyDocuments.filter(f => f.id !== fileId)
      }));
      const previewKey = `propertyDocuments_${fileId}`;
      setPreviewImages(prev => {
        const newPrev = { ...prev };
        delete newPrev[previewKey];
        return newPrev;
      });
    } else {
      const previewKey = `${category}_${field}`;
      if (previewImages[previewKey]) {
        URL.revokeObjectURL(previewImages[previewKey]);
        setPreviewImages(prev => {
          const newPrev = { ...prev };
          delete newPrev[previewKey];
          return newPrev;
        });
      }
      setUploadedFiles(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [field]: null
        }
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors = {};
    if (!formData.article) newErrors.article = 'Please select article/type.';
    if (!formData.property.trim()) newErrors.property = 'Please enter property description.';
    if (!formData.amount || Number(formData.amount) <= 0) newErrors.amount = 'Please enter valid amount.';
    if (!formData.f_name.trim() || formData.f_name.trim().length < 3) newErrors.f_name = 'Enter first party name (min 3 chars).';
    if (!formData.s_name.trim() || formData.s_name.trim().length < 3) newErrors.s_name = 'Enter second party name (min 3 chars).';
    if (!formData.paid_by) newErrors.paid_by = 'Select payer.';
    if (!formData.declaration) newErrors.declaration = 'Please accept the declaration.';

    // Payer mobile mandatory
    if (formData.paid_by === 'first' && !isValidMobile(formData.f_mobile)) {
      newErrors.f_mobile = 'First party mobile required and must be valid.';
    }
    if (formData.paid_by === 'second' && !isValidMobile(formData.s_mobile)) {
      newErrors.s_mobile = 'Second party mobile required and must be valid.';
    }
    if (formData.paid_by === 'both' && (!isValidMobile(formData.f_mobile) || !isValidMobile(formData.s_mobile))) {
      newErrors.f_mobile = 'Both parties mobile required and must be valid.';
      newErrors.s_mobile = 'Both parties mobile required and must be valid.';
    }

    // PAN conditional requirement when amount >= 200000
    const amount = Number(formData.amount) || 0;
    if (amount >= 200000) {
      if (formData.paid_by === 'first' && !isValidPAN(formData.f_pan)) {
        newErrors.f_pan = 'First party PAN is required and must be valid for amount >= ₹2,00,000.';
      }
      if (formData.paid_by === 'second' && !isValidPAN(formData.s_pan)) {
        newErrors.s_pan = 'Second party PAN is required and must be valid for amount >= ₹2,00,000.';
      }
      if (formData.paid_by === 'both' && (!isValidPAN(formData.f_pan) || !isValidPAN(formData.s_pan))) {
        newErrors.f_pan = 'Both parties PAN required and must be valid for amount >= ₹2,00,000.';
        newErrors.s_pan = 'Both parties PAN required and must be valid for amount >= ₹2,00,000.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    preparePreview();
  };

  const confirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      const amount = Number(formData.amount) || 0;
      const considered = Number(formData.consideredPrice) || 0;
      
      const payload = {
        article: formData.article,
        property: formData.property,
        consideredPrice: considered,
        amount: amount,
        amountWordsEn: numberToWordsEn(amount),
        amountWordsHi: numberToWordsHi(amount),
        firstParty: {
          name: formData.f_name,
          gender: formData.f_gender,
          mobile: formData.f_mobile,
          email: formData.f_email,
          pan: formData.f_pan.toUpperCase(),
          aadhaar: formData.f_aad,
          address: formData.f_addr
        },
        secondParty: {
          name: formData.s_name,
          gender: formData.s_gender,
          mobile: formData.s_mobile,
          email: formData.s_email,
          pan: formData.s_pan.toUpperCase(),
          aadhaar: formData.s_aad,
          address: formData.s_addr
        },
        paidBy: formData.paid_by,
        purchasedBy: formData.purchased_by === 'mejyoh' 
          ? t.purchasedDefault 
          : formData.purchased_by === 'first' 
            ? formData.f_name 
            : formData.purchased_by === 'second' 
              ? formData.s_name 
              : formData.purchased_by === 'others'
                ? formData.purchased_by_other
                : ''
      };

      // Create FormData for file uploads
      const formDataToSend = new FormData();
      
      // Add JSON payload
      formDataToSend.append('data', JSON.stringify(payload));
      
      // Add property documents
      uploadedFiles.propertyDocuments.forEach((doc, index) => {
        formDataToSend.append(`propertyDocuments_${index}`, doc.file);
      });
      
      // Add first party documents
      if (uploadedFiles.firstParty.photo) {
        formDataToSend.append('firstParty_photo', uploadedFiles.firstParty.photo);
      }
      if (uploadedFiles.firstParty.aadhaar) {
        formDataToSend.append('firstParty_aadhaar', uploadedFiles.firstParty.aadhaar);
      }
      if (uploadedFiles.firstParty.pan) {
        formDataToSend.append('firstParty_pan', uploadedFiles.firstParty.pan);
      }
      
      // Add second party documents
      if (uploadedFiles.secondParty.photo) {
        formDataToSend.append('secondParty_photo', uploadedFiles.secondParty.photo);
      }
      if (uploadedFiles.secondParty.aadhaar) {
        formDataToSend.append('secondParty_aadhaar', uploadedFiles.secondParty.aadhaar);
      }
      if (uploadedFiles.secondParty.pan) {
        formDataToSend.append('secondParty_pan', uploadedFiles.secondParty.pan);
      }

      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(`${API_BASE}/api/staff/2/e-stamp/submit`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders()
          // Don't set Content-Type, let browser set it with boundary for FormData
        },
        body: formDataToSend
      });

      if (response.ok) {
        alert('Form submitted successfully.');
        // Reset form
        setFormData({
          article: '',
          property: '',
          consideredPrice: '',
          amount: '',
          f_name: '',
          f_gender: '',
          f_mobile: '',
          f_email: '',
          f_pan: '',
          f_aad: '',
          f_addr: '',
          s_name: '',
          s_gender: '',
          s_mobile: '',
          s_email: '',
          s_pan: '',
          s_aad: '',
          s_addr: '',
          paid_by: '',
          purchased_by: '',
          purchased_by_other: '',
          declaration: false
        });
        setErrors({});
        setShowPreview(false);
        // Reset uploaded files
        uploadedFiles.propertyDocuments.forEach(doc => {
          if (doc.preview) URL.revokeObjectURL(doc.preview);
        });
        Object.values(previewImages).forEach(url => {
          if (url) URL.revokeObjectURL(url);
        });
        setUploadedFiles({
          propertyDocuments: [],
          firstParty: { photo: null, aadhaar: null, pan: null },
          secondParty: { photo: null, aadhaar: null, pan: null }
        });
        setPreviewImages({});
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Submission failed.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const consideredWords = formData.consideredPrice 
    ? `${numberToWordsEn(Number(formData.consideredPrice) || 0)} / ${numberToWordsHi(Number(formData.consideredPrice) || 0)}`
    : '';
  const amountWords = formData.amount 
    ? `${numberToWordsEn(Number(formData.amount) || 0)} / ${numberToWordsHi(Number(formData.amount) || 0)}`
    : '';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">{t.pageTitle}</h3>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
          </select>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} noValidate>
            {/* Section 1: Stamp & Property Details */}
            <h5 className="text-lg font-semibold text-gray-900 mb-4">{t.sec1Title}</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.label_article} <span className="text-red-500">*</span>
                </label>
                <select
                  name="article"
                  value={formData.article}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.article ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">-- Select --</option>
                  <option>Affidavit</option>
                  <option>Lease Agreement</option>
                  <option>Conveyance Deed</option>
                  <option>Sale Deed</option>
                  <option>Agreement</option>
                  <option>Power of Attorney</option>
                  <option>Cancellation</option>
                  <option>Mortgage Deed</option>
                  <option>Bond</option>
                  <option>Court Bond</option>
                  <option>Other</option>
                </select>
                {errors.article && <p className="text-red-500 text-sm mt-1">{errors.article}</p>}
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.label_property} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="property"
                  value={formData.property}
                  onChange={handleChange}
                  placeholder="Enter property description"
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.property ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.property && <p className="text-red-500 text-sm mt-1">{errors.property}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.label_considered} (₹)
                </label>
                <input
                  type="number"
                  name="consideredPrice"
                  value={formData.consideredPrice}
                  onChange={handleChange}
                  min="0"
                  placeholder="e.g., 1500000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {consideredWords && (
                  <div className="text-sm italic text-gray-600 mt-1">{consideredWords}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.label_amount} (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min="0"
                  placeholder="e.g., 2000"
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {amountWords && (
                  <div className="text-sm italic text-gray-600 mt-1">{amountWords}</div>
                )}
                {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
              </div>
            </div>

            {/* Property Documents Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Documents (Photos/Documents)
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                multiple
                onChange={(e) => {
                  Array.from(e.target.files).forEach(file => {
                    handleFileChange('propertyDocuments', 'document', file);
                  });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {uploadedFiles.propertyDocuments.length > 0 && (
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {uploadedFiles.propertyDocuments.map((file) => (
                    <div key={file.id} className="relative">
                      <div className="w-full h-24 border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                        {file.preview ? (
                          <img
                            src={file.preview}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                            {file.name}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile('propertyDocuments', 'document', file.id)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <hr className="my-6" />

            {/* Section 2: First Party */}
            <h5 className="text-lg font-semibold text-gray-900 mb-4">{t.sec2Title}</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.label_f_name} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="f_name"
                  value={formData.f_name}
                  onChange={handleChange}
                  minLength="3"
                  placeholder="First party name"
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.f_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.f_name && <p className="text-red-500 text-sm mt-1">{errors.f_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.label_f_gender}
                </label>
                <select
                  name="f_gender"
                  value={formData.f_gender}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.label_f_mobile}
                </label>
                <input
                  type="text"
                  name="f_mobile"
                  value={formData.f_mobile}
                  onChange={handleChange}
                  placeholder="+9198xxxxxxx"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.f_mobile ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.f_mobile && <p className="text-red-500 text-sm mt-1">{errors.f_mobile}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.label_f_email}
                </label>
                <input
                  type="email"
                  name="f_email"
                  value={formData.f_email}
                  onChange={handleChange}
                  placeholder="example@mail.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.label_f_pan}
                </label>
                <input
                  type="text"
                  name="f_pan"
                  value={formData.f_pan}
                  onChange={handlePANInput}
                  maxLength="10"
                  placeholder="ABCDE1234F"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase ${
                    errors.f_pan ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.f_pan && <p className="text-red-500 text-sm mt-1">{errors.f_pan}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.label_f_aad}
                </label>
                <input
                  type="text"
                  name="f_aad"
                  value={formData.f_aad}
                  onChange={handleChange}
                  maxLength="12"
                  placeholder="12-digit Aadhaar"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.label_f_addr}
                </label>
                <textarea
                  name="f_addr"
                  value={formData.f_addr}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* First Party Documents */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Party Documents
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Photo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('firstParty', 'photo', e.target.files[0])}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    {uploadedFiles.firstParty.photo && (
                      <div className="mt-2 relative">
                        <img
                          src={previewImages['firstParty_photo']}
                          alt="First Party Photo"
                          className="w-24 h-24 object-cover border border-gray-300 rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile('firstParty', 'photo')}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Aadhaar Card</label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange('firstParty', 'aadhaar', e.target.files[0])}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    {uploadedFiles.firstParty.aadhaar && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-600">{uploadedFiles.firstParty.aadhaar.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile('firstParty', 'aadhaar')}
                          className="ml-2 text-xs text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">PAN Card</label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange('firstParty', 'pan', e.target.files[0])}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    {uploadedFiles.firstParty.pan && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-600">{uploadedFiles.firstParty.pan.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile('firstParty', 'pan')}
                          className="ml-2 text-xs text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <hr className="my-6" />

            {/* Section 3: Second Party */}
            <h5 className="text-lg font-semibold text-gray-900 mb-4">{t.sec3Title}</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.label_s_name} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="s_name"
                  value={formData.s_name}
                  onChange={handleChange}
                  minLength="3"
                  placeholder="Second party name"
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.s_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.s_name && <p className="text-red-500 text-sm mt-1">{errors.s_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.label_s_gender}
                </label>
                <select
                  name="s_gender"
                  value={formData.s_gender}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.label_s_mobile}
                </label>
                <input
                  type="text"
                  name="s_mobile"
                  value={formData.s_mobile}
                  onChange={handleChange}
                  placeholder="+9198xxxxxxx"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.s_mobile ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.s_mobile && <p className="text-red-500 text-sm mt-1">{errors.s_mobile}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.label_s_email}
                </label>
                <input
                  type="email"
                  name="s_email"
                  value={formData.s_email}
                  onChange={handleChange}
                  placeholder="example@mail.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.label_s_pan}
                </label>
                <input
                  type="text"
                  name="s_pan"
                  value={formData.s_pan}
                  onChange={handlePANInput}
                  maxLength="10"
                  placeholder="ABCDE1234F"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase ${
                    errors.s_pan ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.s_pan && <p className="text-red-500 text-sm mt-1">{errors.s_pan}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.label_s_aad}
                </label>
                <input
                  type="text"
                  name="s_aad"
                  value={formData.s_aad}
                  onChange={handleChange}
                  maxLength="12"
                  placeholder="12-digit Aadhaar"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.label_s_addr}
                </label>
                <textarea
                  name="s_addr"
                  value={formData.s_addr}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Second Party Documents */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Second Party Documents
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Photo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('secondParty', 'photo', e.target.files[0])}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    {uploadedFiles.secondParty.photo && (
                      <div className="mt-2 relative">
                        <img
                          src={previewImages['secondParty_photo']}
                          alt="Second Party Photo"
                          className="w-24 h-24 object-cover border border-gray-300 rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile('secondParty', 'photo')}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Aadhaar Card</label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange('secondParty', 'aadhaar', e.target.files[0])}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    {uploadedFiles.secondParty.aadhaar && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-600">{uploadedFiles.secondParty.aadhaar.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile('secondParty', 'aadhaar')}
                          className="ml-2 text-xs text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">PAN Card</label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange('secondParty', 'pan', e.target.files[0])}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    {uploadedFiles.secondParty.pan && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-600">{uploadedFiles.secondParty.pan.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile('secondParty', 'pan')}
                          className="ml-2 text-xs text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <hr className="my-6" />

            {/* Section 4: Payment & Submit */}
            <h5 className="text-lg font-semibold text-gray-900 mb-4">{t.sec4Title}</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.label_paid_by} <span className="text-red-500">*</span>
                </label>
                <select
                  name="paid_by"
                  value={formData.paid_by}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.paid_by ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {getPaidByOptions().map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {errors.paid_by && <p className="text-red-500 text-sm mt-1">{errors.paid_by}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.label_purchased_by}
                </label>
                <select
                  name="purchased_by"
                  value={formData.purchased_by}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {getPurchasedByOptions().map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                {formData.purchased_by === 'others' && (
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    If others, name
                  </label>
                )}
                {formData.purchased_by === 'others' && (
                  <input
                    type="text"
                    name="purchased_by_other"
                    value={formData.purchased_by_other}
                    onChange={handleChange}
                    placeholder="If others, name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
              </div>
            </div>

            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="declaration"
                  checked={formData.declaration}
                  onChange={handleChange}
                  required
                  className={`w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${
                    errors.declaration ? 'border-red-500' : ''
                  }`}
                />
                <span className="ml-2 text-sm text-gray-700">{t.label_decl}</span>
              </label>
              {errors.declaration && <p className="text-red-500 text-sm mt-1">{errors.declaration}</p>}
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={preparePreview}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Preview
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h5 className="text-lg font-semibold text-gray-900">{t.previewTitle}</h5>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <p><strong>{language === 'hi' ? 'धारा/टाइप' : 'Article/Type'}:</strong> {formData.article || '-'}</p>
                <p><strong>{language === 'hi' ? 'संपत्ति का विवरण' : 'Property Description'}:</strong> {formData.property || '-'}</p>
                {formData.consideredPrice && (
                  <p>
                    <strong>{language === 'hi' ? 'विचारित मूल्य' : 'Considered Price'}:</strong> ₹{formData.consideredPrice}
                    <br />
                    <em>{numberToWordsEn(Number(formData.consideredPrice) || 0)} / {numberToWordsHi(Number(formData.consideredPrice) || 0)}</em>
                  </p>
                )}
                <p>
                  <strong>{language === 'hi' ? 'राशि (स्टैम्प)' : 'Amount (Stamp)'}:</strong> ₹{formData.amount || '-'}
                  <br />
                  <em>{formData.amount ? `${numberToWordsEn(Number(formData.amount) || 0)} / ${numberToWordsHi(Number(formData.amount) || 0)}` : ''}</em>
                </p>
                <hr />
                <p><strong>{language === 'hi' ? 'पहली पार्टी' : 'First Party'}:</strong> {formData.f_name || '-'}</p>
                <p><strong>{language === 'hi' ? 'दूसरी पार्टी' : 'Second Party'}:</strong> {formData.s_name || '-'}</p>
                <p><strong>{language === 'hi' ? 'स्टैम्प ड्यूटी किसने दी' : 'Stamp Duty Paid By'}:</strong> {
                  formData.paid_by === 'first' ? formData.f_name :
                  formData.paid_by === 'second' ? formData.s_name :
                  formData.paid_by === 'both' ? t.both : '-'
                }</p>
                <p><strong>{language === 'hi' ? 'स्टैम्प खरीदा' : 'Stamp Purchased By'}:</strong> {
                  formData.purchased_by === 'mejyoh' ? t.purchasedDefault :
                  formData.purchased_by === 'first' ? formData.f_name :
                  formData.purchased_by === 'second' ? formData.s_name :
                  formData.purchased_by === 'others' ? formData.purchased_by_other :
                  '-'
                }</p>
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={confirmSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Confirm & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EStampApplication;

