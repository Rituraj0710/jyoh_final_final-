import express from "express";
import passport from "passport";
import StaffReportController from "../controllers/staffReportController.js";
import accessTokenAutoRefresh from "../middlewares/accessTokenAutoRefresh.js";
import setAuthHeader from "../middlewares/setAuthHeader.js";
import { authorize } from "../middlewares/rbac.js";
import { authLimiter } from "../config/rateLimits.js";

const router = express.Router();

// All routes require authentication
router.use(setAuthHeader, accessTokenAutoRefresh, passport.authenticate('userOrStaff', {session: false}));

// Staff report routes (for staff1 role - Forms Review and Stamp Calculation)
router.post("/create", 
  authorize(['staff1', 'admin']), 
  authLimiter,
  StaffReportController.createReport
);

router.post("/:reportId/submit", 
  authorize(['staff1', 'admin']), 
  authLimiter,
  StaffReportController.submitReport
);

router.get("/staff", 
  authorize(['staff1', 'admin']), 
  StaffReportController.getStaffReports
);

router.get("/assigned-forms", 
  authorize(['staff1', 'admin']), 
  StaffReportController.getAssignedForms
);

router.get("/:reportId", 
  authorize(['staff1', 'admin']), 
  StaffReportController.getReportById
);

router.put("/:reportId", 
  authorize(['staff1', 'admin']), 
  authLimiter,
  StaffReportController.updateReport
);

// Admin routes (for viewing all reports)
router.get("/admin/all", 
  authorize(['admin']), 
  StaffReportController.getAllReports
);

export default router;

