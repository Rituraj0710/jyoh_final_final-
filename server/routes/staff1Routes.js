import express from 'express';
import multer from 'multer';
import path from 'path';
import Staff1Controller from '../controllers/staff1Controller.js';
import { authenticateToken, authorizeStaff1 } from '../middlewares/roleBasedAuth.js';
import { authLimiter } from '../config/rateLimits.js';

// Configure multer for file uploads - using memory storage for Cloudinary
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 50 // Maximum 50 files
  },
  fileFilter: (req, file, cb) => {
    // Allow common document and image formats
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|zip/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and documents are allowed'));
    }
  }
});

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(authorizeStaff1);

// Forms management routes
router.get('/forms', Staff1Controller.getFormsForReview);
router.get('/forms/:id', Staff1Controller.getFormById);
router.put('/forms/:id/correct', Staff1Controller.correctForm);
router.put('/forms/:id/verify', Staff1Controller.verifyForm);

// Form submission on behalf of users (for offline users)
router.post('/forms/submit', 
  authLimiter,
  upload.any(), // Handle file uploads
  Staff1Controller.submitFormOnBehalf
);

// Stamp calculation routes
router.post('/forms/:id/calculate-stamp', Staff1Controller.calculateStampDuty);

// Work reports routes
router.post('/reports', Staff1Controller.submitWorkReport);
router.get('/reports', Staff1Controller.getWorkReports);

// Dashboard routes
router.get('/dashboard/stats', Staff1Controller.getDashboardStats);

export default router;