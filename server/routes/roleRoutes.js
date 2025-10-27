import express from "express";
import passport from "passport";
import RoleController from "../controllers/roleController.js";
import accessTokenAutoRefresh from "../middlewares/accessTokenAutoRefresh.js";
import setAuthHeader from "../middlewares/setAuthHeader.js";
import { authorize, canManageStaff, logAction, logResponse } from "../middlewares/rbac.js";
import { authLimiter } from "../config/rateLimits.js";

const router = express.Router();

// All role routes require authentication and admin role
router.use(setAuthHeader, accessTokenAutoRefresh, passport.authenticate('userOrStaff', {session: false}));

// Role Management Routes
router.post("/create", 
  authorize(['admin']), 
  canManageStaff, 
  logAction('role_create', 'role'),
  authLimiter,
  RoleController.createRole,
  logResponse
);

router.get("/", 
  authorize(['admin']), 
  RoleController.getAllRoles
);

router.get("/permissions", 
  authorize(['admin']), 
  RoleController.getAvailablePermissions
);

router.get("/:roleId", 
  authorize(['admin']), 
  RoleController.getRoleById
);

router.put("/:roleId", 
  authorize(['admin']), 
  canManageStaff, 
  logAction('role_update', 'role'),
  RoleController.updateRole,
  logResponse
);

router.delete("/:roleId", 
  authorize(['admin']), 
  canManageStaff, 
  logAction('role_delete', 'role'),
  RoleController.deleteRole,
  logResponse
);

export default router;
