// Utility functions for consistent API responses

export const successResponse = (res, message, data = null, statusCode = 200) => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

export const errorResponse = (res, message, error = null, statusCode = 500) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };

  if (error && process.env.NODE_ENV === 'development') {
    response.error = error;
  }

  return res.status(statusCode).json(response);
};

export const validationErrorResponse = (res, errors, message = 'Validation failed') => {
  return res.status(400).json({
    success: false,
    message,
    error_code: 'VALIDATION_ERROR',
    errors,
    timestamp: new Date().toISOString()
  });
};

export const notFoundResponse = (res, resource = 'Resource') => {
  return res.status(404).json({
    success: false,
    message: `${resource} not found`,
    error_code: 'NOT_FOUND',
    timestamp: new Date().toISOString()
  });
};

export const unauthorizedResponse = (res, message = 'Unauthorized access') => {
  return res.status(401).json({
    success: false,
    message,
    error_code: 'UNAUTHORIZED',
    timestamp: new Date().toISOString()
  });
};

export const forbiddenResponse = (res, message = 'Access forbidden') => {
  return res.status(403).json({
    success: false,
    message,
    error_code: 'FORBIDDEN',
    timestamp: new Date().toISOString()
  });
};

// Backwards-compatible helper used across controllers that expect a plain
// response object (not directly sending via res). The project uses
// `generateResponse(success, message, data, error)` in several controllers.
export const generateResponse = (success, message, data = null, error = null) => {
  const response = {
    success: Boolean(success),
    message: message || '',
    timestamp: new Date().toISOString()
  };

  if (data !== null) response.data = data;
  if (error) response.error = error;

  return response;
};