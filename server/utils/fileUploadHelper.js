import { uploadFile } from './cloudinaryUpload.js';
import logger from '../config/logger.js';

/**
 * Helper function to upload a single file to Cloudinary and return file metadata
 * @param {Object} file - Multer file object (from memory storage)
 * @param {String} folder - Cloudinary folder path
 * @returns {Object|null} - File metadata with Cloudinary URL or null if upload fails
 */
export const processFileUpload = async (file, folder = null) => {
  if (!file) return null;
  
  try {
    const baseFolder = process.env.CLOUDINARY_ASSET_FOLDER || 'Cloudinary_joyh';
    const uploadFolder = folder ? `${baseFolder}/${folder}` : baseFolder;
    
    const cloudinaryResult = await uploadFile(file, uploadFolder);
    
    return {
      filename: cloudinaryResult.filename,
      contentType: cloudinaryResult.contentType,
      size: cloudinaryResult.size,
      path: cloudinaryResult.cloudinaryUrl, // Cloudinary URL
      publicId: cloudinaryResult.publicId, // Store public_id for future deletion
      cloudinaryUrl: cloudinaryResult.cloudinaryUrl
    };
  } catch (error) {
    logger.error('Error uploading file to Cloudinary', {
      error: error.message,
      filename: file?.originalname
    });
    return null;
  }
};

/**
 * Helper function to process multiple files from req.files object
 * @param {Object} files - Multer files object (from req.files)
 * @param {String} baseFolder - Base folder name for Cloudinary
 * @returns {Array} - Array of processed file objects
 */
export const processMultipleFiles = async (files, baseFolder = null) => {
  if (!files || files.length === 0) return [];
  
  try {
    const folder = baseFolder || process.env.CLOUDINARY_ASSET_FOLDER || 'Cloudinary_joyh';
    const uploadPromises = files.map(file => processFileUpload(file, folder));
    const results = await Promise.all(uploadPromises);
    return results.filter(result => result !== null);
  } catch (error) {
    logger.error('Error processing multiple files', {
      error: error.message,
      fileCount: files.length
    });
    return [];
  }
};

/**
 * Helper function to process files from req.files object (fields format)
 * @param {Object} filesObject - Multer files object with field names as keys
 * @param {String} baseFolder - Base folder name for Cloudinary
 * @returns {Array} - Array of processed file objects with field names
 */
export const processFilesByFields = async (filesObject, baseFolder = null) => {
  if (!filesObject) return [];
  
  const folder = baseFolder || process.env.CLOUDINARY_ASSET_FOLDER || 'Cloudinary_joyh';
  const files = [];
  
  try {
    for (const [fieldName, fileArray] of Object.entries(filesObject)) {
      if (Array.isArray(fileArray)) {
        for (const file of fileArray) {
          const processedFile = await processFileUpload(file, `${folder}/${fieldName}`);
          if (processedFile) {
            files.push({
              field: fieldName,
              ...processedFile
            });
          }
        }
      } else if (fileArray) {
        const processedFile = await processFileUpload(fileArray, `${folder}/${fieldName}`);
        if (processedFile) {
          files.push({
            field: fieldName,
            ...processedFile
          });
        }
      }
    }
  } catch (error) {
    logger.error('Error processing files by fields', {
      error: error.message
    });
  }
  
  return files;
};

/**
 * Helper function to find and process a specific file by fieldname
 * @param {Array} filesArray - Array of multer file objects
 * @param {String} fieldname - Field name to search for
 * @param {String} folder - Cloudinary folder path
 * @returns {Object|null} - Processed file object or null
 */
export const findAndProcessFile = async (filesArray, fieldname, folder = null) => {
  if (!filesArray || filesArray.length === 0) return null;
  
  const file = filesArray.find(f => f.fieldname === fieldname);
  if (!file) return null;
  
  return await processFileUpload(file, folder);
};

