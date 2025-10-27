"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Staff1StampCalculationPage() {
  const searchParams = useSearchParams();
  const formId = searchParams.get('formId');
  const { getAuthHeaders } = useAuth();
  
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState(null);
  const [calculationResult, setCalculationResult] = useState(null);
  
  const [calculationData, setCalculationData] = useState({
    propertyValue: '',
    propertyType: 'residential',
    location: '',
    calculationMethod: 'Standard Rate',
    applicableRules: [],
    notes: ''
  });

  useEffect(() => {
    if (formId) {
      fetchFormDetails();
    }
  }, [formId]);

  const fetchFormDetails = async () => {
    try {
      setLoading(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(`${API_BASE}/api/staff/1/forms/${formId}`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setForm(data.data.form);
        
        // Pre-fill some data from form if available
        const fields = data.data.form.fields || {};
        setCalculationData(prev => ({
          ...prev,
          propertyValue: fields.propertyValue || fields.saleAmount || fields.marketValue || '',
          location: fields.propertyLocation || fields.address || '',
        }));
      } else {
        throw new Error('Failed to fetch form details');
      }
    } catch (error) {
      console.error('Error fetching form details:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateStamp = async () => {
    try {
      setCalculating(true);
      setError(null);

      if (!calculationData.propertyValue || isNaN(calculationData.propertyValue)) {
        throw new Error('Please enter a valid property value');
      }

      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(`${API_BASE}/api/staff/1/forms/${formId}/calculate-stamp`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(calculationData)
      });

      if (response.ok) {
        const data = await response.json();
        setCalculationResult(data.data);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to calculate stamp duty');
      }
    } catch (error) {
      console.error('Error calculating stamp duty:', error);
      setError(error.message);
    } finally {
      setCalculating(false);
    }
  };

  const handleInputChange = (field, value) => {
    setCalculationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getServiceTypeDescription = (serviceType) => {
    const descriptions = {
      'sale-deed': 'Sale Deed - Transfer of property ownership through sale',
      'will-deed': 'Will Deed - Transfer of property through inheritance',
      'trust-deed': 'Trust Deed - Property held in trust',
      'property-registration': 'Property Registration - Official registration of property',
      'power-of-attorney': 'Power of Attorney - Legal authorization document',
      'adoption-deed': 'Adoption Deed - Legal adoption documentation'
    };
    return descriptions[serviceType] || serviceType;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Stamp Duty Calculator</h1>
            <p className="text-gray-600">
              Calculate stamp duty for legal documents and property transactions
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {formId && (
              <Link
                href={`/staff1/forms/${formId}`}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Form
              </Link>
            )}
            <Link
              href="/staff1/forms"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              All Forms
            </Link>
          </div>
        </div>

        {/* Form Information */}
        {form && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Form Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Service Type:</span>
                <p className="text-blue-900">{getServiceTypeDescription(form.serviceType)}</p>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Submitted By:</span>
                <p className="text-blue-900">{form.userId?.name}</p>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Form ID:</span>
                <p className="text-blue-900 font-mono">{form._id}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Calculation Form */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Calculation Parameters</h2>
          <p className="text-sm text-gray-600 mt-1">
            Enter the required information to calculate the stamp duty
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Property Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Value (₹) *
              </label>
              <input
                type="number"
                value={calculationData.propertyValue}
                onChange={(e) => handleInputChange('propertyValue', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter property value in rupees"
                min="0"
                step="1000"
              />
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type
              </label>
              <select
                value={calculationData.propertyType}
                onChange={(e) => handleInputChange('propertyType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
                <option value="agricultural">Agricultural</option>
                <option value="plot">Plot/Land</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Location
              </label>
              <input
                type="text"
                value={calculationData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter property location"
              />
            </div>

            {/* Calculation Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calculation Method
              </label>
              <select
                value={calculationData.calculationMethod}
                onChange={(e) => handleInputChange('calculationMethod', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Standard Rate">Standard Rate</option>
                <option value="Market Value">Market Value Based</option>
                <option value="Government Rate">Government Rate</option>
                <option value="Circle Rate">Circle Rate</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={calculationData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add any additional notes about the calculation..."
            />
          </div>

          {/* Calculate Button */}
          <div className="mt-6">
            <button
              onClick={handleCalculateStamp}
              disabled={calculating || !calculationData.propertyValue || !formId}
              className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {calculating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Calculating...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>Calculate Stamp Duty</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-red-800 font-semibold">Calculation Error</h3>
          </div>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
      )}

      {/* Calculation Result */}
      {calculationResult && (
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Calculation Result</h2>
          </div>
          
          <div className="p-6">
            {/* Main Result */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-green-900 mb-2">
                  Stamp Duty: {formatCurrency(calculationResult.stampDuty)}
                </h3>
                <p className="text-green-700">
                  For {form?.serviceType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </p>
              </div>
            </div>

            {/* Calculation Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Calculation Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property Value:</span>
                    <span className="font-medium">{formatCurrency(calculationData.propertyValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Rate:</span>
                    <span className="font-medium">{calculationResult.calculationDetails?.baseRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property Type:</span>
                    <span className="font-medium capitalize">{calculationData.propertyType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method:</span>
                    <span className="font-medium">{calculationData.calculationMethod}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Calculation Formula</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <code className="text-sm text-gray-800">
                    {calculationResult.calculationDetails?.calculation}
                  </code>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {calculationResult.staffReport && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Report Information</h4>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    This calculation has been saved to the staff report for form {form?._id}.
                    The stamp duty amount and calculation details are now part of the form's processing history.
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>Print Result</span>
                </button>

                <button
                  onClick={() => {
                    setCalculationResult(null);
                    setCalculationData(prev => ({
                      ...prev,
                      propertyValue: '',
                      notes: ''
                    }));
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>New Calculation</span>
                </button>

                {formId && (
                  <Link
                    href={`/staff1/forms/${formId}`}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Continue with Form</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stamp Duty Information */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Stamp Duty Information</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-3">Standard Rates</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sale Deed:</span>
                  <span className="font-medium">6% of property value</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Will Deed:</span>
                  <span className="font-medium">0.1% (min ₹500)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trust Deed:</span>
                  <span className="font-medium">3% of property value</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Property Registration:</span>
                  <span className="font-medium">1% of property value</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Power of Attorney:</span>
                  <span className="font-medium">Fixed ₹100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Adoption Deed:</span>
                  <span className="font-medium">Fixed ₹50</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-3">Important Notes</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Stamp duty rates may vary by state and property type</li>
                <li>• Additional registration charges may apply</li>
                <li>• Consult local authorities for exact rates</li>
                <li>• Some documents may have minimum stamp duty requirements</li>
                <li>• Commercial properties may have different rates</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
