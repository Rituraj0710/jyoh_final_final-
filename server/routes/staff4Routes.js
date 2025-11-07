import express from 'express';
import Staff4Controller from '../controllers/staff4Controller.js';
import { authenticateToken } from '../middlewares/roleBasedAuth.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';
import { authLimiter } from '../config/rateLimits.js';

const router = express.Router();

// Apply authentication and role authorization to all routes
router.use(authenticateToken);
router.use(authorizeRoles('staff4', 'admin'));

// Dashboard routes
router.get('/dashboard-stats', authLimiter, Staff4Controller.getDashboardStats);

// Forms routes
router.get('/forms', authLimiter, Staff4Controller.getForms);
router.get('/forms/:id', authLimiter, Staff4Controller.getFormById);
router.put('/forms/:id/cross-verify', authLimiter, Staff4Controller.crossVerifyForm);
router.put('/forms/:id/update', authLimiter, Staff4Controller.updateForm);

// Work report routes
router.get('/work-data', authLimiter, Staff4Controller.getWorkData);
router.post('/reports', authLimiter, Staff4Controller.submitWorkReport);
router.post('/cross-verification-report', authLimiter, Staff4Controller.submitCrossVerificationReport);
router.get('/reports', authLimiter, Staff4Controller.getWorkReports);

export default router;