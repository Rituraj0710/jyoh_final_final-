import bcrypt from 'bcrypt';
import User from '../models/User.js';
import EmailVerification from '../models/EmailVerification.js';
import sendSignupEmail from '../utils/sendSignupEmail.js';
import logger from '../config/logger.js';
import AuditLog from '../models/AuditLog.js';
import transporter from '../config/emailConfig.js';

class AgentSignupController {
  /**
   * Create new agent account
   */
  static signup = async (req, res) => {
    try {
      const { name, email, password, phone } = req.body;

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

      // Check if agent already exists (skip for testing)
      // const existingAgent = await User.findOne({ email: email.toLowerCase() });
      // if (existingAgent) {
      //   return res.status(409).json({
      //     status: "failed",
      //     message: "Agent with this email already exists"
      //   });
      // }

      // Create new agent (password will be hashed by pre-save hook)
      const newAgent = new User({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: password, // Let pre-save hook handle hashing
        phone: phone ? phone.trim() : undefined,
        role: 'user2', // Agent role
        status: 'pending', // Requires admin approval
        is_verified: false, // Will be verified via email
        isActive: true
      });

      try {
        await newAgent.save();
      } catch (saveError) {
        // Handle duplicate key and validation errors explicitly
        if (saveError?.code === 11000) {
          const dupField = Object.keys(saveError.keyPattern || {})[0] || 'field';
          return res.status(409).json({
            status: "failed",
            message: `An account with this ${dupField} already exists`
          });
        }
        if (saveError?.name === 'ValidationError') {
          const firstErr = Object.values(saveError.errors)[0];
          return res.status(400).json({
            status: "failed",
            message: firstErr?.message || 'Invalid data'
          });
        }
        throw saveError;
      }

      // Send notification email to agent (no OTP required)
      try {
        await this.sendAgentSignupNotification(newAgent);
        
        logger.info(`Agent signup successful: ${email}`, {
          userId: newAgent._id,
          email: email,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });

        // Log activity
        await this.logActivity('register', newAgent._id, 'user2', 'Success', {
          email: email,
          role: 'user2',
          ip: req.ip
        });

        res.status(201).json({
          status: "success",
          message: "Your signup request has been submitted. Please wait until the Admin approves your account.",
          data: {
            userId: newAgent._id,
            email: newAgent.email,
            name: newAgent.name,
            phone: newAgent.phone,
            status: 'pending',
            isVerified: false
          }
        });

      } catch (emailError) {
        logger.error(`Failed to send verification email to ${email}:`, emailError);
        
        // Still return success but mention email issue
        res.status(201).json({
          status: "success",
          message: "Agent account created successfully. Please contact support if you don't receive verification email.",
          data: {
            userId: newAgent._id,
            email: newAgent.email,
            name: newAgent.name,
            phone: newAgent.phone,
            isVerified: false
          }
        });
      }

    } catch (error) {
      logger.error('Agent signup error:', error);
      
      // Log failed registration
      await this.logActivity('register', null, 'user2', 'Failure', {
        email: req.body.email,
        error: error.message,
        ip: req.ip
      });

      res.status(500).json({
        status: "failed",
        message: error?.message || "Unable to create agent account, please try again later"
      });
    }
  };

  /**
   * Verify agent email with OTP
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

      // Find verification record
      const verification = await EmailVerification.findOne({
        email: email.toLowerCase(),
        userType: 'agent'
      });

      if (!verification) {
        return res.status(404).json({
          status: "failed",
          message: "No verification request found for this email"
        });
      }

      // Check if OTP is expired
      if (verification.otpExpiry < new Date()) {
        return res.status(400).json({
          status: "failed",
          message: "OTP has expired. Please request a new one."
        });
      }

      // Verify OTP
      if (verification.otp !== otp) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid OTP. Please check and try again."
        });
      }

      // Update agent verification status
      await User.findByIdAndUpdate(verification.userId, {
        is_verified: true
      });

      // Remove verification record
      await EmailVerification.findByIdAndDelete(verification._id);

      logger.info(`Agent email verified: ${email}`, {
        userId: verification.userId,
        email: email,
        ip: req.ip
      });

      res.status(200).json({
        status: "success",
        message: "Email verified successfully. You can now login."
      });

    } catch (error) {
      logger.error('Agent email verification error:', error);
      res.status(500).json({
        status: "failed",
        message: "Unable to verify email, please try again later"
      });
    }
  };

  /**
   * Resend verification OTP for agent
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

      // Check if agent exists and is not verified
      const agent = await User.findOne({ 
        email: email.toLowerCase(),
        role: 'user2',
        is_verified: false 
      });

      if (!agent) {
        return res.status(404).json({
          status: "failed",
          message: "Agent not found or already verified"
        });
      }

      // Generate new OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Update verification record
      await EmailVerification.findOneAndUpdate(
        { email: email.toLowerCase(), userType: 'agent' },
        {
          email: email.toLowerCase(),
          otp: otp,
          otpExpiry: otpExpiry,
          userType: 'agent',
          userId: agent._id
        },
        { upsert: true, new: true }
      );

      // Send verification email
      try {
        await sendSignupEmail(email, otp, agent.name);
        
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
      logger.error('Agent resend OTP error:', error);
      res.status(500).json({
        status: "failed",
        message: "Unable to resend OTP, please try again later"
      });
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

  // Send agent signup notification email
  static sendAgentSignupNotification = async (agent) => {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: agent.email,
        subject: "Agent Registration Submitted - Awaiting Admin Approval",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Hello ${agent.name}!</h2>
            <p>Thank you for registering as an agent with our platform.</p>
            <p>Your agent account has been submitted and is currently pending admin approval.</p>
            <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #007bff; margin: 20px 0;">
              <h3 style="color: #007bff; margin-top: 0;">What happens next?</h3>
              <ul>
                <li>Our admin team will review your application</li>
                <li>You will receive an email notification once approved</li>
                <li>Once approved, you can login and start using the platform</li>
              </ul>
            </div>
            <p>We appreciate your patience during the review process.</p>
            <p>Best regards,<br>Document Management Team</p>
          </div>
        `
      });
      console.log(`Agent signup notification sent to: ${agent.email}`);
    } catch (error) {
      console.error("Error sending agent signup notification:", error);
      throw error;
    }
  };
}

export default AgentSignupController;
