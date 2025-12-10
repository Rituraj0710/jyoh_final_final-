import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create Cloudinary storage for multer
export const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: process.env.CLOUDINARY_ASSET_FOLDER || 'Cloudinary_joyh', // Asset folder from env or default
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
    resource_type: 'auto', // Automatically detect resource type
    transformation: [
      {
        quality: 'auto',
        fetch_format: 'auto'
      }
    ]
  }
});

// Helper function to upload file to Cloudinary
export const uploadToCloudinary = async (file, folder = null, options = {}) => {
  try {
    // Use asset folder from env if folder not specified
    const uploadFolder = folder || process.env.CLOUDINARY_ASSET_FOLDER || 'Cloudinary_joyh';
    
    const uploadOptions = {
      folder: uploadFolder,
      resource_type: 'auto',
      ...options
    };

    // If file is a buffer (from multer memory storage)
    if (file.buffer) {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        uploadStream.end(file.buffer);
      });
    }
    
    // If file has a path (from disk storage)
    if (file.path) {
      const result = await cloudinary.uploader.upload(file.path, uploadOptions);
      return result;
    }

    throw new Error('Invalid file object. Must have either buffer or path.');
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

// Helper function to delete file from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Cloudinary delete failed: ${error.message}`);
  }
};

// Helper function to get Cloudinary URL
export const getCloudinaryUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    ...options
  });
};

export default cloudinary;

