import express from "express";
import passport from "passport";
import LogsController from "../controllers/logsController.js";
import accessTokenAutoRefresh from "../middlewares/accessTokenAutoRefresh.js";
import setAuthHeader from "../middlewares/setAuthHeader.js";
import { authorize } from "../middlewares/rbac.js";

const router = express.Router();

// All logs routes require authentication and admin role
router.use(setAuthHeader, accessTokenAutoRefresh, passport.authenticate('userOrStaff', {session: false}));

// Activity Logs Routes
router.get("/", 
  authorize(['admin']), 
  LogsController.getAllLogs
);

router.get("/recent", 
  authorize(['admin']), 
  LogsController.getRecentLogs
);

router.get("/stats", 
  authorize(['admin']), 
  LogsController.getLogStats
);

router.get("/user/:userId", 
  authorize(['admin']), 
  LogsController.getLogsByUser
);

router.get("/export", 
  authorize(['admin']), 
  LogsController.exportLogs
);

router.get("/:logId", 
  authorize(['admin']), 
  LogsController.getLogById
);

router.get("/filters/options", 
  authorize(['admin']), 
  LogsController.getFilterOptions
);

export default router;
