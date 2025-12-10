"use client"

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const FormWorkflowContext = createContext();

export const useFormWorkflow = () => {
  const context = useContext(FormWorkflowContext);
  if (!context) {
    throw new Error('useFormWorkflow must be used within a FormWorkflowProvider');
  }
  return context;
};

export const FormWorkflowProvider = ({ children, formType }) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState('form');
  const [formData, setFormData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('Processing your request...');

  const goToPreview = useCallback((data) => {
    setFormData(data);
    setCurrentStep('preview');
  }, []);

  const goToEdit = useCallback(() => {
    setCurrentStep('form');
  }, []);

  const goToProcessing = useCallback((message = 'Processing your request...') => {
    setProcessingMessage(message);
    setCurrentStep('processing');
    setIsProcessing(true);
  }, []);

  const goToPayment = useCallback((paymentData) => {
    setCurrentStep('payment');
    setIsProcessing(false);
  }, []);

  const resetWorkflow = useCallback(() => {
    setCurrentStep('form');
    setFormData(null);
    setIsProcessing(false);
    setProcessingMessage('Processing your request...');
  }, []);

  const submitForm = useCallback(async (endpoint, data) => {
    try {
      goToProcessing('Validating your form...');
      
      // Validate form data before submission
      if (!data) {
        throw new Error('No form data provided');
      }

      // Basic validation based on form type
      switch (formType) {
        case 'trust-deed':
          if (!data.trustees || data.trustees.length === 0) {
            throw new Error('At least one trustee is required');
          }
          if (!data.trustName) {
            throw new Error('Trust name is required');
          }
          if (!data.trustAddress) {
            throw new Error('Trust address is required');
          }
          break;
        case 'sale-deed':
          if (!data.sellers || data.sellers.length === 0) {
            throw new Error('At least one seller is required');
          }
          if (!data.buyers || data.buyers.length === 0) {
            throw new Error('At least one buyer is required');
          }
          break;
        case 'will-deed':
          if (!data.testator || !data.testator.name) {
            throw new Error('Testator information is required');
          }
          if (!data.beneficiaries || data.beneficiaries.length === 0) {
            throw new Error('At least one beneficiary is required');
          }
          break;
        case 'property-registration':
          if (!data.propertyDetails) {
            throw new Error('Property details are required');
          }
          break;
        case 'property-sale-certificate':
          if (!data.bank_name || !data.bank_rep_name || !data.property_address || !data.sale_amount) {
            throw new Error('Bank information, property details, and sale amount are required');
          }
          break;
        case 'power-of-attorney':
          if (!data.kartaParties || data.kartaParties.length === 0) {
            throw new Error('At least one principal (Karta) is required');
          }
          if (!data.agentParties || data.agentParties.length === 0) {
            throw new Error('At least one agent is required');
          }
          break;
        case 'adoption-deed':
          if (!data.firstParties || data.firstParties.length === 0) {
            throw new Error('At least one first party is required');
          }
          if (!data.childName) {
            throw new Error('Child name is required');
          }
          break;
      }

      goToProcessing('Submitting form data to database...');
      
      // Get authentication token
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      
      // Submit form data directly to backend
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      
      // For sale-deed, we need to convert JSON to FormData format
      let body;
      let headers = {};
      
      if (formType === 'sale-deed') {
        // Convert to FormData for multipart submission
        body = new FormData();
        
        // Prepare data for JSON serialization (remove File objects temporarily)
        const dataForJson = { ...data };
        const filesToAppend = [];
        
        // Extract files from sellers, buyers, witnesses and prepare for separate append
        ['sellers', 'buyers', 'witnesses'].forEach(key => {
          if (Array.isArray(data[key])) {
            data[key] = data[key].map((item, index) => {
              const cleanedItem = { ...item };
              const typePrefix = key.substring(0, key.length - 1); // seller, buyer, witness
              
              // Extract file fields
              ['panCard', 'photo', 'id', 'signature'].forEach(fileKey => {
                if (item[fileKey] instanceof File) {
                  filesToAppend.push({
                    fieldname: `${typePrefix}_${index}_${fileKey}`,
                    file: item[fileKey]
                  });
                  cleanedItem[fileKey] = null; // Remove File object from JSON data
                }
              });
              
              return cleanedItem;
            });
          }
        });

        // Extract property photos
        if (Array.isArray(data.propertyPhotos)) {
          data.propertyPhotos.forEach((photo, index) => {
            // photo can be a File object directly or an object with a file property
            if (photo instanceof File) {
              filesToAppend.push({
                fieldname: `propertyPhoto_${index}`,
                file: photo
              });
            } else if (photo && photo.file instanceof File) {
              filesToAppend.push({
                fieldname: `propertyPhoto_${index}`,
                file: photo.file
              });
            }
          });
          // Remove File objects from JSON data
          data.propertyPhotos = data.propertyPhotos.map(photo => {
            if (photo instanceof File) {
              return null;
            }
            return {
              ...photo,
              file: null
            };
          }).filter(p => p !== null);
        }

        // Extract live photos
        if (Array.isArray(data.livePhotos)) {
          data.livePhotos.forEach((photo, index) => {
            // photo can be a File object directly or an object with a file property
            if (photo instanceof File) {
              filesToAppend.push({
                fieldname: `livePhoto_${index}`,
                file: photo
              });
            } else if (photo && photo.file instanceof File) {
              filesToAppend.push({
                fieldname: `livePhoto_${index}`,
                file: photo.file
              });
            }
          });
          // Remove File objects from JSON data
          data.livePhotos = data.livePhotos.map(photo => {
            if (photo instanceof File) {
              return null;
            }
            return {
              ...photo,
              file: null
            };
          }).filter(p => p !== null);
        }
        
        // Add all form fields (including arrays as JSON)
        Object.keys(dataForJson).forEach(key => {
          if (key !== 'files' && key !== 'calculations' && key !== 'amount' && key !== 'formType') {
            if (typeof dataForJson[key] === 'object' && !Array.isArray(dataForJson[key]) && dataForJson[key] !== null) {
              // Nested objects
              Object.keys(dataForJson[key]).forEach(nestedKey => {
                body.append(`${key}_${nestedKey}`, dataForJson[key][nestedKey]);
              });
            } else if (Array.isArray(dataForJson[key])) {
              // Arrays - send as JSON string for complex arrays, or flatten for simple arrays
              if (key === 'sellers' || key === 'buyers' || key === 'witnesses' || key === 'rooms' || key === 'trees') {
                // Send complex arrays as JSON string
                body.append(key, JSON.stringify(dataForJson[key]));
              } else {
                // Simple arrays
                dataForJson[key].forEach((item, index) => {
                  body.append(`${key}_${index + 1}`, item);
                });
              }
            } else if (dataForJson[key] !== null && dataForJson[key] !== undefined) {
              body.append(key, dataForJson[key]);
            }
          }
        });
        
        // Append calculations if present
        if (dataForJson.calculations) {
          body.append('calculations', JSON.stringify(dataForJson.calculations));
        }
        
        // Append all files with correct field names
        filesToAppend.forEach(({ fieldname, file }) => {
          body.append(fieldname, file);
        });
      } else {
        // For other forms, use JSON
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(data);
      }
      
      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed (${response.status})`);
      }

      const result = await response.json();
      console.log('Form submitted successfully:', result);
      
      goToProcessing('Form submitted successfully! Redirecting to payment...');
      
      // After successful database submission, go to payment
      setTimeout(() => {
        goToPayment({
          formId: result.data?.id || `form-${Date.now()}`,
          amount: data.amount || 1000,
          formType: formType,
          formData: data,
          submittedToDatabase: true
        });
      }, 1500);
      
    } catch (error) {
      console.error('Form submission error:', error);
      goToProcessing(`❌ ${error.message}. Please check your form and try again.`);
      
      // Reset to form after error
      setTimeout(() => {
        resetWorkflow();
      }, 4000);
    }
  }, [goToProcessing, goToPayment, resetWorkflow, formType]);

  const value = {
    currentStep,
    formData,
    isProcessing,
    processingMessage,
    formType,
    goToPreview,
    goToEdit,
    goToProcessing,
    goToPayment,
    resetWorkflow,
    submitForm,
  };

  return (
    <FormWorkflowContext.Provider value={value}>
      {children}
    </FormWorkflowContext.Provider>
  );
};

