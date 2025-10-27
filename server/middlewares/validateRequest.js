import { validationResult } from 'express-validator';
import logger from '../config/logger.js';

// Middleware to handle validation errors
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const validationErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    logger.warn('Validation failed', {
      url: req.url,
      method: req.method,
      userId: req.user?.id,
      errors: validationErrors,
      ip: req.ip
    });

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      error_code: 'VALIDATION_ERROR',
      errors: validationErrors
    });
  }

  next();
};

// Provide a default export for backwards compatibility
export default validateRequest;