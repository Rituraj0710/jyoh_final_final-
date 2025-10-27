"use client"

import React, { useState } from "react";

const FormInput = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  required = false,
  className = "",
  showValidation = true,
  ...props
}) => {
  const [touched, setTouched] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleBlur = (e) => {
    setTouched(true);
    setFocused(false);
    if (onBlur) {
      onBlur(e);
    }
  };

  const handleFocus = () => {
    setFocused(true);
  };

  const showError = showValidation && touched && error;
  const showSuccess = showValidation && touched && !error && value;

  const inputClasses = `
    w-full px-4 py-3 border rounded-lg transition-all duration-200
    ${focused 
      ? 'border-blue-500 ring-2 ring-blue-200' 
      : showError 
        ? 'border-red-500 ring-2 ring-red-200' 
        : showSuccess
          ? 'border-green-500 ring-2 ring-green-200'
          : 'border-gray-300'
    }
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    ${className}
  `;

  return (
    <div className="mb-4">
      <label 
        htmlFor={name} 
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        required={required}
        className={inputClasses}
        aria-describedby={showError ? `${name}-error` : undefined}
        aria-invalid={showError ? "true" : "false"}
        {...props}
      />
      
      {showError && (
        <p 
          id={`${name}-error`}
          className="text-red-500 text-sm mt-1 flex items-center"
          role="alert"
        >
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {showSuccess && (
        <p className="text-green-500 text-sm mt-1 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Looks good!
        </p>
      )}
    </div>
  );
};

export default FormInput;
