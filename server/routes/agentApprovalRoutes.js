import express from 'express';
import AgentApprovalController from '../controllers/agentApprovalController.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authorizeRoles('admin'));

// Get agent requests with filtering by status
router.get('/requests', AgentApprovalController.getAgentRequests);

// Get agent statistics
router.get('/stats', AgentApprovalController.getAgentStats);

// Approve an agent
router.patch('/:id/approve', AgentApprovalController.approveAgent);

// Reject an agent
router.patch('/:id/reject', AgentApprovalController.rejectAgent);

// Export agent requests to CSV
router.get('/export', AgentApprovalController.exportAgentRequests);

export default router;
