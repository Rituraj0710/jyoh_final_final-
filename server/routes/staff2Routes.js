import express from 'express';
import Staff2Controller from '../controllers/staff2Controller.js';
import { authenticateToken } from '../middlewares/roleBasedAuth.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';
import { authLimiter } from '../config/rateLimits.js';
import multer from 'multer';
import path from 'path';

// Multer setup for file uploads - using memory storage for Cloudinary
const storage = multer.memoryStorage();

const upload = multer({ 
  storage, 
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 50 // Maximum 50 files
  },
  fileFilter: (req, file, cb) => {
    // Allow common document and image formats
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
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

// Apply authentication and role authorization to all routes
router.use(authenticateToken);
router.use(authorizeRoles('staff2', 'admin'));

// Dashboard routes
router.get('/dashboard-stats', authLimiter, Staff2Controller.getDashboardStats);

// Forms routes
router.get('/forms', authLimiter, Staff2Controller.getForms);
router.get('/forms/:id', authLimiter, Staff2Controller.getFormById);
router.put('/forms/:id/verify', authLimiter, Staff2Controller.verifyForm);
router.put('/forms/:id/update', authLimiter, Staff2Controller.updateForm);

// Work report routes
router.get('/work-data', authLimiter, Staff2Controller.getWorkData);
router.post('/reports', authLimiter, Staff2Controller.submitWorkReport);
router.get('/reports', authLimiter, Staff2Controller.getWorkReports);

// E-Stamp and Map Module routes
router.post('/e-stamp/submit', authLimiter, upload.any(), Staff2Controller.submitEStamp);
router.post('/map-module/submit', authLimiter, upload.any(), Staff2Controller.submitMapModule);
router.get('/pending-final-approval', authLimiter, Staff2Controller.getPendingFinalApproval);
router.put('/forms/:id/mark-final-done', authLimiter, Staff2Controller.markAsFinalDone);

export default router;