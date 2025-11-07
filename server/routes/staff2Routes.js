import express from 'express';
import Staff2Controller from '../controllers/staff2Controller.js';
import { authenticateToken } from '../middlewares/roleBasedAuth.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';
import { authLimiter } from '../config/rateLimits.js';

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

export default router;