import express from 'express';
import passport from 'passport';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import FormsDataController from '../controllers/formsDataController.js';
import accessTokenAutoRefresh from '../middlewares/accessTokenAutoRefresh.js';
import setAuthHeader from '../middlewares/setAuthHeader.js';
import { authorize } from '../middlewares/rbac.js';
import { 
  canAccessFormsData, 
  canViewForm, 
  canEditForm, 
  canVerifyForm, 
  canApproveForm, 
  canAssignForm, 
  filterFormsByRole, 
  canLockForm 
} from '../middlewares/formsRbac.js';
import { authLimiter } from '../config/rateLimits.js';

// Create upload directory for forms data
const uploadRoot = path.join(process.cwd(), 'uploads', 'forms-data');
fs.mkdirSync(uploadRoot, { recursive: true });

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadRoot),
  filename: (req, file, cb) => {
    const ts = Date.now();
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${ts}_${safe}`);
  }
});

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

// Public health check
router.get('/health', (req, res) => {
  res.json({ status: 'success', message: 'Forms service is running' });
});

// All other routes require authentication and forms access
router.use(setAuthHeader, accessTokenAutoRefresh, passport.authenticate('userOrStaff', { session: false }), canAccessFormsData);

// User/Agent routes - can save and submit their own forms
router.post('/save', 
  authLimiter,
  upload.any(), // Handle file uploads
  FormsDataController.saveForm
);

router.post('/submit', 
  authLimiter,
  upload.any(), // Handle file uploads
  FormsDataController.submitForm
);

router.get('/user-forms', 
  FormsDataController.getUserForms
);

router.get('/', 
  FormsDataController.getFormsByUserOrAgent
);

router.get('/stats', 
  FormsDataController.getFormStats
);

// Payment and calculation routes
router.post('/calculations', 
  authLimiter,
  FormsDataController.submitCalculations
);

router.put('/payment-status', 
  authLimiter,
  FormsDataController.updatePaymentStatus
);

router.post('/verify-payment', 
  authLimiter,
  authorize(['admin', 'staff1', 'staff2', 'staff3', 'staff4', 'staff5']),
  FormsDataController.verifyPayment
);

// Admin/Staff routes - full CRUD access with role-based filtering
router.get('/admin/forms', 
  authorize(['admin', 'staff1', 'staff2', 'staff3', 'staff4', 'staff5']),
  filterFormsByRole,
  FormsDataController.getAdminForms
);

router.get('/:id', 
  canViewForm,
  FormsDataController.getFormById
);

router.put('/:id', 
  authorize(['admin', 'staff1', 'staff2', 'staff3', 'staff4', 'staff5']),
  canViewForm,
  canEditForm,
  authLimiter,
  FormsDataController.updateForm
);

router.delete('/:id', 
  authorize(['admin']),
  canViewForm,
  FormsDataController.deleteForm
);

// Staff assignment and verification routes
router.post('/admin/forms/:id/assign', 
  authorize(['admin']),
  canAssignForm,
  authLimiter,
  FormsDataController.assignFormToStaff
);

router.post('/forms/:id/verify', 
  authorize(['staff1', 'staff2', 'staff3', 'staff4', 'staff5']),
  canViewForm,
  canVerifyForm,
  authLimiter,
  FormsDataController.verifyForm
);

router.post('/admin/forms/:id/approve', 
  authorize(['admin']),
  canViewForm,
  canApproveForm,
  authLimiter,
  FormsDataController.approveForm
);

// Staff routes - get assigned forms with role-based filtering
router.get('/staff/forms', 
  authorize(['staff1', 'staff2', 'staff3', 'staff4', 'staff5']),
  filterFormsByRole,
  FormsDataController.getStaffForms
);

export default router;
