"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function StampFormEdit({ params }) {
  const { formId } = params;
  const router = useRouter();
  const { getAuthHeaders } = useAuth();
  
  const [formData, setFormData] = useState({
    article: '',
    property: '',
    consideredPrice: 0,
    amount: 0,
    amountWords: '',
    firstParty: {
      name: '',
      mobile: '',
      email: '',
      pan: '',
      aadhaar: '',
      address: ''
    },
    secondParty: {
      name: '',
      mobile: '',
      email: '',
      pan: '',
      aadhaar: '',
      address: ''
    },
    paidBy: '',
    purchasedBy: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    if (formId) {
      loadStampForm();
    }
  }, [formId]);

  const loadStampForm = async () => {
    try {
      setLoading(true);
      setError('');
      
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(`${API_BASE}/api/stampForms/${formId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const stampForm = data.data.stampForm;
        setFormData({
          article: stampForm.article || '',
          property: stampForm.property || '',
          consideredPrice: stampForm.consideredPrice || 0,
          amount: stampForm.amount || 0,
          amountWords: stampForm.amountWords || '',
          firstParty: {
            name: stampForm.firstParty?.name || '',
            mobile: stampForm.firstParty?.mobile || '',
            email: stampForm.firstParty?.email || '',
            pan: stampForm.firstParty?.pan || '',
            aadhaar: stampForm.firstParty?.aadhaar || '',
            address: stampForm.firstParty?.address || ''
          },
          secondParty: {
            name: stampForm.secondParty?.name || '',
            mobile: stampForm.secondParty?.mobile || '',
            email: stampForm.secondParty?.email || '',
            pan: stampForm.secondParty?.pan || '',
            aadhaar: stampForm.secondParty?.aadhaar || '',
            address: stampForm.secondParty?.address || ''
          },
          paidBy: stampForm.paidBy || '',
          purchasedBy: stampForm.purchasedBy || ''
        });
      } else {
        setError(data.message || 'Failed to load stamp form');
      }
    } catch (err) {
      setError(err.message || 'Error loading stamp form');
    } finally {
      setLoading(false);
    }
  };

  const numberToWords = (num) => {
    if (!num || num === 0) return 'Zero Rupees Only';
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    const convertHundreds = (n) => {
      if (n < 20) return ones[n];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
      if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convertHundreds(n % 100) : '');
      return '';
    };
    
    let result = '';
    let n = Math.floor(num);
    
    if (n >= 10000000) {
      result += convertHundreds(Math.floor(n / 10000000)) + ' Crore ';
      n %= 10000000;
    }
    if (n >= 100000) {
      result += convertHundreds(Math.floor(n / 100000)) + ' Lakh ';
      n %= 100000;
    }
    if (n >= 1000) {
      result += convertHundreds(Math.floor(n / 1000)) + ' Thousand ';
      n %= 1000;
    }
    if (n > 0) {
      result += convertHundreds(n);
    }
    
    return result.trim().replace(/\s+/g, ' ') + ' Rupees Only';
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Auto-update amount words when amount changes
    if (field === 'amount' || field === 'consideredPrice') {
      const amount = field === 'amount' ? value : formData.amount;
      if (amount > 0) {
        setFormData(prev => ({
          ...prev,
          amountWords: numberToWords(amount)
        }));
      }
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(`${API_BASE}/api/stampForms/${formId}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Stamp form updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update stamp form');
      }
    } catch (err) {
      setError(err.message || 'Error updating stamp form');
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(`${API_BASE}/api/stampForms/${formId}/verify`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notes: 'Form verified by Staff 2'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Stamp form verified successfully!');
        setTimeout(() => {
          setSuccess('');
          router.push('/staff2/stamp-forms');
        }, 2000);
      } else {
        setError(data.message || 'Failed to verify stamp form');
      }
    } catch (err) {
      setError(err.message || 'Error verifying stamp form');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this stamp form? This action cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(`${API_BASE}/api/stampForms/${formId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (response.ok && data.success) {
        router.push('/staff2/stamp-forms');
      } else {
        setError(data.message || 'Failed to delete stamp form');
      }
    } catch (err) {
      setError(err.message || 'Error deleting stamp form');
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePDF = () => {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
    window.open(`${API_BASE}/api/stampForms/${formId}/pdf`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading stamp form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                e-Stamp Form - {formId.slice(-8)}
              </h1>
              <p className="text-gray-600">Edit and verify stamp application form</p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/staff2/stamp-forms"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                ← Back to List
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Language Selector */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {language === 'en' ? 'e-Stamp Application' : 'ई-स्टैम्प आवेदन'}
            </h3>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
            </select>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
            {success}
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border">
          <form className="p-6 space-y-8">
            {/* Section 1: Stamp & Property Details */}
            <div>
              <h5 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                1. {language === 'en' ? 'Stamp & Property Details' : 'स्टैम्प और संपत्ति विवरण'}
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'en' ? 'Article / Stamp Type' : 'धारा / स्टैम्प प्रकार'} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.article}
                    onChange={(e) => handleInputChange('article', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select --</option>
                    <option value="Affidavit">Affidavit</option>
                    <option value="Lease Agreement">Lease Agreement</option>
                    <option value="Conveyance Deed">Conveyance Deed</option>
                    <option value="Sale Deed">Sale Deed</option>
                    <option value="Agreement">Agreement</option>
                    <option value="Power of Attorney">Power of Attorney</option>
                    <option value="Cancellation">Cancellation</option>
                    <option value="Mortgage Deed">Mortgage Deed</option>
                    <option value="Bond">Bond</option>
                    <option value="Court Bond">Court Bond</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'en' ? 'Considered Price (₹)' : 'विचारित मूल्य (₹)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.consideredPrice}
                    onChange={(e) => handleInputChange('consideredPrice', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 1500000"
                  />
                  {formData.consideredPrice > 0 && (
                    <p className="text-sm text-gray-500 mt-1 italic">
                      {numberToWords(formData.consideredPrice)}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'en' ? 'Property Description' : 'संपत्ति का विवरण'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.property}
                    onChange={(e) => handleInputChange('property', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter property description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'en' ? 'Amount (Stamp) (₹)' : 'राशि (स्टैम्प) (₹)'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 2000"
                  />
                  {formData.amount > 0 && (
                    <p className="text-sm text-gray-500 mt-1 italic">
                      {numberToWords(formData.amount)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'en' ? 'Amount in Words' : 'राशि अक्षरों में'}
                  </label>
                  <input
                    type="text"
                    value={formData.amountWords}
                    onChange={(e) => handleInputChange('amountWords', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Auto-generated from amount"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: First Party */}
            <div>
              <h5 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                2. {language === 'en' ? 'First Party Details' : 'पहली पार्टी विवरण'}
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'en' ? 'Full Name' : 'पूरा नाम'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstParty.name}
                    onChange={(e) => handleInputChange('firstParty.name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="First party name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'en' ? 'Mobile' : 'मोबाइल'}
                  </label>
                  <input
                    type="tel"
                    value={formData.firstParty.mobile}
                    onChange={(e) => handleInputChange('firstParty.mobile', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+9198xxxxxxx"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'en' ? 'Email' : 'ईमेल'}
                  </label>
                  <input
                    type="email"
                    value={formData.firstParty.email}
                    onChange={(e) => handleInputChange('firstParty.email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="example@mail.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'en' ? 'PAN' : 'पैन'}
                  </label>
                  <input
                    type="text"
                    maxLength="10"
                    value={formData.firstParty.pan}
                    onChange={(e) => handleInputChange('firstParty.pan', e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ABCDE1234F"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'en' ? 'Aadhaar' : 'आधार'}
                  </label>
                  <input
                    type="text"
                    maxLength="12"
                    value={formData.firstParty.aadhaar}
                    onChange={(e) => handleInputChange('firstParty.aadhaar', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="12-digit Aadhaar"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'en' ? 'Address (optional)' : 'पता (वैकल्पिक)'}
                  </label>
                  <textarea
                    rows="3"
                    value={formData.firstParty.address}
                    onChange={(e) => handleInputChange('firstParty.address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter address"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Second Party */}
            <div>
              <h5 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                3. {language === 'en' ? 'Second Party Details' : 'दूसरी पार्टी विवरण'}
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'en' ? 'Full Name' : 'पूरा नाम'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.secondParty.name}
                    onChange={(e) => handleInputChange('secondParty.name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Second party name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'en' ? 'Mobile' : 'मोबाइल'}
                  </label>
                  <input
                    type="tel"
                    value={formData.secondParty.mobile}
                    onChange={(e) => handleInputChange('secondParty.mobile', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+9198xxxxxxx"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'en' ? 'Email' : 'ईमेल'}
                  </label>
                  <input
                    type="email"
                    value={formData.secondParty.email}
                    onChange={(e) => handleInputChange('secondParty.email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="example@mail.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'en' ? 'PAN' : 'पैन'}
                  </label>
                  <input
                    type="text"
                    maxLength="10"
                    value={formData.secondParty.pan}
                    onChange={(e) => handleInputChange('secondParty.pan', e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ABCDE1234F"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'en' ? 'Aadhaar' : 'आधार'}
                  </label>
                  <input
                    type="text"
                    maxLength="12"
                    value={formData.secondParty.aadhaar}
                    onChange={(e) => handleInputChange('secondParty.aadhaar', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="12-digit Aadhaar"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'en' ? 'Address (optional)' : 'पता (वैकल्पिक)'}
                  </label>
                  <textarea
                    rows="3"
                    value={formData.secondParty.address}
                    onChange={(e) => handleInputChange('secondParty.address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter address"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Payment & Submit */}
            <div>
              <h5 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                4. {language === 'en' ? 'Stamp Payment & Submission' : 'स्टैम्प भुगतान और सबमिशन'}
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'en' ? 'Stamp Duty Paid By' : 'स्टैम्प ड्यूटी किसने दी'} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.paidBy}
                    onChange={(e) => handleInputChange('paidBy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select</option>
                    <option value={formData.firstParty.name}>{formData.firstParty.name || 'First Party'}</option>
                    <option value={formData.secondParty.name}>{formData.secondParty.name || 'Second Party'}</option>
                    <option value="Both">{language === 'en' ? 'Both' : 'दोनों'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'en' ? 'Stamp Purchased By' : 'स्टैम्प खरीदा'}
                  </label>
                  <select
                    value={formData.purchasedBy}
                    onChange={(e) => handleInputChange('purchasedBy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Me Jyoh Service Pvt. Ltd.">Me Jyoh Service Pvt. Ltd.</option>
                    <option value={formData.firstParty.name}>{formData.firstParty.name || 'First Party'}</option>
                    <option value={formData.secondParty.name}>{formData.secondParty.name || 'Second Party'}</option>
                    <option value="Others">{language === 'en' ? 'Others' : 'अन्य'}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : '💾 Save Changes'}
              </button>

              <button
                type="button"
                onClick={handleVerify}
                disabled={saving}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Verifying...' : '✅ Verify Form'}
              </button>

              <button
                type="button"
                onClick={handleGeneratePDF}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                🖨️ Generate PDF
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Deleting...' : '🗑️ Delete Form'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
