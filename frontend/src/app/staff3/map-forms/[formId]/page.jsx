"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function MapFormEdit({ params }) {
  const { formId } = params;
  const router = useRouter();
  const { getAuthHeaders } = useAuth();
  const canvasRef = useRef(null);
  
  const [formData, setFormData] = useState({
    propertyType: 'Residential',
    propertySubType: '',
    propertyAddress: '',
    plotLength: 50,
    plotWidth: 30,
    lengthUnit: 'feet',
    widthUnit: 'feet',
    vicinityRadius: 100,
    entryDirection: 'North',
    builtUpUnit: 'feet',
    builtUpAreas: [],
    neighbourDetails: {
      north: { type: 'Road', name: '', roadSize: 20 },
      south: { type: 'Plot', name: '', roadSize: 0 },
      east: { type: 'Road', name: '', roadSize: 15 },
      west: { type: 'Plot', name: '', roadSize: 0 }
    },
    notes: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [language, setLanguage] = useState('en');
  const [showPreview, setShowPreview] = useState(false);

  // Property type options
  const propertyTypes = {
    Residential: ['Vacant Plot', 'Flat', 'House', 'Villa', 'Other Residential'],
    Commercial: ['Shop', 'Office', 'Showroom', 'Other Commercial'],
    Industrial: ['Shed', 'Factory', 'Warehouse', 'Other Industrial'],
    Agriculture: ['Agricultural Land', 'Farm House', 'Other Agriculture']
  };

  const builtUpOptions = [
    { id: 'room', label: 'Room', color: '#ffc107' },
    { id: 'kitchen', label: 'Kitchen', color: '#dc3545' },
    { id: 'bathroom', label: 'Bathroom', color: '#28a745' },
    { id: 'hall', label: 'Hall', color: '#17a2b8' },
    { id: 'open', label: 'Open Area', color: '#007bff' }
  ];

  useEffect(() => {
    if (formId) {
      loadMapForm();
    }
  }, [formId]);

  const loadMapForm = async () => {
    try {
      setLoading(true);
      setError('');
      
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(`${API_BASE}/api/mapForms/staff3/${formId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const mapForm = data.data.mapForm;
        setFormData({
          propertyType: mapForm.propertyType || 'Residential',
          propertySubType: mapForm.propertySubType || '',
          propertyAddress: mapForm.propertyAddress || '',
          plotLength: mapForm.plotLength || 50,
          plotWidth: mapForm.plotWidth || 30,
          lengthUnit: mapForm.lengthUnit || 'feet',
          widthUnit: mapForm.widthUnit || 'feet',
          vicinityRadius: mapForm.vicinityRadius || 100,
          entryDirection: mapForm.entryDirection || 'North',
          builtUpUnit: mapForm.builtUpUnit || 'feet',
          builtUpAreas: mapForm.builtUpAreas || [],
          neighbourDetails: mapForm.neighbourDetails || {
            north: { type: 'Road', name: '', roadSize: 20 },
            south: { type: 'Plot', name: '', roadSize: 0 },
            east: { type: 'Road', name: '', roadSize: 15 },
            west: { type: 'Plot', name: '', roadSize: 0 }
          },
          notes: mapForm.notes || ''
        });
        
        // Initialize with default built-up areas if none exist
        if (!mapForm.builtUpAreas || mapForm.builtUpAreas.length === 0) {
          addBuiltUpRow('room', 14, 12);
          addBuiltUpRow('hall', 18, 15);
          addBuiltUpRow('kitchen', 8, 6);
        }
      } else {
        setError(data.message || 'Failed to load map form');
      }
    } catch (err) {
      setError(err.message || 'Error loading map form');
    } finally {
      setLoading(false);
    }
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
    
    // Trigger canvas redraw when relevant fields change
    if (['plotLength', 'plotWidth', 'lengthUnit', 'widthUnit', 'entryDirection'].includes(field) || 
        field.startsWith('builtUpAreas') || field.startsWith('neighbourDetails')) {
      setTimeout(() => drawPlot(), 100);
    }
  };

  const handleNeighbourChange = (direction, field, value) => {
    setFormData(prev => ({
      ...prev,
      neighbourDetails: {
        ...prev.neighbourDetails,
        [direction]: {
          ...prev.neighbourDetails[direction],
          [field]: value
        }
      }
    }));
    setTimeout(() => drawPlot(), 100);
  };

  const addBuiltUpRow = (defaultType = 'room', defaultL = '', defaultW = '') => {
    const newArea = {
      type: defaultType,
      label: `${defaultType.charAt(0).toUpperCase() + defaultType.slice(1)}${formData.builtUpAreas.length + 1}`,
      length: defaultL || 0,
      width: defaultW || 0,
      unit: formData.builtUpUnit,
      color: builtUpOptions.find(opt => opt.id === defaultType)?.color || '#ffc107'
    };

    setFormData(prev => ({
      ...prev,
      builtUpAreas: [...prev.builtUpAreas, newArea]
    }));
    
    setTimeout(() => drawPlot(), 100);
  };

  const removeBuiltUpRow = (index) => {
    setFormData(prev => ({
      ...prev,
      builtUpAreas: prev.builtUpAreas.filter((_, i) => i !== index)
    }));
    setTimeout(() => drawPlot(), 100);
  };

  const updateBuiltUpArea = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      builtUpAreas: prev.builtUpAreas.map((area, i) => 
        i === index ? { ...area, [field]: value } : area
      )
    }));
    setTimeout(() => drawPlot(), 100);
  };

  // Utility functions
  const convertToFeet = (value, unit) => {
    const conversions = { feet: 1, yards: 3, meters: 3.28084 };
    return value * (conversions[unit] || 1);
  };

  const calculateAreas = () => {
    const lengthFeet = convertToFeet(formData.plotLength, formData.lengthUnit);
    const widthFeet = convertToFeet(formData.plotWidth, formData.widthUnit);
    const plotAreaSqFeet = lengthFeet * widthFeet;
    const plotAreaSqMeters = plotAreaSqFeet * 0.092903;
    const plotAreaSqYards = plotAreaSqFeet / 9;

    let totalBuiltUpSqFeet = 0;
    formData.builtUpAreas.forEach(area => {
      const areaLengthFeet = convertToFeet(area.length, area.unit);
      const areaWidthFeet = convertToFeet(area.width, area.unit);
      totalBuiltUpSqFeet += areaLengthFeet * areaWidthFeet;
    });

    const builtUpSqMeters = totalBuiltUpSqFeet * 0.092903;
    const builtUpPercentage = plotAreaSqFeet > 0 ? (totalBuiltUpSqFeet / plotAreaSqFeet) * 100 : 0;

    return {
      plotAreaSqFeet,
      plotAreaSqMeters,
      plotAreaSqYards,
      totalBuiltUpSqFeet,
      builtUpSqMeters,
      builtUpPercentage
    };
  };

  const drawPlot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Get dimensions
    const lengthFeet = convertToFeet(formData.plotLength, formData.lengthUnit);
    const widthFeet = convertToFeet(formData.plotWidth, formData.widthUnit);
    
    if (lengthFeet <= 0 || widthFeet <= 0) return;

    // Calculate scaling
    const maxDimension = Math.max(lengthFeet, widthFeet);
    const margin = 80;
    const scale = (Math.min(canvasWidth, canvasHeight) - margin) / maxDimension;
    
    const scaledWidth = widthFeet * scale;
    const scaledLength = lengthFeet * scale;
    const plotX = (canvasWidth - scaledWidth) / 2;
    const plotY = (canvasHeight - scaledLength) / 2;

    // Draw plot boundary
    ctx.beginPath();
    ctx.rect(plotX, plotY, scaledWidth, scaledLength);
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#eaf5ff';
    ctx.fill();
    ctx.closePath();

    // Plot text
    ctx.font = '16px Arial bold';
    ctx.fillStyle = '#343a40';
    ctx.textAlign = 'center';
    const areaData = calculateAreas();
    ctx.fillText(`PLOT AREA (${areaData.plotAreaSqFeet.toFixed(0)} sq. ft.)`, 
      plotX + scaledWidth / 2, plotY + scaledLength / 2 - 20);

    // Draw built-up areas
    if (formData.builtUpAreas.length > 0) {
      const plotInnerL = scaledWidth * 0.9;
      const plotInnerW = scaledLength * 0.9;
      
      let builtScaleL = 0;
      let builtScaleW = 0;
      
      // Calculate total built-up dimensions
      formData.builtUpAreas.forEach(area => {
        const areaLengthFeet = convertToFeet(area.length, area.unit);
        const areaWidthFeet = convertToFeet(area.width, area.unit);
        builtScaleL = Math.max(builtScaleL, areaLengthFeet);
        builtScaleW = Math.max(builtScaleW, areaWidthFeet);
      });
      
      builtScaleL *= scale;
      builtScaleW *= scale;
      
      // Scale down if too large
      let sizeRatio = 1;
      if (builtScaleL > plotInnerL || builtScaleW > plotInnerW) {
        const ratioL = plotInnerL / builtScaleL;
        const ratioW = plotInnerW / builtScaleW;
        sizeRatio = Math.min(ratioL, ratioW, 1);
      }
      
      builtScaleL *= sizeRatio;
      builtScaleW *= sizeRatio;
      const finalBuiltScale = scale * sizeRatio;

      const builtDrawX = plotX + (scaledWidth - builtScaleL) / 2;
      const builtDrawY = plotY + (scaledLength - builtScaleW) / 2;
      
      // Draw overall built-up boundary
      ctx.beginPath();
      ctx.rect(builtDrawX, builtDrawY, builtScaleL, builtScaleW);
      ctx.strokeStyle = '#343a40';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#f2f2f2';
      ctx.fill();
      ctx.closePath();
      
      ctx.font = '14px Arial bold';
      ctx.fillStyle = '#dc3545';
      ctx.textAlign = 'center';
      ctx.fillText(`BUILT UP: ${areaData.totalBuiltUpSqFeet.toFixed(0)} Sq. Ft.`, 
        plotX + scaledWidth / 2, plotY + scaledLength / 2 + 30);

      // Draw individual rooms
      let current_x = builtDrawX + 5;
      let current_y = builtDrawY + 5;
      const max_x_limit = builtDrawX + builtScaleL - 5;
      const max_y_limit = builtDrawY + builtScaleW - 5;
      let max_row_w = 0;

      formData.builtUpAreas.forEach((area) => {
        const dimScaleL = convertToFeet(area.length, area.unit) * finalBuiltScale;
        const dimScaleW = convertToFeet(area.width, area.unit) * finalBuiltScale;
        
        if (current_x + dimScaleL > max_x_limit) {
          current_x = builtDrawX + 5;
          current_y += max_row_w + 5;
          max_row_w = 0;
        }
        
        if (current_y + dimScaleW > max_y_limit) return;

        // Draw the room
        ctx.beginPath();
        ctx.rect(current_x, current_y, dimScaleL, dimScaleW);
        ctx.strokeStyle = area.color;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = area.color + '33';
        ctx.fill();
        ctx.closePath();
        
        // Label
        ctx.font = '12px Arial bold';
        ctx.fillStyle = area.color;
        ctx.textAlign = 'center';
        ctx.fillText(area.label, current_x + dimScaleL / 2, current_y + dimScaleW / 2 - 5);
        ctx.font = '10px Arial';
        ctx.fillText(`${area.length.toFixed(0)}x${area.width.toFixed(0)} ${area.unit.charAt(0)}`, 
          current_x + dimScaleL / 2, current_y + dimScaleW / 2 + 8);
        
        current_x += dimScaleL + 5;
        max_row_w = Math.max(max_row_w, dimScaleW);
      });

      // Draw entry arrow
      const arrowSize = 8;
      let arrowX, arrowY;
      
      if (formData.entryDirection === 'North') {
        arrowX = plotX + scaledWidth / 2;
        arrowY = plotY;
      } else if (formData.entryDirection === 'South') {
        arrowX = plotX + scaledWidth / 2;
        arrowY = plotY + scaledLength;
      } else if (formData.entryDirection === 'East') {
        arrowX = plotX + scaledWidth;
        arrowY = plotY + scaledLength / 2;
      } else if (formData.entryDirection === 'West') {
        arrowX = plotX;
        arrowY = plotY + scaledLength / 2;
      }

      // Draw arrow
      ctx.fillStyle = '#007bff';
      ctx.strokeStyle = '#007bff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      if (formData.entryDirection === 'North') {
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - arrowSize, arrowY + arrowSize);
        ctx.lineTo(arrowX + arrowSize, arrowY + arrowSize);
      } else if (formData.entryDirection === 'South') {
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - arrowSize, arrowY - arrowSize);
        ctx.lineTo(arrowX + arrowSize, arrowY - arrowSize);
      } else if (formData.entryDirection === 'East') {
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - arrowSize, arrowY - arrowSize);
        ctx.lineTo(arrowX - arrowSize, arrowY + arrowSize);
      } else if (formData.entryDirection === 'West') {
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX + arrowSize, arrowY - arrowSize);
        ctx.lineTo(arrowX + arrowSize, arrowY + arrowSize);
      }
      
      ctx.closePath();
      ctx.fill();
      
      // Entry text
      ctx.font = '12px Arial bold';
      ctx.fillStyle = '#007bff';
      ctx.textAlign = 'center';
      if (formData.entryDirection === 'North') {
        ctx.fillText('ENTRY', arrowX, arrowY - 10);
      } else if (formData.entryDirection === 'South') {
        ctx.fillText('ENTRY', arrowX, arrowY + 20);
      } else if (formData.entryDirection === 'East') {
        ctx.fillText('ENTRY', arrowX + 25, arrowY);
      } else if (formData.entryDirection === 'West') {
        ctx.fillText('ENTRY', arrowX - 25, arrowY);
      }
    }

    // Draw dimension lines
    ctx.strokeStyle = '#6c757d';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#343a40';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';

    // North/South dimension
    ctx.beginPath();
    ctx.moveTo(plotX + scaledWidth, plotY);
    ctx.lineTo(plotX + scaledWidth, plotY + scaledLength);
    ctx.moveTo(plotX + scaledWidth + 10, plotY);
    ctx.lineTo(plotX + scaledWidth + 10, plotY + scaledLength);
    ctx.moveTo(plotX + scaledWidth, plotY);
    ctx.lineTo(plotX + scaledWidth + 10, plotY);
    ctx.moveTo(plotX + scaledWidth, plotY + scaledLength);
    ctx.lineTo(plotX + scaledWidth + 10, plotY + scaledLength);
    ctx.stroke();
    ctx.fillText(`${formData.plotLength.toFixed(1)} ${formData.lengthUnit}`, 
      plotX + scaledWidth + 15, plotY + scaledLength / 2);

    // East/West dimension
    ctx.beginPath();
    ctx.moveTo(plotX, plotY);
    ctx.lineTo(plotX + scaledWidth, plotY);
    ctx.moveTo(plotX, plotY - 10);
    ctx.lineTo(plotX + scaledWidth, plotY - 10);
    ctx.moveTo(plotX, plotY);
    ctx.lineTo(plotX, plotY - 10);
    ctx.moveTo(plotX + scaledWidth, plotY);
    ctx.lineTo(plotX + scaledWidth, plotY - 10);
    ctx.stroke();
    ctx.fillText(`${formData.plotWidth.toFixed(1)} ${formData.widthUnit}`, 
      plotX + scaledWidth / 2, plotY - 15);

    // Direction indicator
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'left';
    ctx.font = '18px Arial bold';
    ctx.fillText('↑ N', 20, 30);
  };

  useEffect(() => {
    if (!loading) {
      drawPlot();
    }
  }, [loading, formData]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(`${API_BASE}/api/mapForms/staff3/${formId}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Map form updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update map form');
      }
    } catch (err) {
      setError(err.message || 'Error updating map form');
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
      const response = await fetch(`${API_BASE}/api/mapForms/staff3/${formId}/verify`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notes: 'Map form verified by Staff 3'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Map form verified successfully!');
        setTimeout(() => {
          setSuccess('');
          router.push('/staff3/map-forms');
        }, 2000);
      } else {
        setError(data.message || 'Failed to verify map form');
      }
    } catch (err) {
      setError(err.message || 'Error verifying map form');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this map form? This action cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(`${API_BASE}/api/mapForms/staff3/${formId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (response.ok && data.success) {
        router.push('/staff3/map-forms');
      } else {
        setError(data.message || 'Failed to delete map form');
      }
    } catch (err) {
      setError(err.message || 'Error deleting map form');
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePDF = () => {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
    window.open(`${API_BASE}/api/mapForms/staff3/${formId}/pdf`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading map form...</p>
        </div>
      </div>
    );
  }

  const areaData = calculateAreas();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Map Module Form - {formId.slice(-8)}
              </h1>
              <p className="text-gray-600">Edit and verify property map and built-up area form</p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/staff3/map-forms"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                ← Back to List
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Language Selector */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {language === 'en' ? 'संपत्ति का विस्तृत नक़्शा और बिल्ट-अप रिपोर्ट' : 'Property Detailed Map & Built-up Report'}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            {/* Property Details */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h5 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                1. Property Details
              </h5>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => handleInputChange('propertyType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(propertyTypes).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Sub-Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.propertySubType}
                    onChange={(e) => handleInputChange('propertySubType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select --</option>
                    {propertyTypes[formData.propertyType]?.map(subType => (
                      <option key={subType} value={subType}>{subType}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.propertyAddress}
                    onChange={(e) => handleInputChange('propertyAddress', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter property address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vicinity Radius (Sq. Meter)
                  </label>
                  <input
                    type="number"
                    value={formData.vicinityRadius}
                    onChange={(e) => handleInputChange('vicinityRadius', parseFloat(e.target.value) || 100)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="100"
                  />
                </div>
              </div>
            </div>

            {/* Plot Dimensions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h5 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                2. Plot Dimensions
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plot Length (N/S)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formData.plotLength}
                      onChange={(e) => handleInputChange('plotLength', parseFloat(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="50"
                    />
                    <select
                      value={formData.lengthUnit}
                      onChange={(e) => handleInputChange('lengthUnit', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="feet">Feet</option>
                      <option value="yards">Yards</option>
                      <option value="meters">Meters</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plot Width (E/W)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formData.plotWidth}
                      onChange={(e) => handleInputChange('plotWidth', parseFloat(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="30"
                    />
                    <select
                      value={formData.widthUnit}
                      onChange={(e) => handleInputChange('widthUnit', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="feet">Feet</option>
                      <option value="yards">Yards</option>
                      <option value="meters">Meters</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Area Display */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h6 className="font-semibold text-blue-900 mb-2">Total Plot Area:</h6>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">{areaData.plotAreaSqMeters.toFixed(3)}</span> Sq. Meter
                  </div>
                  <div>
                    <span className="font-medium">{areaData.plotAreaSqFeet.toFixed(3)}</span> Sq. Feet
                  </div>
                  <div>
                    <span className="font-medium">{areaData.plotAreaSqYards.toFixed(3)}</span> Sq. Yards
                  </div>
                </div>
              </div>
            </div>

            {/* Built-up Details */}
            {formData.propertySubType && !['Vacant Plot', 'Agricultural Land'].includes(formData.propertySubType) && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h5 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                  3. Built-up Area Details
                </h5>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Entry Direction
                      </label>
                      <select
                        value={formData.entryDirection}
                        onChange={(e) => handleInputChange('entryDirection', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="North">North</option>
                        <option value="South">South</option>
                        <option value="East">East</option>
                        <option value="West">West</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Built-up Unit
                      </label>
                      <select
                        value={formData.builtUpUnit}
                        onChange={(e) => handleInputChange('builtUpUnit', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="feet">Feet</option>
                        <option value="yards">Yards</option>
                        <option value="meters">Meters</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Built-up Areas
                    </label>
                    <div className="space-y-3">
                      {formData.builtUpAreas.map((area, index) => (
                        <div key={index} className="flex gap-2 items-center p-3 bg-gray-50 rounded-lg">
                          <select
                            value={area.type}
                            onChange={(e) => updateBuiltUpArea(index, 'type', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            {builtUpOptions.map(option => (
                              <option key={option.id} value={option.id}>{option.label}</option>
                            ))}
                          </select>
                          <label className="text-sm font-medium min-w-16">{area.label}:</label>
                          <input
                            type="number"
                            value={area.length}
                            onChange={(e) => updateBuiltUpArea(index, 'length', parseFloat(e.target.value) || 0)}
                            placeholder="Length"
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <input
                            type="number"
                            value={area.width}
                            onChange={(e) => updateBuiltUpArea(index, 'width', parseFloat(e.target.value) || 0)}
                            placeholder="Width"
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <select
                            value={area.unit}
                            onChange={(e) => updateBuiltUpArea(index, 'unit', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="feet">ft</option>
                            <option value="yards">yd</option>
                            <option value="meters">m</option>
                          </select>
                          <button
                            onClick={() => removeBuiltUpRow(index)}
                            className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => addBuiltUpRow()}
                      className="mt-2 w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      + Add More Room/Area
                    </button>
                  </div>

                  {/* Built-up Area Summary */}
                  {areaData.totalBuiltUpSqFeet > 0 && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg">
                      <h6 className="font-semibold text-green-900 mb-2">Built-up Area Summary:</h6>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">{areaData.builtUpSqMeters.toFixed(3)}</span> Sq. Meter
                        </div>
                        <div>
                          <span className="font-medium">{areaData.totalBuiltUpSqFeet.toFixed(3)}</span> Sq. Feet
                        </div>
                        <div>
                          <span className="font-medium">{areaData.builtUpPercentage.toFixed(1)}%</span> of Plot
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Neighbour Details */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h5 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                4. Neighbour Details
              </h5>
              <div className="space-y-4">
                {['north', 'south', 'east', 'west'].map(direction => (
                  <div key={direction}>
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                      {direction} Direction:
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={formData.neighbourDetails[direction].type}
                        onChange={(e) => handleNeighbourChange(direction, 'type', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Road">Road</option>
                        <option value="Plot">Plot (Neighbour)</option>
                        <option value="Others">Others</option>
                      </select>
                      
                      {formData.neighbourDetails[direction].type === 'Others' && (
                        <input
                          type="text"
                          value={formData.neighbourDetails[direction].name}
                          onChange={(e) => handleNeighbourChange(direction, 'name', e.target.value)}
                          placeholder="Others name"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                      
                      {formData.neighbourDetails[direction].type === 'Road' && (
                        <input
                          type="number"
                          value={formData.neighbourDetails[direction].roadSize}
                          onChange={(e) => handleNeighbourChange(direction, 'roadSize', parseFloat(e.target.value) || 0)}
                          placeholder="Road Size (ft)"
                          className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex flex-wrap gap-4">
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
            </div>
          </div>

          {/* Canvas Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h5 className="text-lg font-semibold text-gray-900 mb-4 text-center border-b pb-2">
              Plot Design & Map
            </h5>
            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                width={500}
                height={500}
                className="border border-gray-300 rounded-lg"
              />
            </div>
            
            {/* Plot Data Display */}
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>North:</strong> {formData.neighbourDetails.north.type} 
                {formData.neighbourDetails.north.roadSize > 0 && ` (${formData.neighbourDetails.north.roadSize} ft)`}
                <br />
                <span className="text-gray-600">({formData.plotLength.toFixed(1)} {formData.lengthUnit})</span>
              </div>
              <div>
                <strong>South:</strong> {formData.neighbourDetails.south.type}
                {formData.neighbourDetails.south.roadSize > 0 && ` (${formData.neighbourDetails.south.roadSize} ft)`}
                <br />
                <span className="text-gray-600">({formData.plotLength.toFixed(1)} {formData.lengthUnit})</span>
              </div>
              <div>
                <strong>East:</strong> {formData.neighbourDetails.east.type}
                {formData.neighbourDetails.east.roadSize > 0 && ` (${formData.neighbourDetails.east.roadSize} ft)`}
                <br />
                <span className="text-gray-600">({formData.plotWidth.toFixed(1)} {formData.widthUnit})</span>
              </div>
              <div>
                <strong>West:</strong> {formData.neighbourDetails.west.type}
                {formData.neighbourDetails.west.roadSize > 0 && ` (${formData.neighbourDetails.west.roadSize} ft)`}
                <br />
                <span className="text-gray-600">({formData.plotWidth.toFixed(1)} {formData.widthUnit})</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
