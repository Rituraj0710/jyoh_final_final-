import FormsData from '../models/FormsData.js';
import logger from '../config/logger.js';

/**
 * Service type to 2-letter code mapping
 */
const SERVICE_TYPE_CODES = {
  'sale-deed': 'SD',
  'will-deed': 'WD',
  'trust-deed': 'TD',
  'property-registration': 'PR',
  'power-of-attorney': 'PO',
  'adoption-deed': 'AD',
  'property-sale-certificate': 'PS',
  'e-stamp': 'ES',
  'map-module': 'MM'
};

/**
 * Generate formatted form ID in format: YYYYMMDD + service code + sequential number
 * Example: 20251211SD001
 * 
 * @param {String} serviceType - The service type (e.g., 'sale-deed')
 * @param {Date} date - Optional date to use (defaults to today)
 * @returns {Promise<String>} - The formatted form ID
 */
export async function generateFormattedFormId(serviceType, date = null) {
  try {
    // Validate service type
    if (!SERVICE_TYPE_CODES[serviceType]) {
      throw new Error(`Invalid service type: ${serviceType}`);
    }

    // Get the 2-letter code for the service type
    const serviceCode = SERVICE_TYPE_CODES[serviceType];

    // Use provided date or current date
    const targetDate = date || new Date();
    
    // Format date as YYYYMMDD
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const datePrefix = `${year}${month}${day}`;

    // Find the highest sequential number for this service type on this date
    // Look for forms with formattedFormId matching the pattern: YYYYMMDD + serviceCode + number
    const pattern = new RegExp(`^${datePrefix}${serviceCode}(\\d{3})$`);
    
    const existingForms = await FormsData.find({
      formattedFormId: { $regex: pattern }
    }).select('formattedFormId').lean();

    // Extract the highest number
    let maxNumber = 0;
    existingForms.forEach(form => {
      if (form.formattedFormId) {
        const match = form.formattedFormId.match(pattern);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (num > maxNumber) {
            maxNumber = num;
          }
        }
      }
    });

    // Generate next sequential number (001, 002, 003, etc.)
    const nextNumber = maxNumber + 1;
    const sequentialNumber = String(nextNumber).padStart(3, '0');

    // Combine: YYYYMMDD + serviceCode + sequentialNumber
    const formattedFormId = `${datePrefix}${serviceCode}${sequentialNumber}`;

    logger.info(`Generated formatted form ID: ${formattedFormId} for service type: ${serviceType}`);
    
    return formattedFormId;
  } catch (error) {
    logger.error('Error generating formatted form ID:', error);
    throw error;
  }
}

/**
 * Get service code for a given service type
 * @param {String} serviceType - The service type
 * @returns {String} - The 2-letter service code
 */
export function getServiceCode(serviceType) {
  return SERVICE_TYPE_CODES[serviceType] || 'UN';
}

export default {
  generateFormattedFormId,
  getServiceCode
};

