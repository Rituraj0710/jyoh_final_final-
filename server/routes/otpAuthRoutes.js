import express from "express";
import OtpAuthController from "../controllers/otpAuthController.js";
import UserController from "../controllers/userController.js";
import AgentSignupController from "../controllers/agentSignupController.js";

const router = express.Router();

// User Signup
router.post("/user/signup", UserController.userRegistration);

// Agent Signup
router.post("/agent/signup", AgentSignupController.signup);

// User Login (Normal User)
router.post("/user/login", OtpAuthController.userLogin);

// Agent Login
router.post("/agent/login", OtpAuthController.agentLogin);

// Simple Agent Login (for testing)
import SimpleAgentLoginController from '../controllers/simpleAgentLogin.js';
router.post("/agent/simple-login", SimpleAgentLoginController.simpleAgentLogin);

// Verify OTP
router.post("/verify-otp", OtpAuthController.verifyOTP);

// Resend OTP
router.post("/resend-otp", UserController.resendOTP);

// Logout
router.post("/logout", OtpAuthController.logout);

export default router;
