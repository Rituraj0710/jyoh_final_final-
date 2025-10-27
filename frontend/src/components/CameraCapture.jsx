"use client";
import React, { useState, useRef, useCallback, useEffect } from 'react';

const CameraCapture = ({ 
  onCapture, 
  label = "Take Photo", 
  previewLabel = "Photo Preview",
  className = "",
  showPreview = true,
  aspectRatio = 4/3,
  width = 320,
  height = 240,
  compact = false
}) => {
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Ensure component only renders on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Conditionally import Webcam only on client side
  const [Webcam, setWebcam] = useState(null);
  
  useEffect(() => {
    if (isClient) {
      import('react-webcam').then((module) => {
        setWebcam(() => module.default);
      }).catch((error) => {
        console.error('Failed to load react-webcam:', error);
        setError('Camera component failed to load');
      });
    }
  }, [isClient]);

  const videoConstraints = {
    width: width,
    height: height,
    facingMode: "user"
  };

  const capture = useCallback(() => {
    if (webcamRef.current) {
      setIsCapturing(true);
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      
      // Convert to blob for better handling
      if (imageSrc) {
        fetch(imageSrc)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], `captured-photo-${Date.now()}.jpg`, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            onCapture(file, imageSrc);
          })
          .catch(err => {
            console.error('Error converting image to blob:', err);
            setError('Failed to process captured image');
          })
          .finally(() => {
            setIsCapturing(false);
          });
      }
    }
  }, [onCapture]);

  const retakePhoto = () => {
    setCapturedImage(null);
    setError(null);
  };

  const startCamera = () => {
    setIsCameraActive(true);
    setError(null);
  };

  const stopCamera = () => {
    setIsCameraActive(false);
  };

  const handleUserMediaError = (error) => {
    console.error('Camera error:', error);
    setError('Unable to access camera. Please check permissions and try again.');
    setIsCameraActive(false);
  };

  // Don't render on server side or if Webcam is not loaded
  if (!isClient || !Webcam) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex items-center gap-4">
          <div className="bg-gray-200 text-gray-500 px-4 py-2 rounded-md">
            {!isClient ? 'Loading camera component...' : 'Loading camera library...'}
          </div>
        </div>
      </div>
    );
  }

  // Compact mode - matches the image style
  if (compact) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex items-center gap-4">
          {/* Camera Button */}
          {!isCameraActive ? (
            <button
              type="button"
              onClick={startCamera}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              कैमरा
            </button>
          ) : (
            <button
              type="button"
              onClick={stopCamera}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Stop
            </button>
          )}

          {/* Compact Camera Feed */}
          {isCameraActive && (
            <div className="relative flex-1 max-w-xs">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  width: 200,
                  height: 150,
                  facingMode: "user"
                }}
                onUserMediaError={handleUserMediaError}
                className="rounded-md border border-gray-300 w-full h-32 object-cover"
              />
              
              {/* Capture Button Overlay */}
              <button
                type="button"
                onClick={capture}
                disabled={isCapturing}
                className="absolute bottom-2 right-2 bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors disabled:opacity-50 shadow-lg"
              >
                {isCapturing ? (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          )}

          {/* Captured Photo Preview */}
          {showPreview && capturedImage && (
            <div className="relative">
              <img
                src={capturedImage}
                alt="Captured"
                className="rounded-md border border-gray-300 w-24 h-32 object-cover"
              />
              <button
                type="button"
                onClick={retakePhoto}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-2 bg-red-50 border border-red-200 rounded-md p-2">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
      </div>
    );
  }

  // Full mode - original implementation
  return (
    <div className={`w-full ${className}`}>
      <div className="bg-white border border-gray-300 rounded-lg p-4">
        <div className="flex flex-col items-center space-y-4">
          {/* Camera Controls */}
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            {!isCameraActive ? (
              <button
                type="button"
                onClick={startCamera}
                className="w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Start Camera
              </button>
            ) : (
              <button
                type="button"
                onClick={stopCamera}
                className="w-full sm:w-auto bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Stop Camera
              </button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="w-full bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Camera Feed */}
          {isCameraActive && (
            <div className="w-full flex flex-col items-center space-y-4">
              <div className="relative">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  onUserMediaError={handleUserMediaError}
                  className="rounded-lg border border-gray-300 shadow-lg"
                  style={{
                    width: '100%',
                    maxWidth: `${width}px`,
                    height: 'auto',
                    aspectRatio: aspectRatio
                  }}
                />
                
                {/* Camera overlay frame */}
                <div className="absolute inset-0 border-2 border-white rounded-lg pointer-events-none">
                  <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-blue-500"></div>
                  <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-blue-500"></div>
                  <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-blue-500"></div>
                  <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-blue-500"></div>
                </div>
              </div>

              {/* Capture Button */}
              <button
                type="button"
                onClick={capture}
                disabled={isCapturing}
                className="bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
              >
                {isCapturing ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Capturing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {label}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Captured Photo Preview */}
          {showPreview && capturedImage && (
            <div className="w-full space-y-3">
              <h4 className="text-sm font-medium text-gray-700 text-center">
                {previewLabel}
              </h4>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative">
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="rounded-lg border border-gray-300 shadow-lg max-w-full h-auto"
                    style={{
                      maxWidth: `${width}px`,
                      aspectRatio: aspectRatio
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={retakePhoto}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Retake
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.download = `captured-photo-${Date.now()}.jpg`;
                      link.href = capturedImage;
                      link.click();
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;