import express from 'express';
import {
  getAllMapForms,
  getMapFormById,
  createMapForm,
  updateMapForm,
  deleteMapForm,
  verifyMapForm,
  autoCreateMapForm,
  generateMapFormPDF,
  getMyMapForms
} from '../controllers/mapFormController.js';
import { authenticateToken } from '../middlewares/roleBasedAuth.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Public routes for Staff 3
router.get('/my-forms', ...authorizeRoles('staff3', 'admin'), getMyMapForms);
router.post('/auto-create/:userFormId', ...authorizeRoles('staff3', 'admin'), autoCreateMapForm);

// Staff 3 specific routes
router.get('/staff3/:formId', ...authorizeRoles('staff3', 'admin'), getMapFormById);
router.put('/staff3/:formId', ...authorizeRoles('staff3', 'admin'), updateMapForm);
router.delete('/staff3/:formId', ...authorizeRoles('staff3', 'admin'), deleteMapForm);
router.post('/staff3/:formId/verify', ...authorizeRoles('staff3', 'admin'), verifyMapForm);
router.get('/staff3/:formId/pdf', ...authorizeRoles('staff3', 'admin'), generateMapFormPDF);

// Admin routes
router.get('/', ...authorizeRoles('admin'), getAllMapForms);
router.get('/:formId', ...authorizeRoles('admin'), getMapFormById);
router.post('/', ...authorizeRoles('admin'), createMapForm);
router.put('/:formId', ...authorizeRoles('admin'), updateMapForm);
router.delete('/:formId', ...authorizeRoles('admin'), deleteMapForm);
router.get('/:formId/pdf', ...authorizeRoles('admin'), generateMapFormPDF);

export default router;
