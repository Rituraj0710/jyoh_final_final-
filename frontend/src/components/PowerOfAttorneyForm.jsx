"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import CameraCapture from "./CameraCapture";
import LanguageSelector from "./LanguageSelector";
import { useTranslation } from "../hooks/useTranslation";
import { FormWorkflowProvider, useFormWorkflow } from './FormWorkflow/FormWorkflowProvider';
import FormWorkflow from './FormWorkflow/FormWorkflow';
import FormPreview from './FormWorkflow/FormPreview';
import ProcessingState from './FormWorkflow/ProcessingState';
import PaymentGateway from './FormWorkflow/PaymentGateway';

const PowerOfAttorneyFormContent = () => {
  const { t } = useTranslation();
  const { goToPreview } = useFormWorkflow();
  const [currentLang, setCurrentLang] = useState('hi');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Document Details
    executionDate: '',
    state: '',
    district: '',
    tehsil: '',
    subRegistrarOffice: '',
    
    // Parties
    kartaParties: [{
      prefix: 'Shri',
      name: '',
      fatherName: '',
      age: '',
      occupation: 'Service',
      idType: 'Aadhaar',
      idNo: '',
      idPhoto: null,
      address: '',
      photo: null
    }],
    agentParties: [{
      prefix: 'Shri',
      name: '',
      fatherName: '',
      occupation: 'Service',
      idType: 'Aadhaar',
      idNo: '',
      idPhoto: null,
      address: '',
      photo: null
    }],
    witnessParties: [{
      prefix: 'Shri',
      name: '',
      fatherName: '',
      occupation: 'Service',
      idType: 'Aadhaar',
      idNo: '',
      idPhoto: null,
      address: '',
      photo: null
    }],
    
    // Powers
    powers: [],
    otherPowersText: '',
    generalPowerCheckbox: false,
    
    // Properties
    properties: [{
      mainPropertyType: '',
      propertyAddress: '',
      propertyType: '',
      totalPlotArea: '',
      totalPlotUnit: 'sqft',
      builtUpArea: '',
      builtUpUnit: 'sqft',
      acquisitionMethod: '',
      acquisitionDocNo: '',
      pageNo: '',
      bookVolumeNo: '',
      registrationDate: '',
      subRegistrarDetails: '',
      movablePropertyDetails: ''
    }]
  });

  const [errors, setErrors] = useState({});

  const [previewPhotos, setPreviewPhotos] = useState({});

  // Validation functions
  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'executionDate':
        if (!value) error = 'Execution date is required';
        else if (new Date(value) > new Date()) error = 'Execution date cannot be in the future';
        break;
      case 'state':
      case 'district':
      case 'tehsil':
      case 'subRegistrarOffice':
        if (!value) error = 'This field is required';
        break;
      case 'name':
        if (!value) error = 'Name is required';
        else if (value.length < 2) error = 'Name must be at least 2 characters';
        break;
      case 'fatherName':
        if (!value) error = 'Father/Husband name is required';
        break;
      case 'age':
        if (!value) error = 'Age is required';
        else if (isNaN(value) || value < 18 || value > 100) error = 'Age must be between 18 and 100';
        break;
      case 'idNo':
        if (!value) error = 'ID number is required';
        else if (value.length < 10) error = 'ID number must be at least 10 characters';
        break;
      case 'address':
        if (!value) error = 'Address is required';
        else if (value.length < 10) error = 'Address must be at least 10 characters';
        break;
      case 'totalPlotArea':
      case 'builtUpArea':
        if (value && (isNaN(value) || value <= 0)) error = 'Please enter a valid number';
        break;
      default:
        break;
    }
    
    return error;
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate document details
    ['executionDate', 'state', 'district', 'tehsil', 'subRegistrarOffice'].forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    
    // Validate parties
    ['kartaParties', 'agentParties', 'witnessParties'].forEach(partyType => {
      formData[partyType].forEach((party, index) => {
        ['name', 'fatherName', 'address'].forEach(field => {
          const error = validateField(field, party[field]);
          if (error) newErrors[`${partyType}_${index}_${field}`] = error;
        });
        
        if (partyType === 'kartaParties') {
          const ageError = validateField('age', party.age);
          if (ageError) newErrors[`${partyType}_${index}_age`] = ageError;
        }
        
        const idError = validateField('idNo', party.idNo);
        if (idError) newErrors[`${partyType}_${index}_idNo`] = idError;
      });
    });
    
    // Validate powers
    if (formData.powers.length === 0) {
      newErrors.powers = 'At least one power must be selected';
    }
    
    // Validate properties
    formData.properties.forEach((property, index) => {
      if (property.mainPropertyType) {
        if (property.mainPropertyType === 'Immovable' || property.mainPropertyType === 'Both') {
          if (!property.propertyAddress) {
            newErrors[`property_${index}_address`] = 'Property address is required';
          }
        }
        if (property.mainPropertyType === 'Movable' || property.mainPropertyType === 'Both') {
          if (!property.movablePropertyDetails) {
            newErrors[`property_${index}_movable`] = 'Movable property details are required';
          }
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const translations = {
    hi: {
      "form-heading": "मुख्तार आम (Power of Attorney) रजिस्ट्रेशन फॉर्म",
      "form-subheading": "कृपया सभी जानकारी सही और साफ़ तौर पर भरें।",
      "section-1-heading": "दस्तावेज़ की जानकारी",
      "section-2-heading": "1. मुख्तार कर्ता (Principal) की जानकारी",
      "section-3-heading": "2. मुख्तार (Agent) की जानकारी",
      "section-4-heading": "3. दिए गए अधिकार (Powers Granted)",
      "section-5-heading": "4. संपत्ति (Property) की जानकारी",
      "section-6-heading": "5. गवाहों (Witnesses) की जानकारी",
      "label-executionDate": "दस्तावेज़ बनाने की तारीख:",
      "label-state": "राज्य (State):",
      "label-district": "ज़िला (District):",
      "label-tehsil": "तहसील (Tehsil):",
      "label-subRegistrarOffice": "सब रजिस्ट्रार कार्यालय:",
      "label-party-name": "पूरा नाम",
      "label-father-name": "पिता/पति का नाम:",
      "label-age": "उम्र:",
      "label-occupation": "पेशा (Occupation):",
      "label-id-type": "पहचान का प्रकार (Identity Type):",
      "label-id-no": "पहचान संख्या (Identity No.):",
      "label-id-photo": "पहचान दस्तावेज़ अपलोड:",
      "label-address": "पूरा पता (Address):",
      "label-photo": "पासपोर्ट साइज़ फ़ोटो:",
      "btn-camera": "कैमरा",
      "span-document-preview": "डॉक्यूमेंट पूर्वावलोकन",
      "span-photo-preview": "फोटो पूर्वावलोकन",
      "powers-subheading": "कृपया मुख्तार को दिए जाने वाले अधिकार चुनें:",
      "label-power-sell": "संपत्ति बेचना",
      "label-power-lease": "संपत्ति पट्टे पर देना",
      "label-power-bank": "बैंक खाते का संचालन",
      "label-power-court": "न्यायालय में केस लड़ना",
      "label-power-rent": "किराया जमा करना",
      "label-power-sign": "दस्तावेज़ों पर हस्ताक्षर करना",
      "label-power-mortgage": "संपत्ति गिरवी रखना",
      "label-power-tax": "करों का भुगतान करना",
      "label-power-govt": "सरकारी विभागों से संपर्क करना",
      "label-power-debt": "बकाया और ऋण एकत्र करना",
      "label-power-other": "अन्य (खुद लिखें)",
      "label-general-power": "जनरल पॉवर ऑफ़ अटॉर्नी के नियम और शर्तें शामिल करें",
      "h4-immovable": "अचल संपत्ति (Immovable Property)",
      "h4-movable": "चल संपत्ति (Movable Property)",
      "h4-acquisition": "संपत्ति की प्राप्ति का विवरण (Acquisition Details)",
      "label-property-type": "संपत्ति का प्रकार (चल/अचल):",
      "label-property-address": "संपत्ति का पूरा पता:",
      "label-property-type-specific": "संपत्ति का प्रकार:",
      "label-plot-area": "कुल प्लॉट क्षेत्रफल:",
      "label-built-area": "निर्मित क्षेत्रफल (Built-up Area):",
      "label-movable-details": "चल संपत्ति का विवरण:",
      "span-sqm-text": "Sq. Mtr. में:",
      "label-acquisition-doc": "किस दस्तावेज़ से संपत्ति प्राप्त की गई:",
      "label-acquisition-doc-no": "दस्तावेज़ संख्या:",
      "label-page-no": "पृष्ठ संख्या (From-To):",
      "label-book-no": "बुक संख्या/वॉल्यूम संख्या:",
      "label-reg-date": "पंजीकरण की तारीख:",
      "label-sub-registrar": "सब रजिस्ट्रार का नाम और पता:",
      "btn-add-karta": "और जोड़ें (मुख्तार कर्ता)",
      "btn-add-agent": "और जोड़ें (मुख्तार)",
      "btn-add-witness": "और जोड़ें (गवाह)",
      "btn-add-property": "और संपत्ति जोड़ें",
      "btn-select-all": "सभी चुनें",
      "btn-preview": "पूर्वावलोकन देखें",
      "btn-submit": "सबमिट करें",
      "btn-remove": "हटाएं"
    },
    en: {
      "form-heading": "Power of Attorney Registration Form",
      "form-subheading": "Please fill all the details correctly and clearly.",
      "section-1-heading": "Document Details",
      "section-2-heading": "1. Principal's Details",
      "section-3-heading": "2. Agent's Details",
      "section-4-heading": "3. Powers Granted",
      "section-5-heading": "4. Property Details",
      "section-6-heading": "5. Witnesses' Details",
      "label-executionDate": "Execution Date:",
      "label-state": "State:",
      "label-district": "District:",
      "label-tehsil": "Tehsil:",
      "label-subRegistrarOffice": "Sub Registrar Office:",
      "label-party-name": "Full Name",
      "label-father-name": "Father/Husband's Name:",
      "label-age": "Age:",
      "label-occupation": "Occupation:",
      "label-id-type": "Identity Type:",
      "label-id-no": "Identity No.:",
      "label-id-photo": "Upload Identity Document:",
      "label-address": "Full Address:",
      "label-photo": "Passport Size Photo:",
      "btn-camera": "Camera",
      "span-document-preview": "Document Preview",
      "span-photo-preview": "Photo Preview",
      "powers-subheading": "Please select the powers to be granted to the agent:",
      "label-power-sell": "To sell the property",
      "label-power-lease": "To lease the property",
      "label-power-bank": "To operate bank accounts",
      "label-power-court": "To litigate in court",
      "label-power-rent": "To collect rent",
      "label-power-sign": "To sign documents",
      "label-power-mortgage": "To mortgage the property",
      "label-power-tax": "To pay taxes",
      "label-power-govt": "To interact with government departments",
      "label-power-debt": "To collect dues and debts",
      "label-power-other": "Other (write your own)",
      "label-general-power": "Include general Power of Attorney terms and conditions",
      "h4-immovable": "Immovable Property",
      "h4-movable": "Movable Property",
      "h4-acquisition": "Acquisition Details",
      "label-property-type": "Property Type (Movable/Immovable):",
      "label-property-address": "Full Property Address:",
      "label-property-type-specific": "Property Type:",
      "label-plot-area": "Total Plot Area:",
      "label-built-area": "Built-up Area:",
      "label-movable-details": "Movable Property Details:",
      "span-sqm-text": "In Sq. Mtr.:",
      "label-acquisition-doc": "Document by which property was acquired:",
      "label-acquisition-doc-no": "Document No.:",
      "label-page-no": "Page No. (From-To):",
      "label-book-no": "Book No./Volume No.:",
      "label-reg-date": "Registration Date:",
      "label-sub-registrar": "Name and Address of Sub Registrar:",
      "btn-add-karta": "Add More (Principal)",
      "btn-add-agent": "Add More (Agent)",
      "btn-add-witness": "Add More (Witness)",
      "btn-add-property": "Add More Property",
      "btn-select-all": "Select All",
      "btn-preview": "Show Preview",
      "btn-submit": "Submit",
      "btn-remove": "Remove"
    }
  };

  const locationData = {
    "Uttar Pradesh": {
      "Ghaziabad": ["Ghaziabad", "Modinagar", "Loni"],
      "Lucknow": ["Lucknow", "Mohanlalganj", "Bakshi Ka Talab"]
    },
    "Delhi": {
      "New Delhi": ["New Delhi", "Dwarka"],
      "North Delhi": ["Civil Lines", "Narela"]
    },
    "Maharashtra": {
      "Mumbai": ["Mumbai City", "Mumbai Suburban"],
      "Pune": ["Haveli", "Pimpri-Chinchwad"]
    }
  };

  const powerOptions = [
    { value: "संपत्ति बेचना", label: "label-power-sell" },
    { value: "संपत्ति पट्टे पर देना", label: "label-power-lease" },
    { value: "बैंक खाते का संचालन", label: "label-power-bank" },
    { value: "न्यायालय में केस लड़ना", label: "label-power-court" },
    { value: "किराया जमा करना", label: "label-power-rent" },
    { value: "दस्तावेज़ों पर हस्ताक्षर करना", label: "label-power-sign" },
    { value: "संपत्ति गिरवी रखना", label: "label-power-mortgage" },
    { value: "करों का भुगतान करना", label: "label-power-tax" },
    { value: "सरकारी विभागों से संपर्क करना", label: "label-power-govt" },
    { value: "बकाया और ऋण एकत्र करना", label: "label-power-debt" }
  ];

  const handleInputChange = (section, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleFileChange = (section, index, field, file) => {
    handleInputChange(section, index, field, file);
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewPhotos(prev => ({
          ...prev,
          [`${section}_${index}_${field}`]: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (section, index, field, file, imageSrc) => {
    handleInputChange(section, index, field, file);
    setPreviewPhotos(prev => ({
      ...prev,
      [`${section}_${index}_${field}`]: imageSrc
    }));
    toast.success('Photo captured successfully!');
  };

  const addParty = (type) => {
    const newParty = {
      prefix: 'Shri',
      name: '',
      fatherName: '',
      age: '',
      occupation: 'Service',
      idType: 'Aadhaar',
      idNo: '',
      idPhoto: null,
      address: '',
      photo: null
    };

    if (type !== 'karta') {
      delete newParty.age;
    }

    setFormData(prev => ({
      ...prev,
      [`${type}Parties`]: [...prev[`${type}Parties`], newParty]
    }));
  };

  const removeParty = (type, index) => {
    setFormData(prev => ({
      ...prev,
      [`${type}Parties`]: prev[`${type}Parties`].filter((_, i) => i !== index)
    }));
  };

  const addProperty = () => {
    const newProperty = {
      mainPropertyType: '',
      propertyAddress: '',
      propertyType: '',
      totalPlotArea: '',
      totalPlotUnit: 'sqft',
      builtUpArea: '',
      builtUpUnit: 'sqft',
      acquisitionMethod: '',
      acquisitionDocNo: '',
      pageNo: '',
      bookVolumeNo: '',
      registrationDate: '',
      subRegistrarDetails: '',
      movablePropertyDetails: ''
    };

    setFormData(prev => ({
      ...prev,
      properties: [...prev.properties, newProperty]
    }));
  };

  const removeProperty = (index) => {
    setFormData(prev => ({
      ...prev,
      properties: prev.properties.filter((_, i) => i !== index)
    }));
  };

  const handlePowerChange = (power) => {
    setFormData(prev => ({
      ...prev,
      powers: prev.powers.includes(power)
        ? prev.powers.filter(p => p !== power)
        : [...prev.powers, power]
    }));
  };

  const selectAllPowers = () => {
    setFormData(prev => ({
      ...prev,
      powers: powerOptions.map(p => p.value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      toast.error('Please fix the errors in the form before submitting');
      return;
    }
    
    // Instead of submitting directly, go to preview
    const dataToSave = {
      ...formData,
      amount: 1200, // Base amount for power of attorney
      formType: 'power-of-attorney'
    };
    
    goToPreview(dataToSave);
  };

  const renderPartySection = (type, parties, sectionNumber) => (
    <div className="bg-gray-50 p-4 md:p-6 rounded-lg border border-gray-200 mb-6">
      <h3 className="text-lg md:text-xl font-semibold text-blue-600 border-b-2 border-blue-600 pb-2 mb-4">
        {sectionNumber}. {translations[currentLang][`section-${sectionNumber}-heading`]}
      </h3>
      
      {parties.map((party, index) => (
        <div key={index} className="bg-white p-4 rounded-lg border border-dashed border-gray-300 mb-4 relative">
          {parties.length > 1 && (
            <button
              type="button"
              onClick={() => removeParty(type, index)}
              className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
            >
              {translations[currentLang]['btn-remove']}
            </button>
          )}
          
          <h4 className="font-medium text-gray-700 mb-4">
            {translations[currentLang]['label-party-name']} {index + 1}:
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="w-full flex gap-2">
              <select
                value={party.prefix}
                onChange={(e) => handleInputChange(`${type}Parties`, index, 'prefix', e.target.value)}
                className="w-20 md:w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Shri">श्री</option>
                <option value="Smt">श्रीमती</option>
              </select>
              <input
                type="text"
                placeholder={translations[currentLang]['label-party-name']}
                value={party.name}
                onChange={(e) => {
                  handleInputChange(`${type}Parties`, index, 'name', e.target.value);
                  const error = validateField('name', e.target.value);
                  setErrors(prev => ({ ...prev, [`${type}Parties_${index}_name`]: error }));
                }}
                className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors[`${type}Parties_${index}_name`] ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
            </div>
            
            <div className="w-full">
              <input
                type="text"
                placeholder={translations[currentLang]['label-father-name']}
                value={party.fatherName}
                onChange={(e) => {
                  handleInputChange(`${type}Parties`, index, 'fatherName', e.target.value);
                  const error = validateField('fatherName', e.target.value);
                  setErrors(prev => ({ ...prev, [`${type}Parties_${index}_fatherName`]: error }));
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors[`${type}Parties_${index}_fatherName`] ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors[`${type}Parties_${index}_fatherName`] && (
                <p className="text-red-500 text-xs mt-1">{errors[`${type}Parties_${index}_fatherName`]}</p>
              )}
            </div>
            
            {type === 'karta' && (
              <div className="w-full">
                <input
                  type="number"
                  placeholder={translations[currentLang]['label-age']}
                  value={party.age}
                  onChange={(e) => {
                    handleInputChange(`${type}Parties`, index, 'age', e.target.value);
                    const error = validateField('age', e.target.value);
                    setErrors(prev => ({ ...prev, [`${type}Parties_${index}_age`]: error }));
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors[`${type}Parties_${index}_age`] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors[`${type}Parties_${index}_age`] && (
                  <p className="text-red-500 text-xs mt-1">{errors[`${type}Parties_${index}_age`]}</p>
                )}
              </div>
            )}
            
            <div className="w-full">
              <select
                value={party.occupation}
                onChange={(e) => handleInputChange(`${type}Parties`, index, 'occupation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Service">सेवा</option>
                <option value="Business">व्यवसाय</option>
                <option value="Farmer">किसान</option>
                <option value="Homemaker">गृहिणी</option>
              </select>
            </div>
            
            <div className="w-full">
              <select
                value={party.idType}
                onChange={(e) => handleInputChange(`${type}Parties`, index, 'idType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Aadhaar">आधार</option>
                <option value="Voter ID">वोटर आईडी</option>
                <option value="PAN Card">पैन कार्ड</option>
              </select>
            </div>
            
            <div className="w-full">
              <input
                type="text"
                placeholder={translations[currentLang]['label-id-no']}
                value={party.idNo}
                onChange={(e) => {
                  handleInputChange(`${type}Parties`, index, 'idNo', e.target.value);
                  const error = validateField('idNo', e.target.value);
                  setErrors(prev => ({ ...prev, [`${type}Parties_${index}_idNo`]: error }));
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors[`${type}Parties_${index}_idNo`] ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors[`${type}Parties_${index}_idNo`] && (
                <p className="text-red-500 text-xs mt-1">{errors[`${type}Parties_${index}_idNo`]}</p>
              )}
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {translations[currentLang]['label-id-photo']}
            </label>
            
            {/* File Upload Option */}
            <div className="mb-4">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(`${type}Parties`, index, 'idPhoto', e.target.files[0])}
                  className="w-full md:flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="w-24 h-24 border border-gray-300 rounded flex items-center justify-center bg-gray-50 flex-shrink-0">
                  {previewPhotos[`${type}Parties_${index}_idPhoto`] ? (
                    <img
                      src={previewPhotos[`${type}Parties_${index}_idPhoto`]}
                      alt="Preview"
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <span className="text-xs text-gray-500 text-center">
                      {translations[currentLang]['span-document-preview']}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Camera Capture Option */}
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600 mb-3">Or capture a photo using your camera:</p>
              <CameraCapture
                onCapture={(file, imageSrc) => handleCameraCapture(`${type}Parties`, index, 'idPhoto', file, imageSrc)}
                label="Capture ID Document"
                previewLabel="ID Document Preview"
                width={280}
                height={200}
                aspectRatio={1.333}
                compact={true}
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {translations[currentLang]['label-address']}
            </label>
            <textarea
              rows="3"
              placeholder={translations[currentLang]['label-address']}
              value={party.address}
              onChange={(e) => {
                handleInputChange(`${type}Parties`, index, 'address', e.target.value);
                const error = validateField('address', e.target.value);
                setErrors(prev => ({ ...prev, [`${type}Parties_${index}_address`]: error }));
              }}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors[`${type}Parties_${index}_address`] ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors[`${type}Parties_${index}_address`] && (
              <p className="text-red-500 text-xs mt-1">{errors[`${type}Parties_${index}_address`]}</p>
            )}
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {translations[currentLang]['label-photo']}
            </label>
            
            {/* File Upload Option */}
            <div className="mb-4">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(`${type}Parties`, index, 'photo', e.target.files[0])}
                  className="w-full md:flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="w-24 h-24 border border-gray-300 rounded flex items-center justify-center bg-gray-50 flex-shrink-0">
                  {previewPhotos[`${type}Parties_${index}_photo`] ? (
                    <img
                      src={previewPhotos[`${type}Parties_${index}_photo`]}
                      alt="Preview"
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <span className="text-xs text-gray-500 text-center">
                      {translations[currentLang]['span-photo-preview']}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Camera Capture Option */}
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600 mb-3">Or capture a passport photo using your camera:</p>
              <CameraCapture
                onCapture={(file, imageSrc) => handleCameraCapture(`${type}Parties`, index, 'photo', file, imageSrc)}
                label="Capture Passport Photo"
                previewLabel="Passport Photo Preview"
                width={240}
                height={300}
                aspectRatio={0.75}
                compact={true}
              />
            </div>
          </div>
        </div>
      ))}
      
      <button
        type="button"
        onClick={() => addParty(type)}
        className="w-full md:w-auto bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
      >
        {translations[currentLang][`btn-add-${type}`]}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 w-full px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {translations[currentLang]['form-heading']}
              </h1>
              <p className="text-sm text-gray-600 mt-1">Complete power of attorney documentation with all required parties and legal formalities.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  {translations[currentLang]['label-select-lang']}
                </label>
                <select
                  value={currentLang}
                  onChange={(e) => setCurrentLang(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="hi">हिंदी (Hindi)</option>
                  <option value="en">English</option>
                </select>
              </div>
              <button 
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                disabled={isLoading}
                onClick={handleSubmit}
              >
                {isLoading ? '⏳ Submitting...' : '✅ Submit Form'}
              </button>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-center text-gray-600 mb-8">
          {translations[currentLang]['form-subheading']}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Document Details */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              {translations[currentLang]['section-1-heading']}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {translations[currentLang]['label-executionDate']}
                </label>
                <input
                  type="date"
                  value={formData.executionDate}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, executionDate: e.target.value }));
                    const error = validateField('executionDate', e.target.value);
                    setErrors(prev => ({ ...prev, executionDate: error }));
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.executionDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.executionDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.executionDate}</p>
                )}
              </div>
              
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {translations[currentLang]['label-state']}
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, state: e.target.value, district: '', tehsil: '', subRegistrarOffice: '' }));
                    const error = validateField('state', e.target.value);
                    setErrors(prev => ({ ...prev, state: error }));
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.state ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">-- चुनें --</option>
                  <option value="Uttar Pradesh">उत्तर प्रदेश</option>
                  <option value="Delhi">दिल्ली</option>
                  <option value="Maharashtra">महाराष्ट्र</option>
                </select>
                {errors.state && (
                  <p className="text-red-500 text-xs mt-1">{errors.state}</p>
                )}
              </div>
              
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {translations[currentLang]['label-district']}
                </label>
                <select
                  value={formData.district}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, district: e.target.value, tehsil: '', subRegistrarOffice: '' }));
                    const error = validateField('district', e.target.value);
                    setErrors(prev => ({ ...prev, district: error }));
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.district ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">-- चुनें --</option>
                  {formData.state && locationData[formData.state] && 
                    Object.keys(locationData[formData.state]).map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))
                  }
                </select>
                {errors.district && (
                  <p className="text-red-500 text-xs mt-1">{errors.district}</p>
                )}
              </div>
              
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {translations[currentLang]['label-tehsil']}
                </label>
                <select
                  value={formData.tehsil}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, tehsil: e.target.value, subRegistrarOffice: '' }));
                    const error = validateField('tehsil', e.target.value);
                    setErrors(prev => ({ ...prev, tehsil: error }));
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.tehsil ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">-- चुनें --</option>
                  {formData.state && formData.district && locationData[formData.state]?.[formData.district] && 
                    locationData[formData.state][formData.district].map(tehsil => (
                      <option key={tehsil} value={tehsil}>{tehsil}</option>
                    ))
                  }
                </select>
                {errors.tehsil && (
                  <p className="text-red-500 text-xs mt-1">{errors.tehsil}</p>
                )}
              </div>
              
              <div className="w-full md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {translations[currentLang]['label-subRegistrarOffice']}
                </label>
                <select
                  value={formData.subRegistrarOffice}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, subRegistrarOffice: e.target.value }));
                    const error = validateField('subRegistrarOffice', e.target.value);
                    setErrors(prev => ({ ...prev, subRegistrarOffice: error }));
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.subRegistrarOffice ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">-- चुनें --</option>
                  {formData.tehsil && (
                    <option value={`Office of Sub-Registrar, ${formData.tehsil}`}>
                      Office of Sub-Registrar, {formData.tehsil}
                    </option>
                  )}
                </select>
                {errors.subRegistrarOffice && (
                  <p className="text-red-500 text-xs mt-1">{errors.subRegistrarOffice}</p>
                )}
              </div>
            </div>
          </div>

          {/* Principal Parties */}
          {renderPartySection('karta', formData.kartaParties, 2)}

          {/* Agent Parties */}
          {renderPartySection('agent', formData.agentParties, 3)}

          {/* Powers Granted */}
          <div className="bg-gray-50 p-4 md:p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg md:text-xl font-semibold text-blue-600 border-b-2 border-blue-600 pb-2 mb-4">
              {translations[currentLang]['section-4-heading']}
            </h3>
            <p className="text-gray-600 mb-4">
              {translations[currentLang]['powers-subheading']}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              {powerOptions.map((power, index) => (
                <label key={index} className="flex items-center p-2 hover:bg-gray-100 rounded">
                  <input
                    type="checkbox"
                    checked={formData.powers.includes(power.value)}
                    onChange={() => handlePowerChange(power.value)}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700 text-sm md:text-base">{translations[currentLang][power.label]}</span>
                </label>
              ))}
            </div>
            
            <div className="mb-4">
              <label className="flex items-center p-2 hover:bg-gray-100 rounded">
                <input
                  type="checkbox"
                  checked={formData.powers.includes('Other')}
                  onChange={() => handlePowerChange('Other')}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-gray-700">{translations[currentLang]['label-power-other']}</span>
              </label>
              {formData.powers.includes('Other') && (
                <textarea
                  rows="4"
                  placeholder="विस्तृत अधिकार लिखें..."
                  value={formData.otherPowersText}
                  onChange={(e) => setFormData(prev => ({ ...prev, otherPowersText: e.target.value }))}
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <button
                type="button"
                onClick={selectAllPowers}
                className="w-full md:w-auto bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
              >
                {translations[currentLang]['btn-select-all']}
              </button>
              
              <label className="flex items-center p-2 hover:bg-gray-100 rounded">
                <input
                  type="checkbox"
                  checked={formData.generalPowerCheckbox}
                  onChange={(e) => setFormData(prev => ({ ...prev, generalPowerCheckbox: e.target.checked }))}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-gray-700 text-sm md:text-base">{translations[currentLang]['label-general-power']}</span>
              </label>
            </div>
            
            {errors.powers && (
              <p className="text-red-500 text-sm mt-2">{errors.powers}</p>
            )}
          </div>

          {/* Properties */}
          <div className="bg-gray-50 p-4 md:p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg md:text-xl font-semibold text-blue-600 border-b-2 border-blue-600 pb-2 mb-4">
              {translations[currentLang]['section-5-heading']}
            </h3>
            
            {formData.properties.map((property, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border border-dashed border-gray-300 mb-4 relative">
                {formData.properties.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProperty(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    {translations[currentLang]['btn-remove']}
                  </button>
                )}
                
                <h4 className="font-medium text-gray-700 mb-4">Property {index + 1}:</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {translations[currentLang]['label-property-type']}
                    </label>
                    <select
                      value={property.mainPropertyType}
                      onChange={(e) => {
                        const newProperties = [...formData.properties];
                        newProperties[index].mainPropertyType = e.target.value;
                        setFormData(prev => ({ ...prev, properties: newProperties }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- चुनें --</option>
                      <option value="Immovable">अचल संपत्ति (Immovable)</option>
                      <option value="Movable">चल संपत्ति (Movable)</option>
                      <option value="Both">दोनों (Both)</option>
                    </select>
                  </div>
                  
                  {(property.mainPropertyType === 'Immovable' || property.mainPropertyType === 'Both') && (
                    <>
                      <div className="w-full md:col-span-2 lg:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {translations[currentLang]['label-property-address']}
                        </label>
                        <textarea
                          rows="3"
                          placeholder={translations[currentLang]['label-property-address']}
                          value={property.propertyAddress}
                          onChange={(e) => {
                            const newProperties = [...formData.properties];
                            newProperties[index].propertyAddress = e.target.value;
                            setFormData(prev => ({ ...prev, properties: newProperties }));
                          }}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors[`property_${index}_address`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors[`property_${index}_address`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`property_${index}_address`]}</p>
                        )}
                      </div>
                      
                      <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {translations[currentLang]['label-property-type-specific']}
                        </label>
                        <select
                          value={property.propertyType}
                          onChange={(e) => {
                            const newProperties = [...formData.properties];
                            newProperties[index].propertyType = e.target.value;
                            setFormData(prev => ({ ...prev, properties: newProperties }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">-- चुनें --</option>
                          <option value="Residential">आवासीय (Residential)</option>
                          <option value="Agricultural">कृषि (Agricultural)</option>
                          <option value="Commercial">वाणिज्यिक (Commercial)</option>
                          <option value="Industrial">औद्योगिक (Industrial)</option>
                          <option value="Other">अन्य (Other)</option>
                        </select>
                      </div>
                      
                      <div className="w-full flex flex-col md:flex-row gap-2">
                        <input
                          type="number"
                          step="any"
                          placeholder={translations[currentLang]['label-plot-area']}
                          value={property.totalPlotArea}
                          onChange={(e) => {
                            const newProperties = [...formData.properties];
                            newProperties[index].totalPlotArea = e.target.value;
                            setFormData(prev => ({ ...prev, properties: newProperties }));
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                          value={property.totalPlotUnit}
                          onChange={(e) => {
                            const newProperties = [...formData.properties];
                            newProperties[index].totalPlotUnit = e.target.value;
                            setFormData(prev => ({ ...prev, properties: newProperties }));
                          }}
                          className="w-full md:w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="sqft">Sq. Ft.</option>
                          <option value="sqm">Sq. Mtr.</option>
                          <option value="acre">Acre</option>
                          <option value="bigha">Bigha</option>
                        </select>
                      </div>
                    </>
                  )}
                  
                  {(property.mainPropertyType === 'Movable' || property.mainPropertyType === 'Both') && (
                    <div className="w-full md:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {translations[currentLang]['label-movable-details']}
                      </label>
                      <textarea
                        rows="4"
                        placeholder="जैसे: बैंक खाता, वाहन, शेयर, गहने आदि।"
                        value={property.movablePropertyDetails}
                        onChange={(e) => {
                          const newProperties = [...formData.properties];
                          newProperties[index].movablePropertyDetails = e.target.value;
                          setFormData(prev => ({ ...prev, properties: newProperties }));
                        }}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors[`property_${index}_movable`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors[`property_${index}_movable`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`property_${index}_movable`]}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addProperty}
              className="w-full md:w-auto bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              {translations[currentLang]['btn-add-property']}
            </button>
          </div>

          {/* Witness Parties */}
          {renderPartySection('witness', formData.witnessParties, 6)}

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto bg-green-500 text-white px-8 py-3 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
            >
              {isLoading ? 'Submitting...' : translations[currentLang]['btn-submit']}
            </button>
          </div>
        </form>
        </div>
        </div>
      </div>
  );
};

const PowerOfAttorneyForm = () => {
  return (
    <FormWorkflowProvider formType="power-of-attorney">
      <FormWorkflow 
        formTitle="Power of Attorney"
        formType="power-of-attorney"
        fields={[
          { name: 'executionDate', label: 'Execution Date' },
          { name: 'state', label: 'State' },
          { name: 'district', label: 'District' },
          { name: 'tehsil', label: 'Tehsil' },
          { name: 'subRegistrarOffice', label: 'Sub Registrar Office' },
        ]}
      >
        <PowerOfAttorneyFormContent />
      </FormWorkflow>
    </FormWorkflowProvider>
  );
};

export default PowerOfAttorneyForm;
