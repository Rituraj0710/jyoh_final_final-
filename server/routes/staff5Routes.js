import express from 'express';
import Staff5Controller from '../controllers/staff5Controller.js';
import { authenticateToken } from '../middlewares/roleBasedAuth.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';
import { authLimiter } from '../config/rateLimits.js';

const router = express.Router();

// Apply authentication and role authorization to all routes
router.use(authenticateToken);
router.use(authorizeRoles('staff5', 'admin'));

// Dashboard routes
router.get('/dashboard-stats', authLimiter, Staff5Controller.getDashboardStats);

// Forms routes
router.get('/forms', authLimiter, Staff5Controller.getForms);
router.get('/forms/:id', authLimiter, Staff5Controller.getFormById);
router.put('/forms/:id/final-approval', authLimiter, Staff5Controller.finalApproval);

// Final reports routes
router.get('/final-reports', authLimiter, Staff5Controller.getFinalReports);
router.post('/generate-final-report/:formId', authLimiter, Staff5Controller.generateFinalReportPDF);

// Certificate generation routes
router.get('/generate-certificate/:formId', authLimiter, Staff5Controller.generateCertificatePDF);

export default router;