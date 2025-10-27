"use client";
import React, { useState, useEffect, useRef } from "react";
import "../app/sale-deed/saledeed.css";
import { FormWorkflowProvider, useFormWorkflow } from './FormWorkflow/FormWorkflowProvider';
import FormWorkflow from './FormWorkflow/FormWorkflow';
import LanguageSelectorDropdown from './LanguageSelectorDropdown';
import ClientOnly from './ClientOnly';
import { useTranslation } from 'react-i18next';

// Constants
const STAMP_DUTY_RATE = 0.07;
const REGISTRATION_CHARGE_RATE = 0.01;
const PARKING_CHARGE_RATE = 0.04;
const NALKOOP_RATE = 20000;
const BOREWELL_RATE = 15000;
const TREE_RATES = {
  'mango': 15000,
  'neem': 10000,
  'eucalyptus': 5000,
  'guava': 8000
};

const CONSTRUCTION_RATES = {
  'residential': {
    '1st_class': 16000,
    '2nd_class': 14000,
    '3rd_class': 12000,
    '4th_class': 10000
  },
  'commercial': {
    'single-shop': 18000,
    'multiple-shops': 20000,
    'mall': 22000
  }
};

const ROOM_TYPES = ['Bedroom', 'Kitchen', 'Bathroom', 'Drawing Room', 'Dining Room', 'Hall', 'Open Area', 'Balcony', 'Washing Room', 'Servant Room'];

// Utility functions
const convertToSqMeters = (value, unit) => {
  if (!value) return 0;
  switch (unit) {
    case 'sq_yards':
      return value * 0.836127;
    case 'sq_feet':
      return value * 0.092903;
    case 'acre':
      return value * 4046.86;
    case 'hectare':
      return value * 10000;
    case 'sq_meters':
    default:
      return value;
  }
};

const convertToMeters = (value, unit) => {
  if (!value) return 0;
  switch (unit) {
    case 'feet':
      return value * 0.3048;
    case 'meters':
    default:
      return value;
  }
};

