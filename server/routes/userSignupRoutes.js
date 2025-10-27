import express from "express";
import UserSignupController from "../controllers/userSignupController.js";
import { authLimiter } from "../config/rateLimits.js";

const router = express.Router();

// User Signup Routes
router.post("/signup", 
  authLimiter,
  UserSignupController.signup
);

router.post("/verify-email", 
  authLimiter,
  UserSignupController.verifyEmail
);

router.post("/resend-otp", 
  authLimiter,
  UserSignupController.resendOTP
);

export default router;
