import express from "express";
import DemoOtpAuthController from "../controllers/demoOtpAuthController.js";
import { authLimiter } from "../config/rateLimits.js";

const router = express.Router();

// Step 1: Send OTP (supports both email and mobile) - DEMO VERSION
router.post("/send-otp", 
  authLimiter,
  DemoOtpAuthController.sendOTP
);

// Step 2: Verify OTP and complete login - DEMO VERSION
router.post("/verify-otp", 
  authLimiter,
  DemoOtpAuthController.verifyOTP
);

// Resend OTP - DEMO VERSION
router.post("/resend-otp", 
  authLimiter,
  DemoOtpAuthController.resendOTP
);

// Health check
router.get("/health", (req, res) => {
  res.json({ 
    status: "success", 
    message: "Demo OTP Authentication service is running",
    timestamp: new Date().toISOString(),
    demoMode: true
  });
});

export default router;
