import express from 'express';
import Staff3Controller from '../controllers/staff3Controller.js';
import { authenticateToken } from '../middlewares/roleBasedAuth.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';
import { authLimiter } from '../config/rateLimits.js';

const router = express.Router();

// Apply authentication and role authorization to all routes
router.use(authenticateToken);
router.use(authorizeRoles('staff3', 'admin'));

// Dashboard routes
router.get('/dashboard-stats', authLimiter, Staff3Controller.getDashboardStats);

// Forms routes
router.get('/forms', authLimiter, Staff3Controller.getForms);
router.get('/forms/:id', authLimiter, Staff3Controller.getFormById);
router.put('/forms/:id/verify', authLimiter, Staff3Controller.verifyForm);
router.put('/forms/:id/update', authLimiter, Staff3Controller.updateForm);

// Work report routes
router.get('/work-data', authLimiter, Staff3Controller.getWorkData);
router.post('/reports', authLimiter, Staff3Controller.submitWorkReport);
router.get('/reports', authLimiter, Staff3Controller.getWorkReports);

export default router;