import express from 'express';
import AgentManagementController from '../controllers/agentManagementController.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authorizeRoles('admin'));

// Get all approved agents with work statistics
router.get('/approved', AgentManagementController.getApprovedAgents);

// Get agent's detailed work information
router.get('/:id/work', AgentManagementController.getAgentWork);

// Update agent's work (commission, transactions, forms)
router.patch('/:id/work', AgentManagementController.updateAgentWork);

// Get agent statistics for dashboard
router.get('/stats', AgentManagementController.getAgentStats);

export default router;
