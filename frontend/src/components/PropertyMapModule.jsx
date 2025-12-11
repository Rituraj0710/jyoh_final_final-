"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const PropertyMapModule = () => {
  const { getAuthHeaders } = useAuth();
  const [formData, setFormData] = useState({
    propertyType: '',
    propertySubType: '',
    propertyAddress: '',
    vicinityRadius: '',
    plotLength: '',
    plotWidth: '',
    unitLength: 'feet',
    unitWidth: 'feet',
    entryDirection: 'North',
    builtUpUnit: 'feet',
    neighbourNorthType: '',
    neighbourNorthOther: '',
    roadNorth: '',
    neighbourSouthType: '',
    neighbourSouthOther: '',
    roadSouth: '',
    neighbourEastType: '',
    neighbourEastOther: '',
    roadEast: '',
    neighbourWestType: '',
    neighbourWestOther: '',
    roadWest: ''
  });

  const [builtUpRows, setBuiltUpRows] = useState([]);

  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rowCounter, setRowCounter] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState({
    propertyPhotos: [],
    mapImages: [],
    propertyDocuments: []
  });
  const [previewImages, setPreviewImages] = useState({});
  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);

  // Conversion constants
  const METER_TO_FEET = 3.28084;
  const YARD_TO_FEET = 3;
  const SQ_FEET_TO_SQ_METER = 0.092903;

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'propertyType') {
      setFormData(prev => ({ ...prev, [name]: value, propertySubType: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const toFeet = (value, unit) => {
    if (unit === 'meters') return value * METER_TO_FEET;
    if (unit === 'yards') return value * YARD_TO_FEET;
    return value;
  };

  const generateColor = (index) => {
    const colors = ['#ffc107', '#17a2b8', '#dc3545', '#28a745', '#6f42c1', '#fd7e14', '#007bff', '#20c997', '#6c757d', '#adb5bd', '#ff6b6b'];
    return colors[index % colors.length];
  };

  const isBuiltUpVisible = () => {
    const subType = formData.propertySubType;
    return subType !== 'Vacant Plot' && subType !== 'Agricultural Land' && subType !== '';
  };

  const addBuiltUpRow = () => {
    setBuiltUpRows(prev => [...prev, { id: rowCounter, type: 'room', l: '', w: '' }]);
    setRowCounter(prev => prev + 1);
  };

  const removeBuiltUpRow = (id) => {
    setBuiltUpRows(prev => prev.filter(row => row.id !== id));
  };

  const updateBuiltUpRow = (id, field, value) => {
    setBuiltUpRows(prev => prev.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const getLabel = (rowId, type) => {
    const allRows = builtUpRows.filter(r => r.type === type && r.id <= rowId);
    const count = allRows.length;
    const labelMap = {
      room: 'R', kitchen: 'K', bathroom: 'B', hall: 'H', open: 'OA'
    };
    let finalLabel = labelMap[type] || type.toUpperCase().substring(0, 2);
    if (type === 'room' || type === 'bathroom') {
      finalLabel += count;
    }
    return finalLabel;
  };

  const calculateBuiltUpArea = () => {
    let totalSqFeet = 0;
    const roomDims = [];
    let maxL = 0;
    let maxW = 0;

    builtUpRows.forEach(row => {
      const l = parseFloat(row.l) || 0;
      const w = parseFloat(row.w) || 0;
      if (l > 0 && w > 0) {
        const l_feet = toFeet(l, formData.builtUpUnit);
        const w_feet = toFeet(w, formData.builtUpUnit);
        const area = l_feet * w_feet;
        totalSqFeet += area;
        maxL = Math.max(maxL, l_feet);
        maxW = Math.max(maxW, w_feet);

        const colorIndex = builtUpOptions.findIndex(opt => opt.id === row.type);
        const color = generateColor(colorIndex !== -1 ? colorIndex : 0);
        const label = getLabel(row.id, row.type);

        roomDims.push({
          label, area, l, w, unit: formData.builtUpUnit,
          l_feet, w_feet, color
        });
      }
    });

    let builtL = 0;
    let builtW = 0;
    if (roomDims.length > 0) {
      const sortedL = roomDims.map(d => d.l_feet).sort((a, b) => b - a);
      const sortedW = roomDims.map(d => d.w_feet).sort((a, b) => b - a);
      builtL = sortedL[0] + (sortedL[1] || 0) * 0.5;
      builtW = sortedW[0] + (sortedW[1] || 0) * 0.5;
    }

    return {
      totalSqFeet,
      dimensions: roomDims,
      totalSqMeters: totalSqFeet * SQ_FEET_TO_SQ_METER,
      totalSqYards: totalSqFeet / 9,
      builtL,
      builtW
    };
  };

  const getNeighbourData = (direction) => {
    const type = formData[`neighbour${direction}Type`];
    if (type === 'Road') {
      const size = parseFloat(formData[`road${direction}`]) || 0;
      return `ROAD (${size} ft)`;
    } else if (type === 'Others') {
      return formData[`neighbour${direction}Other`] || 'NEIGHBOUR';
    } else {
      return 'PLOT (Padosi)';
    }
  };

  const drawArrow = (ctx, x, y, direction, size) => {
    ctx.fillStyle = '#007bff';
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    if (direction === 'North') {
      ctx.moveTo(x, y);
      ctx.lineTo(x - size, y + size);
      ctx.lineTo(x + size, y + size);
    } else if (direction === 'South') {
      ctx.moveTo(x, y);
      ctx.lineTo(x - size, y - size);
      ctx.lineTo(x + size, y - size);
    } else if (direction === 'East') {
      ctx.moveTo(x, y);
      ctx.lineTo(x - size, y - size);
      ctx.lineTo(x - size, y + size);
    } else if (direction === 'West') {
      ctx.moveTo(x, y);
      ctx.lineTo(x + size, y - size);
      ctx.lineTo(x + size, y + size);
    }
    ctx.closePath();
    ctx.fill();
  };

  const drawDimension = (ctx, x1, y1, x2, y2, text, orientation, offset) => {
    ctx.strokeStyle = '#6c757d';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#343a40';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.beginPath();
    
    if (orientation === 'H') {
      ctx.moveTo(x1, y1);
      ctx.lineTo(x1, y1 + offset);
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2, y2 + offset);
      ctx.moveTo(x1, y1 + offset);
      ctx.lineTo(x2, y2 + offset);
      ctx.stroke();
      ctx.fillText(text, (x1 + x2) / 2, y1 + offset + 15);
    } else {
      ctx.moveTo(x1, y1);
      ctx.lineTo(x1 + offset, y1);
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 + offset, y2);
      ctx.moveTo(x1 + offset, y1);
      ctx.lineTo(x2 + offset, y2);
      ctx.stroke();
      ctx.save();
      ctx.translate(x1 + offset + 15, (y1 + y2) / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(text, 0, 0);
      ctx.restore();
    }
  };

  const drawPlot = (canvas) => {
    if (!canvas) return;

    const lengthVal = parseFloat(formData.plotLength);
    const widthVal = parseFloat(formData.plotWidth);
    
    if (isNaN(lengthVal) || isNaN(widthVal) || lengthVal <= 0 || widthVal <= 0) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const lengthFeet = toFeet(lengthVal, formData.unitLength);
    const widthFeet = toFeet(widthVal, formData.unitWidth);
    const areaSqFeet = lengthFeet * widthFeet;
    const builtUpResult = calculateBuiltUpArea();
    const isBuilt = isBuiltUpVisible() && builtUpResult.dimensions.length > 0;

    const ctx = canvas.getContext('2d');
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

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

    ctx.font = '16px Arial bold';
    ctx.fillStyle = '#343a40';
    ctx.textAlign = 'center';
    ctx.fillText(`PLOT AREA (${areaSqFeet.toFixed(0)} sq. ft.)`, plotX + scaledWidth / 2, plotY + scaledLength / 2 - 20);

    // Draw built-up layout
    if (isBuilt) {
      const plotInnerL = scaledWidth * 0.9;
      const plotInnerW = scaledLength * 0.9;
      
      let builtScaleL = builtUpResult.builtL * scale;
      let builtScaleW = builtUpResult.builtW * scale;

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
      ctx.fillText(`BUILT UP: ${builtUpResult.totalSqFeet.toFixed(0)} Sq. Ft.`, plotX + scaledWidth / 2, plotY + scaledLength / 2 + 30);

      let current_x = builtDrawX + 5;
      let current_y = builtDrawY + 5;
      const max_x_limit = builtDrawX + builtScaleL - 5;
      const max_y_limit = builtDrawY + builtScaleW - 5;
      let max_row_w = 0;

      builtUpResult.dimensions.forEach((dim) => {
        const dimScaleL = dim.l_feet * finalBuiltScale;
        const dimScaleW = dim.w_feet * finalBuiltScale;
        
        if (current_x + dimScaleL > max_x_limit) {
          current_x = builtDrawX + 5;
          current_y += max_row_w + 5;
          max_row_w = 0;
        }
        
        if (current_y + dimScaleW > max_y_limit) return;

        ctx.beginPath();
        ctx.rect(current_x, current_y, dimScaleL, dimScaleW);
        ctx.strokeStyle = dim.color;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = dim.color + '33';
        ctx.fill();
        ctx.closePath();
        
        ctx.font = '12px Arial bold';
        ctx.fillStyle = dim.color;
        ctx.textAlign = 'center';
        ctx.fillText(dim.label, current_x + dimScaleL / 2, current_y + dimScaleW / 2 - 5);
        ctx.font = '10px Arial';
        ctx.fillText(`${dim.l.toFixed(0)}x${dim.w.toFixed(0)} ${dim.unit.charAt(0)}`, current_x + dimScaleL / 2, current_y + dimScaleW / 2 + 8);
        
        current_x += dimScaleL + 5;
        max_row_w = Math.max(max_row_w, dimScaleW);
      });

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

      drawArrow(ctx, arrowX, arrowY, formData.entryDirection, arrowSize);
      
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
    drawDimension(ctx, plotX + scaledWidth, plotY, plotX + scaledWidth, plotY + scaledLength,
      `${lengthVal.toFixed(1)} ${formData.unitLength}`, 'V', 10);
    
    drawDimension(ctx, plotX, plotY, plotX + scaledWidth, plotY,
      `${widthVal.toFixed(1)} ${formData.unitWidth}`, 'H', -10);

    ctx.fillStyle = '#000000';
    ctx.textAlign = 'left';
    ctx.font = '18px Arial bold';
    ctx.fillText('↑ N', 20, 30);
  };


  useEffect(() => {
    if (canvasRef.current) {
      drawPlot(canvasRef.current);
    }
  }, [formData, builtUpRows]);

  useEffect(() => {
    if (showPreview && previewCanvasRef.current) {
      drawPlot(previewCanvasRef.current);
    }
  }, [showPreview, formData, builtUpRows]);

  const openPreview = () => {
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
  };

  const handlePrint = () => {
    window.print();
  };

  // File upload handlers
  const handleFileChange = (category, file, index = null) => {
    if (!file) return;

    const fileId = Math.random().toString(36).substr(2, 9);
    const previewKey = index !== null ? `${category}_${index}` : `${category}_${fileId}`;
    let previewUrl = null;

    if (file.type.startsWith('image/')) {
      previewUrl = URL.createObjectURL(file);
      setPreviewImages(prev => ({
        ...prev,
        [previewKey]: previewUrl
      }));
    }

    setUploadedFiles(prev => ({
      ...prev,
      [category]: [...prev[category], {
        id: fileId,
        file,
        name: file.name,
        preview: previewUrl
      }]
    }));
  };

  const removeFile = (category, fileId) => {
    const fileToRemove = uploadedFiles[category].find(f => f.id === fileId);
    if (fileToRemove && fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    setUploadedFiles(prev => ({
      ...prev,
      [category]: prev[category].filter(f => f.id !== fileId)
    }));
    const previewKey = `${category}_${fileId}`;
    setPreviewImages(prev => {
      const newPrev = { ...prev };
      delete newPrev[previewKey];
      return newPrev;
    });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        builtUpRows,
        calculatedData: {
          areaSqFeet,
          areaSqMeters,
          areaSqYards,
          builtUpResult: calculateBuiltUpArea()
        }
      };

      // Create FormData for file uploads
      const formDataToSend = new FormData();
      
      // Add JSON payload
      formDataToSend.append('data', JSON.stringify(payload));
      
      // Add property photos
      uploadedFiles.propertyPhotos.forEach((photo) => {
        formDataToSend.append('propertyPhotos', photo.file);
      });
      
      // Add map images
      uploadedFiles.mapImages.forEach((image) => {
        formDataToSend.append('mapImages', image.file);
      });
      
      // Add property documents
      uploadedFiles.propertyDocuments.forEach((doc) => {
        formDataToSend.append('propertyDocuments', doc.file);
      });

      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(`${API_BASE}/api/staff/2/map-module/submit`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders()
          // Don't set Content-Type, let browser set it with boundary for FormData
        },
        body: formDataToSend
      });

      if (response.ok) {
        const data = await response.json();
        alert('Map Module submitted successfully.');
        setShowPreview(false);
        // Reset form
        setFormData({
          propertyType: '',
          propertySubType: '',
          propertyAddress: '',
          vicinityRadius: '',
          plotLength: '',
          plotWidth: '',
          unitLength: 'feet',
          unitWidth: 'feet',
          entryDirection: 'North',
          builtUpUnit: 'feet',
          neighbourNorthType: '',
          neighbourNorthOther: '',
          roadNorth: '',
          neighbourSouthType: '',
          neighbourSouthOther: '',
          roadSouth: '',
          neighbourEastType: '',
          neighbourEastOther: '',
          roadEast: '',
          neighbourWestType: '',
          neighbourWestOther: '',
          roadWest: ''
        });
        setBuiltUpRows([]);
        setRowCounter(0);
        // Reset uploaded files
        [...uploadedFiles.propertyPhotos, ...uploadedFiles.mapImages, ...uploadedFiles.propertyDocuments].forEach(file => {
          if (file.preview) URL.revokeObjectURL(file.preview);
        });
        Object.values(previewImages).forEach(url => {
          if (url) URL.revokeObjectURL(url);
        });
        setUploadedFiles({
          propertyPhotos: [],
          mapImages: [],
          propertyDocuments: []
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

  const lengthFeet = toFeet(parseFloat(formData.plotLength) || 0, formData.unitLength);
  const widthFeet = toFeet(parseFloat(formData.plotWidth) || 0, formData.unitWidth);
  const areaSqFeet = lengthFeet * widthFeet;
  const areaSqMeters = areaSqFeet * SQ_FEET_TO_SQ_METER;
  const areaSqYards = areaSqFeet / 9;
  const builtUpResult = calculateBuiltUpArea();
  const isBuilt = isBuiltUpVisible() && builtUpResult.dimensions.length > 0;
  const vicinityRadius = parseFloat(formData.vicinityRadius) || 0;
  const radiusValue = vicinityRadius > 0 ? Math.sqrt(vicinityRadius / Math.PI).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border-2 border-blue-500 p-6">
          <h1 className="text-2xl font-bold text-blue-600 text-center mb-6 border-b-2 border-blue-500 pb-2">
            संपत्ति का विस्तृत नक़्शा और बिल्ट-अप रिपोर्ट
          </h1>

          <div className="flex flex-wrap gap-6">
            {/* Input Form */}
            <div className="flex-1 min-w-[350px] pr-4 border-r border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-yellow-400 pb-2">
                प्रॉपर्टी विवरण
              </h2>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  प्रॉपर्टी का प्रकार (Property Type):
                </label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={(e) => {
                    handleChange(e);
                    setFormData(prev => ({ ...prev, propertySubType: '' }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="Residential">आवासीय (Residential)</option>
                  <option value="Commercial">व्यावसायिक (Commercial)</option>
                  <option value="Industrial">औद्योगिक (Industrial)</option>
                  <option value="Agriculture">कृषि (Agriculture)</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  प्रॉपर्टी उप-प्रकार (Sub-Type):
                </label>
                <select
                  name="propertySubType"
                  value={formData.propertySubType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">-- चुनें --</option>
                  {propertyTypes[formData.propertyType]?.map(subType => (
                    <option key={subType} value={subType}>{subType}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  प्रॉपर्टी का पता (Address):
                </label>
                <input
                  type="text"
                  name="propertyAddress"
                  value={formData.propertyAddress}
                  onChange={handleChange}
                  placeholder="गाँव/शहर, खसरा नंबर आदि"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>

              {/* Property Photos Upload */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Property Photos
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    Array.from(e.target.files).forEach(file => {
                      handleFileChange('propertyPhotos', file);
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                {uploadedFiles.propertyPhotos.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {uploadedFiles.propertyPhotos.map((photo) => (
                      <div key={photo.id} className="relative">
                        <div className="w-full h-24 border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                          {photo.preview ? (
                            <img
                              src={photo.preview}
                              alt={photo.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                              {photo.name}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile('propertyPhotos', photo.id)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Map/Diagram Images Upload */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Map/Diagram Images
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    Array.from(e.target.files).forEach(file => {
                      handleFileChange('mapImages', file);
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                {uploadedFiles.mapImages.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {uploadedFiles.mapImages.map((image) => (
                      <div key={image.id} className="relative">
                        <div className="w-full h-24 border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                          {image.preview ? (
                            <img
                              src={image.preview}
                              alt={image.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                              {image.name}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile('mapImages', image.id)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Property Documents Upload */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Property Documents (PDF/Images)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  onChange={(e) => {
                    Array.from(e.target.files).forEach(file => {
                      handleFileChange('propertyDocuments', file);
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                {uploadedFiles.propertyDocuments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {uploadedFiles.propertyDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                        <span className="text-xs text-gray-700">{doc.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile('propertyDocuments', doc.id)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Vicinity Radius (त्रिज्या) Sq. Mtr. में:
                </label>
                <input
                  type="number"
                  name="vicinityRadius"
                  value={formData.vicinityRadius}
                  onChange={handleChange}
                  placeholder="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>

              <hr className="my-4" />

              <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-yellow-400 pb-2">
                प्लॉट के आयाम (Total Plot Size)
              </h2>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  प्लॉट की लंबाई (Length - N/S):
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="plotLength"
                    value={formData.plotLength}
                    onChange={handleChange}
                    placeholder="50"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <select
                    name="unitLength"
                    value={formData.unitLength}
                    onChange={handleChange}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="feet">Feet</option>
                    <option value="yards">Yards</option>
                    <option value="meters">Meters</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  प्लॉट की चौड़ाई (Width - E/W):
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="plotWidth"
                    value={formData.plotWidth}
                    onChange={handleChange}
                    placeholder="30"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <select
                    name="unitWidth"
                    value={formData.unitWidth}
                    onChange={handleChange}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="feet">Feet</option>
                    <option value="yards">Yards</option>
                    <option value="meters">Meters</option>
                  </select>
                </div>
              </div>

              <hr className="my-4" />

              {isBuiltUpVisible() && (
                <>
                  <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-yellow-400 pb-2">
                    बिल्ट-अप डिटेल्स (Built-up Area Details)
                  </h2>

                  <div className="mb-4">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      एंट्री दिशा (House Entry Direction):
                    </label>
                    <select
                      name="entryDirection"
                      value={formData.entryDirection}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="North">North (उत्तर)</option>
                      <option value="South">South (दक्षिण)</option>
                      <option value="East">East (पूर्व)</option>
                      <option value="West">West (पश्चिम)</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      आयाम की यूनिट (Unit):
                    </label>
                    <select
                      name="builtUpUnit"
                      value={formData.builtUpUnit}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="feet">Feet</option>
                      <option value="yards">Yards</option>
                      <option value="meters">Meters</option>
                    </select>
                  </div>

                  <div className="mb-4 space-y-2">
                    {builtUpRows.map((row) => {
                      const label = getLabel(row.id, row.type);
                      const option = builtUpOptions.find(opt => opt.id === row.type);
                      return (
                        <div key={row.id} className="flex gap-2 items-center border-l-2 border-gray-300 pl-2">
                          <select
                            value={row.type}
                            onChange={(e) => updateBuiltUpRow(row.id, 'type', e.target.value)}
                            className="w-28 px-2 py-1 border border-gray-300 rounded text-xs"
                          >
                            {builtUpOptions.map(opt => (
                              <option key={opt.id} value={opt.id}>{opt.label}</option>
                            ))}
                          </select>
                          <label className="w-12 text-xs text-center">{label}:</label>
                          <input
                            type="number"
                            value={row.l}
                            onChange={(e) => updateBuiltUpRow(row.id, 'l', e.target.value)}
                            placeholder="लंबाई (L)"
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-xs"
                          />
                          <input
                            type="number"
                            value={row.w}
                            onChange={(e) => updateBuiltUpRow(row.id, 'w', e.target.value)}
                            placeholder="चौड़ाई (W)"
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-xs"
                          />
                          <button
                            onClick={() => removeBuiltUpRow(row.id)}
                            className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={addBuiltUpRow}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                  >
                    + Add More Room/Area
                  </button>

                  <hr className="my-4" />
                </>
              )}

              <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-yellow-400 pb-2">
                पड़ोसी विवरण
              </h2>
              <p className="text-xs text-gray-600 mb-4">(रोड साइज़ केवल Feet में दर्ज करें)</p>

              {['North', 'South', 'East', 'West'].map(direction => (
                <div key={direction} className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {direction === 'North' ? 'उत्तर' : direction === 'South' ? 'दक्षिण' : direction === 'East' ? 'पूर्व' : 'पश्चिम'} दिशा में:
                  </label>
                  <div className="flex gap-2 items-center">
                    <select
                      name={`neighbour${direction}Type`}
                      value={formData[`neighbour${direction}Type`]}
                      onChange={handleChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="Road">Road</option>
                      <option value="Plot">Plot (पड़ोसी)</option>
                      <option value="Others">Others</option>
                    </select>
                    {formData[`neighbour${direction}Type`] === 'Others' && (
                      <input
                        type="text"
                        name={`neighbour${direction}Other`}
                        value={formData[`neighbour${direction}Other`]}
                        onChange={handleChange}
                        placeholder="Others का नाम"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    )}
                    {formData[`neighbour${direction}Type`] === 'Road' && (
                      <input
                        type="number"
                        name={`road${direction}`}
                        value={formData[`road${direction}`]}
                        onChange={handleChange}
                        placeholder="Road Size (ft)"
                        className="w-28 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    )}
                  </div>
                </div>
              ))}

              <button
                onClick={openPreview}
                className="w-full mt-6 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold"
              >
                प्रीव्यू (Preview) & कैलकुलेट
              </button>
            </div>

            {/* Diagram Area */}
            <div className="flex-1 min-w-[500px] text-center">
              <canvas
                ref={canvasRef}
                width={500}
                height={500}
                className="border border-gray-300 mx-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preview Overlay */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-gray-100 overflow-y-auto p-5 print:static print:inset-0 print:bg-white">
          <div className="max-w-4xl mx-auto bg-white p-6 border border-gray-300 shadow-lg print:shadow-none print:border-0">
            <div className="flex justify-between items-center mb-4 print:hidden">
              <h1 className="text-xl font-bold text-gray-900">संपत्ति का विस्तृत नक़्शा और बिल्ट-अप रिपोर्ट (PREVIEW)</h1>
              <div className="flex gap-2">
                <button
                  onClick={closePreview}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Close Preview
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Print Report 🖨️
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 mb-6">
              <div className="flex-1 min-w-[300px]">
                <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                  प्रॉपर्टी सारांश
                </h2>
                <div className="mb-4 text-center">
                  <p className="font-bold text-blue-600">{formData.propertyAddress || 'पता दर्ज करें'}</p>
                </div>

                <div className="mb-4 border border-gray-300 p-4">
                  <p className="text-lg font-bold text-blue-600 text-center border-b border-gray-300 pb-2 mb-2">
                    कुल प्लॉट एरिया (Total Plot Area):
                  </p>
                  <div className="flex justify-around text-sm">
                    <p><strong>{areaSqMeters.toFixed(3)}</strong> Sq. Meter</p>
                    <p><strong>{areaSqFeet.toFixed(3)}</strong> Sq. Feet</p>
                    <p><strong>{areaSqYards.toFixed(3)}</strong> Sq. Yards</p>
                  </div>
                </div>

                {isBuilt && (
                  <div className="mb-4 border border-gray-300 p-4">
                    <p className="text-lg font-bold text-gray-800 text-center border-b border-gray-300 pb-2 mb-2">
                      बिल्ट-अप एरिया (Built-up Area):
                    </p>
                    <ul className="list-none p-0 text-sm space-y-1">
                      {builtUpResult.dimensions.map((dim, idx) => (
                        <li key={idx}>
                          <span style={{ color: dim.color }}>{dim.label}: </span>
                          {dim.l.toFixed(1)} x {dim.w.toFixed(1)} {dim.unit} = {dim.area.toFixed(2)} Sq. Ft.
                        </li>
                      ))}
                    </ul>
                    <p className="text-center mt-4">
                      <strong>Total: {builtUpResult.totalSqMeters.toFixed(3)} Sq. Meter | </strong>
                      <strong>{builtUpResult.totalSqFeet.toFixed(3)} Sq. Feet</strong>
                    </p>
                  </div>
                )}
              </div>

              <div className="flex-1.5 min-w-[400px] text-center">
                <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                  प्लॉट का नक़्शा (Design)
                </h2>
                <div className="relative inline-block">
                  <canvas
                    ref={previewCanvasRef}
                    width={500}
                    height={500}
                    className="border border-gray-300"
                  />
                  <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    <div className="absolute top-16 left-1/2 transform -translate-x-1/2 text-sm font-bold">
                      <strong>N:</strong> {getNeighbourData('North')} ({formData.plotLength} {formData.unitLength})
                    </div>
                    <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 text-sm font-bold">
                      <strong>S:</strong> {getNeighbourData('South')} ({formData.plotLength} {formData.unitLength})
                    </div>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-[-90deg] text-sm font-bold">
                      <strong>E:</strong> {getNeighbourData('East')} ({formData.plotWidth} {formData.unitWidth})
                    </div>
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 rotate-90 text-sm font-bold">
                      <strong>W:</strong> {getNeighbourData('West')} ({formData.plotWidth} {formData.unitWidth})
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-dashed border-gray-400 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">नक़्शे का त्रिज्या और स्थान</h3>
              <div className="flex justify-around items-center flex-wrap">
                <div className="w-full md:w-1/2 text-sm mb-4 md:mb-0">
                  <p className="font-bold mb-2">
                    यह प्लॉट लगभग <span>{vicinityRadius}</span> Sq. Meter के व्यास (Vicinity) में:
                  </p>
                  <ul className="list-none p-0 space-y-1 border-b border-dotted border-gray-300">
                    <li className="pb-1 border-b border-dotted border-gray-300">
                      <strong>North:</strong> {formData.neighbourNorthType === 'Road' 
                        ? `Road (${formData.roadNorth} ft)` 
                        : formData.neighbourNorthType === 'Others' 
                          ? formData.neighbourNorthOther 
                          : 'PLOT (Padosi)'}
                    </li>
                    <li className="pb-1 border-b border-dotted border-gray-300">
                      <strong>South:</strong> {formData.neighbourSouthType === 'Road' 
                        ? `Road (${formData.roadSouth} ft)` 
                        : formData.neighbourSouthType === 'Others' 
                          ? formData.neighbourSouthOther 
                          : 'PLOT (Padosi)'}
                    </li>
                    <li className="pb-1 border-b border-dotted border-gray-300">
                      <strong>East:</strong> {formData.neighbourEastType === 'Road' 
                        ? `Road (${formData.roadEast} ft)` 
                        : formData.neighbourEastType === 'Others' 
                          ? formData.neighbourEastOther 
                          : 'PLOT (Padosi)'}
                    </li>
                    <li>
                      <strong>West:</strong> {formData.neighbourWestType === 'Road' 
                        ? `Road (${formData.roadWest} ft)` 
                        : formData.neighbourWestType === 'Others' 
                          ? formData.neighbourWestOther 
                          : 'PLOT (Padosi)'}
                    </li>
                  </ul>
                  <p className="mt-4"><strong>**प्रॉपर्टी टाइप:**</strong> {formData.propertyType}</p>
                  <p><strong>**उप-प्रकार:**</strong> {formData.propertySubType}</p>
                </div>
                <div className="w-full md:w-1/2 flex justify-center">
                  <div className="relative w-64 h-64 rounded-full border-2 border-blue-600 bg-gray-50 shadow-md">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -mt-6 text-xs font-bold text-blue-600">
                      {vicinityRadius} Sq. Mtr. Vicinity
                    </div>
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 rotate-[-90deg] text-xs font-bold text-gray-800">
                      Radius: {radiusValue} Mtr.
                    </div>
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 rotate-90 text-xs font-bold text-gray-800">
                      Radius: {radiusValue} Mtr.
                    </div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-blue-600 border border-white"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white">
                      PLOT
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-300 pt-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4">हस्ताक्षर (Signatures)</h3>
              <div className="flex justify-around mt-5">
                <div className="w-[45%] text-center">
                  <div className="h-px bg-black mt-12"></div>
                  <p className="mt-2">First Party Sign (प्रथम पक्ष के हस्ताक्षर)</p>
                </div>
                <div className="w-[45%] text-center">
                  <div className="h-px bg-black mt-12"></div>
                  <p className="mt-2">Second Party Sign (द्वितीय पक्ष के हस्ताक्षर)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyMapModule;

