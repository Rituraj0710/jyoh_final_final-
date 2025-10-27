import express from "express";
import AgentSignupController from "../controllers/agentSignupController.js";
import { authLimiter } from "../config/rateLimits.js";

const router = express.Router();

// Agent Signup Routes
router.post("/signup", 
  authLimiter,
  AgentSignupController.signup
);

router.post("/verify-email", 
  authLimiter,
  AgentSignupController.verifyEmail
);

router.post("/resend-otp", 
  authLimiter,
  AgentSignupController.resendOTP
);

export default router;
