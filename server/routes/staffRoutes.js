import express from "express";
import passport from "passport";

const router = express.Router();

import UserController from "../controllers/userController.js";
import accessTokenAutoRefresh from "../middlewares/accessTokenAutoRefresh.js";
import ContactController from "../controllers/contactUsController.js";
import optionalAuthMiddleware from "../middlewares/contactUs.js";
import StaffController from "../controllers/staffController.js";
import setAuthHeader from "../middlewares/setAuthHeader.js";
import { authLimiter, passwordResetLimiter, emailVerificationLimiter } from "../config/rateLimits.js";

// Public Routes with rate limiting
router.post("/staff-verify-email", emailVerificationLimiter, UserController.verifyEmail);
router.post("/staff-login", authLimiter, StaffController.staffLogin);
router.post("/refresh-token", UserController.getNewAccessToken);
router.post("/reset-password-link", passwordResetLimiter, StaffController.sendStaffPasswordResetEmail);
router.post("/reset-password/:id/:token", passwordResetLimiter, StaffController.staffPasswordReset);


// Protected Routes
router.get("/", setAuthHeader, accessTokenAutoRefresh, passport.authenticate('userOrStaff', {session: false}), StaffController.getStaffList);
router.get("/staff-profile",setAuthHeader, accessTokenAutoRefresh,passport.authenticate('userOrStaff', {session: false}),StaffController.staffProfile);
router.post("/staff-change-password",setAuthHeader, accessTokenAutoRefresh,passport.authenticate('userOrStaff', {session: false}),StaffController.changeStaffPassword);
router.post("/staff-logout",setAuthHeader, accessTokenAutoRefresh,passport.authenticate('userOrStaff', {session: false}),StaffController.staffLogout);

router.post("/contact",setAuthHeader,accessTokenAutoRefresh,passport.authenticate('userOrStaff', {session: false}), ContactController.submitContactForm);

export default router;