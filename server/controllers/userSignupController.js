import bcrypt from 'bcrypt';
import User from '../models/User.js';
import EmailVerification from '../models/EmailVerification.js';
import sendSignupEmail from '../utils/sendSignupEmail.js';
import logger from '../config/logger.js';

class UserSignupController {
  /**
   * Create new user account
   */
  static signup = async (req, res) => {
    try {
      const { name, email, password, contact } = req.body;

      // Validate required fields
      if (!name || !email || !password) {
        return res.status(400).json({
          status: "failed",
          message: "Name, email, and password are required"
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          status: "failed",
          message: "Please provide a valid email address"
        });
      }

      // Validate password strength
      if (password.length < 6) {
        return res.status(400).json({
          status: "failed",
          message: "Password must be at least 6 characters long"
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(409).json({
          status: "failed",
          message: "User with this email already exists"
        });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create new user
      const newUser = new User({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: contact.trim(), // Map contact to phone field
        password: hashedPassword,
        role: 'user1', // Default role for normal users
        is_verified: false, // Will be verified via email
        isActive: true
      });

      await newUser.save();

      // Generate email verification OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Store OTP in user document for verification
      newUser.otp = otp;
      newUser.otpExpiry = otpExpiry;
      await newUser.save();

      // Save OTP to EmailVerification collection for additional tracking
      await EmailVerification.findOneAndUpdate(
        { email: email.toLowerCase() },
        {
          email: email.toLowerCase(),
          otp: otp,
          otpExpiry: otpExpiry,
          userType: 'user',
          userId: newUser._id
        },
        { upsert: true, new: true }
      );

      // Send verification email
      try {
        await sendSignupEmail(email, otp, newUser.name);
        
        logger.info(`Verification email sent to: ${email}`, {
          userId: newUser._id,
          email: email
        });

      } catch (emailError) {
        logger.error(`Failed to send verification email to ${email}:`, emailError);
        
        // Still return success but indicate email issue
        return res.status(201).json({
          status: "success",
          message: "Account created but failed to send verification email. Please contact support.",
          data: {
            userId: newUser._id,
            email: newUser.email,
            name: newUser.name,
            isVerified: false,
            requiresOTP: true,
            emailError: process.env.NODE_ENV === 'development' ? emailError.message : 'Email service unavailable'
          }
        });
      }
      
      logger.info(`User signup successful: ${email}`, {
        userId: newUser._id,
        email: email,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json({
        status: "success",
        message: "User account created successfully. Please check your email for verification OTP.",
        data: {
          userId: newUser._id,
          email: newUser.email,
          name: newUser.name,
          isVerified: false,
          requiresOTP: true
        }
      });

    } catch (error) {
      logger.error('User signup error:', error);
      console.error('User signup error details:', error);
      res.status(500).json({
        status: "failed",
        message: "Unable to create user account, please try again later",
        error: error.message
      });
    }
  };

  /**
   * Verify user email with OTP
   */
  static verifyEmail = async (req, res) => {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          status: "failed",
          message: "Email and OTP are required"
        });
      }

      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() });

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
          message: "Email is already verified"
        });
      }

      // Check if OTP exists and is not expired
      if (!user.otp || !user.otpExpiry || user.otpExpiry < new Date()) {
        return res.status(400).json({
          status: "failed",
          message: "OTP has expired. Please request a new one."
        });
      }

      // Verify OTP
      if (user.otp !== otp) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid OTP. Please check and try again."
        });
      }

      // Update user verification status and clear OTP
      user.is_verified = true;
      user.otp = null;
      user.otpExpiry = null;
      await user.save();

      // Remove verification record from EmailVerification collection
      await EmailVerification.findOneAndDelete({
        email: email.toLowerCase(),
        userType: 'user'
      });

      logger.info(`User email verified: ${email}`, {
        userId: user._id,
        email: email,
        ip: req.ip
      });

      res.status(200).json({
        status: "success",
        message: "Email verified successfully. You can now login."
      });

    } catch (error) {
      logger.error('Email verification error:', error);
      res.status(500).json({
        status: "failed",
        message: "Unable to verify email, please try again later"
      });
    }
  };

  /**
   * Resend verification OTP
   */
  static resendOTP = async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          status: "failed",
          message: "Email is required"
        });
      }

      // Check if user exists and is not verified
      const user = await User.findOne({ 
        email: email.toLowerCase(),
        is_verified: false 
      });

      if (!user) {
        return res.status(404).json({
          status: "failed",
          message: "User not found or already verified"
        });
      }

      // Generate new OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Update user document with new OTP
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();

      // Update verification record
      await EmailVerification.findOneAndUpdate(
        { email: email.toLowerCase(), userType: 'user' },
        {
          email: email.toLowerCase(),
          otp: otp,
          otpExpiry: otpExpiry,
          userType: 'user',
          userId: user._id
        },
        { upsert: true, new: true }
      );

      // Send verification email
      try {
        await sendSignupEmail(email, otp, user.name);
        
        logger.info(`Verification OTP resent to: ${email}`, {
          userId: user._id,
          email: email
        });

        res.status(200).json({
          status: "success",
          message: "Verification OTP sent successfully"
        });

      } catch (emailError) {
        logger.error(`Failed to resend verification email to ${email}:`, emailError);
        
        res.status(500).json({
          status: "failed",
          message: "Unable to send verification email, please try again later"
        });
      }

    } catch (error) {
      logger.error('Resend OTP error:', error);
      res.status(500).json({
        status: "failed",
        message: "Unable to resend OTP, please try again later"
      });
    }
  };
}

export default UserSignupController;
