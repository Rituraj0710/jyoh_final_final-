import express from 'express';
import SupportTicketController from '../controllers/supportTicketController.js';
import { authenticateToken } from '../middlewares/roleBasedAuth.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';
import { authLimiter } from '../config/rateLimits.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/support-tickets';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `ticket-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and text files are allowed.'));
    }
  }
});

const router = express.Router();

// User routes
router.post('/create', authenticateToken, authLimiter, upload.array('attachments', 5), SupportTicketController.createTicket);
router.get('/user/list', authenticateToken, authLimiter, SupportTicketController.getUserTickets);
router.get('/user/:id', authenticateToken, authLimiter, SupportTicketController.getTicketById);

// Admin/Staff routes
router.get('/admin/all', authenticateToken, authorizeRoles('admin', 'staff1', 'staff2', 'staff3', 'staff4', 'staff5'), authLimiter, SupportTicketController.getAllTickets);
router.get('/admin/:id', authenticateToken, authorizeRoles('admin', 'staff1', 'staff2', 'staff3', 'staff4', 'staff5'), authLimiter, SupportTicketController.getTicketById);
router.post('/:id/response', authenticateToken, authLimiter, upload.array('attachments', 5), SupportTicketController.addResponse);
router.post('/:id/assign', authenticateToken, authorizeRoles('admin', 'staff1', 'staff2', 'staff3', 'staff4', 'staff5'), authLimiter, SupportTicketController.assignTicket);
router.post('/:id/resolve', authenticateToken, authorizeRoles('admin', 'staff1', 'staff2', 'staff3', 'staff4', 'staff5'), authLimiter, SupportTicketController.resolveTicket);
router.put('/:id/status', authenticateToken, authorizeRoles('admin', 'staff1', 'staff2', 'staff3', 'staff4', 'staff5'), authLimiter, SupportTicketController.updateTicketStatus);
router.post('/:id/rating', authenticateToken, authLimiter, SupportTicketController.addRating);

export default router;
