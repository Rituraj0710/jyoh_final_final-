/**
 * Environment validation utility
 * Ensures all required environment variables are present
 */

// Validate required environment variables
export const validateEnvironment = () => {
  const requiredVars = [
    'NEXT_PUBLIC_API_BASE'
  ];

  const missingVars = requiredVars.filter(varName => {
    const value = process.env[varName];
    return !value || value.trim() === '';
  });

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars);
    console.error('Please check your .env.local file or environment configuration');
    return false;
  }

  // Validate API base URL format
  const apiBase = process.env.NEXT_PUBLIC_API_BASE;
  try {
    new URL(apiBase);
  } catch (error) {
    console.error('❌ Invalid NEXT_PUBLIC_API_BASE URL format:', apiBase);
    return false;
  }

  console.log('✅ Environment variables validated successfully');
  return true;
};

// Get API base URL with fallback
export const getApiBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
};

// Check if running in development
export const isDevelopment = () => {
  return process.env.NODE_ENV === 'development';
};

// Check if running in production
export const isProduction = () => {
  return process.env.NODE_ENV === 'production';
};

// Get environment info for debugging
export const getEnvironmentInfo = () => {
  return {
    nodeEnv: process.env.NODE_ENV,
    apiBase: getApiBaseUrl(),
    isDev: isDevelopment(),
    isProd: isProduction(),
  };
};
