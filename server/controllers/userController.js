import UserModel from "../models/User.js";
import FormsData from "../models/FormsData.js";
import bcrypt from "bcrypt";
import sendEmailVerificationOTP from "../utils/sendEmailVerificationOTP.js";
import EmailVerificationModel from "../models/EmailVerification.js";
import generateTokens from "../utils/generateTokens.js";
import setTokenCookies from "../utils/setTokenCookies.js";
import refreshAccessToken from "../utils/refreshAccessToken.js";
import userRefreshTokenModel from "../models/UserRefreshToken.js";
import jwt from "jsonwebtoken"
import transporter from "../config/emailConfig.js";
import logger from "../config/logger.js";
import { successResponse, errorResponse } from "../utils/responseHelper.js";
import etherealEmailService from "../utils/etherealEmailService.js";
import AuditLog from "../models/AuditLog.js"; 
class UserController {
  // User Registration
  static userRegistration = async (req,res) =>{
    try {
      // Extract request body parameters
      const {name, phone, email, password, password_confirmation, role = 'user1'} = req.body;

      // Check if all fields are provided
      if(!name || !email || !password || !password_confirmation) {
        return res.status(400).json({status: "failed", message: "All fields are required"});
      }

      // Validate role
      if(!['user1', 'user2'].includes(role)) {
        return res.status(400).json({status: "failed", message: "Invalid role. Must be user1 or user2"});
      }

      // Check if password & password_confirmation is matched or not
      if(password !== password_confirmation){
        return res.status(400).json({status: "failed", message: "Password and confirm Password don't match"});
      }

      // Check if phone already exists (only if phone is provided)
      if(phone) {
        const existingPhone = await UserModel.findOne({phone});
        if(existingPhone){
          return res.status(409).json({status: "failed", message: "Phone Number already exists"});
        }
      }

      // Check if email already exists
      const existingUser = await UserModel.findOne({email});
      if(existingUser){
        logger.warn(`Registration attempt with existing email: ${email}`, {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          email: email
        });
        return res.status(409).json({status: "failed", message: "Email already exists"});
      }

      // Generate salt and hash password
      const salt = await bcrypt.genSalt(Number(process.env.SALT));
      const hashedPassword = await bcrypt.hash(password, salt);

      // Generate OTP for users (not agents)
      let otp = null;
      let otpExpiry = null;
      
      if (role === 'user1') {
        // Generate 6-digit OTP
        otp = String(Math.floor(100000 + Math.random() * 900000));
        // Set expiry to 15 minutes from now
        otpExpiry = new Date(Date.now() + 15 * 60 * 1000);
      }

      // create new user or save data of new user
      const userData = {
        name, 
        email, 
        password: hashedPassword, 
        role,
        is_verified: role === 'user2' ? false : false, // Both need verification, but different processes
        otp: otp,
        otpExpiry: otpExpiry
      };
      if(phone) userData.phone = phone;
      
      const newUser = await UserModel.create(userData);
      await newUser.save();

      // Send OTP email only for users (user1)
      if (role === 'user1' && otp) {
        try {
          await this.sendOTPEmail(newUser, otp);
          logger.info(`✅ OTP email sent successfully to user: ${email}`);
        } catch (emailError) {
          logger.error(`❌ Failed to send OTP email to ${email}:`, {
            error: emailError.message,
            code: emailError.code,
            email: email,
            userId: newUser._id
          });
          
          // Return error response if email fails
          return res.status(500).json({
            status: "failed",
            message: "Registration successful but failed to send verification email. Please contact support or try again later.",
            user: {
              id: newUser._id,
              email: newUser.email
            },
            requiresOTP: true,
            emailError: process.env.NODE_ENV === 'development' ? emailError.message : 'Email service unavailable'
          });
        }
      }

      // Log successful registration
      logger.info(`User registration successful: ${email}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: newUser._id,
        email: email,
        role: role
      });

      // Log activity
      await this.logActivity('register', newUser._id, role, 'Success', {
        email: email,
        role: role,
        ip: req.ip
      });

      // Send different response based on role
      if (role === 'user1') {
        res.status(201).json({
          status: "success", 
          message: "Registration successful. Please check your email for OTP verification.",
          user: {id: newUser._id, email: newUser.email},
          requiresOTP: true
        });
      } else {
        res.status(201).json({
          status: "success", 
          message: "Agent registration submitted. Please wait for admin approval.",
          user: {id: newUser._id, email: newUser.email},
          requiresApproval: true
        });
      }

    } catch (error) {
      console.error("Registration error:", error);
      logger.error(`User registration failed: ${error.message}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        email: req.body.email,
        error: error.message,
        stack: error.stack
      });

      // Log failed registration
      await this.logActivity('register', null, 'user1', 'Failure', {
        email: req.body.email,
        error: error.message,
        ip: req.ip
      });

      res.status(500).json({status: "failed", message: "Unable to register, Please try again later"});
    }
  }

  // Resend Email Verification OTP
  static resendVerificationOTP = async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ status: "failed", message: "Email is required" });
      }
      const existingUser = await UserModel.findOne({ email });
      if (!existingUser) {
        return res.status(404).json({ status: "failed", message: "User not found" });
      }
      if (existingUser.is_verified) {
        return res.status(400).json({ status: "failed", message: "Email is already verified." });
      }

      await sendEmailVerificationOTP(req, existingUser);
      return res.status(200).json({ status: "success", message: "A new OTP has been sent to your email." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: "failed", message: "Unable to resend OTP. Please try again later." });
    }
  }

  // User Email Verification
  static verifyEmail = async (req, res) => {
    try {
      // Extract request body parameters
      const {email, otp} = req.body;

      // Check if all required fields are provided
      if(!email || !otp) {
        return res.status(400).json({status: "failed", message: "All fields are required"});
      }

      const existingUser = await UserModel.findOne({email});
      // Check if email doesn't exists
      if(!existingUser) {
        return  res.status(400).json({status: "failed", message: "Email doesn't exists"});
      }

      // Check if email is already verified
      if(existingUser.is_verified){
        return res.status(400).json({status: "failed", message: "Email is already verified."});  
      }

      // Always compare against the most recent OTP for the user
      const providedOtp = String(otp).trim();
      const emailVerification = await EmailVerificationModel
        .findOne({ userId: existingUser._id })
        .sort({ createdAt: -1 });
      if (!emailVerification) {
        await sendEmailVerificationOTP(req, existingUser);
        return res.status(400).json({ status: "failed", message: "No OTP found. A new OTP has been sent to your email." });
      }
      // Check if OTP matches
      if (String(emailVerification.otp).trim() !== providedOtp) {
        return res.status(400).json({ status: "failed", message: "Invalid OTP. Please try again." });
      }

      // const emailVerification = await EmailVerificationModel.findOne({userId: existingUser._id, otp});
      // if(!emailVerification) {
      //   if(!existingUser.is_verified){
      //     console.log(existingUser);
      //     await sendEmailVerificationOTP(req, existingUser);
      //     return res.status(400).json({status:"failed", message: "Invalid OTP, new OTP sent to your email"});
      //   }
      //   return res.status(400).json({status:"failed", message:"Invalid OTP"});
      // }

      // Check if OTP is expired
      const currentTime = new Date();
      // 15 * 60 * 1000 calculate the expiration period in milliseconds(15 minutes).
      const expirationTime = new Date(emailVerification.createdAt.getTime() + 15 * 60 * 1000);
      if(currentTime > expirationTime) {
        // OTP expired, send new OTP
        await EmailVerificationModel.deleteMany({ userId: existingUser._id }); // Clear old OTPs
      await sendEmailVerificationOTP(req, existingUser); // Send new OTP
      return res.status(400).json({ status: "failed", message: "OTP expired. A new OTP has been sent to your email." });
        // await sendEmailVerificationOTP(req, existingUser);
        // return res.status(400).json({status: "failed", message: "OTP expired, new OTP sent to your email"});
      }

      // OTP is valid and not expired, mark email as verified
      existingUser.is_verified = true;
      await existingUser.save();

      // Delete email verification document
      await EmailVerificationModel.deleteMany({userId: existingUser._id,});

      res.status(200).json({ status: "success", message: "Email verified successfully!" });
    } catch (error) {
      console.log(error);
      res.status(500).json({status: "failed", message: "Unable to verify email, please try again later."});
    }
  }

  // Send OTP Email
  static sendOTPEmail = async (user, otp) => {
    try {
      // Check if email configuration is available
      if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        logger.warn(`📧 Email configuration missing, using Ethereal Email service for user: ${user.email}`);
        return await etherealEmailService.sendOTPEmail(user, otp);
      }

      // Verify transporter connection
      await transporter.verify();
      logger.info(`📧 Email transporter verified for user: ${user.email}`);

      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: user.email,
        subject: "OTP Verification - Complete Your Registration",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome ${user.name}!</h2>
            <p>Thank you for registering with us. To complete your registration, please verify your email address using the OTP below:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #007bff; font-size: 32px; margin: 0;">${otp}</h1>
            </div>
            <p>This OTP is valid for 15 minutes. If you didn't request this OTP, please ignore this email.</p>
            <p>Best regards,<br>Document Management Team</p>
          </div>
        `
      };

      const result = await transporter.sendMail(mailOptions);
      logger.info(`✅ OTP email sent successfully to: ${user.email}`, {
        messageId: result.messageId,
        response: result.response
      });
      
      return result;
    } catch (error) {
      logger.error(`❌ Error sending OTP email to ${user.email}:`, {
        error: error.message,
        code: error.code,
        email: user.email,
        userId: user._id
      });
      
      // Try fallback to Ethereal Email
      try {
        logger.warn(`🔄 Trying Ethereal Email fallback for user: ${user.email}`);
        return await etherealEmailService.sendOTPEmail(user, otp);
      } catch (fallbackError) {
        logger.error(`❌ Ethereal Email fallback also failed for user: ${user.email}`, fallbackError.message);
        throw error; // Throw original error
      }
    }
  };

  // Verify OTP
  static verifyOTP = async (req, res) => {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          status: "failed",
          message: "Email and OTP are required"
        });
      }

      // Find user by email
      const user = await UserModel.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(404).json({
          status: "failed",
          message: "User not found"
        });
      }

      // Check if user is already verified
      if (user.is_verified) {
        return res.status(400).json({
          status: "failed",
          message: "User is already verified"
        });
      }

      // Check if OTP exists and is not expired
      if (!user.otp || !user.otpExpiry) {
        return res.status(400).json({
          status: "failed",
          message: "No OTP found. Please request a new OTP"
        });
      }

      // Check if OTP is expired
      if (new Date() > user.otpExpiry) {
        return res.status(400).json({
          status: "failed",
          message: "OTP has expired. Please request a new OTP"
        });
      }

      // Verify OTP
      if (user.otp !== otp) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid OTP"
        });
      }

      // Update user as verified and clear OTP
      user.is_verified = true;
      user.otp = null;
      user.otpExpiry = null;
      await user.save();

      // Log successful verification
      logger.info(`User OTP verification successful: ${email}`, {
        userId: user._id,
        email: email
      });

      // Log activity
      await this.logActivity('otp_verification', user._id, user.role, 'Success', {
        email: email,
        ip: req.ip
      });

      res.status(200).json({
        status: "success",
        message: "Email verified successfully. You can now login.",
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        }
      });

    } catch (error) {
      console.error("OTP verification error:", error);
      logger.error(`OTP verification failed: ${error.message}`, {
        email: req.body.email,
        error: error.message
      });
      res.status(500).json({
        status: "failed",
        message: "Unable to verify OTP, please try again later"
      });
    }
  };

  // Resend OTP
  static resendOTP = async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          status: "failed",
          message: "Email is required"
        });
      }

      // Find user by email
      const user = await UserModel.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(404).json({
          status: "failed",
          message: "User not found"
        });
      }

      // Check if user is already verified
      if (user.is_verified) {
        return res.status(400).json({
          status: "failed",
          message: "User is already verified"
        });
      }

      // Generate new OTP
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

      // Update user with new OTP
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();

      // Send OTP email
      try {
        await this.sendOTPEmail(user, otp);
        logger.info(`OTP resent to user: ${email}`);
      } catch (emailError) {
        logger.warn(`Failed to resend OTP email to ${email}:`, emailError.message);
        return res.status(500).json({
          status: "failed",
          message: "Failed to send OTP email. Please try again later."
        });
      }

      res.status(200).json({
        status: "success",
        message: "OTP has been resent to your email"
      });

    } catch (error) {
      console.error("Resend OTP error:", error);
      res.status(500).json({
        status: "failed",
        message: "Unable to resend OTP, please try again later"
      });
    }
  };

  // User Login
  static userLogin = async (req, res) => {
    try {
      const {email, password, role} = req.body;
      // Check is email and password are provided
      if(!email || !password) {
        return res.status(400).json({status:"failed", message: "Email and password are required"});
      }
      // Find user by email with password field
      const user = await UserModel.findOne({email}).select('+password');

      // Check if user exists
      if(!user){
        logger.warn(`Login attempt with non-existent email: ${email}`, {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          email: email
        });
        
        // Log failed login attempt
        const ActivityLogger = (await import('../services/activityLogger.js')).default;
        await ActivityLogger.logActivity({
          userId: null,
          userType: 'agent',
          userEmail: email,
          userName: 'Unknown',
          action: 'login',
          details: { reason: 'User not found' },
          status: 'failure',
          severity: 'medium'
        }, req);
        
        return res.status(400).json({status:"failed", message:"Invalid email or password"});
      }

      // Check if user is a regular user (user1 or user2)
      if(!['user1', 'user2'].includes(user.role)){
        return res.status(403).json({status: "failed", message: "Access denied. Not a regular user"})
      }

      // If role is specified, check if it matches the user's role
      if(role && role !== user.role) {
        return res.status(403).json({status: "failed", message: `Access denied. This account is for ${user.role === 'user1' ? 'Normal User' : 'Agent'} login`})
      }
      // Check verification status based on role
      if (user.role === 'user1') {
        // Users need OTP verification
        if (!user.is_verified) {
          return res.status(401).json({
            status: "failed", 
            message: "Please verify your email with OTP before logging in"
          });
        }
      } else if (user.role === 'user2') {
        // Agents need admin approval
        if (user.status !== 'approved') {
          if (user.status === 'pending') {
            return res.status(401).json({
              status: "failed", 
              message: "Your agent account is pending admin approval. Please wait for approval."
            });
          } else if (user.status === 'rejected') {
            return res.status(401).json({
              status: "failed", 
              message: "Your agent account has been rejected. Please contact support."
            });
          }
        }
      }

      // Check if user account is blocked (only if accountStatus field exists)
      if(user.accountStatus && user.accountStatus === 'blocked') {
        return res.status(403).json({status: "failed", message: "Your account has been blocked. Please contact support."})
      }

      // Compare password / Check Password
      const isMatch =  await bcrypt.compare(password, user.password);
      if(!isMatch){
        logger.warn(`Failed login attempt - incorrect password: ${email}`, {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          email: email,
          userId: user._id
        });
        
        // Log failed login attempt
        const ActivityLogger = (await import('../services/activityLogger.js')).default;
        await ActivityLogger.logActivity({
          userId: user._id,
          userType: 'agent',
          userEmail: user.email,
          userName: user.name,
          action: 'login',
          details: { reason: 'Incorrect password' },
          status: 'failure',
          severity: 'medium'
        }, req);
        
        return res.status(401).json({status:"failed", message:"Invalid email or password"}); 
      }

      // Generate tokens
      const {accessToken, refreshToken, accessTokenExp, refreshTokenExp} = await generateTokens(user);

      // Use role from request body (already destructured above)

      // No cookies – frontend stores tokens in localStorage

      // Log successful login
      logger.info(`User login successful: ${email}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: user._id,
        email: email,
        role: role
      });

      // Log activity
      const ActivityLogger = (await import('../services/activityLogger.js')).default;
      await ActivityLogger.logLogin(user, 'success', req);

      // Send Success Response with Tokens
      res.status(200).json({
        user: {id: user._id, email: user.email, name:user.name, roles: user.roles[0]},
        status: "success",
        message: "Login successful",
        access_token: accessToken,
        refresh_token: refreshToken,
        access_token_exp: accessTokenExp,
        is_auth: true,
      })

    } catch (error) {
      console.error(error);
      res.status(500).json({status: "failed", message: "Unable to login, please try again later"});
    }
  }

  // Get New Access Token OR Refresh Token
  static getNewAccessToken = async (req,res) =>{
    try {
      // Get new access token using Refresh Token
      const{newAccessToken, newRefreshToken, newAccessTokenExp,newRefreshTokenExp} = await refreshAccessToken(req,res)
    // Set New Token to Cookie
    setTokenCookies(res, newAccessToken, newRefreshToken, newAccessTokenExp, newRefreshTokenExp)
    res.status(200).send({
      status: "success",
      message: "New tokens generated", 
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      access_token_exp: newAccessTokenExp,
    });
    } catch (error) {
      console.error(error);
      res.status(500).json({status: "failed", message: "Unable to generate new token, please try again later."})
    }
  }

  // Profile OR Logged in User
  static userProfile = async(req,res) => {
    res.send({"user": req.user})
  }

  // Change Password
  static changeUserPassword = async (req,res) =>{
    try {
      const {password, password_confirmation} = req.body;
      // check if both fields are provided 
      if(!password || !password_confirmation) {
        return res.status(400).json({status: "failed", message:"Password and Confirm password are required"})
      }

      // Check if password and password_confirmation match
      if(password !== password_confirmation){
        return res.status(400).json({status: "failed", message:"New Password and confirm password don't match"})
      }

      // Generate salt and hash new password
      const salt = await bcrypt.genSalt(10);
      const newHashPassword = await bcrypt.hash(password, salt);

      // Update user's password
      await UserModel.findByIdAndUpdate(req.user._id, {$set: {password: newHashPassword}});

      // send success response
      res.status(200).json({status: "success", message:"Password changed successfully."});

    } catch (error) {
      console.error(error);
      res.status(500).json({status: "failed", message: "Unable to change password, please try again later."});
    }
  }

  // Send Password Reset link via Email
  static sendUserPasswordResetEmail = async (req, res) =>{
    try {
      const {email} = req.body;
      // check if email is provided
      if(!email){
        return res.status(400).json({status:"failed", message:"Email field is required."})
      }
      // Find user by email
      const user = await UserModel.findOne({email});
      if(!user){
        return res.status(404).json({status:"failed", message:"Email doesn't exist."});
      }

      // Generate token for password reset
      const secret = user._id + process.env.JWT_ACCESS_TOKEN_SECRECT_KEY;
      const token = jwt.sign({userId: user._id}, secret, {expiresIn: '15m'});
      // Reset Link
      const resetLink = `${process.env.FRONTEND_HOST}/account/reset-password-confirm/${user._id}/${token}`;
      console.log("ResetLink->", resetLink);

      // Send password reset email
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "Password Reset Link",
        html: `<p>Hello ${user.name},</p>
        <p>Please <a href='${resetLink}'>click here</a> to reset your password.</p>`,
      });

      // send success response
      res.status(200).json({status:"success", message:"Password reset email sent. Please check your email."})

    } catch (error) {
      console.error(error);
      res.status(500).json({status: "failed", message: "Unable to send password reset email. Please try again later."});
    }
  }

  // Password Reset
  static userPasswordReset = async (req,res) =>{
    try {
      const {password, password_confirmation} = req.body;
      const {id, token} = req.params;
      
      // Find user by ID
      const user = await UserModel.findById(id);
      console.log("user for password reset:", user);
      if(!user){
        return res.status(400).json({status: "failed", message:"User not found."});
      }
      // Validate token 
      const new_secret = user._id + process.env.JWT_ACCESS_TOKEN_SECRECT_KEY;
      jwt.verify(token, new_secret);

      // Check if password and confirm_password is provided
      if(!password || !password_confirmation){
        return res.status(400).json({status: "failed", message:"New password and confirm password are required."});
      }

      // Check if both password is match 
      if(password !== password_confirmation){
        res.status(400).json({status: "failed", message:"New password and confirm password don't match"});
      }

      // Generate salt and hash new password
      const salt = await bcrypt.genSalt(10);
      const newHashPassword = await bcrypt.hash(password, salt);

      // Updates user's password
      await UserModel.findByIdAndUpdate(user._id, {$set: {password: newHashPassword}});

      // Send success response
      res.status(200).json({status: "success", message:"Password reset successfully."});
    } catch (error) {
      if(error.name === "TokenExpiredError"){
        return res.status(400).json({status:"failed", message:"Token expired. Please request new password link."});
      }
      return res.status(500).json({status: "failed", message:"Unable to reset password. Please try again later."});
    }
  }

  // Logout
  static userLogout = async (req,res) =>{
    try {
      // optionally, blacklist the refresh token in the database
      const refreshToken = req.cookies.refreshToken;
      await userRefreshTokenModel.findOneAndUpdate(
        {token: refreshToken},
        {$set: {blacklisted: true}}
      );

      // cleare access & refresh token cookies
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      res.clearCookie('is_auth');
      res.clearCookie('role');

      res.status(200).json({status: "success", message: "Logout successful"});
    } catch (error) {
      console.error(error);
      res.status(500).json({status:"failed", message:"Unable to logout, please try again later"});
    }
  }

  // Get user's forms
  static getUserForms = async (req, res) => {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10, status, serviceType } = req.query;
      const skip = (page - 1) * limit;

      const options = {
        serviceType,
        status,
        limit: parseInt(limit),
        skip: parseInt(skip)
      };

      const forms = await FormsData.getUserForms(userId, options);
      const total = await FormsData.countDocuments({ userId });

      // Log activity
      await this.logActivity('User Forms List', userId, null, 'Success');

      return successResponse(res, 'User forms retrieved successfully', {
        forms,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Error getting user forms:', error);
      await this.logActivity('User Forms List Error', req.user.id, null, 'Failure', error.message);
      return errorResponse(res, 'Error retrieving user forms', error.message, 500);
    }
  };

  // Get specific user form by ID
  static getUserFormById = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const formData = await FormsData.findById(id)
        .populate('userId', 'name email role')
        .populate('lastActivityBy', 'name email role');

      if (!formData) {
        return errorResponse(res, 'Form not found', null, 404);
      }

      // Check if user owns this form
      if (formData.userId._id.toString() !== userId) {
        return errorResponse(res, 'Access denied', null, 403);
      }

      // Log activity
      await this.logActivity('User Form View', userId, formData._id, 'Success');

      return successResponse(res, 'Form retrieved successfully', { formData });
    } catch (error) {
      logger.error('Error getting user form by ID:', error);
      await this.logActivity('User Form View Error', req.user.id, req.params.id, 'Failure', error.message);
      return errorResponse(res, 'Error retrieving form', error.message, 500);
    }
  };

  // Download user form as PDF
  static downloadUserForm = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const formData = await FormsData.findById(id)
        .populate('userId', 'name email role');

      if (!formData) {
        return errorResponse(res, 'Form not found', null, 404);
      }

      // Check if user owns this form
      if (formData.userId._id.toString() !== userId) {
        return errorResponse(res, 'Access denied', null, 403);
      }

      // Allow download for submitted/approved/completed forms
      const allowedStatuses = ['submitted', 'under_review', 'in-progress', 'cross_verified', 'verified', 'approved', 'completed'];
      if (!allowedStatuses.includes(formData.status)) {
        return errorResponse(res, 'Form must be submitted before it can be downloaded', null, 400);
      }

      // Generate PDF
      const pdfBuffer = await this.generateFormPDF(formData);

      // Log activity
      await this.logActivity('User Form Download', userId, formData._id, 'Success');

      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${formData.serviceType}-${formData._id}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      return res.send(pdfBuffer);
    } catch (error) {
      logger.error('Error downloading user form:', error);
      logger.error('Error stack:', error.stack);
      await this.logActivity('User Form Download Error', req.user.id, req.params.id, 'Failure', error.message);
      return errorResponse(res, 'Error downloading form', error.message || 'Unknown error occurred', 500);
    }
  };

  // Generate PDF from form data
  static generateFormPDF = async (formData) => {
    try {
      // Fetch original form if formId exists (before creating PDF)
      if (formData.formId && formData.serviceType) {
        try {
          const modelMap = {
            'will-deed': (await import('../models/WillDeed.js')).default,
            'sale-deed': (await import('../models/SaleDeed.js')).default,
            'trust-deed': (await import('../models/TrustDeed.js')).default,
            'power-of-attorney': (await import('../models/PowerOfAttorney.js')).default,
            'adoption-deed': (await import('../models/AdoptionDeed.js')).default,
            'property-registration': (await import('../models/PropertyRegistration.js')).default,
            'property-sale-certificate': (await import('../models/PropertySaleCertificate.js')).default
          };

          const Model = modelMap[formData.serviceType];
          if (Model) {
            const originalFormData = await Model.findById(formData.formId);
            if (originalFormData) {
              // Merge original form data into FormsData
              const originalData = originalFormData.toObject();
              // Remove MongoDB internal fields
              delete originalData._id;
              delete originalData.__v;
              delete originalData.createdAt;
              delete originalData.updatedAt;
              // Merge into formData.data
              if (!formData.data) formData.data = {};
              Object.assign(formData.data, originalData);
            }
          }
        } catch (error) {
          logger.warn('Error fetching original form data for PDF:', error);
        }
      }

      // Import PDFDocument dynamically for ES modules
      const PDFDocument = (await import('pdfkit')).default;
      const doc = new PDFDocument({ 
        size: 'A4', 
        margin: 50,
        info: {
          Title: `${formData.serviceType?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Form`,
          Author: formData.userId?.name || 'User',
          Subject: 'Form Submission',
          Creator: 'Property Registration System'
        }
      });
      
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      
      return new Promise((resolve, reject) => {
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        doc.on('error', reject);

        // Helper function to format field names
        const formatFieldName = (key) => {
          return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/[_-]/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .trim();
        };

        // Helper function to format value
        const formatValue = (value) => {
          if (value === null || value === undefined) return 'N/A';
          if (typeof value === 'boolean') return value ? 'Yes' : 'No';
          if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
            return JSON.stringify(value, null, 2);
          }
          if (Array.isArray(value)) {
            return value.join(', ');
          }
          return String(value);
        };

        // Helper function to add section
        const addSection = (title, yPos) => {
          if (yPos > 750) {
            doc.addPage();
            yPos = 50;
          }
          doc.fontSize(14).font('Helvetica-Bold').text(title, 50, yPos);
          yPos += 20;
          doc.moveTo(50, yPos).lineTo(545, yPos).stroke();
          yPos += 15;
          doc.font('Helvetica').fontSize(10);
          return yPos;
        };

        let yPos = 50;

        // Header
        doc.fontSize(20).font('Helvetica-Bold').text(
          formData.serviceType?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) + ' Form',
          50, yPos, { align: 'center' }
        );
        yPos += 30;

        // Form Information Section
        yPos = addSection('Form Information', yPos);
        doc.text(`Form ID: ${formData._id}`, 60, yPos);
        yPos += 15;
        doc.text(`Service Type: ${formData.serviceType?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`, 60, yPos);
        yPos += 15;
        doc.text(`Status: ${formData.status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`, 60, yPos);
        yPos += 15;
        doc.text(`Submitted By: ${formData.userId?.name || 'N/A'}`, 60, yPos);
        yPos += 15;
        doc.text(`Email: ${formData.userId?.email || 'N/A'}`, 60, yPos);
        yPos += 15;
        doc.text(`Submitted At: ${new Date(formData.submittedAt || formData.createdAt).toLocaleString()}`, 60, yPos);
        yPos += 20;

        // Get complete form data (priority: data > fields > rawFormData)
        // Start with FormsData fields
        let formFields = {};
        if (formData.data && Object.keys(formData.data).length > 0) {
          formFields = { ...formData.data };
        } else if (formData.fields && Object.keys(formData.fields).length > 0) {
          formFields = { ...formData.fields };
        } else if (formData.rawFormData && Object.keys(formData.rawFormData).length > 0) {
          formFields = { ...formData.rawFormData };
        }

        // Form Data Section
        if (Object.keys(formFields).length > 0) {
          yPos = addSection('Form Data', yPos);
          
          // Filter out internal fields
          const excludeFields = ['_id', '__v', 'createdAt', 'updatedAt', 'formId', 'serviceType', 'status'];
          
          let fieldCount = 0;
          for (const [key, value] of Object.entries(formFields)) {
            if (excludeFields.includes(key)) continue;
            if (value === null || value === undefined || value === '') continue;
            
            fieldCount++;
            const fieldName = formatFieldName(key);
            const fieldValue = formatValue(value);
            
            // Check if we need a new page
            if (yPos > 750) {
              doc.addPage();
              yPos = 50;
            }
            
            // Handle long values
            const maxWidth = 495;
            const labelWidth = 180;
            
            doc.font('Helvetica-Bold').fontSize(9).text(`${fieldName}:`, 60, yPos, { width: labelWidth });
            doc.font('Helvetica').fontSize(9);
            
            // Calculate text height before rendering
            const textHeight = doc.heightOfString(fieldValue, { width: maxWidth });
            
            if (textHeight > 300) {
              // Very long value, truncate
              const truncated = fieldValue.substring(0, 500) + '... (truncated)';
              doc.text(truncated, 200, yPos, { width: maxWidth, continued: false });
              yPos += 40;
            } else {
              doc.text(fieldValue, 200, yPos, { width: maxWidth, continued: false });
              yPos += Math.max(textHeight / 9, 14); // Approximate line height
            }
            
            yPos += 5;
            
            // Limit to prevent PDF from being too large
            if (fieldCount > 100) {
              doc.font('Helvetica-Italic').fontSize(9).text('... (Additional fields omitted for brevity)', 200, yPos);
              yPos += 15;
              break;
            }
          }
        }

        // Payment Information (if available)
        if (formData.paymentInfo) {
          yPos = addSection('Payment Information', yPos);
          if (formData.paymentInfo.paymentAmount) {
            doc.text(`Payment Amount: ₹${formData.paymentInfo.paymentAmount.toLocaleString('en-IN')}`, 60, yPos);
            yPos += 15;
          }
          if (formData.paymentInfo.calculations) {
            if (formData.paymentInfo.calculations.stampDuty) {
              doc.text(`Stamp Duty: ₹${formData.paymentInfo.calculations.stampDuty.toLocaleString('en-IN')}`, 60, yPos);
              yPos += 15;
            }
            if (formData.paymentInfo.calculations.registrationCharge) {
              doc.text(`Registration Charge: ₹${formData.paymentInfo.calculations.registrationCharge.toLocaleString('en-IN')}`, 60, yPos);
              yPos += 15;
            }
          }
          if (formData.paymentInfo.paymentDate) {
            doc.text(`Payment Date: ${new Date(formData.paymentInfo.paymentDate).toLocaleDateString()}`, 60, yPos);
            yPos += 15;
          }
          if (formData.paymentInfo.paymentStatus) {
            doc.text(`Payment Status: ${formData.paymentInfo.paymentStatus}`, 60, yPos);
            yPos += 15;
          }
        }

        // Add simple footer on last page
        doc.fontSize(8).fillColor('gray').text(
          `Generated on ${new Date().toLocaleString()}`,
          50,
          doc.page.height - 30,
          { align: 'center' }
        );

        // Finalize PDF
        doc.end();
      });
    } catch (error) {
      logger.error('Error generating PDF:', error);
      throw error;
    }
  };

  // Helper method to log activities
  static async logActivity(action, userId, userRole, status, details = null) {
    try {
      const auditLog = new AuditLog({
        action,
        userId,
        userRole,
        resource: 'user',
        resourceId: userId,
        resourceModel: 'User',
        success: status === 'Success',
        details,
        timestamp: new Date()
      });
      await auditLog.save();
    } catch (error) {
      logger.error('Error logging activity:', error);
    }
  }

  // Get forms ready for delivery preference selection
  static getDeliveryForms = async (req, res) => {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      // Find forms that are completed/cross-verified and ready for delivery
      const query = {
        userId: userId,
        $or: [
          { 'approvals.staff4.approved': true },
          { status: 'cross_verified' },
          { status: 'completed' }
        ],
        'delivery.status': { $in: ['pending_user_selection', 'user_selected'] }
      };

      const forms = await FormsData.find(query)
        .sort({ 'delivery.readyForDeliveryAt': -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await FormsData.countDocuments(query);

      return successResponse(res, 'Delivery forms retrieved successfully', {
        forms,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Error getting delivery forms:', error);
      return errorResponse(res, 'Error retrieving delivery forms', error.message, 500);
    }
  };

  // Set user delivery preference
  static setDeliveryPreference = async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { method, deliveryAddress, contactPhone, email } = req.body;

      if (!method || !['pickup', 'courier', 'email', 'postal'].includes(method)) {
        return errorResponse(res, 'Valid delivery method is required', null, 400);
      }

      const form = await FormsData.findById(id);
      if (!form) {
        return errorResponse(res, 'Form not found', null, 404);
      }

      // Check if user owns this form
      if (form.userId.toString() !== userId) {
        return errorResponse(res, 'Access denied', null, 403);
      }

      // Check if form is ready for delivery
      if (!form.delivery || !['pending_user_selection', 'user_selected'].includes(form.delivery.status)) {
        return errorResponse(res, 'Form is not ready for delivery preference selection', null, 400);
      }

      // Update delivery preference
      form.delivery = form.delivery || {};
      form.delivery.userPreference = {
        method,
        selectedAt: new Date(),
        deliveryAddress: deliveryAddress || null,
        contactPhone: contactPhone || null,
        email: email || null
      };
      form.delivery.finalMethod = method;
      form.delivery.status = 'user_selected';

      // If readyForDeliveryAt is not set, set it now
      if (!form.delivery.readyForDeliveryAt) {
        form.delivery.readyForDeliveryAt = new Date();
      }

      await form.save();

      await this.logActivity('Delivery Preference Set', userId, req.user.role, 'Success', `Method: ${method}`);

      return successResponse(res, 'Delivery preference set successfully', { form });
    } catch (error) {
      logger.error('Error setting delivery preference:', error);
      return errorResponse(res, 'Error setting delivery preference', error.message, 500);
    }
  };
}

export default UserController;