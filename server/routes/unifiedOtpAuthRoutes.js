import express from "express";
import UnifiedOtpAuthController from "../controllers/unifiedOtpAuthController.js";
import { authLimiter } from "../config/rateLimits.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        status: "failed",
        message: "Access token required"
      });
    }

    // Verify token
    const JWT_SECRET = process.env.JWT_ACCESS_TOKEN_SECRECT_KEY || process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-document-management-system-2024';
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user info to request
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      status: "failed",
      message: "Invalid or expired token"
    });
  }
};

// Step 1: Send OTP (supports both email and mobile)
router.post("/send-otp", 
  authLimiter,
  UnifiedOtpAuthController.sendOTP
);

// Step 2: Verify OTP and complete login
router.post("/verify-otp", 
  authLimiter,
  UnifiedOtpAuthController.verifyOTP
);

// Resend OTP
router.post("/resend-otp", 
  authLimiter,
  UnifiedOtpAuthController.resendOTP
);

// Get user profile (requires authentication)
router.get("/profile", 
  authenticateToken,
  UnifiedOtpAuthController.getProfile
);

// Health check
router.get("/health", (req, res) => {
  res.json({ 
    status: "success", 
    message: "Unified OTP Authentication service is running",
    timestamp: new Date().toISOString()
  });
});

export default router;
