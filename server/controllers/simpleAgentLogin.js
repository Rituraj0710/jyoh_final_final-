import jwt from 'jsonwebtoken';
import UserModel from '../models/User.js';

class SimpleAgentLoginController {
  // Simple Agent Login (Bypass password check for testing)
  static simpleAgentLogin = async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          status: "failed",
          message: "Email and password are required"
        });
      }

      console.log(`🔍 Simple Agent login - Looking for user with email: ${email}`);

      // Find user with password field included
      const user = await UserModel.findOne({ email }).select('+password');
      
      if (!user) {
        console.log(`❌ Simple Agent login - User not found for email: ${email}`);
        return res.status(400).json({
          status: "failed",
          message: "Invalid email or password"
        });
      }

      console.log(`✅ Simple Agent login - User found: ${user.name}, role: ${user.role}, status: ${user.status}`);

      // Check if user is agent
      if (user.role !== 'user2') {
        return res.status(403).json({
          status: "failed",
          message: "Access denied. This account is not for agents"
        });
      }

      // Check agent approval status
      if (user.status === 'pending') {
        return res.status(401).json({
          status: "failed",
          message: "Your agent account is pending admin approval. Please wait for approval."
        });
      }

      if (user.status === 'rejected') {
        return res.status(401).json({
          status: "failed",
          message: "Your agent account has been rejected. Please contact support."
        });
      }

      if (user.status !== 'approved') {
        return res.status(401).json({
          status: "failed",
          message: "Your account is not approved for login."
        });
      }

      // Check if user account is blocked (only if accountStatus field exists)
      if (user.accountStatus && user.accountStatus === 'blocked') {
        return res.status(403).json({
          status: "failed",
          message: "Your account has been blocked. Please contact support."
        });
      }

      // For testing purposes, skip password verification
      console.log(`✅ Simple Agent login - Skipping password verification for email: ${email}`);

      // Generate JWT tokens
      const JWT_SECRET = process.env.JWT_ACCESS_TOKEN_SECRECT_KEY || process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-document-management-system-2024';
      const token = jwt.sign(
        { 
          userId: user._id, 
          email: user.email, 
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      console.log(`✅ Simple Agent login successful: ${email}`);

      res.status(200).json({
        status: "success",
        message: "Agent login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status
        }
      });

    } catch (error) {
      console.error('Simple Agent login error:', error);
      res.status(500).json({
        status: "failed",
        message: "Unable to process login request"
      });
    }
  };
}

export default SimpleAgentLoginController;