const SaleDeedFormContent = () => {
  const { goToPreview, formData: workflowFormData } = useFormWorkflow();
  const { t } = useTranslation();
  
  // Form state
  const [formData, setFormData] = useState({
    documentType: workflowFormData?.documentType || '',
    propertyType: workflowFormData?.propertyType || '',
    plotType: workflowFormData?.plotType || '',
    salePrice: workflowFormData?.salePrice || '',
    circleRateAmount: workflowFormData?.circleRateAmount || '',
    areaInputType: workflowFormData?.areaInputType || 'total',
    area: workflowFormData?.area || '',
    areaUnit: workflowFormData?.areaUnit || 'sq_meters',
    propertyLength: workflowFormData?.propertyLength || '',
    propertyWidth: workflowFormData?.propertyWidth || '',
    dimUnit: workflowFormData?.dimUnit || 'meters',
    buildupType: workflowFormData?.buildupType || 'single-shop',
    numShops: workflowFormData?.numShops || 1,
    numFloorsMall: workflowFormData?.numFloorsMall || 1,
    numFloorsMulti: workflowFormData?.numFloorsMulti || 1,
    superAreaMulti: workflowFormData?.superAreaMulti || '',
    coveredAreaMulti: workflowFormData?.coveredAreaMulti || '',
    nalkoopCount: 0,
    borewellCount: 0,
    state: '',
    district: '',
    tehsil: '',
    village: '',
    khasraNo: '',
    plotNo: '',
    colonyName: '',
    wardNo: '',
    streetNo: '',
    roadSize: '',
    roadUnit: 'meter',
    doubleSideRoad: false,
    directionNorth: '',
    directionEast: '',
    directionSouth: '',
    directionWest: '',
    coveredParkingCount: 0,
    openParkingCount: 0,
    deductionType: '',
    otherDeductionPercent: '',
    buyerGender: '',
    otherDeduction: ''
  });

  // Dynamic arrays
  const [sellers, setSellers] = useState(workflowFormData?.sellers || [{
    name: '',
    relation: '',
    address: '',
    mobile: '',
    idType: '',
    idNo: ''
  }]);

  const [buyers, setBuyers] = useState(workflowFormData?.buyers || [{
    name: '',
    relation: '',
    address: '',
    mobile: '',
    idType: '',
    idNo: ''
  }]);

  const [witnesses, setWitnesses] = useState(workflowFormData?.witnesses || [
    { name: '', relation: '', address: '', mobile: '' },
    { name: '', relation: '', address: '', mobile: '' }
  ]);

  const [rooms, setRooms] = useState(workflowFormData?.rooms || []);
  const [trees, setTrees] = useState(workflowFormData?.trees || []);
  const [shops, setShops] = useState(workflowFormData?.shops || []);
  const [mallFloors, setMallFloors] = useState(workflowFormData?.mallFloors || []);
  const [facilities, setFacilities] = useState(workflowFormData?.facilities || []);
  const [dynamicFacilities, setDynamicFacilities] = useState(workflowFormData?.dynamicFacilities || []);
  const [uploadedFiles, setUploadedFiles] = useState(workflowFormData?.uploadedFiles || []);

  // UI state
  const [showCalculations, setShowCalculations] = useState(false);
  const [calculationResults, setCalculationResults] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Refs for file inputs
  const fileInputRef = useRef(null);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add seller
  const addSeller = () => {
    setSellers(prev => [...prev, {
      name: '',
      relation: '',
      address: '',
      mobile: '',
      idType: '',
      idNo: ''
    }]);
  };

  // Remove seller
  const removeSeller = (index) => {
    if (sellers.length > 1) {
      setSellers(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Update seller
  const updateSeller = (index, field, value) => {
    setSellers(prev => prev.map((seller, i) =>
      i === index ? { ...seller, [field]: value } : seller
    ));
  };

  // Add buyer
  const addBuyer = () => {
    setBuyers(prev => [...prev, {
      name: '',
      relation: '',
      address: '',
      mobile: '',
      idType: '',
      idNo: ''
    }]);
  };

  // Remove buyer
  const removeBuyer = (index) => {
    if (buyers.length > 1) {
      setBuyers(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Update buyer
  const updateBuyer = (index, field, value) => {
    setBuyers(prev => prev.map((buyer, i) =>
      i === index ? { ...buyer, [field]: value } : buyer
    ));
  };

  // Add room
  const addRoom = () => {
    setRooms(prev => [...prev, {
      type: 'bedroom',
      length: '',
      width: ''
    }]);
  };

  // Remove room
  const removeRoom = (index) => {
    setRooms(prev => prev.filter((_, i) => i !== index));
  };

  // Update room
  const updateRoom = (index, field, value) => {
    setRooms(prev => prev.map((room, i) =>
      i === index ? { ...room, [field]: value } : room
    ));
  };

  // Add tree
  const addTree = () => {
    setTrees(prev => [...prev, {
      type: 'mango',
      count: 1
    }]);
  };

  // Remove tree
  const removeTree = (index) => {
    setTrees(prev => prev.filter((_, i) => i !== index));
  };

  // Update tree
  const updateTree = (index, field, value) => {
    setTrees(prev => prev.map((tree, i) =>
      i === index ? { ...tree, [field]: value } : tree
    ));
  };

  // File upload functions
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove && fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  // Local storage functions
  const saveDraft = () => {
    try {
      const draftData = {
        formData,
        sellers,
        buyers,
        witnesses,
        rooms,
        trees,
        shops,
        mallFloors,
        facilities,
        dynamicFacilities,
        calculations: calculationResults,
        timestamp: new Date().toISOString()
      };

      localStorage.setItem('sale_deed_draft_v1', JSON.stringify(draftData));
      alert('Draft saved successfully to local storage!');
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft: ' + error.message);
    }
  };

  const loadDraft = () => {
    try {
      const savedDraft = localStorage.getItem('sale_deed_draft_v1');
      if (!savedDraft) {
        alert('No saved draft found!');
        return;
      }

      const draftData = JSON.parse(savedDraft);

      setFormData(draftData.formData || formData);
      setSellers(draftData.sellers || sellers);
      setBuyers(draftData.buyers || buyers);
      setWitnesses(draftData.witnesses || witnesses);
      setRooms(draftData.rooms || rooms);
      setTrees(draftData.trees || trees);
      setShops(draftData.shops || shops);
      setMallFloors(draftData.mallFloors || mallFloors);
      setFacilities(draftData.facilities || facilities);
      setDynamicFacilities(draftData.dynamicFacilities || dynamicFacilities);
      setCalculationResults(draftData.calculations || null);

      if (draftData.calculations) {
        setShowCalculations(true);
      }

      alert('Draft loaded successfully!');
    } catch (error) {
      console.error('Error loading draft:', error);
      alert('Failed to load draft: ' + error.message);
    }
  };

  // Auto-save functionality
  useEffect(() => {
    const autoSave = () => {
      if (formData.documentType && formData.propertyType) {
        saveDraft();
      }
    };

    const timeoutId = setTimeout(autoSave, 5000); // Auto-save every 5 seconds
    return () => clearTimeout(timeoutId);
  }, [formData, sellers, buyers, witnesses]);

  // Load draft on component mount
  useEffect(() => {
    loadDraft();
  }, []);

  // Calculate form values
  const calculateFormValues = () => {
    const { propertyType, plotType, salePrice, circleRateAmount, areaInputType, area, areaUnit, propertyLength, propertyWidth, dimUnit } = formData;

    if (!formData.documentType || !propertyType || !salePrice || !circleRateAmount) {
      alert("Please fill in all required fields (Document Type, Property Type, Sale Price, Circle Rate Amount).");
      return null;
    }

    let totalPlotAreaSqMeters = 0;
    if (propertyType !== 'agriculture') {
      if (areaInputType === 'total') {
        totalPlotAreaSqMeters = convertToSqMeters(parseFloat(area) || 0, areaUnit);
      } else if (areaInputType === 'dimensions') {
        const lengthMeters = convertToMeters(parseFloat(propertyLength) || 0, dimUnit);
        const widthMeters = convertToMeters(parseFloat(propertyWidth) || 0, dimUnit);
        totalPlotAreaSqMeters = lengthMeters * widthMeters;
      }
    }

    if (totalPlotAreaSqMeters <= 0 && propertyType !== 'flat' && propertyType !== 'multistory') {
      alert("Please provide a valid property area.");
      return null;
    }

    let totalBuildupAreaSqMeters = 0;
    let buildupValue = 0;
    let additionCharges = 0;

    // Calculate buildup area and value based on property type and plot type
    if (propertyType === 'residential') {
      if (plotType === 'buildup') {
        const buildupAreaSqFt = totalPlotAreaSqMeters * 10.7639;
        const buildupRate = CONSTRUCTION_RATES.residential['1st_class'];
        buildupValue = buildupAreaSqFt * buildupRate;
      } else if (plotType === 'flat') {
        let totalRoomsAreaSqFt = 0;
        rooms.forEach(room => {
          const length = parseFloat(room.length) || 0;
          const width = parseFloat(room.width) || 0;
          totalRoomsAreaSqFt += length * width;
        });
        totalBuildupAreaSqMeters = totalRoomsAreaSqFt * 0.092903;
        const buildupRate = CONSTRUCTION_RATES.residential['1st_class'];
        buildupValue = totalRoomsAreaSqFt * buildupRate;
      } else if (plotType === 'multistory') {
        const coveredAreaSqFt = parseFloat(formData.coveredAreaMulti) || 0;
        totalBuildupAreaSqMeters = coveredAreaSqFt * 0.092903;
        const buildupRate = CONSTRUCTION_RATES.residential['1st_class'];
        buildupValue = coveredAreaSqFt * buildupRate;
      }
    } else if (propertyType === 'commercial') {
      if (plotType === 'buildup') {
        const buildupType = formData.buildupType;
        if (buildupType === 'single-shop' || buildupType === 'multiple-shops') {
          let totalShopAreaSqFt = 0;
          shops.forEach(area => totalShopAreaSqFt += parseFloat(area) || 0);
          totalBuildupAreaSqMeters = totalShopAreaSqFt * 0.092903;
          const buildupRate = CONSTRUCTION_RATES.commercial[buildupType];
          buildupValue = totalShopAreaSqFt * buildupRate;
        } else if (buildupType === 'mall') {
          let totalFloorAreaSqFt = 0;
          mallFloors.forEach(area => totalFloorAreaSqFt += parseFloat(area) || 0);
          totalBuildupAreaSqMeters = totalFloorAreaSqFt * 0.092903;
          const buildupRate = CONSTRUCTION_RATES.commercial[buildupType];
          buildupValue = totalFloorAreaSqFt * buildupRate;
        }
      }
    } else if (propertyType === 'agriculture') {
      additionCharges += (parseInt(formData.nalkoopCount) || 0) * NALKOOP_RATE;
      additionCharges += (parseInt(formData.borewellCount) || 0) * BOREWELL_RATE;

      trees.forEach(tree => {
        const count = parseInt(tree.count) || 0;
        if (TREE_RATES[tree.type]) {
          additionCharges += TREE_RATES[tree.type] * count;
        }
      });
    }

    let baseCircleRateValue = (totalPlotAreaSqMeters / 10.7639) * parseFloat(circleRateAmount);

    if (formData.doubleSideRoad) {
      baseCircleRateValue *= 1.10;
    }

    let finalCircleRateValue = baseCircleRateValue + buildupValue + additionCharges;
    const finalValue = Math.max(parseFloat(salePrice), finalCircleRateValue);

    let stampDuty = finalValue * STAMP_DUTY_RATE;
    let registrationCharge = finalValue * REGISTRATION_CHARGE_RATE;
    let deductionAmount = 0;

    // Apply deductions
    if (formData.deductionType === 'female') {
      deductionAmount = finalValue * 0.01;
      stampDuty -= deductionAmount;
    } else if (formData.deductionType === 'ex-serviceman') {
      stampDuty = 100;
    } else if (formData.deductionType === 'handicapped') {
      const handicappedDeductionBase = Math.min(finalValue, 500000);
      deductionAmount = handicappedDeductionBase * 0.25;
      stampDuty -= deductionAmount;
    } else if (formData.deductionType === 'other') {
      const otherDeductionPercent = parseFloat(formData.otherDeductionPercent) || 0;
      deductionAmount = finalValue * (otherDeductionPercent / 100);
      stampDuty -= deductionAmount;
    }

    stampDuty = Math.max(0, stampDuty);
    const finalPayableAmount = stampDuty + registrationCharge;

    return {
      salePrice: parseFloat(salePrice),
      totalPlotAreaSqMeters,
      totalBuildupAreaSqMeters,
      baseCircleRateValue,
      finalCircleRateValue,
      stampDuty,
      registrationCharge,
      finalPayableAmount,
      deductionAmount,
      propertyType,
      plotType
    };
  };

  // Show calculations
  const handleShowCalculations = () => {
    const results = calculateFormValues();
    if (results) {
      setCalculationResults(results);
      setShowCalculations(true);
    }
  };

  // Generate preview
  const generatePreview = () => {
    const results = calculateFormValues();
    if (!results) return;

    setCalculationResults(results);
    setIsPreviewMode(true);
  };

  // Save data to local storage and backend
  const handleSaveData = async () => {
    const results = calculateFormValues();
    if (!results) return;

    // Instead of submitting directly, go to preview
    const dataToSave = {
      ...formData,
      sellers,
      buyers,
      witnesses,
      rooms,
      trees,
      shops,
      mallFloors,
      facilities,
      dynamicFacilities,
      calculations: results,
      amount: 1500, // Base amount for sale deed
      formType: 'sale-deed'
    };
    
    goToPreview(dataToSave);
  };

  const handleSaveDataDirect = async () => {
    const results = calculateFormValues();
    if (!results) return;

    setIsLoading(true);
    try {
      // Save to local storage
      saveDraft();

      // Prepare data for backend
      const dataToSave = {
        ...formData,
        sellers,
        buyers,
        witnesses,
        rooms,
        trees,
        shops,
        mallFloors,
        facilities,
        dynamicFacilities,
        calculations: results
      };

      // Create FormData for file uploads
      const formDataToSend = new FormData();
      formDataToSend.append('data', JSON.stringify(dataToSave));

      // Add uploaded files
      uploadedFiles.forEach((fileObj, index) => {
        formDataToSend.append(`file_${index}`, fileObj.file);
      });

      // Get authentication token
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      
      // Submit to backend
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const headers = {};
      
      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE}/api/sale-deed`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }

      const result = await response.json();
      alert(result.message || 'Sale deed saved successfully!');
    } catch (error) {
      console.error('Error saving sale deed:', error);
      alert('Failed to save sale deed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Export data as JSON
  const exportData = () => {
    const results = calculateFormValues();
    if (!results) return;

    const dataToSave = {
      ...formData,
      sellers,
      buyers,
      witnesses,
      rooms,
      trees,
      shops,
      mallFloors,
      facilities,
      dynamicFacilities,
      calculations: results
    };

    const dataStr = JSON.stringify(dataToSave, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "sale-deed-data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert("Form data exported as sale-deed-data.json");
  };

  // Clear form
  const handleClearForm = () => {
    setFormData({
      documentType: '',
      propertyType: '',
      plotType: '',
      salePrice: '',
      circleRateAmount: '',
      areaInputType: 'total',
      area: '',
      areaUnit: 'sq_meters',
      propertyLength: '',
      propertyWidth: '',
      dimUnit: 'meters',
      buildupType: 'single-shop',
      numShops: 1,
      numFloorsMall: 1,
      numFloorsMulti: 1,
      superAreaMulti: '',
      coveredAreaMulti: '',
      nalkoopCount: 0,
      borewellCount: 0,
      state: '',
      district: '',
      tehsil: '',
      village: '',
      khasraNo: '',
      plotNo: '',
      colonyName: '',
      wardNo: '',
      streetNo: '',
      roadSize: '',
      roadUnit: 'meter',
      doubleSideRoad: false,
      directionNorth: '',
      directionEast: '',
      directionSouth: '',
      directionWest: '',
      coveredParkingCount: 0,
      openParkingCount: 0,
      deductionType: '',
      otherDeductionPercent: ''
    });
    setSellers([{ name: '', relation: '', address: '', mobile: '', idType: '', idNo: '' }]);
    setBuyers([{ name: '', relation: '', address: '', mobile: '', idType: '', idNo: '' }]);
    setWitnesses([
      { name: '', relation: '', address: '', mobile: '' },
      { name: '', relation: '', address: '', mobile: '' }
    ]);
    setRooms([]);
    setTrees([]);
    setShops([]);
    setMallFloors([]);
    setFacilities([]);
    setDynamicFacilities([]);
    setShowCalculations(false);
    setCalculationResults(null);
    setUploadedFiles([]);
    setIsPreviewMode(false);

    // Clear local storage
    localStorage.removeItem('sale_deed_draft_v1');
    alert("Form cleared successfully");
  };

  // Preview component
  const PreviewComponent = () => {
    if (!calculationResults) return null;

    return (
      <div className="preview-wrap">
        <div className="preview-controls">
          <button
            className="btn"
            onClick={() => setIsPreviewMode(false)}
          >
            ✏️ Edit
          </button>
          <button
            className="btn save"
            onClick={handleSaveData}
            disabled={isLoading}
          >
            {isLoading ? '⏳ Saving...' : '💾 Save'}
          </button>
          <button
            className="btn"
            onClick={() => window.print()}
          >
            🖨️ Print
          </button>
        </div>

        <div className="preview-page">
          <div className="watermark-layer">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="wm">DRAFT</div>
            ))}
          </div>

          <div className="preview-body">
            <h2 style={{ textAlign: 'center', color: 'var(--brand)', marginBottom: '20px' }}>
              Sale Deed Document
            </h2>

            <div className="preview-section">
              <h3>Property Information</h3>
              <p><strong>Document Type:</strong> {formData.documentType}</p>
              <p><strong>Property Type:</strong> {formData.propertyType}</p>
              <p><strong>Plot Type:</strong> {formData.plotType}</p>
              <p><strong>Sale Price:</strong> ₹{formData.salePrice?.toLocaleString()}</p>
              <p><strong>Circle Rate:</strong> ₹{formData.circleRateAmount?.toLocaleString()}</p>
            </div>

            <div className="preview-section">
              <h3>Property Location</h3>
              <p><strong>State:</strong> {formData.state}</p>
              <p><strong>District:</strong> {formData.district}</p>
              <p><strong>Tehsil:</strong> {formData.tehsil}</p>
              <p><strong>Village:</strong> {formData.village}</p>
              {formData.khasraNo && <p><strong>Khasra No:</strong> {formData.khasraNo}</p>}
              {formData.plotNo && <p><strong>Plot No:</strong> {formData.plotNo}</p>}
            </div>

            {sellers.length > 0 && (
              <div className="preview-section">
                <h3>Sellers</h3>
                {sellers.map((seller, index) => (
                  <div key={index} className="preview-person">
                    <p><strong>Name:</strong> {seller.name}</p>
                    <p><strong>Relation:</strong> {seller.relation}</p>
                    <p><strong>Address:</strong> {seller.address}</p>
                    <p><strong>Mobile:</strong> {seller.mobile}</p>
                  </div>
                ))}
              </div>
            )}

            {buyers.length > 0 && (
              <div className="preview-section">
                <h3>Buyers</h3>
                {buyers.map((buyer, index) => (
                  <div key={index} className="preview-person">
                    <p><strong>Name:</strong> {buyer.name}</p>
                    <p><strong>Relation:</strong> {buyer.relation}</p>
                    <p><strong>Address:</strong> {buyer.address}</p>
                    <p><strong>Mobile:</strong> {buyer.mobile}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="preview-section">
              <h3>Financial Calculations</h3>
              <p><strong>Sale Price:</strong> ₹{calculationResults.salePrice?.toLocaleString()}</p>
              <p><strong>Total Plot Area:</strong> {calculationResults.totalPlotAreaSqMeters?.toFixed(2)} sq meters</p>
              <p><strong>Base Circle Rate Value:</strong> ₹{calculationResults.baseCircleRateValue?.toLocaleString()}</p>
              <p><strong>Final Circle Rate Value:</strong> ₹{calculationResults.finalCircleRateValue?.toLocaleString()}</p>
              <p><strong>Stamp Duty:</strong> ₹{calculationResults.stampDuty?.toLocaleString()}</p>
              <p><strong>Registration Charge:</strong> ₹{calculationResults.registrationCharge?.toLocaleString()}</p>
              <p><strong>Final Payable Amount:</strong> ₹{calculationResults.finalPayableAmount?.toLocaleString()}</p>
            </div>

            <div className="preview-signatures">
              <div className="signature-section">
                <div className="signature-line"></div>
                <p>Seller Signature</p>
              </div>
              <div className="signature-section">
                <div className="signature-line"></div>
                <p>Buyer Signature</p>
              </div>
              <div className="signature-section">
                <div className="signature-line"></div>
                <p>Witness 1 Signature</p>
              </div>
              <div className="signature-section">
                <div className="signature-line"></div>
                <p>Witness 2 Signature</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Show preview if in preview mode
  if (isPreviewMode) {
    return <PreviewComponent />;
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sale Deed Form Generator</h1>
              <p className="text-sm text-gray-600 mt-1">Complete property sale deed with calculations, file uploads, and preview generation.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ClientOnly fallback={
                <div className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm">
                  <span className="text-lg">🌐</span>
                  <span className="hidden sm:inline">Loading...</span>
                </div>
              }>
                <LanguageSelectorDropdown />
              </ClientOnly>
              <button 
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                onClick={saveDraft}
              >
                💾 Save Draft
              </button>
              <button 
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                onClick={generatePreview}
              >
                🔍 Preview
              </button>
              <button 
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                onClick={handleSaveData} 
                disabled={isLoading}
              >
                {isLoading ? '⏳ Saving...' : '✅ Submit'}
              </button>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Sale Deed Form</h2>
            <p className="text-gray-600">Professional Property Transaction Documentation</p>
          </div>

        <form className="space-y-6">
          {/* Property Information Section */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Property Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div>
                <label>Document Type *</label>
                <select
                  value={formData.documentType}
                  onChange={(e) => handleInputChange('documentType', e.target.value)}
                  required
                >
                  <option value="">Select Deed Type</option>
                  <option value="sale-deed">Sale Deed</option>
                  <option value="gift-deed">Gift Deed</option>
                  <option value="partition-deed">Partition Deed</option>
                  <option value="exchange-deed">Exchange Deed</option>
                  <option value="other-deed">Others</option>
                </select>
              </div>

              <div>
                <label>Property Type *</label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => handleInputChange('propertyType', e.target.value)}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="residential">Residential</option>
                  <option value="agriculture">Agriculture</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                </select>
              </div>

              <div>
                <label>Plot Type *</label>
                <select
                  value={formData.plotType}
                  onChange={(e) => handleInputChange('plotType', e.target.value)}
                  required
                >
                  <option value="">Select Plot Type</option>
                  <option value="vacant">Vacant Plot/Land</option>
                  <option value="buildup">Buildup</option>
                  <option value="flat">Flat/Floor</option>
                  <option value="multistory">Multistory</option>
                </select>
              </div>

              <div>
                <label>Sale Consideration Price (INR) *</label>
                <input
                  type="number"
                  value={formData.salePrice}
                  onChange={(e) => handleInputChange('salePrice', e.target.value)}
                  min="1"
                  step="any"
                  required
                />
              </div>

              <div>
                <label>Circle Rate Amount (per unit area) (INR) *</label>
                <input
                  type="number"
                  value={formData.circleRateAmount}
                  onChange={(e) => handleInputChange('circleRateAmount', e.target.value)}
                  min="1"
                  step="any"
                  required
                />
              </div>

              <div>
                <label>Property Area Input Type</label>
                <select
                  value={formData.areaInputType}
                  onChange={(e) => handleInputChange('areaInputType', e.target.value)}
                >
                  <option value="total">Total Area</option>
                  <option value="dimensions">Length & Width</option>
                </select>
              </div>
            </div>

            {/* Area Input Section */}
            {formData.areaInputType === 'total' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                <div>
                  <label>Property Area *</label>
                  <input
                    type="number"
                    value={formData.area}
                    onChange={(e) => handleInputChange('area', e.target.value)}
                    min="1"
                    step="any"
                    placeholder="Enter Property Area"
                    required
                  />
                </div>
                <div>
                  <label>Area Unit</label>
                  <select
                    value={formData.areaUnit}
                    onChange={(e) => handleInputChange('areaUnit', e.target.value)}
                  >
                    <option value="sq_meters">Sq. Meters</option>
                    <option value="sq_yards">Sq. Yards</option>
                    <option value="sq_feet">Sq. Feet</option>
                    <option value="acre">Acre</option>
                    <option value="hectare">Hectare</option>
                    <option value="bigha">Bigha</option>
                    <option value="kanal">Kanal</option>
                    <option value="marla">Marla</option>
                  </select>
                </div>
              </div>
            )}

            {formData.areaInputType === 'dimensions' && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Length
                  </label>
                  <input
                    type="number"
                    value={formData.propertyLength}
                    onChange={(e) => handleInputChange('propertyLength', e.target.value)}
                    min="1"
                    step="any"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Width
                  </label>
                  <input
                    type="number"
                    value={formData.propertyWidth}
                    onChange={(e) => handleInputChange('propertyWidth', e.target.value)}
                    min="1"
                    step="any"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit
                  </label>
                  <select
                    value={formData.dimUnit}
                    onChange={(e) => handleInputChange('dimUnit', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="meters">Meters</option>
                    <option value="feet">Feet</option>
                  </select>
                </div>
              </div>
            )}

            {/* Dynamic Sections based on Property Type and Plot Type */}
            {formData.propertyType === 'residential' && formData.plotType === 'flat' && (
              <div className="mt-6 border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-700 mb-4">Room Details</h4>
                <p className="text-sm text-gray-600 mb-4">Add rooms and their dimensions. These are used to calculate the built-up area.</p>

                {rooms.map((room, index) => (
                  <div key={index} className="flex flex-wrap items-center gap-4 mb-4 p-3 border border-gray-200 rounded">
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type:</label>
                      <select
                        value={room.type}
                        onChange={(e) => updateRoom(index, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      >
                        {ROOM_TYPES.map(type => (
                          <option key={type} value={type.toLowerCase().replace(' ', '-')}>
                            {type}
                          </option>
                        ))}
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Length (Ft):</label>
                      <input
                        type="number"
                        value={room.length}
                        onChange={(e) => updateRoom(index, 'length', e.target.value)}
                        min="1"
                        step="any"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Width (Ft):</label>
                      <input
                        type="number"
                        value={room.width}
                        onChange={(e) => updateRoom(index, 'width', e.target.value)}
                        min="1"
                        step="any"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRoom(index)}
                      className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addRoom}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Add Room
                </button>
              </div>
            )}

            {formData.propertyType === 'agriculture' && (
              <div className="mt-6 border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-700 mb-4">Agriculture Land Additions</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nalkoop Count
                    </label>
                    <input
                      type="number"
                      value={formData.nalkoopCount}
                      onChange={(e) => handleInputChange('nalkoopCount', e.target.value)}
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {formData.nalkoopCount > 0 && (
                      <div className="text-sm text-gray-600 mt-1">
                        Amount: ₹{(parseInt(formData.nalkoopCount) * NALKOOP_RATE).toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Borewell Count
                    </label>
                    <input
                      type="number"
                      value={formData.borewellCount}
                      onChange={(e) => handleInputChange('borewellCount', e.target.value)}
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {formData.borewellCount > 0 && (
                      <div className="text-sm text-gray-600 mt-1">
                        Amount: ₹{(parseInt(formData.borewellCount) * BOREWELL_RATE).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trees</label>

                  {trees.map((tree, index) => (
                    <div key={index} className="flex flex-wrap items-center gap-4 mb-4 p-3 border border-gray-200 rounded">
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tree Type:</label>
                        <select
                          value={tree.type}
                          onChange={(e) => updateTree(index, 'type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        >
                          {Object.keys(TREE_RATES).map(treeType => (
                            <option key={treeType} value={treeType}>
                              {treeType.charAt(0).toUpperCase() + treeType.slice(1)}
                            </option>
                          ))}
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="flex-1 min-w-[150px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Count:</label>
                        <input
                          type="number"
                          value={tree.count}
                          onChange={(e) => updateTree(index, 'count', e.target.value)}
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTree(index)}
                        className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addTree}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Add Tree
                  </button>

                  {trees.length > 0 && (
                    <div className="mt-4 text-sm text-gray-600">
                      Total Trees Amount: ₹{trees.reduce((total, tree) => {
                        const count = parseInt(tree.count) || 0;
                        const rate = TREE_RATES[tree.type] || 0;
                        return total + (count * rate);
                      }, 0).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {formData.propertyType === 'residential' && formData.plotType === 'multistory' && (
              <div className="mt-6 border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-700 mb-4">Multistory Building Details</h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Floors
                    </label>
                    <input
                      type="number"
                      value={formData.numFloorsMulti}
                      onChange={(e) => handleInputChange('numFloorsMulti', e.target.value)}
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Super Area (Sq. Ft.)
                    </label>
                    <input
                      type="number"
                      value={formData.superAreaMulti}
                      onChange={(e) => handleInputChange('superAreaMulti', e.target.value)}
                      min="0"
                      step="any"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Covered Area (Sq. Ft.)
                    </label>
                    <input
                      type="number"
                      value={formData.coveredAreaMulti}
                      onChange={(e) => handleInputChange('coveredAreaMulti', e.target.value)}
                      min="0"
                      step="any"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.propertyType === 'commercial' && formData.plotType === 'buildup' && (
              <div className="mt-6 border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-700 mb-4">Buildup Details</h4>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buildup Type
                  </label>
                  <select
                    value={formData.buildupType}
                    onChange={(e) => handleInputChange('buildupType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="single-shop">Single Shop</option>
                    <option value="multiple-shops">Multiple Shops</option>
                    <option value="mall">Mall</option>
                  </select>
                </div>

                {(formData.buildupType === 'single-shop' || formData.buildupType === 'multiple-shops') && (
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Shops
                      </label>
                      <input
                        type="number"
                        value={formData.numShops}
                        onChange={(e) => handleInputChange('numShops', e.target.value)}
                        min="1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="space-y-4">
                      {Array.from({ length: parseInt(formData.numShops) || 1 }, (_, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <h5 className="text-md font-medium text-gray-700 mb-2">Shop {index + 1}</h5>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Shop Area (Sq.Ft.)
                            </label>
                            <input
                              type="number"
                              value={shops[index] || ''}
                              onChange={(e) => {
                                const newShops = [...shops];
                                newShops[index] = e.target.value;
                                setShops(newShops);
                              }}
                              min="1"
                              step="any"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              required
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {formData.buildupType === 'mall' && (
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Floors
                      </label>
                      <input
                        type="number"
                        value={formData.numFloorsMall}
                        onChange={(e) => handleInputChange('numFloorsMall', e.target.value)}
                        min="1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="space-y-4">
                      {Array.from({ length: parseInt(formData.numFloorsMall) || 1 }, (_, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <h5 className="text-md font-medium text-gray-700 mb-2">Floor {index + 1}</h5>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Floor Area (Sq.Ft.)
                            </label>
                            <input
                              type="number"
                              value={mallFloors[index] || ''}
                              onChange={(e) => {
                                const newMallFloors = [...mallFloors];
                                newMallFloors[index] = e.target.value;
                                setMallFloors(newMallFloors);
                              }}
                              min="1"
                              step="any"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              required
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Common Facilities Section */}
            {(formData.propertyType === 'residential' && (formData.plotType === 'flat' || formData.plotType === 'multistory')) && (
              <div className="mt-6 border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-700 mb-4">Common Facilities</h4>
                <p className="text-sm text-gray-600 mb-4">These charges will increase the <strong>Circle Rate Value</strong>.</p>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="select-all-facilities"
                      className="mr-2"
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        const facilityCheckboxes = document.querySelectorAll('input[name="facility"]');
                        facilityCheckboxes.forEach(cb => {
                          if (cb.id !== 'others') cb.checked = isChecked;
                        });
                      }}
                    />
                    <label htmlFor="select-all-facilities" className="text-sm font-medium text-gray-700">
                      Select/Deselect All
                    </label>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { value: 'swimming_pool', label: 'Swimming Pool', charge: 1 },
                      { value: 'gym', label: 'Gymnasium', charge: 1 },
                      { value: 'club_house', label: 'Club House', charge: 1 },
                      { value: 'garden', label: 'Terrace Garden', charge: 1 },
                      { value: 'security_guard', label: 'Security Guard', charge: 1 },
                      { value: 'park', label: 'Park', charge: 1 },
                      { value: 'lift', label: 'Lift', charge: 1 }
                    ].map(facility => (
                      <label key={facility.value} className="flex items-center">
                        <input
                          type="checkbox"
                          name="facility"
                          value={facility.value}
                          data-charge={facility.charge}
                          className="mr-2"
                        />
                        {facility.label}
                      </label>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Covered Parking Count
                      </label>
                      <input
                        type="number"
                        value={formData.coveredParkingCount}
                        onChange={(e) => handleInputChange('coveredParkingCount', e.target.value)}
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Open Parking Count
                      </label>
                      <input
                        type="number"
                        value={formData.openParkingCount}
                        onChange={(e) => handleInputChange('openParkingCount', e.target.value)}
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Seller Details Section */}
          <div className="form-section">
            <h3>Seller Details</h3>

            {sellers.map((seller, index) => (
              <div key={index} className="form-section">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-medium text-gray-700">Seller {index + 1}</h4>
                  {sellers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSeller(index)}
                      className="remove-btn"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="professional-grid cols-4">
                  <div>
                    <label>Name *</label>
                    <input
                      type="text"
                      value={seller.name}
                      onChange={(e) => updateSeller(index, 'name', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label>Son of / Husband of</label>
                    <input
                      type="text"
                      value={seller.relation}
                      onChange={(e) => updateSeller(index, 'relation', e.target.value)}
                    />
                  </div>

                  <div>
                    <label>Mobile No.</label>
                    <input
                      type="text"
                      value={seller.mobile}
                      onChange={(e) => updateSeller(index, 'mobile', e.target.value)}
                    />
                  </div>

                  <div>
                    <label>Address</label>
                    <textarea
                      value={seller.address}
                      onChange={(e) => updateSeller(index, 'address', e.target.value)}
                      rows="2"
                    />
                  </div>

                  <div>
                    <label>ID Card Type</label>
                    <select
                      value={seller.idType}
                      onChange={(e) => updateSeller(index, 'idType', e.target.value)}
                    >
                      <option value="">Select ID Type</option>
                      <option value="aadhaar">Aadhaar Card</option>
                      <option value="pan">PAN Card</option>
                      <option value="passport">Passport</option>
                      <option value="voter-id">Voter ID</option>
                    </select>
                  </div>

                  <div>
                    <label>ID Card No.</label>
                    <input
                      type="text"
                      value={seller.idNo}
                      onChange={(e) => updateSeller(index, 'idNo', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addSeller}
              className="btn add-btn"
            >
              + Add More Sellers
            </button>
          </div>

          {/* Buyer Details Section */}
          <div className="form-section">
            <h3>Buyer Details</h3>

            {buyers.map((buyer, index) => (
              <div key={index} className="form-section">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-medium text-gray-700">Buyer {index + 1}</h4>
                  {buyers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBuyer(index)}
                      className="remove-btn"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="professional-grid cols-4">
                  <div>
                    <label>Name *</label>
                    <input
                      type="text"
                      value={buyer.name}
                      onChange={(e) => updateBuyer(index, 'name', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label>Son of / Husband of</label>
                    <input
                      type="text"
                      value={buyer.relation}
                      onChange={(e) => updateBuyer(index, 'relation', e.target.value)}
                    />
                  </div>

                  <div>
                    <label>Mobile No.</label>
                    <input
                      type="text"
                      value={buyer.mobile}
                      onChange={(e) => updateBuyer(index, 'mobile', e.target.value)}
                    />
                  </div>

                  <div>
                    <label>Address</label>
                    <textarea
                      value={buyer.address}
                      onChange={(e) => updateBuyer(index, 'address', e.target.value)}
                      rows="2"
                    />
                  </div>

                  <div>
                    <label>ID Card Type</label>
                    <select
                      value={buyer.idType}
                      onChange={(e) => updateBuyer(index, 'idType', e.target.value)}
                    >
                      <option value="">Select ID Type</option>
                      <option value="aadhaar">Aadhaar Card</option>
                      <option value="pan">PAN Card</option>
                      <option value="passport">Passport</option>
                      <option value="voter-id">Voter ID</option>
                    </select>
                  </div>

                  <div>
                    <label>ID Card No.</label>
                    <input
                      type="text"
                      value={buyer.idNo}
                      onChange={(e) => updateBuyer(index, 'idNo', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addBuyer}
              className="btn add-btn"
            >
              + Add More Buyers
            </button>
          </div>

          {/* Party Details Section */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-medium text-gray-700 border-b-2 border-blue-500 pb-2 mb-6">
              Party Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Party (Seller):
                </label>
                <div className="font-bold text-blue-600">
                  {sellers.filter(s => s.name.trim()).map(seller =>
                    <div key={seller.name}>{seller.name} (Hereinafter Called The First Party)</div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Second Party (Buyer):
                </label>
                <div className="font-bold text-green-600">
                  {buyers.filter(b => b.name.trim()).map(buyer =>
                    <div key={buyer.name}>{buyer.name} (Hereinafter Called The Second Party)</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Witness Details Section */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-medium text-gray-700 border-b-2 border-blue-500 pb-2 mb-6">
              Witness Details
            </h3>

            {witnesses.map((witness, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                <h4 className="text-lg font-medium text-gray-700 mb-4">Witness {index + 1}</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={witness.name}
                      onChange={(e) => {
                        const newWitnesses = [...witnesses];
                        newWitnesses[index].name = e.target.value;
                        setWitnesses(newWitnesses);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Son of / Husband of
                    </label>
                    <input
                      type="text"
                      value={witness.relation}
                      onChange={(e) => {
                        const newWitnesses = [...witnesses];
                        newWitnesses[index].relation = e.target.value;
                        setWitnesses(newWitnesses);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      value={witness.address}
                      onChange={(e) => {
                        const newWitnesses = [...witnesses];
                        newWitnesses[index].address = e.target.value;
                        setWitnesses(newWitnesses);
                      }}
                      rows="2"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile No.
                    </label>
                    <input
                      type="text"
                      value={witness.mobile}
                      onChange={(e) => {
                        const newWitnesses = [...witnesses];
                        newWitnesses[index].mobile = e.target.value;
                        setWitnesses(newWitnesses);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Property Description Section */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Property Description</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tehsil *</label>
                <input
                  type="text"
                  value={formData.tehsil}
                  onChange={(e) => handleInputChange('tehsil', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Village / Locality *</label>
                <input
                  type="text"
                  value={formData.village}
                  onChange={(e) => handleInputChange('village', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Khasra/Survey No.</label>
                <input
                  type="text"
                  value={formData.khasraNo}
                  onChange={(e) => handleInputChange('khasraNo', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plot No.</label>
                <input
                  type="text"
                  value={formData.plotNo}
                  onChange={(e) => handleInputChange('plotNo', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Colony Name</label>
                <input
                  type="text"
                  value={formData.colonyName}
                  onChange={(e) => handleInputChange('colonyName', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ward No.</label>
                <input
                  type="text"
                  value={formData.wardNo}
                  onChange={(e) => handleInputChange('wardNo', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street No.</label>
                <input
                  type="text"
                  value={formData.streetNo}
                  onChange={(e) => handleInputChange('streetNo', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label>Road Size</label>
                <input
                  type="number"
                  value={formData.roadSize}
                  onChange={(e) => handleInputChange('roadSize', e.target.value)}
                  step="any"
                  placeholder="Enter Road Size"
                />
              </div>

              <div>
                <label>Road Unit</label>
                <select
                  value={formData.roadUnit}
                  onChange={(e) => handleInputChange('roadUnit', e.target.value)}
                >
                  <option value="meter">Meter</option>
                  <option value="foot">Foot</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="double-side-road"
                  checked={formData.doubleSideRoad}
                  onChange={(e) => handleInputChange('doubleSideRoad', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="double-side-road" className="text-sm font-medium text-gray-700">
                  Double Side Road (+10% on Circle Rate)
                </label>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Directions (North, East, South, West)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="North"
                  value={formData.directionNorth}
                  onChange={(e) => handleInputChange('directionNorth', e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="East"
                  value={formData.directionEast}
                  onChange={(e) => handleInputChange('directionEast', e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="South"
                  value={formData.directionSouth}
                  onChange={(e) => handleInputChange('directionSouth', e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="West"
                  value={formData.directionWest}
                  onChange={(e) => handleInputChange('directionWest', e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Deductions Section */}
          {/* <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-medium text-gray-700 border-b-2 border-blue-500 pb-2 mb-6">
              Deductions
            </h3>
            <p className="text-sm text-gray-600 mb-4">Select only ONE option for stamp duty deduction.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buyer's Gender
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="deduction-type"
                      value="female"
                      checked={formData.deductionType === 'female'}
                      onChange={(e) => handleInputChange('deductionType', e.target.value)}
                      className="mr-2"
                    />
                    Female (-1% Stamp Duty)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="deduction-type"
                      value="male"
                      checked={formData.deductionType === 'male'}
                      onChange={(e) => handleInputChange('deductionType', e.target.value)}
                      className="mr-2"
                    />
                    Male
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="deduction-type"
                      value="transgender"
                      checked={formData.deductionType === 'transgender'}
                      onChange={(e) => handleInputChange('deductionType', e.target.value)}
                      className="mr-2"
                    />
                    Transgender
                  </label>
                </div>
              </div> */}

          {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Other Deductions
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="deduction-type"
                      value="ex-serviceman"
                      checked={formData.deductionType === 'ex-serviceman'}
                      onChange={(e) => handleInputChange('deductionType', e.target.value)}
                      className="mr-2"
                    />
                    Ex-Serviceman (₹100 Stamp Duty)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="deduction-type"
                      value="handicapped"
                      checked={formData.deductionType === 'handicapped'}
                      onChange={(e) => handleInputChange('deductionType', e.target.value)}
                      className="mr-2"
                    />
                    Handicapped (25% on first ₹5 Lakh of Circle Value)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="deduction-type"
                      value="other"
                      checked={formData.deductionType === 'other'}
                      onChange={(e) => handleInputChange('deductionType', e.target.value)}
                      className="mr-2"
                    />
                    Other Deduction (%)
                  </label>
                </div>
              </div>
               */}

          {/* {formData.deductionType === 'other' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Percentage
                  </label>
                  <input
                    type="number"
                    value={formData.otherDeductionPercent}
                    onChange={(e) => handleInputChange('otherDeductionPercent', e.target.value)}
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Deductions Section */}
          <div className="form-section">
            <h3>Deductions</h3>
            <p className="text-sm text-gray-600 mb-6">Select only ONE option for stamp duty deduction.</p>

            {/* Buyer's Gender Section */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Buyer's Gender</h4>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="buyerGender"
                    value="female"
                    checked={formData.buyerGender === 'female'}
                    onChange={(e) => handleInputChange('buyerGender', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Female (-1% Stamp Duty)</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="buyerGender"
                    value="male"
                    checked={formData.buyerGender === 'male'}
                    onChange={(e) => handleInputChange('buyerGender', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Male</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="buyerGender"
                    value="transgender"
                    checked={formData.buyerGender === 'transgender'}
                    onChange={(e) => handleInputChange('buyerGender', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Transgender</span>
                </label>
              </div>
            </div>

            {/* Other Deductions Section */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Other Deductions</h4>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="otherDeduction"
                    value="ex-serviceman"
                    checked={formData.otherDeduction === 'ex-serviceman'}
                    onChange={(e) => handleInputChange('otherDeduction', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Ex-Serviceman (₹100 Stamp Duty)</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="otherDeduction"
                    value="handicapped"
                    checked={formData.otherDeduction === 'handicapped'}
                    onChange={(e) => handleInputChange('otherDeduction', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Handicapped (25% on first ₹5 Lakh of Circle Value)</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="otherDeduction"
                    value="other"
                    checked={formData.otherDeduction === 'other'}
                    onChange={(e) => handleInputChange('otherDeduction', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Other Deduction (%)</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={calculateFormValues}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Show Final Calculation
              </button>

              <button
                type="button"
                onClick={saveDraft}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Save
              </button>

              <button
                type="button"
                onClick={loadDraft}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Import Data
              </button>

              <button
                type="button"
                onClick={handleClearForm}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Calculation Display */}
          {showCalculations && calculationResults && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-blue-800 mb-4">Calculation Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-lg">
                  <span>Sale Consideration Price:</span>
                  <strong className="text-gray-800">₹{calculationResults.salePrice.toFixed(2)}</strong>
                </div>
                <div className="flex justify-between text-lg">
                  <span>Plot Area:</span>
                  <strong className="text-gray-800">
                    {calculationResults.propertyType === 'agriculture'
                      ? `${(calculationResults.totalPlotAreaSqMeters / 10000).toFixed(4)} Hectare`
                      : `${calculationResults.totalPlotAreaSqMeters.toFixed(2)} Sq.Meters`
                    }
                  </strong>
                </div>
                <div className="flex justify-between text-lg">
                  <span>Total Built-up/Additions Area:</span>
                  <strong className="text-gray-800">{calculationResults.totalBuildupAreaSqMeters.toFixed(2)} Sq.Meters</strong>
                </div>
                {calculationResults.totalBuildupAreaSqMeters > calculationResults.totalPlotAreaSqMeters && (
                  <div className="text-red-600 font-bold">
                    Warning: Built-up area exceeds plot area!
                  </div>
                )}
                <div className="flex justify-between text-lg">
                  <span>Circle Rate Value (Before additions):</span>
                  <strong className="text-gray-800">₹{calculationResults.baseCircleRateValue.toFixed(2)}</strong>
                </div>
                <div className="flex justify-between text-lg">
                  <span>Circle Rate Value (After additions):</span>
                  <strong className="text-gray-800">₹{calculationResults.finalCircleRateValue.toFixed(2)}</strong>
                </div>
                {calculationResults.deductionAmount > 0 && (
                  <div className="flex justify-between text-lg">
                    <span>Deduction:</span>
                    <strong className="text-red-600">- ₹{calculationResults.deductionAmount.toFixed(2)}</strong>
                  </div>
                )}
                <div className="flex justify-between text-lg">
                  <span>Stamp Duty (7% of Final Value):</span>
                  <strong className="text-gray-800">₹{calculationResults.stampDuty.toFixed(2)}</strong>
                </div>
                <div className="flex justify-between text-lg">
                  <span>Registration Charge (1% of Final Value):</span>
                  <strong className="text-gray-800">₹{calculationResults.registrationCharge.toFixed(2)}</strong>
                </div>
                <div className="flex justify-between text-2xl font-bold text-blue-600 border-t-2 border-blue-600 pt-3">
                  <span>Total Stamp Duty & Registration Charges:</span>
                  <strong>₹{calculationResults.finalPayableAmount.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          )}

        </form>
        </div>
      </div>
    </div>
  );
};

const SaleDeedForm = () => {
  return (
    <FormWorkflowProvider formType="sale-deed">
      <FormWorkflow 
        formTitle="Sale Deed"
        formType="sale-deed"
        fields={[
          { name: 'documentType', label: 'Document Type' },
          { name: 'propertyType', label: 'Property Type' },
          { name: 'salePrice', label: 'Sale Price' },
          { name: 'area', label: 'Area' },
        ]}
      >
        <SaleDeedFormContent />
      </FormWorkflow>
    </FormWorkflowProvider>
  );
};

export default SaleDeedForm;

// "use client";
// import React, { useState, useEffect, useRef } from "react";
// import axios from 'axios';
// import "../app/sale-deed/saledeed.css";

// // Constants
// const STAMP_DUTY_RATE = 0.07;
// const REGISTRATION_CHARGE_RATE = 0.01;
// const PARKING_CHARGE_RATE = 0.04;
// const NALKOOP_RATE = 20000;
// const BOREWELL_RATE = 15000;
// const TREE_RATES = {
//   'mango': 15000,
//   'neem': 10000,
//   'eucalyptus': 5000,
//   'guava': 8000
// };

// const CONSTRUCTION_RATES = {
//   'residential': {
//     '1st_class': 16000,
//     '2nd_class': 14000,
//     '3rd_class': 12000,
//     '4th_class': 10000
//   },
//   'commercial': {
//     'single-shop': 18000,
//     'multiple-shops': 20000,
//     'mall': 22000
//   }
// };

// const ROOM_TYPES = ['Bedroom', 'Kitchen', 'Bathroom', 'Drawing Room', 'Dining Room', 'Hall', 'Open Area', 'Balcony', 'Washing Room', 'Servant Room'];

// // Utility functions
// const convertToSqMeters = (value, unit) => {
//   if (!value) return 0;
//   switch (unit) {
//     case 'sq_yards':
//       return value * 0.836127;
//     case 'sq_feet':
//       return value * 0.092903;
//     case 'acre':
//       return value * 4046.86;
//     case 'hectare':
//       return value * 10000;
//     case 'sq_meters':
//     default:
//       return value;
//   }
// };

// const convertToMeters = (value, unit) => {
//   if (!value) return 0;
//   switch (unit) {
//     case 'feet':
//       return value * 0.3048;
//     case 'meters':
//     default:
//       return value;
//   }
// };

// export default function SaleDeedForm() {
//   // Form state
//   const [formData, setFormData] = useState({
//     documentType: '',
//     propertyType: '',
//     plotType: '',
//     salePrice: '',
//     circleRateAmount: '',
//     areaInputType: 'total',
//     area: '',
//     areaUnit: 'sq_meters',
//     propertyLength: '',
//     propertyWidth: '',
//     dimUnit: 'meters',
//     buildupType: 'single-shop',
//     numShops: 1,
//     numFloorsMall: 1,
//     numFloorsMulti: 1,
//     superAreaMulti: '',
//     coveredAreaMulti: '',
//     nalkoopCount: 0,
//     borewellCount: 0,
//     state: '',
//     district: '',
//     tehsil: '',
//     village: '',
//     khasraNo: '',
//     plotNo: '',
//     colonyName: '',
//     wardNo: '',
//     streetNo: '',
//     roadSize: '',
//     roadUnit: 'meter',
//     doubleSideRoad: false,
//     directionNorth: '',
//     directionEast: '',
//     directionSouth: '',
//     directionWest: '',
//     coveredParkingCount: 0,
//     openParkingCount: 0,
//     deductionType: '',
//     otherDeductionPercent: '',
//     buyerGender: '',
//     otherDeduction: ''
//   });

//   // Dynamic arrays
//   const [sellers, setSellers] = useState([{
//     name: '',
//     relation: '',
//     address: '',
//     mobile: '',
//     idType: '',
//     idNo: ''
//   }]);

//   const [buyers, setBuyers] = useState([{
//     name: '',
//     relation: '',
//     address: '',
//     mobile: '',
//     idType: '',
//     idNo: ''
//   }]);

//   const [witnesses, setWitnesses] = useState([
//     { name: '', relation: '', address: '', mobile: '' },
//     { name: '', relation: '', address: '', mobile: '' }
//   ]);

//   const [rooms, setRooms] = useState([]);
//   const [trees, setTrees] = useState([]);
//   const [shops, setShops] = useState([]);
//   const [mallFloors, setMallFloors] = useState([]);
//   const [facilities, setFacilities] = useState([]);
//   const [dynamicFacilities, setDynamicFacilities] = useState([]);
//   const [uploadedFiles, setUploadedFiles] = useState([]);

//   // UI state
//   const [showCalculations, setShowCalculations] = useState(false);
//   const [calculationResults, setCalculationResults] = useState(null);
//   const [isPreviewMode, setIsPreviewMode] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Refs for file inputs
//   const fileInputRef = useRef(null);

//   // Handle form input changes
//   const handleInputChange = (field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   // Add seller
//   const addSeller = () => {
//     setSellers(prev => [...prev, {
//       name: '',
//       relation: '',
//       address: '',
//       mobile: '',
//       idType: '',
//       idNo: ''
//     }]);
//   };

//   // Remove seller
//   const removeSeller = (index) => {
//     if (sellers.length > 1) {
//       setSellers(prev => prev.filter((_, i) => i !== index));
//     }
//   };

//   // Update seller
//   const updateSeller = (index, field, value) => {
//     setSellers(prev => prev.map((seller, i) =>
//       i === index ? { ...seller, [field]: value } : seller
//     ));
//   };

//   // Add buyer
//   const addBuyer = () => {
//     setBuyers(prev => [...prev, {
//       name: '',
//       relation: '',
//       address: '',
//       mobile: '',
//       idType: '',
//       idNo: ''
//     }]);
//   };

//   // Remove buyer
//   const removeBuyer = (index) => {
//     if (buyers.length > 1) {
//       setBuyers(prev => prev.filter((_, i) => i !== index));
//     }
//   };

//   // Update buyer
//   const updateBuyer = (index, field, value) => {
//     setBuyers(prev => prev.map((buyer, i) =>
//       i === index ? { ...buyer, [field]: value } : buyer
//     ));
//   };

//   // Add room
//   const addRoom = () => {
//     setRooms(prev => [...prev, {
//       type: 'bedroom',
//       length: '',
//       width: ''
//     }]);
//   };

//   // Remove room
//   const removeRoom = (index) => {
//     setRooms(prev => prev.filter((_, i) => i !== index));
//   };

//   // Update room
//   const updateRoom = (index, field, value) => {
//     setRooms(prev => prev.map((room, i) =>
//       i === index ? { ...room, [field]: value } : room
//     ));
//   };

//   // Add tree
//   const addTree = () => {
//     setTrees(prev => [...prev, {
//       type: 'mango',
//       count: 1
//     }]);
//   };

//   // Remove tree
//   const removeTree = (index) => {
//     setTrees(prev => prev.filter((_, i) => i !== index));
//   };

//   // Update tree
//   const updateTree = (index, field, value) => {
//     setTrees(prev => prev.map((tree, i) =>
//       i === index ? { ...tree, [field]: value } : tree
//     ));
//   };

//   // File upload functions
//   const handleFileUpload = (event) => {
//     const files = Array.from(event.target.files);
//     const newFiles = files.map(file => ({
//       id: Math.random().toString(36).substr(2, 9),
//       file,
//       name: file.name,
//       size: file.size,
//       type: file.type,
//       preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
//     }));

//     setUploadedFiles(prev => [...prev, ...newFiles]);
//   };

//   const removeFile = (fileId) => {
//     setUploadedFiles(prev => {
//       const fileToRemove = prev.find(f => f.id === fileId);
//       if (fileToRemove && fileToRemove.preview) {
//         URL.revokeObjectURL(fileToRemove.preview);
//       }
//       return prev.filter(f => f.id !== fileId);
//     });
//   };

//   // Local storage functions
//   const saveDraft = () => {
//     try {
//       const draftData = {
//         formData,
//         sellers,
//         buyers,
//         witnesses,
//         rooms,
//         trees,
//         shops,
//         mallFloors,
//         facilities,
//         dynamicFacilities,
//         calculations: calculationResults,
//         timestamp: new Date().toISOString()
//       };

//       localStorage.setItem('sale_deed_draft_v1', JSON.stringify(draftData));
//       alert('Draft saved successfully to local storage!');
//     } catch (error) {
//       console.error('Error saving draft:', error);
//       alert('Failed to save draft: ' + error.message);
//     }
//   };

//   const loadDraft = () => {
//     try {
//       const savedDraft = localStorage.getItem('sale_deed_draft_v1');
//       if (!savedDraft) {
//         alert('No saved draft found!');
//         return;
//       }

//       const draftData = JSON.parse(savedDraft);

//       setFormData(draftData.formData || formData);
//       setSellers(draftData.sellers || sellers);
//       setBuyers(draftData.buyers || buyers);
//       setWitnesses(draftData.witnesses || witnesses);
//       setRooms(draftData.rooms || rooms);
//       setTrees(draftData.trees || trees);
//       setShops(draftData.shops || shops);
//       setMallFloors(draftData.mallFloors || mallFloors);
//       setFacilities(draftData.facilities || facilities);
//       setDynamicFacilities(draftData.dynamicFacilities || dynamicFacilities);
//       setCalculationResults(draftData.calculations || null);

//       if (draftData.calculations) {
//         setShowCalculations(true);
//       }

//       alert('Draft loaded successfully!');
//     } catch (error) {
//       console.error('Error loading draft:', error);
//       alert('Failed to load draft: ' + error.message);
//     }
//   };

//   // Load saved sale deeds from backend
//   const loadSavedSaleDeeds = async () => {
//     setIsLoading(true);
//     try {
//       const response = await axios.get('/api/sale-deed', {
//         withCredentials: true
//       });
//       // You can store these in state if you want to display a list
//       console.log('Saved sale deeds:', response.data);
//     } catch (error) {
//       setError('Failed to load saved sale deeds: ' + error.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Auto-save functionality
//   useEffect(() => {
//     const autoSave = () => {
//       if (formData.documentType && formData.propertyType) {
//         saveDraft();
//       }
//     };

//     const timeoutId = setTimeout(autoSave, 5000);
//     return () => clearTimeout(timeoutId);
//   }, [formData, sellers, buyers, witnesses]);

//   // Load draft on component mount
//   useEffect(() => {
//     loadDraft();
//     loadSavedSaleDeeds();
//   }, []);

//   // Calculate form values
//   const calculateFormValues = () => {
//     const { propertyType, plotType, salePrice, circleRateAmount, areaInputType, area, areaUnit, propertyLength, propertyWidth, dimUnit } = formData;

//     if (!formData.documentType || !propertyType || !salePrice || !circleRateAmount) {
//       alert("Please fill in all required fields (Document Type, Property Type, Sale Price, Circle Rate Amount).");
//       return null;
//     }

//     let totalPlotAreaSqMeters = 0;
//     if (propertyType !== 'agriculture') {
//       if (areaInputType === 'total') {
//         totalPlotAreaSqMeters = convertToSqMeters(parseFloat(area) || 0, areaUnit);
//       } else if (areaInputType === 'dimensions') {
//         const lengthMeters = convertToMeters(parseFloat(propertyLength) || 0, dimUnit);
//         const widthMeters = convertToMeters(parseFloat(propertyWidth) || 0, dimUnit);
//         totalPlotAreaSqMeters = lengthMeters * widthMeters;
//       }
//     }

//     if (totalPlotAreaSqMeters <= 0 && propertyType !== 'flat' && propertyType !== 'multistory') {
//       alert("Please provide a valid property area.");
//       return null;
//     }

//     let totalBuildupAreaSqMeters = 0;
//     let buildupValue = 0;
//     let additionCharges = 0;

//     if (propertyType === 'residential') {
//       if (plotType === 'buildup') {
//         const buildupAreaSqFt = totalPlotAreaSqMeters * 10.7639;
//         const buildupRate = CONSTRUCTION_RATES.residential['1st_class'];
//         buildupValue = buildupAreaSqFt * buildupRate;
//       } else if (plotType === 'flat') {
//         let totalRoomsAreaSqFt = 0;
//         rooms.forEach(room => {
//           const length = parseFloat(room.length) || 0;
//           const width = parseFloat(room.width) || 0;
//           totalRoomsAreaSqFt += length * width;
//         });
//         totalBuildupAreaSqMeters = totalRoomsAreaSqFt * 0.092903;
//         const buildupRate = CONSTRUCTION_RATES.residential['1st_class'];
//         buildupValue = totalRoomsAreaSqFt * buildupRate;
//       } else if (plotType === 'multistory') {
//         const coveredAreaSqFt = parseFloat(formData.coveredAreaMulti) || 0;
//         totalBuildupAreaSqMeters = coveredAreaSqFt * 0.092903;
//         const buildupRate = CONSTRUCTION_RATES.residential['1st_class'];
//         buildupValue = coveredAreaSqFt * buildupRate;
//       }
//     } else if (propertyType === 'commercial') {
//       if (plotType === 'buildup') {
//         const buildupType = formData.buildupType;
//         if (buildupType === 'single-shop' || buildupType === 'multiple-shops') {
//           let totalShopAreaSqFt = 0;
//           shops.forEach(area => totalShopAreaSqFt += parseFloat(area) || 0);
//           totalBuildupAreaSqMeters = totalShopAreaSqFt * 0.092903;
//           const buildupRate = CONSTRUCTION_RATES.commercial[buildupType];
//           buildupValue = totalShopAreaSqFt * buildupRate;
//         } else if (buildupType === 'mall') {
//           let totalFloorAreaSqFt = 0;
//           mallFloors.forEach(area => totalFloorAreaSqFt += parseFloat(area) || 0);
//           totalBuildupAreaSqMeters = totalFloorAreaSqFt * 0.092903;
//           const buildupRate = CONSTRUCTION_RATES.commercial[buildupType];
//           buildupValue = totalFloorAreaSqFt * buildupRate;
//         }
//       }
//     } else if (propertyType === 'agriculture') {
//       additionCharges += (parseInt(formData.nalkoopCount) || 0) * NALKOOP_RATE;
//       additionCharges += (parseInt(formData.borewellCount) || 0) * BOREWELL_RATE;

//       trees.forEach(tree => {
//         const count = parseInt(tree.count) || 0;
//         if (TREE_RATES[tree.type]) {
//           additionCharges += TREE_RATES[tree.type] * count;
//         }
//       });
//     }

//     let baseCircleRateValue = (totalPlotAreaSqMeters / 10.7639) * parseFloat(circleRateAmount);

//     if (formData.doubleSideRoad) {
//       baseCircleRateValue *= 1.10;
//     }

//     let finalCircleRateValue = baseCircleRateValue + buildupValue + additionCharges;
//     const finalValue = Math.max(parseFloat(salePrice), finalCircleRateValue);

//     let stampDuty = finalValue * STAMP_DUTY_RATE;
//     let registrationCharge = finalValue * REGISTRATION_CHARGE_RATE;
//     let deductionAmount = 0;

//     if (formData.buyerGender === 'female') {
//       deductionAmount = finalValue * 0.01;
//       stampDuty -= deductionAmount;
//     } else if (formData.otherDeduction === 'ex-serviceman') {
//       stampDuty = 100;
//     } else if (formData.otherDeduction === 'handicapped') {
//       const handicappedDeductionBase = Math.min(finalValue, 500000);
//       deductionAmount = handicappedDeductionBase * 0.25;
//       stampDuty -= deductionAmount;
//     } else if (formData.otherDeduction === 'other') {
//       const otherDeductionPercent = parseFloat(formData.otherDeductionPercent) || 0;
//       deductionAmount = finalValue * (otherDeductionPercent / 100);
//       stampDuty -= deductionAmount;
//     }

//     stampDuty = Math.max(0, stampDuty);
//     const finalPayableAmount = stampDuty + registrationCharge;

//     return {
//       salePrice: parseFloat(salePrice),
//       totalPlotAreaSqMeters,
//       totalBuildupAreaSqMeters,
//       baseCircleRateValue,
//       finalCircleRateValue,
//       stampDuty,
//       registrationCharge,
//       finalPayableAmount,
//       deductionAmount,
//       propertyType,
//       plotType
//     };
//   };

//   // Show calculations
//   const handleShowCalculations = () => {
//     const results = calculateFormValues();
//     if (results) {
//       setCalculationResults(results);
//       setShowCalculations(true);
//     }
//   };

//   // Generate preview
//   const generatePreview = () => {
//     const results = calculateFormValues();
//     if (!results) return;

//     setCalculationResults(results);
//     setIsPreviewMode(true);
//   };

//   // Save data to local storage and backend
//   const handleSaveData = async () => {
//     const results = calculateFormValues();
//     if (!results) return;

//     setIsLoading(true);
//     setError(null);
//     try {
//       // Save to local storage
//       saveDraft();

//       // Prepare data for backend
//       const dataToSave = {
//         ...formData,
//         sellers,
//         buyers,
//         witnesses,
//         rooms,
//         trees,
//         shops,
//         mallFloors,
//         facilities,
//         dynamicFacilities,
//         calculations: results
//       };

//       // Create FormData for file uploads
//       const formDataToSend = new FormData();
//       formDataToSend.append('data', JSON.stringify(dataToSave));

//       // Add uploaded files
//       uploadedFiles.forEach((fileObj, index) => {
//         formDataToSend.append(`files`, fileObj.file);
//       });

//       // Submit to backend
//       const response = await axios.post('/api/sale-deed', formDataToSend, {
//         withCredentials: true,
//         headers: {
//           'Content-Type': 'multipart/form-data'
//         }
//       });

//       alert(response.data.message || 'Sale deed saved successfully!');
//     } catch (error) {
//       console.error('Error saving sale deed:', error);
//       setError('Failed to save sale deed: ' + error.message);
//       alert('Failed to save sale deed: ' + error.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Export data as JSON
//   const exportData = () => {
//     const results = calculateFormValues();
//     if (!results) return;

//     const dataToSave = {
//       ...formData,
//       sellers,
//       buyers,
//       witnesses,
//       rooms,
//       trees,
//       shops,
//       mallFloors,
//       facilities,
//       dynamicFacilities,
//       calculations: results
//     };

//     const dataStr = JSON.stringify(dataToSave, null, 2);
//     const blob = new Blob([dataStr], { type: "application/json" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = "sale-deed-data.json";
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);
//     alert("Form data exported as sale-deed-data.json");
//   };

//   // Clear form
//   const handleClearForm = () => {
//     setFormData({
//       documentType: '',
//       propertyType: '',
//       plotType: '',
//       salePrice: '',
//       circleRateAmount: '',
//       areaInputType: 'total',
//       area: '',
//       areaUnit: 'sq_meters',
//       propertyLength: '',
//       propertyWidth: '',
//       dimUnit: 'meters',
//       buildupType: 'single-shop',
//       numShops: 1,
//       numFloorsMall: 1,
//       numFloorsMulti: 1,
//       superAreaMulti: '',
//       coveredAreaMulti: '',
//       nalkoopCount: 0,
//       borewellCount: 0,
//       state: '',
//       district: '',
//       tehsil: '',
//       village: '',
//       khasraNo: '',
//       plotNo: '',
//       colonyName: '',
//       wardNo: '',
//       streetNo: '',
//       roadSize: '',
//       roadUnit: 'meter',
//       doubleSideRoad: false,
//       directionNorth: '',
//       directionEast: '',
//       directionSouth: '',
//       directionWest: '',
//       coveredParkingCount: 0,
//       openParkingCount: 0,
//       deductionType: '',
//       otherDeductionPercent: '',
//       buyerGender: '',
//       otherDeduction: ''
//     });
//     setSellers([{ name: '', relation: '', address: '', mobile: '', idType: '', idNo: '' }]);
//     setBuyers([{ name: '', relation: '', address: '', mobile: '', idType: '', idNo: '' }]);
//     setWitnesses([
//       { name: '', relation: '', address: '', mobile: '' },
//       { name: '', relation: '', address: '', mobile: '' }
//     ]);
//     setRooms([]);
//     setTrees([]);
//     setShops([]);
//     setMallFloors([]);
//     setFacilities([]);
//     setDynamicFacilities([]);
//     setShowCalculations(false);
//     setCalculationResults(null);
//     setUploadedFiles([]);
//     setIsPreviewMode(false);
//     setError(null);

//     localStorage.removeItem('sale_deed_draft_v1');
//     alert("Form cleared successfully");
//   };

//   // Preview component
//   const PreviewComponent = () => {
//     if (!calculationResults) return null;

//     return (
//       <div className="preview-wrap">
//         <div className="preview-controls">
//           <button
//             className="btn"
//             onClick={() => setIsPreviewMode(false)}
//           >
//             ✏️ Edit
//           </button>
//           <button
//             className="btn save"
//             onClick={handleSaveData}
//             disabled={isLoading}
//           >
//             {isLoading ? '⏳ Saving...' : '💾 Save'}
//           </button>
//           <button
//             className="btn"
//             onClick={() => window.print()}
//           >
//             🖨️ Print
//           </button>
//         </div>

//         <div className="preview-page">
//           <div className="watermark-layer">
//             {Array.from({ length: 20 }, (_, i) => (
//               <div key={i} className="wm">DRAFT</div>
//             ))}
//           </div>

//           <div className="preview-body">
//             <h2 style={{ textAlign: 'center', color: 'var(--brand)', marginBottom: '20px' }}>
//               Sale Deed Document
//             </h2>

//             <div className="preview-section">
//               <h3>Property Information</h3>
//               <p><strong>Document Type:</strong> {formData.documentType}</p>
//               <p><strong>Property Type:</strong> {formData.propertyType}</p>
//               <p><strong>Plot Type:</strong> {formData.plotType}</p>
//               <p><strong>Sale Price:</strong> ₹{formData.salePrice?.toLocaleString()}</p>
//               <p><strong>Circle Rate:</strong> ₹{formData.circleRateAmount?.toLocaleString()}</p>
//             </div>

//             <div className="preview-section">
//               <h3>Property Location</h3>
//               <p><strong>State:</strong> {formData.state}</p>
//               <p><strong>District:</strong> {formData.district}</p>
//               <p><strong>Tehsil:</strong> {formData.tehsil}</p>
//               <p><strong>Village:</strong> {formData.village}</p>
//               {formData.khasraNo && <p><strong>Khasra No:</strong> {formData.khasraNo}</p>}
//               {formData.plotNo && <p><strong>Plot No:</strong> {formData.plotNo}</p>}
//             </div>

//             {sellers.length > 0 && (
//               <div className="preview-section">
//                 <h3>Sellers</h3>
//                 {sellers.map((seller, index) => (
//                   <div key={index} className="preview-person">
//                     <p><strong>Name:</strong> {seller.name}</p>
//                     <p><strong>Relation:</strong> {seller.relation}</p>
//                     <p><strong>Address:</strong> {seller.address}</p>
//                     <p><strong>Mobile:</strong> {seller.mobile}</p>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {buyers.length > 0 && (
//               <div className="preview-section">
//                 <h3>Buyers</h3>
//                 {buyers.map((buyer, index) => (
//                   <div key={index} className="preview-person">
//                     <p><strong>Name:</strong> {buyer.name}</p>
//                     <p><strong>Relation:</strong> {buyer.relation}</p>
//                     <p><strong>Address:</strong> {buyer.address}</p>
//                     <p><strong>Mobile:</strong> {buyer.mobile}</p>
//                   </div>
//                 ))}
//               </div>
//             )}

//             <div className="preview-section">
//               <h3>Financial Calculations</h3>
//               <p><strong>Sale Price:</strong> ₹{calculationResults.salePrice?.toLocaleString()}</p>
//               <p><strong>Total Plot Area:</strong> {calculationResults.totalPlotAreaSqMeters?.toFixed(2)} sq meters</p>
//               <p><strong>Base Circle Rate Value:</strong> ₹{calculationResults.baseCircleRateValue?.toLocaleString()}</p>
//               <p><strong>Final Circle Rate Value:</strong> ₹{calculationResults.finalCircleRateValue?.toLocaleString()}</p>
//               <p><strong>Stamp Duty:</strong> ₹{calculationResults.stampDuty?.toLocaleString()}</p>
//               <p><strong>Registration Charge:</strong> ₹{calculationResults.registrationCharge?.toLocaleString()}</p>
//               <p><strong>Final Payable Amount:</strong> ₹{calculationResults.finalPayableAmount?.toLocaleString()}</p>
//             </div>

//             <div className="preview-signatures">
//               <div className="signature-section">
//                 <div className="signature-line"></div>
//                 <p>Seller Signature</p>
//               </div>
//               <div className="signature-section">
//                 <div className="signature-line"></div>
//                 <p>Buyer Signature</p>
//               </div>
//               <div className="signature-section">
//                 <div className="signature-line"></div>
//                 <p>Witness 1 Signature</p>
//               </div>
//               <div className="signature-section">
//                 <div className="signature-line"></div>
//                 <p>Witness 2 Signature</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   if (isPreviewMode) {
//     return <PreviewComponent />;
//   }

//   return (
//     <div className="container">
//       <div className="header">
//         <div>
//           <div className="title">Sale Deed Form Generator</div>
//           <div className="small">Complete property sale deed with calculations, file uploads, and preview generation.</div>
//         </div>
//         <div className="controls">
//           <button className="btn save" onClick={saveDraft}>💾 Save Draft</button>
//           <button className="btn preview" onClick={generatePreview}>🔍 Preview</button>
//           <button className="btn submit" onClick={handleSaveData} disabled={isLoading}>
//             {isLoading ? '⏳ Saving...' : '✅ Submit'}
//           </button>
//         </div>
//       </div>

//       {error && (
//         <div className="error-message">
//           {error}
//         </div>
//       )}

//       <div className="professional-form">
//         <div className="text-center mb-6">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">Sale Deed Form</h1>
//           <p className="text-gray-600">Professional Property Transaction Documentation</p>
//         </div>

//         <form className="space-y-3">
//           {/* Property Information Section */}
//           <div className="form-section">
//             <h3>Property Information</h3>
//             <div className="professional-grid cols-6">
//               <div>
//                 <label>Document Type *</label>
//                 <select
//                   value={formData.documentType}
//                   onChange={(e) => handleInputChange('documentType', e.target.value)}
//                   required
//                 >
//                   <option value="">Select Deed Type</option>
//                   <option value="sale-deed">Sale Deed</option>
//                   <option value="gift-deed">Gift Deed</option>
//                   <option value="partition-deed">Partition Deed</option>
//                   <option value="exchange-deed">Exchange Deed</option>
//                   <option value="other-deed">Others</option>
//                 </select>
//               </div>

//               <div>
//                 <label>Property Type *</label>
//                 <select
//                   value={formData.propertyType}
//                   onChange={(e) => handleInputChange('propertyType', e.target.value)}
//                   required
//                 >
//                   <option value="">Select Type</option>
//                   <option value="residential">Residential</option>
//                   <option value="agriculture">Agriculture</option>
//                   <option value="commercial">Commercial</option>
//                   <option value="industrial">Industrial</option>
//                 </select>
//               </div>

//               <div>
//                 <label>Plot Type *</label>
//                 <select
//                   value={formData.plotType}
//                   onChange={(e) => handleInputChange('plotType', e.target.value)}
//                   required
//                 >
//                   <option value="">Select Plot Type</option>
//                   <option value="vacant">Vacant Plot/Land</option>
//                   <option value="buildup">Buildup</option>
//                   <option value="flat">Flat/Floor</option>
//                   <option value="multistory">Multistory</option>
//                 </select>
//               </div>

//               <div>
//                 <label>Sale Consideration Price (INR) *</label>
//                 <input
//                   type="number"
//                   value={formData.salePrice}
//                   onChange={(e) => handleInputChange('salePrice', e.target.value)}
//                   min="1"
//                   step="any"
//                   required
//                 />
//               </div>

//               <div>
//                 <label>Circle Rate Amount (per unit area) (INR) *</label>
//                 <input
//                   type="number"
//                   value={formData.circleRateAmount}
//                   onChange={(e) => handleInputChange('circleRateAmount', e.target.value)}
//                   min="1"
//                   step="any"
//                   required
//                 />
//               </div>

//               <div>
//                 <label>Property Area Input Type</label>
//                 <select
//                   value={formData.areaInputType}
//                   onChange={(e) => handleInputChange('areaInputType', e.target.value)}
//                 >
//                   <option value="total">Total Area</option>
//                   <option value="dimensions">Length & Width</option>
//                 </select>
//               </div>
//             </div>

//             {formData.areaInputType === 'total' && (
//               <div className="professional-grid cols-3">
//                 <div>
//                   <label>Property Area *</label>
//                   <input
//                     type="number"
//                     value={formData.area}
//                     onChange={(e) => handleInputChange('area', e.target.value)}
//                     min="1"
//                     step="any"
//                     placeholder="Enter Property Area"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label>Area Unit</label>
//                   <select
//                     value={formData.areaUnit}
//                     onChange={(e) => handleInputChange('areaUnit', e.target.value)}
//                   >
//                     <option value="sq_meters">Sq. Meters</option>
//                     <option value="sq_yards">Sq. Yards</option>
//                     <option value="sq_feet">Sq. Feet</option>
//                     <option value="acre">Acre</option>
//                     <option value="hectare">Hectare</option>
//                     <option value="bigha">Bigha</option>
//                     <option value="kanal">Kanal</option>
//                     <option value="marla">Marla</option>
//                   </select>
//                 </div>
//               </div>
//             )}

//             {formData.areaInputType === 'dimensions' && (
//               <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Length
//                   </label>
//                   <input
//                     type="number"
//                     value={formData.propertyLength}
//                     onChange={(e) => handleInputChange('propertyLength', e.target.value)}
//                     min="1"
//                     step="any"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Width
//                   </label>
//                   <input
//                     type="number"
//                     value={formData.propertyWidth}
//                     onChange={(e) => handleInputChange('propertyWidth', e.target.value)}
//                     min="1"
//                     step="any"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Unit
//                   </label>
//                   <select
//                     value={formData.dimUnit}
//                     onChange={(e) => handleInputChange('dimUnit', e.target.value)}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   >
//                     <option value="meters">Meters</option>
//                     <option value="feet">Feet</option>
//                   </select>
//                 </div>
//               </div>
//             )}

//             {formData.propertyType === 'residential' && formData.plotType === 'flat' && (
//               <div className="mt-6 border border-gray-200 rounded-lg p-4">
//                 <h4 className="text-lg font-medium text-gray-700 mb-4">Room Details</h4>
//                 <p className="text-sm text-gray-600 mb-4">Add rooms and their dimensions. These are used to calculate the built-up area.</p>

//                 {rooms.map((room, index) => (
//                   <div key={index} className="flex flex-wrap items-center gap-4 mb-4 p-3 border border-gray-200 rounded">
//                     <div className="flex-1 min-w-[200px]">
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Type:</label>
//                       <select
//                         value={room.type}
//                         onChange={(e) => updateRoom(index, 'type', e.target.value)}
//                         className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
//                       >
//                         {ROOM_TYPES.map(type => (
//                           <option key={type} value={type.toLowerCase().replace(' ', '-')}>
//                             {type}
//                           </option>
//                         ))}
//                         <option value="other">Other</option>
//                       </select>
//                     </div>
//                     <div className="flex-1 min-w-[150px]">
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Length (Ft):</label>
//                       <input
//                         type="number"
//                         value={room.length}
//                         onChange={(e) => updateRoom(index, 'length', e.target.value)}
//                         min="1"
//                         step="any"
//                         className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
//                         required
//                       />
//                     </div>
//                     <div className="flex-1 min-w-[150px]">
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Width (Ft):</label>
//                       <input
//                         type="number"
//                         value={room.width}
//                         onChange={(e) => updateRoom(index, 'width', e.target.value)}
//                         min="1"
//                         step="any"
//                         className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
//                         required
//                       />
//                     </div>
//                     <button
//                       type="button"
//                       onClick={() => removeRoom(index)}
//                       className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
//                     >
//                       Remove
//                     </button>
//                   </div>
//                 ))}

//                 <button
//                   type="button"
//                   onClick={addRoom}
//                   className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
//                 >
//                   Add Room
//                 </button>
//               </div>
//             )}

//             {formData.propertyType === 'agriculture' && (
//               <div className="mt-6 border border-gray-200 rounded-lg p-4">
//                 <h4 className="text-lg font-medium text-gray-700 mb-4">Agriculture Land Additions</h4>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Nalkoop Count
//                     </label>
//                     <input
//                       type="number"
//                       value={formData.nalkoopCount}
//                       onChange={(e) => handleInputChange('nalkoopCount', e.target.value)}
//                       min="0"
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     />
//                     {formData.nalkoopCount > 0 && (
//                       <div className="text-sm text-gray-600 mt-1">
//                         Amount: ₹{(parseInt(formData.nalkoopCount) * NALKOOP_RATE).toLocaleString()}
//                       </div>
//                     )}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Borewell Count
//                     </label>
//                     <input
//                       type="number"
//                       value={formData.borewellCount}
//                       onChange={(e) => handleInputChange('borewellCount', e.target.value)}
//                       min="0"
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     />
//                     {formData.borewellCount > 0 && (
//                       <div className="text-sm text-gray-600 mt-1">
//                         Amount: ₹{(parseInt(formData.borewellCount) * BOREWELL_RATE).toLocaleString()}
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Trees</label>

//                   {trees.map((tree, index) => (
//                     <div key={index} className="flex flex-wrap items-center gap-4 mb-4 p-3 border border-gray-200 rounded">
//                       <div className="flex-1 min-w-[200px]">
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Tree Type:</label>
//                         <select
//                           value={tree.type}
//                           onChange={(e) => updateTree(index, 'type', e.target.value)}
//                           className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
//                         >
//                           {Object.keys(TREE_RATES).map(treeType => (
//                             <option key={treeType} value={treeType}>
//                               {treeType.charAt(0).toUpperCase() + treeType.slice(1)}
//                             </option>
//                           ))}
//                           <option value="other">Other</option>
//                         </select>
//                       </div>
//                       <div className="flex-1 min-w-[150px]">
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Count:</label>
//                         <input
//                           type="number"
//                           value={tree.count}
//                           onChange={(e) => updateTree(index, 'count', e.target.value)}
//                           min="1"
//                           className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
//                           required
//                         />
//                       </div>
//                       <button
//                         type="button"
//                         onClick={() => removeTree(index)}
//                         className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
//                       >
//                         Remove
//                       </button>
//                     </div>
//                   ))}

//                   <button
//                     type="button"
//                     onClick={addTree}
//                     className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
//                   >
//                     Add Tree
//                   </button>

//                   {trees.length > 0 && (
//                     <div className="mt-4 text-sm text-gray-600">
//                       Total Trees Amount: ₹{trees.reduce((total, tree) => {
//                         const count = parseInt(tree.count) || 0;
//                         const rate = TREE_RATES[tree.type] || 0;
//                         return total + (count * rate);
//                       }, 0).toLocaleString()}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {formData.propertyType === 'residential' && formData.plotType === 'multistory' && (
//               <div className="mt-6 border border-gray-200 rounded-lg p-4">
//                 <h4 className="text-lg font-medium text-gray-700 mb-4">Multistory Building Details</h4>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Number of Floors
//                     </label>
//                     <input
//                       type="number"
//                       value={formData.numFloorsMulti}
//                       onChange={(e) => handleInputChange('numFloorsMulti', e.target.value)}
//                       min="1"
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Super Area (Sq. Ft.)
//                     </label>
//                     <input
//                       type="number"
//                       value={formData.superAreaMulti}
//                       onChange={(e) => handleInputChange('superAreaMulti', e.target.value)}
//                       min="0"
//                       step="any"
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Covered Area (Sq. Ft.)
//                     </label>
//                     <input
//                       type="number"
//                       value={formData.coveredAreaMulti}
//                       onChange={(e) => handleInputChange('coveredAreaMulti', e.target.value)}
//                       min="0"
//                       step="any"
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     />
//                   </div>
//                 </div>
//               </div>
//             )}

//             {formData.propertyType === 'commercial' && formData.plotType === 'buildup' && (
//               <div className="mt-6 border border-gray-200 rounded-lg p-4">
//                 <h4 className="text-lg font-medium text-gray-700 mb-4">Buildup Details</h4>

//                 <div className="mb-4">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Buildup Type
//                   </label>
//                   <select
//                     value={formData.buildupType}
//                     onChange={(e) => handleInputChange('buildupType', e.target.value)}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   >
//                     <option value="single-shop">Single Shop</option>
//                     <option value="multiple-shops">Multiple Shops</option>
//                     <option value="mall">Mall</option>
//                   </select>
//                 </div>

//                 {(formData.buildupType === 'single-shop' || formData.buildupType === 'multiple-shops') && (
//                   <div>
//                     <div className="mb-4">
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Number of Shops
//                       </label>
//                       <input
//                         type="number"
//                         value={formData.numShops}
//                         onChange={(e) => handleInputChange('numShops', e.target.value)}
//                         min="1"
//                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       />
//                     </div>

//                     <div className="space-y-4">
//                       {Array.from({ length: parseInt(formData.numShops) || 1 }, (_, index) => (
//                         <div key={index} className="border border-gray-200 rounded-lg p-4">
//                           <h5 className="text-md font-medium text-gray-700 mb-2">Shop {index + 1}</h5>
//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                               Shop Area (Sq.Ft.)
//                             </label>
//                             <input
//                               type="number"
//                               value={shops[index] || ''}
//                               onChange={(e) => {
//                                 const newShops = [...shops];
//                                 newShops[index] = e.target.value;
//                                 setShops(newShops);
//                               }}
//                               min="1"
//                               step="any"
//                               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                               required
//                             />
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {formData.buildupType === 'mall' && (
//                   <div>
//                     <div className="mb-4">
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Number of Floors
//                       </label>
//                       <input
//                         type="number"
//                         value={formData.numFloorsMall}
//                         onChange={(e) => handleInputChange('numFloorsMall', e.target.value)}
//                         min="1"
//                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       />
//                     </div>

//                     <div className="space-y-4">
//                       {Array.from({ length: parseInt(formData.numFloorsMall) || 1 }, (_, index) => (
//                         <div key={index} className="border border-gray-200 rounded-lg p-4">
//                           <h5 className="text-md font-medium text-gray-700 mb-2">Floor {index + 1}</h5>
//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                               Floor Area (Sq.Ft.)
//                             </label>
//                             <input
//                               type="number"
//                               value={mallFloors[index] || ''}
//                               onChange={(e) => {
//                                 const newMallFloors = [...mallFloors];
//                                 newMallFloors[index] = e.target.value;
//                                 setMallFloors(newMallFloors);
//                               }}
//                               min="1"
//                               step="any"
//                               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                               required
//                             />
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}

//             {(formData.propertyType === 'residential' && (formData.plotType === 'flat' || formData.plotType === 'multistory')) && (
//               <div className="mt-6 border border-gray-200 rounded-lg p-4">
//                 <h4 className="text-lg font-medium text-gray-700 mb-4">Common Facilities</h4>
//                 <p className="text-sm text-gray-600 mb-4">These charges will increase the <strong>Circle Rate Value</strong>.</p>

//                 <div className="space-y-4">
//                   <div className="flex items-center">
//                     <input
//                       type="checkbox"
//                       id="select-all-facilities"
//                       className="mr-2"
//                       onChange={(e) => {
//                         const isChecked = e.target.checked;
//                         const facilityCheckboxes = document.querySelectorAll('input[name="facility"]');
//                         facilityCheckboxes.forEach(cb => {
//                           if (cb.id !== 'others') cb.checked = isChecked;
//                         });
//                       }}
//                     />
//                     <label htmlFor="select-all-facilities" className="text-sm font-medium text-gray-700">
//                       Select/Deselect All
//                     </label>
//                   </div>

//                   <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                     {[
//                       { value: 'swimming_pool', label: 'Swimming Pool', charge: 1 },
//                       { value: 'gym', label: 'Gymnasium', charge: 1 },
//                       { value: 'club_house', label: 'Club House', charge: 1 },
//                       { value: 'garden', label: 'Terrace Garden', charge: 1 },
//                       { value: 'security_guard', label: 'Security Guard', charge: 1 },
//                       { value: 'park', label: 'Park', charge: 1 },
//                       { value: 'lift', label: 'Lift', charge: 1 }
//                     ].map(facility => (
//                       <label key={facility.value} className="flex items-center">
//                         <input
//                           type="checkbox"
//                           name="facility"
//                           value={facility.value}
//                           data-charge={facility.charge}
//                           className="mr-2"
//                         />
//                         {facility.label}
//                       </label>
//                     ))}
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Covered Parking Count
//                       </label>
//                       <input
//                         type="number"
//                         value={formData.coveredParkingCount}
//                         onChange={(e) => handleInputChange('coveredParkingCount', e.target.value)}
//                         min="0"
//                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Open Parking Count
//                       </label>
//                       <input
//                         type="number"
//                         value={formData.openParkingCount}
//                         onChange={(e) => handleInputChange('openParkingCount', e.target.value)}
//                         min="0"
//                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           <div className="form-section">
//             <h3>Seller Details</h3>

//             {sellers.map((seller, index) => (
//               <div key={index} className="form-section">
//                 <div className="flex justify-between items-center mb-3">
//                   <h4 className="text-lg font-medium text-gray-700">Seller {index + 1}</h4>
//                   {sellers.length > 1 && (
//                     <button
//                       type="button"
//                       onClick={() => removeSeller(index)}
//                       className="remove-btn"
//                     >
//                       Remove
//                     </button>
//                   )}
//                 </div>

//                 <div className="professional-grid cols-4">
//                   <div>
//                     <label>Name *</label>
//                     <input
//                       type="text"
//                       value={seller.name}
//                       onChange={(e) => updateSeller(index, 'name', e.target.value)}
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label>Son of / Husband of</label>
//                     <input
//                       type="text"
//                       value={seller.relation}
//                       onChange={(e) => updateSeller(index, 'relation', e.target.value)}
//                     />
//                   </div>

//                   <div>
//                     <label>Mobile No.</label>
//                     <input
//                       type="text"
//                       value={seller.mobile}
//                       onChange={(e) => updateSeller(index, 'mobile', e.target.value)}
//                     />
//                   </div>

//                   <div>
//                     <label>Address</label>
//                     <textarea
//                       value={seller.address}
//                       onChange={(e) => updateSeller(index, 'address', e.target.value)}
//                       rows="2"
//                     />
//                   </div>

//                   <div>
//                     <label>ID Card Type</label>
//                     <select
//                       value={seller.idType}
//                       onChange={(e) => updateSeller(index, 'idType', e.target.value)}
//                     >
//                       <option value="">Select ID Type</option>
//                       <option value="aadhaar">Aadhaar Card</option>
//                       <option value="pan">PAN Card</option>
//                       <option value="passport">Passport</option>
//                       <option value="voter-id">Voter ID</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label>ID Card No.</label>
//                     <input
//                       type="text"
//                       value={seller.idNo}
//                       onChange={(e) => updateSeller(index, 'idNo', e.target.value)}
//                     />
//                   </div>
//                 </div>
//               </div>
//             ))}

//             <button
//               type="button"
//               onClick={addSeller}
//               className="btn add-btn"
//             >
//               + Add More Sellers
//             </button>
//           </div>

//           <div className="form-section">
//             <h3>Buyer Details</h3>

//             {buyers.map((buyer, index) => (
//               <div key={index} className="form-section">
//                 <div className="flex justify-between items-center mb-3">
//                   <h4 className="text-lg font-medium text-gray-700">Buyer {index + 1}</h4>
//                   {buyers.length > 1 && (
//                     <button
//                       type="button"
//                       onClick={() => removeBuyer(index)}
//                       className="remove-btn"
//                     >
//                       Remove
//                     </button>
//                   )}
//                 </div>

//                 <div className="professional-grid cols-4">
//                   <div>
//                     <label>Name *</label>
//                     <input
//                       type="text"
//                       value={buyer.name}
//                       onChange={(e) => updateBuyer(index, 'name', e.target.value)}
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label>Son of / Husband of</label>
//                     <input
//                       type="text"
//                       value={buyer.relation}
//                       onChange={(e) => updateBuyer(index, 'relation', e.target.value)}
//                     />
//                   </div>

//                   <div>
//                     <label>Mobile No.</label>
//                     <input
//                       type="text"
//                       value={buyer.mobile}
//                       onChange={(e) => updateBuyer(index, 'mobile', e.target.value)}
//                     />
//                   </div>

//                   <div>
//                     <label>Address</label>
//                     <textarea
//                       value={buyer.address}
//                       onChange={(e) => updateBuyer(index, 'address', e.target.value)}
//                       rows="2"
//                     />
//                   </div>

//                   <div>
//                     <label>ID Card Type</label>
//                     <select
//                       value={buyer.idType}
//                       onChange={(e) => updateBuyer(index, 'idType', e.target.value)}
//                     >
//                       <option value="">Select ID Type</option>
//                       <option value="aadhaar">Aadhaar Card</option>
//                       <option value="pan">PAN Card</option>
//                       <option value="passport">Passport</option>
//                       <option value="voter-id">Voter ID</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label>ID Card No.</label>
//                     <input
//                       type="text"
//                       value={buyer.idNo}
//                       onChange={(e) => updateBuyer(index, 'idNo', e.target.value)}
//                     />
//                   </div>
//                 </div>
//               </div>
//             ))}

//             <button
//               type="button"
//               onClick={addBuyer}
//               className="btn add-btn"
//             >
//               + Add More Buyers
//             </button>
//           </div>

//           <div className="border border-gray-200 rounded-lg p-6">
//             <h3 className="text-xl font-medium text-gray-700 border-b-2 border-blue-500 pb-2 mb-6">
//               Party Details
//             </h3>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   First Party (Seller):
//                 </label>
//                 <div className="font-bold text-blue-600">
//                   {sellers.filter(s => s.name.trim()).map(seller =>
//                     <div key={seller.name}>{seller.name} (Hereinafter Called The First Party)</div>
//                   )}
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Second Party (Buyer):
//                 </label>
//                 <div className="font-bold text-green-600">
//                   {buyers.filter(b => b.name.trim()).map(buyer =>
//                     <div key={buyer.name}>{buyer.name} (Hereinafter Called The Second Party)</div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="border border-gray-200 rounded-lg p-6">
//             <h3 className="text-xl font-medium text-gray-700 border-b-2 border-blue-500 pb-2 mb-6">
//               Witness Details
//             </h3>

//             {witnesses.map((witness, index) => (
//               <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
//                 <h4 className="text-lg font-medium text-gray-700 mb-4">Witness {index + 1}</h4>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Name *
//                     </label>
//                     <input
//                       type="text"
//                       value={witness.name}
//                       onChange={(e) => {
//                         const newWitnesses = [...witnesses];
//                         newWitnesses[index].name = e.target.value;
//                         setWitnesses(newWitnesses);
//                       }}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Son of / Husband of
//                     </label>
//                     <input
//                       type="text"
//                       value={witness.relation}
//                       onChange={(e) => {
//                         const newWitnesses = [...witnesses];
//                         newWitnesses[index].relation = e.target.value;
//                         setWitnesses(newWitnesses);
//                       }}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     />
//                   </div>

//                   <div className="md:col-span-2">
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Address
//                     </label>
//                     <textarea
//                       value={witness.address}
//                       onChange={(e) => {
//                         const newWitnesses = [...witnesses];
//                         newWitnesses[index].address = e.target.value;
//                         setWitnesses(newWitnesses);
//                       }}
//                       rows="2"
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Mobile No.
//                     </label>
//                     <input
//                       type="text"
//                       value={witness.mobile}
//                       onChange={(e) => {
//                         const newWitnesses = [...witnesses];
//                         newWitnesses[index].mobile = e.target.value;
//                         setWitnesses(newWitnesses);
//                       }}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     />
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="form-section">
//             <h3>Property Description</h3>

//             <div className="professional-grid cols-4">
//               <div>
//                 <label>State *</label>
//                 <input
//                   type="text"
//                   value={formData.state}
//                   onChange={(e) => handleInputChange('state', e.target.value)}
//                   required
//                 />
//               </div>

//               <div>
//                 <label>District *</label>
//                 <input
//                   type="text"
//                   value={formData.district}
//                   onChange={(e) => handleInputChange('district', e.target.value)}
//                   required
//                 />
//               </div>

//               <div>
//                 <label>Tehsil *</label>
//                 <input
//                   type="text"
//                   value={formData.tehsil}
//                   onChange={(e) => handleInputChange('tehsil', e.target.value)}
//                   required
//                 />
//               </div>

//               <div>
//                 <label>Village / Locality *</label>
//                 <input
//                   type="text"
//                   value={formData.village}
//                   onChange={(e) => handleInputChange('village', e.target.value)}
//                   required
//                 />
//               </div>

//               <div>
//                 <label>Khasra/Survey No.</label>
//                 <input
//                   type="text"
//                   value={formData.khasraNo}
//                   onChange={(e) => handleInputChange('k