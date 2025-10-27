import express from 'express';
import LedgerController from '../controllers/ledgerController.js';
import { authenticateToken } from '../middlewares/roleBasedAuth.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';
import { authLimiter } from '../config/rateLimits.js';

const router = express.Router();

// User routes
router.get('/user/ledger', authenticateToken, authLimiter, LedgerController.getUserLedger);

// Admin/Staff routes
router.get('/admin/all', authenticateToken, authorizeRoles('admin', 'staff1', 'staff2', 'staff3', 'staff4', 'staff5'), authLimiter, LedgerController.getAllLedger);
router.get('/admin/pending-payments', authenticateToken, authorizeRoles('admin', 'staff1', 'staff2', 'staff3', 'staff4', 'staff5'), authLimiter, LedgerController.getPendingPayments);
router.get('/admin/credit-report', authenticateToken, authorizeRoles('admin', 'staff1', 'staff2', 'staff3', 'staff4', 'staff5'), authLimiter, LedgerController.getCreditReport);
router.post('/admin/verify-payment/:transactionId', authenticateToken, authorizeRoles('admin', 'staff1', 'staff2', 'staff3', 'staff4', 'staff5'), authLimiter, LedgerController.verifyPayment);
router.get('/admin/export', authenticateToken, authorizeRoles('admin'), authLimiter, LedgerController.exportLedgerReport);

export default router;
