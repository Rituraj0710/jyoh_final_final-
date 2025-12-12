import express from 'express';
import SupportTicketController from '../controllers/supportTicketController.js';
import { authenticateToken } from '../middlewares/roleBasedAuth.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';
import { authLimiter } from '../config/rateLimits.js';
import multer from 'multer';

// Configure multer for file uploads - using memory storage for Cloudinary
const storage = multer.memoryStorage();

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
router.get('/admin/all', authenticateToken, authorizeRoles('admin', 'staff1', 'staff2', 'staff3', 'staff4'), authLimiter, SupportTicketController.getAllTickets);
router.get('/admin/:id', authenticateToken, authorizeRoles('admin', 'staff1', 'staff2', 'staff3', 'staff4'), authLimiter, SupportTicketController.getTicketById);
router.post('/:id/response', authenticateToken, authLimiter, upload.array('attachments', 5), SupportTicketController.addResponse);
router.post('/:id/assign', authenticateToken, authorizeRoles('admin', 'staff1', 'staff2', 'staff3', 'staff4'), authLimiter, SupportTicketController.assignTicket);
router.post('/:id/resolve', authenticateToken, authorizeRoles('admin', 'staff1', 'staff2', 'staff3', 'staff4'), authLimiter, SupportTicketController.resolveTicket);
router.put('/:id/status', authenticateToken, authorizeRoles('admin', 'staff1', 'staff2', 'staff3', 'staff4'), authLimiter, SupportTicketController.updateTicketStatus);
router.post('/:id/rating', authenticateToken, authLimiter, SupportTicketController.addRating);

export default router;
