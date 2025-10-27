import transporter from "../config/emailConfig.js";
import logger from "../config/logger.js";

class DemoOtpAuthController {
  // In-memory storage for demo purposes
  static otpStorage = new Map();
  static userStorage = new Map();

  // Generate OTP
  static generateOTP = () => {
    // For demo purposes, use a fixed OTP for testing
    return '123456';
    // return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Generate unique session ID
  static generateUniqueId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  // Send OTP via email
  static sendOTPEmail = async (email, otp, userType) => {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: `🔐 OTP for ${userType} Login - Document Management System`,
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
      // For demo purposes, still return true even if email fails
      console.log(`📧 Demo: OTP ${otp} would be sent to ${email}`);
      return true;
    }
  };

  // Send OTP via SMS (demo)
  static sendOTPSMS = async (mobileNumber, otp, userType) => {
    try {
      // Demo SMS - just log to console
      console.log(`📱 Demo SMS OTP for ${userType}: ${otp} sent to ${mobileNumber}`);
      logger.info(`Demo SMS OTP sent to ${mobileNumber}: ${otp}`);
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
      const otp = DemoOtpAuthController.generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      const uniqueId = DemoOtpAuthController.generateUniqueId();

      // Create or get user from demo storage
      const userKey = email || mobileNumber;
      let user = DemoOtpAuthController.userStorage.get(userKey);
      
      if (!user) {
        user = {
          id: uniqueId,
          name: email ? email.split('@')[0] : `User_${mobileNumber}`,
          email: email || `${mobileNumber}@temp.com`,
          phone: mobileNumber || null,
          role: userType === 'agent' ? 'user2' : 'user1',
          uniqueId: uniqueId,
          isVerified: false,
          createdAt: new Date()
        };
        DemoOtpAuthController.userStorage.set(userKey, user);
      }

      // Store OTP in demo storage
      DemoOtpAuthController.otpStorage.set(userKey, {
        otp: otp,
        expiry: otpExpiry,
        userId: user.id,
        userType: userType
      });

      // Send OTP via email or SMS
      let otpSent = false;
      if (email) {
        otpSent = await DemoOtpAuthController.sendOTPEmail(email, otp, userType);
      } else if (mobileNumber) {
        otpSent = await DemoOtpAuthController.sendOTPSMS(mobileNumber, otp, userType);
      }

      if (!otpSent) {
        return res.status(500).json({
          status: "failed",
          message: "Failed to send OTP. Please try again later"
        });
      }

      logger.info(`OTP sent successfully to: ${email || mobileNumber}`, {
        userId: user.id,
        userType,
        method: email ? 'email' : 'sms'
      });

      res.status(200).json({
        status: "success",
        message: `OTP sent to your ${email ? 'email' : 'mobile number'}`,
        data: {
          userId: user.id,
          email: email || null,
          mobileNumber: mobileNumber || null,
          userType,
          method: email ? 'email' : 'sms',
          expiresIn: '10 minutes',
          demoMode: true
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

      const userKey = email || mobileNumber;

      // Find user in demo storage
      const user = DemoOtpAuthController.userStorage.get(userKey);
      if (!user) {
        return res.status(400).json({
          status: "failed",
          message: "User not found. Please request OTP again"
        });
      }

      // Find OTP in demo storage
      const otpRecord = DemoOtpAuthController.otpStorage.get(userKey);
      if (!otpRecord) {
        return res.status(400).json({
          status: "failed",
          message: "No OTP found. Please request a new OTP"
        });
      }

      // Check if OTP is expired
      if (otpRecord.expiry < new Date()) {
        DemoOtpAuthController.otpStorage.delete(userKey);
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
      DemoOtpAuthController.otpStorage.delete(userKey);

      // Update user verification status
      user.isVerified = true;
      user.lastLogin = new Date();

      // Generate JWT token (demo)
      const token = `demo_token_${user.id}_${Date.now()}`;

      logger.info(`OTP verified successfully for: ${email || mobileNumber}`, {
        userId: user.id,
        userType,
        method: email ? 'email' : 'sms'
      });

      res.status(200).json({
        status: "success",
        message: "OTP verified successfully. Login completed!",
        data: {
          token: token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            uniqueId: user.uniqueId,
            isVerified: user.isVerified,
            lastLogin: user.lastLogin
          },
          redirectTo: user.role === 'admin' ? '/admin/dashboard' : 
                     user.role.startsWith('staff') ? `/${user.role}/dashboard` :
                     user.role === 'user2' ? '/agent/dashboard' : '/user/dashboard',
          demoMode: true
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

      const userKey = email || mobileNumber;

      // Find user in demo storage
      const user = DemoOtpAuthController.userStorage.get(userKey);
      if (!user) {
        return res.status(400).json({
          status: "failed",
          message: "User not found. Please sign up first"
        });
      }

      // Generate new OTP
      const otp = DemoOtpAuthController.generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Update OTP record
      DemoOtpAuthController.otpStorage.set(userKey, {
        otp: otp,
        expiry: otpExpiry,
        userId: user.id,
        userType: userType
      });

      // Send OTP
      let otpSent = false;
      if (email) {
        otpSent = await DemoOtpAuthController.sendOTPEmail(email, otp, userType);
      } else if (mobileNumber) {
        otpSent = await DemoOtpAuthController.sendOTPSMS(mobileNumber, otp, userType);
      }

      if (!otpSent) {
        return res.status(500).json({
          status: "failed",
          message: "Failed to resend OTP. Please try again later"
        });
      }

      logger.info(`OTP resent successfully to: ${email || mobileNumber}`, {
        userId: user.id,
        userType
      });

      res.status(200).json({
        status: "success",
        message: `OTP resent to your ${email ? 'email' : 'mobile number'}`,
        data: {
          userId: user.id,
          email: email || null,
          mobileNumber: mobileNumber || null,
          userType,
          expiresIn: '10 minutes',
          demoMode: true
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
}

export default DemoOtpAuthController;
