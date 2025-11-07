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
    else if (originalUrl.includes('/property-sale-certificate')) serviceType = 'property-sale-certificate';
    else return; // Skip if not a recognized form type
    
    // Get form ID from response
    const formId = responseData.data?.id || responseData.data?._id || responseData.id || responseData._id;
    if (!formId) {
      logger.info('No formId found in response, skipping FormsData sync', { responseData });
      return;
    }
    
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
    
    // Fetch the actual form document from its dedicated collection to get complete data
    let formData = {};
    try {
      const modelMap = {
        'will-deed': (await import('../models/WillDeed.js')).default,
        'sale-deed': (await import('../models/SaleDeed.js')).default,
        'trust-deed': (await import('../models/TrustDeed.js')).default,
        'power-of-attorney': (await import('../models/PowerOfAttorney.js')).default,
        'adoption-deed': (await import('../models/AdoptionDeed.js')).default,
        'property-registration': (await import('../models/PropertyRegistration.js')).default,
        'property-sale-certificate': (await import('../models/PropertySaleCertificate.js')).default
      };
      
      const Model = modelMap[serviceType];
      if (Model) {
        const formDoc = await Model.findById(formId);
        if (formDoc) {
          // Convert Mongoose document to plain object and exclude internal fields
          const formObj = formDoc.toObject();
          // Remove MongoDB internal fields
          delete formObj._id;
          delete formObj.__v;
          delete formObj.createdAt;
          delete formObj.updatedAt;
          formData = formObj;
          logger.info(`Fetched form data from ${serviceType} collection for FormsData sync`);
        }
      }
    } catch (fetchError) {
      logger.warn(`Error fetching form data from ${serviceType} collection:`, fetchError);
      // Continue with empty formData - will use rawFormData instead
    }
    
    // Create new FormsData entry
    const formsDataEntry = new FormsData({
      formId: formId,
      serviceType: serviceType,
      userId: user?.id || user?._id,
      status: 'submitted',
      // Store actual form data in the 'data' field for easy access
      data: Object.keys(formData).length > 0 ? formData : (body && typeof body === 'object' && !Array.isArray(body) ? body : {}),
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
    
    logger.info(`Successfully synced form ${formId} (${serviceType}) to FormsData collection with ${Object.keys(formData).length} data fields`);
  } catch (error) {
    logger.error('Error in syncFormToFormsData:', error);
  }
}

export default { syncToFormsData };
