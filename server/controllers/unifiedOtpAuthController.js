import UserModel from "../models/User.js";
import EmailVerification from "../models/EmailVerification.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../config/emailConfig.js";
import logger from "../config/logger.js";
import mongoose from "mongoose";

class UnifiedOtpAuthController {
  // Generate OTP
  static generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Generate unique session ID
  static generateUniqueId = () => {
    return mongoose.Types.ObjectId().toString();
  };

  // Send OTP via email
  static sendOTPEmail = async (email, otp, userType) => {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: `OTP for ${userType} Login - Document Management System`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
              <h2 style="color: #333; text-align: center; margin-bottom: 20px;">🔐 Login Verification</h2>
              <p style="color: #666; font-size: 16px;">Your OTP for ${userType} login is:</p>
              <div style="background-color: #007bff; color: white; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
                <h1 style="font-size: 36px; margin: 0; letter-spacing: 5px;">${otp}</h1>
              </div>
              <p style="color: #666; font-size: 14px;">This OTP is valid for <strong>10 minutes</strong>.</p>
              <p style="color: #dc3545; font-size: 14px;">⚠️ If you didn't request this OTP, please ignore this email.</p>
            </div>
            <div style="text-align: center; color: #666; font-size: 12px;">
              <p>Document Management System</p>
              <p>This is an automated message, please do not reply.</p>
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      logger.info(`OTP email sent successfully to: ${email}`);
      return true;
    } catch (error) {
      logger.error(`Error sending OTP email to ${email}:`, error);
      return false;
    }
  };

  // Send OTP via SMS (placeholder - would need SMS service integration)
  static sendOTPSMS = async (mobileNumber, otp, userType) => {
    try {
      // This would integrate with SMS service like Twilio, AWS SNS, etc.
      logger.info(`SMS OTP sent to ${mobileNumber}: ${otp}`);
      console.log(`📱 SMS OTP for ${userType}: ${otp} sent to ${mobileNumber}`);
      return true;
    } catch (error) {
      logger.error(`Error sending SMS OTP to ${mobileNumber}:`, error);
      return false;
    }
  };

  // Step 1: Send OTP (supports both email and mobile)
  static sendOTP = async (req, res) => {
    try {
      const { email, mobileNumber, userType = 'user' } = req.body;

      // Validate input
      if (!email && !mobileNumber) {
        return res.status(400).json({
          status: "failed",
          message: "Either email or mobile number is required"
        });
      }

      // Validate email format if provided
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({
            status: "failed",
            message: "Please provide a valid email address"
          });
        }
      }

      // Validate mobile number format if provided
      if (mobileNumber) {
        const mobileRegex = /^[6-9]\d{9}$/;
        if (!mobileRegex.test(mobileNumber)) {
          return res.status(400).json({
            status: "failed",
            message: "Please provide a valid 10-digit mobile number"
          });
        }
      }

      // Generate OTP
      const otp = UnifiedOtpAuthController.generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Check if user exists (for existing users)
      let user = null;
      if (email) {
        user = await UserModel.findOne({ email });
      } else if (mobileNumber) {
        user = await UserModel.findOne({ phone: mobileNumber });
      }

      // If user doesn't exist, create a temporary user record
      if (!user) {
        const uniqueId = UnifiedOtpAuthController.generateUniqueId();
        user = new UserModel({
          name: email ? email.split('@')[0] : `User_${mobileNumber}`,
          email: email || `${mobileNumber}@temp.com`,
          phone: mobileNumber || null,
          password: 'temp_password', // Will be set properly after OTP verification
          role: userType === 'agent' ? 'user2' : 'user1',
          is_verified: false,
          isActive: true,
          status: userType === 'agent' ? 'pending' : 'approved',
          uniqueId: uniqueId
        });
        await user.save();
        logger.info(`Temporary user created for OTP verification: ${email || mobileNumber}`);
      }

      // Store OTP in EmailVerification collection
      await EmailVerification.findOneAndUpdate(
        { userId: user._id },
        {
          userId: user._id,
          otp: otp,
          createdAt: new Date()
        },
        { upsert: true, new: true }
      );

      // Send OTP via email or SMS
      let otpSent = false;
      if (email) {
        otpSent = await UnifiedOtpAuthController.sendOTPEmail(email, otp, userType);
      } else if (mobileNumber) {
        otpSent = await UnifiedOtpAuthController.sendOTPSMS(mobileNumber, otp, userType);
      }

      if (!otpSent) {
        return res.status(500).json({
          status: "failed",
          message: "Failed to send OTP. Please try again later"
        });
      }

      logger.info(`OTP sent successfully to: ${email || mobileNumber}`, {
        userId: user._id,
        userType,
        method: email ? 'email' : 'sms'
      });

      res.status(200).json({
        status: "success",
        message: `OTP sent to your ${email ? 'email' : 'mobile number'}`,
        data: {
          userId: user._id,
          email: email || null,
          mobileNumber: mobileNumber || null,
          userType,
          method: email ? 'email' : 'sms',
          expiresIn: '10 minutes'
        }
      });

    } catch (error) {
      logger.error(`Error in sendOTP: ${error.message}`, { error, req: req.body });
      res.status(500).json({
        status: "failed",
        message: "Unable to send OTP. Please try again later"
      });
    }
  };

  // Step 2: Verify OTP and complete authentication
  static verifyOTP = async (req, res) => {
    try {
      const { email, mobileNumber, otp, userType = 'user' } = req.body;

      // Validate input
      if (!otp) {
        return res.status(400).json({
          status: "failed",
          message: "OTP is required"
        });
      }

      if (!email && !mobileNumber) {
        return res.status(400).json({
          status: "failed",
          message: "Either email or mobile number is required"
        });
      }

      // Find user
      let user = null;
      if (email) {
        user = await UserModel.findOne({ email });
      } else if (mobileNumber) {
        user = await UserModel.findOne({ phone: mobileNumber });
      }

      if (!user) {
        return res.status(400).json({
          status: "failed",
          message: "User not found. Please request OTP again"
        });
      }

      // Find OTP verification record
      const otpRecord = await EmailVerification.findOne({ userId: user._id });
      if (!otpRecord) {
        return res.status(400).json({
          status: "failed",
          message: "No OTP found. Please request a new OTP"
        });
      }

      // Check if OTP is expired (15 minutes TTL)
      const now = new Date();
      const otpAge = now - otpRecord.createdAt;
      if (otpAge > 15 * 60 * 1000) { // 15 minutes in milliseconds
        await EmailVerification.findByIdAndDelete(otpRecord._id);
        return res.status(400).json({
          status: "failed",
          message: "OTP has expired. Please request a new one"
        });
      }

      // Verify OTP
      if (otpRecord.otp !== otp) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid OTP. Please check and try again"
        });
      }

      // Clear OTP record
      await EmailVerification.findByIdAndDelete(otpRecord._id);

      // Update user verification status
      user.is_verified = true;
      user.lastLogin = new Date();
      
      // If this is a new user, set proper password
      if (user.password === 'temp_password') {
        const defaultPassword = 'password123';
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(defaultPassword, salt);
      }

      await user.save();

      // Generate JWT token
      const JWT_SECRET = process.env.JWT_ACCESS_TOKEN_SECRECT_KEY || process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-document-management-system-2024';
      const token = jwt.sign(
        { 
          userId: user._id, 
          email: user.email, 
          role: user.role,
          name: user.name,
          uniqueId: user.uniqueId
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      logger.info(`OTP verified successfully for: ${email || mobileNumber}`, {
        userId: user._id,
        userType,
        method: email ? 'email' : 'sms'
      });

      res.status(200).json({
        status: "success",
        message: "OTP verified successfully. Login completed!",
        data: {
          token: token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            uniqueId: user.uniqueId,
            isVerified: user.is_verified,
            lastLogin: user.lastLogin
          },
          redirectTo: user.role === 'admin' ? '/admin/dashboard' : 
                     user.role.startsWith('staff') ? `/${user.role}/dashboard` :
                     user.role === 'user2' ? '/agent/dashboard' : '/user/dashboard'
        }
      });

    } catch (error) {
      logger.error(`Error verifying OTP: ${error.message}`, { error, req: req.body });
      res.status(500).json({
        status: "failed",
        message: "Unable to verify OTP. Please try again later"
      });
    }
  };

  // Resend OTP
  static resendOTP = async (req, res) => {
    try {
      const { email, mobileNumber, userType = 'user' } = req.body;

      if (!email && !mobileNumber) {
        return res.status(400).json({
          status: "failed",
          message: "Either email or mobile number is required"
        });
      }

      // Find user
      let user = null;
      if (email) {
        user = await UserModel.findOne({ email });
      } else if (mobileNumber) {
        user = await UserModel.findOne({ phone: mobileNumber });
      }

      if (!user) {
        return res.status(400).json({
          status: "failed",
          message: "User not found. Please sign up first"
        });
      }

      // Generate new OTP
      const otp = UnifiedOtpAuthController.generateOTP();

      // Update OTP record
      await EmailVerification.findOneAndUpdate(
        { userId: user._id },
        {
          userId: user._id,
          otp: otp,
          createdAt: new Date()
        },
        { upsert: true, new: true }
      );

      // Send OTP
      let otpSent = false;
      if (email) {
        otpSent = await UnifiedOtpAuthController.sendOTPEmail(email, otp, userType);
      } else if (mobileNumber) {
        otpSent = await UnifiedOtpAuthController.sendOTPSMS(mobileNumber, otp, userType);
      }

      if (!otpSent) {
        return res.status(500).json({
          status: "failed",
          message: "Failed to resend OTP. Please try again later"
        });
      }

      logger.info(`OTP resent successfully to: ${email || mobileNumber}`, {
        userId: user._id,
        userType
      });

      res.status(200).json({
        status: "success",
        message: `OTP resent to your ${email ? 'email' : 'mobile number'}`,
        data: {
          userId: user._id,
          email: email || null,
          mobileNumber: mobileNumber || null,
          userType,
          expiresIn: '10 minutes'
        }
      });

    } catch (error) {
      logger.error(`Error resending OTP: ${error.message}`, { error, req: req.body });
      res.status(500).json({
        status: "failed",
        message: "Unable to resend OTP. Please try again later"
      });
    }
  };

  // Get user profile after OTP verification
  static getProfile = async (req, res) => {
    try {
      const userId = req.user.userId;
      
      const user = await UserModel.findById(userId).select('-password -otp -otpExpiry');
      if (!user) {
        return res.status(404).json({
          status: "failed",
          message: "User not found"
        });
      }

      res.status(200).json({
        status: "success",
        message: "Profile retrieved successfully",
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            uniqueId: user.uniqueId,
            isVerified: user.is_verified,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt
          }
        }
      });

    } catch (error) {
      logger.error(`Error getting profile: ${error.message}`, { error, userId: req.user?.userId });
      res.status(500).json({
        status: "failed",
        message: "Unable to retrieve profile"
      });
    }
  };
}

export default UnifiedOtpAuthController;
