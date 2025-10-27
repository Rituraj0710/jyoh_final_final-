"use client"

import React from "react";
import LoadingSpinner from "./LoadingSpinner";

const SubmitButton = ({
  loading = false,
  disabled = false,
  children,
  loadingText = "Processing...",
  className = "",
  variant = "primary",
  size = "md",
  ...props
}) => {
  const baseClasses = `
    w-full font-medium rounded-lg transition-all duration-200 
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:cursor-not-allowed disabled:opacity-60
    flex items-center justify-center space-x-2
  `;

  const variantClasses = {
    primary: `
      bg-blue-600 hover:bg-blue-700 text-white 
      focus:ring-blue-500 hover:-translate-y-0.5 hover:shadow-lg
    `,
    indigo: `
      bg-indigo-500 hover:bg-indigo-600 text-white 
      focus:ring-indigo-500 hover:-translate-y-0.5 hover:shadow-lg
    `,
    green: `
      bg-green-600 hover:bg-green-700 text-white 
      focus:ring-green-500 hover:-translate-y-0.5 hover:shadow-lg
    `,
    outline: `
      border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white 
      focus:ring-blue-500
    `
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `;

  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className={buttonClasses}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner size="sm" color="white" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default SubmitButton;
