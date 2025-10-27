import express from "express";
import passport from "passport";
import AdminController from "../controllers/adminController.js";
import accessTokenAutoRefresh from "../middlewares/accessTokenAutoRefresh.js";
import setAuthHeader from "../middlewares/setAuthHeader.js";
import { authorize, canManageStaff, logAction, logResponse } from "../middlewares/rbac.js";
import { authLimiter } from "../config/rateLimits.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(setAuthHeader, accessTokenAutoRefresh, passport.authenticate('userOrStaff', {session: false}));

// Staff Management Routes
router.post("/staff/create", 
  authorize(['admin']), 
  canManageStaff, 
  logAction('staff_create', 'staff'),
  authLimiter,
  AdminController.createStaff,
  logResponse
);

router.put("/staff/:staffId", 
  authorize(['admin']), 
  canManageStaff, 
  logAction('staff_update', 'staff'),
  AdminController.updateStaff,
  logResponse
);

router.get("/staff", 
  authorize(['admin']), 
  AdminController.getAllStaff
);

// DELETE route must come before GET /staff/:staffId to avoid route conflicts
router.delete("/staff/:staffId", 
  authorize(['admin']), 
  canManageStaff, 
  logAction('staff_delete', 'staff'),
  AdminController.deleteStaff,
  logResponse
);

router.get("/staff/:staffId", 
  authorize(['admin']), 
  AdminController.getStaffById
);

router.patch("/staff/:staffId/deactivate", 
  authorize(['admin']), 
  canManageStaff, 
  logAction('staff_deactivate', 'staff'),
  AdminController.deactivateStaff,
  logResponse
);

router.put("/staff/:staffId/reset-password", 
  authorize(['admin']), 
  canManageStaff, 
  logAction('staff_reset_password', 'staff'),
  AdminController.resetStaffPassword,
  logResponse
);

// Audit and Monitoring Routes
router.get("/audit-logs", 
  authorize(['admin']), 
  AdminController.getAuditLogs
);

router.get("/dashboard/stats", 
  authorize(['admin']), 
  AdminController.getDashboardStats
);

router.get("/roles/available", 
  authorize(['admin']), 
  AdminController.getAvailableRoles
);

// Forms Management Routes
router.get("/forms", 
  authorize(['admin', 'staff1', 'staff2', 'staff3', 'staff4', 'staff5']), 
  AdminController.getAdminForms
);

router.get("/forms/:id", 
  authorize(['admin', 'staff1', 'staff2', 'staff3', 'staff4', 'staff5']), 
  AdminController.getFormById
);

router.put("/forms/:id", 
  authorize(['admin', 'staff1', 'staff2', 'staff3', 'staff4', 'staff5']), 
  AdminController.updateForm
);

router.delete("/forms/:id", 
  authorize(['admin']), 
  AdminController.deleteForm
);

router.get("/forms/stats", 
  authorize(['admin', 'staff1', 'staff2', 'staff3', 'staff4', 'staff5']), 
  AdminController.getFormStats
);

// User Management Routes
router.get("/users", 
  authorize(['admin']), 
  AdminController.getAllUsers
);

router.get("/users/stats", 
  authorize(['admin']), 
  AdminController.getUserStats
);

router.get("/users/:userId", 
  authorize(['admin']), 
  AdminController.getUserById
);

router.patch("/users/:userId/status", 
  authorize(['admin']), 
  logAction('user_status_update', 'user'),
  AdminController.updateUserStatus,
  logResponse
);

// Agent Management Routes
router.get("/agents", 
  authorize(['admin']), 
  AdminController.getAllAgents
);

router.get("/agents/stats", 
  authorize(['admin']), 
  AdminController.getAgentStats
);

router.get("/agents/:agentId", 
  authorize(['admin']), 
  AdminController.getAgentById
);

router.patch("/agents/:agentId/status", 
  authorize(['admin']), 
  logAction('agent_status_update', 'agent'),
  AdminController.updateAgentStatus, 
  logResponse
);

// Payment Verification Routes
router.post("/payments/verify", 
  authorize(['admin']), 
  logAction('payment_verify', 'payment'),
  AdminController.verifyPayment, 
  logResponse
);

// Document Approval Routes
router.post("/forms/approve-document", 
  authorize(['admin']), 
  logAction('form_document_approve', 'form'),
  AdminController.approveFormDocument, 
  logResponse
);

// Sales and Payment Reports Routes
router.get("/reports/sales-payment", 
  authorize(['admin']), 
  AdminController.getSalesAndPaymentReports
);

export default router;