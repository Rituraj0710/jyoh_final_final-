import FormsData from '../models/FormsData.js';
import logger from '../config/logger.js';

/**
 * Middleware to sync form submissions to FormsData collection
 * This ensures all forms are visible in Staff1 dashboard
 */
export const syncToFormsData = async (req, res, next) => {
  // Store original res.json to intercept successful responses
  const originalJson = res.json;
  
  res.json = function(data) {
    // Call original json method first
    const result = originalJson.call(this, data);
    
    // If this was a successful form submission, sync to FormsData
    if (res.statusCode >= 200 && res.statusCode < 300 && data && (data.status === 'success' || data.success)) {
      // Run sync in background to avoid blocking response
      setImmediate(async () => {
        try {
          await syncFormToFormsData(req, data);
        } catch (error) {
          logger.error('Error syncing form to FormsData:', error);
        }
      });
    }
    
    return result;
  };
  
  next();
};

/**
 * Sync form data to FormsData collection
 */
async function syncFormToFormsData(req, responseData) {
  try {
    // Extract form information from request and response
    const { body, user, originalUrl } = req;
    
    // Determine service type from URL
    let serviceType = '';
    if (originalUrl.includes('/will-deed')) serviceType = 'will-deed';
    else if (originalUrl.includes('/sale-deed')) serviceType = 'sale-deed';
    else if (originalUrl.includes('/trust-deed')) serviceType = 'trust-deed';
    else if (originalUrl.includes('/power-of-attorney')) serviceType = 'power-of-attorney';
    else if (originalUrl.includes('/adoption-deed')) serviceType = 'adoption-deed';
    else if (originalUrl.includes('/property-registration')) serviceType = 'property-registration';
    else return; // Skip if not a recognized form type
    
    // Get form ID from response
    const formId = responseData.data?.id || responseData.data?._id || responseData.id || responseData._id;
    if (!formId) return;
    
    // Check if already exists in FormsData
    const existingForm = await FormsData.findOne({
      $or: [
        { formId: formId },
        { 'fields.originalFormId': formId },
        { _id: formId }
      ]
    });
    
    if (existingForm) {
      logger.info(`Form ${formId} already exists in FormsData, skipping sync`);
      return;
    }
    
    // Create new FormsData entry
    const formsDataEntry = new FormsData({
      formId: formId,
      serviceType: serviceType,
      userId: user?.id || user?._id,
      status: 'submitted',
      fields: {
        // Processed form data for admin panel display
        formType: serviceType,
        submittedAt: new Date(),
        originalFormId: formId,
        syncedAt: new Date(),
        syncSource: 'form-submission'
      },
      rawFormData: {
        // Store raw form data for debugging and compatibility
        ...body,
        originalFormId: formId,
        syncedAt: new Date(),
        syncSource: 'form-submission'
      },
      formTitle: `${serviceType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Form`,
      formDescription: `Form submission for ${serviceType.replace('-', ' ')}`,
      submittedAt: new Date(),
      lastActivityBy: user?.id || user?._id,
      lastActivityAt: new Date(),
      progressPercentage: 100
    });
    
    await formsDataEntry.save();
    
    logger.info(`Successfully synced form ${formId} (${serviceType}) to FormsData collection`);
  } catch (error) {
    logger.error('Error in syncFormToFormsData:', error);
  }
}

export default { syncToFormsData };
