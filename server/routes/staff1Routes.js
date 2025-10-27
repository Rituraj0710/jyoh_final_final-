import express from 'express';
import Staff1Controller from '../controllers/staff1Controller.js';
import { authenticateToken, authorizeStaff1 } from '../middlewares/roleBasedAuth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(authorizeStaff1);

// Forms management routes
router.get('/forms', Staff1Controller.getFormsForReview);
router.get('/forms/:id', Staff1Controller.getFormById);
router.put('/forms/:id/correct', Staff1Controller.correctForm);
router.put('/forms/:id/verify', Staff1Controller.verifyForm);

// Stamp calculation routes
router.post('/forms/:id/calculate-stamp', Staff1Controller.calculateStampDuty);

// Work reports routes
router.post('/reports', Staff1Controller.submitWorkReport);
router.get('/reports', Staff1Controller.getWorkReports);

// Dashboard routes
router.get('/dashboard/stats', Staff1Controller.getDashboardStats);

export default router;