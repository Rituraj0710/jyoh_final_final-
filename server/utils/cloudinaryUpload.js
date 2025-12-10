import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import logger from '../config/logger.js';

/**
 * Upload a single file to Cloudinary
 * @param {Object} file - Multer file object
 * @param {String} folder - Cloudinary folder path
 * @param {Object} options - Additional upload options
 * @returns {Object} - File metadata with Cloudinary URL
 */
export const uploadFile = async (file, folder = null, options = {}) => {
  try {
    if (!file) {
      return null;
    }

    // Use asset folder from env if folder not specified
    const uploadFolder = folder || process.env.CLOUDINARY_ASSET_FOLDER || 'Cloudinary_joyh';
    const result = await uploadToCloudinary(file, uploadFolder, options);
    
    return {
      filename: result.original_filename || file.originalname,
      contentType: result.format || file.mimetype,
      size: result.bytes || file.size,
      path: result.secure_url, // Cloudinary secure URL
      publicId: result.public_id, // Store public_id for deletion
      cloudinaryUrl: result.secure_url,
      resourceType: result.resource_type
    };
  } catch (error) {
    logger.error('Cloudinary upload error', {
      error: error.message,
      filename: file?.originalname
    });
    throw error;
  }
};

/**
 * Upload multiple files to Cloudinary
 * @param {Array} files - Array of Multer file objects
 * @param {String} folder - Cloudinary folder path
 * @param {Object} options - Additional upload options
 * @returns {Array} - Array of file metadata with Cloudinary URLs
 */
export const uploadFiles = async (files, folder = null, options = {}) => {
  if (!files || files.length === 0) {
    return [];
  }

  try {
    const uploadPromises = files.map(file => uploadFile(file, folder, options));
    const results = await Promise.all(uploadPromises);
    return results.filter(result => result !== null);
  } catch (error) {
    logger.error('Cloudinary batch upload error', {
      error: error.message,
      fileCount: files.length
    });
    throw error;
  }
};

/**
 * Delete a file from Cloudinary
 * @param {String} publicId - Cloudinary public_id
 * @returns {Object} - Deletion result
 */
export const deleteFile = async (publicId) => {
  try {
    if (!publicId) {
      return null;
    }
    return await deleteFromCloudinary(publicId);
  } catch (error) {
    logger.error('Cloudinary delete error', {
      error: error.message,
      publicId
    });
    throw error;
  }
};

/**
 * Extract public_id from Cloudinary URL
 * @param {String} url - Cloudinary URL
 * @returns {String} - Public ID
 */
export const extractPublicId = (url) => {
  if (!url) return null;
  
  try {
    // Extract public_id from Cloudinary URL
    // Format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{transformations}/{public_id}.{format}
    const match = url.match(/\/upload\/[^\/]+\/(.+)\.(jpg|jpeg|png|gif|pdf|doc|docx)/i);
    if (match) {
      return match[1];
    }
    
    // Alternative: if URL contains public_id directly
    const publicIdMatch = url.match(/\/v\d+\/(.+)\.(jpg|jpeg|png|gif|pdf|doc|docx)/i);
    if (publicIdMatch) {
      return publicIdMatch[1];
    }
    
    return null;
  } catch (error) {
    logger.error('Error extracting public_id', { url, error: error.message });
    return null;
  }
};

