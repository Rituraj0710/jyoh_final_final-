import express from "express";
import passport from "passport";

const router = express.Router();

import UserController from "../controllers/userController.js";
import accessTokenAutoRefresh from "../middlewares/accessTokenAutoRefresh.js";
import ContactController from "../controllers/contactUsController.js";
import optionalAuthMiddleware from "../middlewares/contactUs.js";
import setAuthHeader from "../middlewares/setAuthHeader.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { authLimiter, passwordResetLimiter, emailVerificationLimiter } from "../config/rateLimits.js";

// Public Routes with rate limiting
router.post("/register", authLimiter, UserController.userRegistration);
router.post("/verify-otp", emailVerificationLimiter, UserController.verifyOTP);
router.post("/resend-otp", emailVerificationLimiter, UserController.resendOTP);
router.post("/login", authLimiter, UserController.userLogin);
router.post("/refresh-token", UserController.getNewAccessToken);
router.post("/reset-password-link", passwordResetLimiter, UserController.sendUserPasswordResetEmail);
router.post("/reset-password/:id/:token", passwordResetLimiter, UserController.userPasswordReset);


// Protected Routes - Accessible by user, staff_*, and admin
router.get("/profile", setAuthHeader, accessTokenAutoRefresh, authorizeRoles('user', 'user1', 'user2', 'normal_user', 'agent_user', 'admin', 'staff_1', 'staff_2', 'staff_3', 'staff_4', 'staff_5', 'staff_6', 'staff_7'), UserController.userProfile);
router.post("/change-password", setAuthHeader, accessTokenAutoRefresh, authorizeRoles('user', 'user1', 'user2', 'normal_user', 'agent_user', 'admin', 'staff_1', 'staff_2', 'staff_3', 'staff_4', 'staff_5', 'staff_6', 'staff_7'), UserController.changeUserPassword);
router.post("/logout", setAuthHeader, accessTokenAutoRefresh, authorizeRoles('user', 'user1', 'user2', 'normal_user', 'agent_user', 'admin', 'staff_1', 'staff_2', 'staff_3', 'staff_4', 'staff_5', 'staff_6', 'staff_7'), UserController.userLogout);

router.post("/contact", setAuthHeader, accessTokenAutoRefresh, authorizeRoles('user', 'user1', 'user2', 'normal_user', 'agent_user', 'admin', 'staff_1', 'staff_2', 'staff_3', 'staff_4', 'staff_5', 'staff_6', 'staff_7'), ContactController.submitContactForm);

// User Forms Routes
router.get("/forms", setAuthHeader, accessTokenAutoRefresh, authorizeRoles('user', 'user1', 'user2', 'normal_user', 'agent_user', 'admin', 'staff_1', 'staff_2', 'staff_3', 'staff_4', 'staff_5', 'staff_6', 'staff_7'), UserController.getUserForms);
router.get("/forms/:id", setAuthHeader, accessTokenAutoRefresh, authorizeRoles('user', 'user1', 'user2', 'normal_user', 'agent_user', 'admin', 'staff_1', 'staff_2', 'staff_3', 'staff_4', 'staff_5', 'staff_6', 'staff_7'), UserController.getUserFormById);
router.get("/forms/:id/download", setAuthHeader, accessTokenAutoRefresh, authorizeRoles('user', 'user1', 'user2', 'normal_user', 'agent_user', 'admin', 'staff_1', 'staff_2', 'staff_3', 'staff_4', 'staff_5', 'staff_6', 'staff_7'), UserController.downloadUserForm);

// Payment endpoints (temporary - to be moved to dedicated payment routes)
router.post("/payment/initialize", (req, res) => {
  try {
    const { formType, formData, amount, userInfo } = req.body;
    
    // Generate transaction ID
    const txnid = `TXN${Date.now()}${Math.random().toString(36).substr(2, 5)}`;
    
    // PayU configuration
    const payuConfig = {
      key: 'gtKFFx',
      salt: 'eCwWELxi',
      txnid: txnid,
      amount: amount || 1000,
      productinfo: `${formType} Form Submission`,
      firstname: userInfo?.name || formData?.name || formData?.trustName || 'User',
      email: 'bonehookadvt01@gmail.com',
      phone: userInfo?.phone || formData?.phone || formData?.mobile || '9999999999',
      surl: `${process.env.FRONTEND_HOST || 'http://localhost:3000'}/payment/success`,
      furl: `${process.env.FRONTEND_HOST || 'http://localhost:3000'}/payment/failure`
    };

    // Generate hash
    const crypto = require('crypto');
    const hashString = `${payuConfig.key}|${payuConfig.txnid}|${payuConfig.amount}|${payuConfig.productinfo}|${payuConfig.firstname}|${payuConfig.email}|||||||||||${payuConfig.salt}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

    res.status(200).json({
      status: 'success',
      message: 'Payment initialized successfully',
      data: {
        ...payuConfig,
        hash: hash,
        paymentUrl: 'https://test.payu.in/_payment'
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'failed',
      message: 'Failed to initialize payment',
      error: error.message
    });
  }
});

export default router;