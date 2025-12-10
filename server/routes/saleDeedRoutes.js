import express from "express";
import multer from "multer";
import path from "path";
import passport from "passport";
import accessTokenAutoRefresh from "../middlewares/accessTokenAutoRefresh.js";
import setAuthHeader from "../middlewares/setAuthHeader.js";
import SaleDeedController from "../controllers/saleDeedController.js";
import { syncToFormsData } from "../middlewares/formSyncMiddleware.js";

const router = express.Router();

// Configure multer to use memory storage (files will be uploaded to Cloudinary)
// Using memory storage to get file buffers, then upload to Cloudinary in controller
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 50 // Maximum 50 files (to handle multiple sellers/buyers/witnesses with all document types)
  },
  fileFilter: (req, file, cb) => {
    // Allow common document and image formats
    // Note: Camera-captured photos are JPEG images (image/jpeg) and are handled here
    
    // Allowed MIME types (camera captures use image/jpeg)
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png', 
      'image/gif', 
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    // Allowed file extensions
    const allowedExtensions = /jpeg|jpg|png|gif|pdf|doc|docx$/;
    
    // Check MIME type first (most reliable, especially for camera captures)
    if (file.mimetype && allowedMimeTypes.includes(file.mimetype)) {
      return cb(null, true);
    }
    
    // Fallback: check file extension
    const extname = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (allowedExtensions.test(extname)) {
      return cb(null, true);
    }
    
    cb(new Error(`File type not allowed. Only images (JPEG, PNG, GIF) and documents (PDF, DOC, DOCX) are allowed. Received: ${file.mimetype || 'unknown'}`));
  }
});

// Apply optional authentication middleware to all routes
router.use((req, res, next) => {
  passport.authenticate('userOrAgent', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (user) {
      req.user = user;
    }
    next();
  })(req, res, next);
});
router.use(accessTokenAutoRefresh);
router.use(setAuthHeader);

// Error handling middleware for file upload errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum file size is 10MB.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 50 files allowed.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`
    });
  }
  if (err) {
    // Handle file type validation errors
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error occurred'
    });
  }
  next();
};

// Routes
router.post("/", syncToFormsData, upload.any(), handleMulterError, SaleDeedController.create);
router.get("/", SaleDeedController.getAll);
router.get("/stats", SaleDeedController.getStats);
router.get("/:id", SaleDeedController.getById);
router.put("/:id/status", SaleDeedController.updateStatus);
router.delete("/:id", SaleDeedController.delete);

export default router;