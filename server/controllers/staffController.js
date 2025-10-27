import UserModel from "../models/User.js";
import bcrypt from "bcrypt";
import sendEmailVerificationOTP from "../utils/sendEmailVerificationOTP.js";
import EmailVerificationModel from "../models/EmailVerification.js";
import generateTokens from "../utils/generateTokens.js";
import setTokenCookies from "../utils/setTokenCookies.js";
import refreshAccessToken from "../utils/refreshAccessToken.js";
import userRefreshTokenModel from "../models/UserRefreshToken.js";
import jwt from "jsonwebtoken"
import transporter from "../config/emailConfig.js"; 


class StaffController {
  // Staff Login
  static staffLogin = async (req, res) => {
    try {
      const {email, password} = req.body;
      
      // Check is email and password are provided
      if(!email || !password) {
        return res.status(400).json({status:"failed", message: "Email and password are required"});
      }
      
      // Find user by email and include password hash for comparison
      const user = await UserModel.findOne({ email: email.toLowerCase?.() || email }).select('+password');

      // Check if user exists
      if(!user){
        return res.status(400).json({status:"failed", message:"Invalid email or password"});
      }

      // Check if user is a staff member (staff1, staff2, staff3, staff4, staff5) or admin
      const staffRoles = ['staff1', 'staff2', 'staff3', 'staff4', 'staff5', 'admin'];
      if(!staffRoles.includes(user.role)){
        return res.status(403).json({status: "failed", message: "Access denied. Not a staff member"})
      }
      
      // Check if user is active
      if(!user.isActive) {
        return res.status(401).json({status: "failed", message: "Your account is deactivated. Please contact administrator."})
      }

      // Compare password / Check Password
      const isMatch = await user.comparePassword(password);
      if(!isMatch){
        return res.status(401).json({status:"failed", message:"Invalid email or password"}); 
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate tokens
      const {accessToken, refreshToken, accessTokenExp, refreshTokenExp} = await generateTokens(user);

      // Set Cookies
      setTokenCookies(res, accessToken, refreshToken, accessTokenExp, refreshTokenExp, user.role)

      // Send Success Response with Tokens
      res.status(200).json({
        user: {id: user._id, email: user.email, name: user.name, role: user.role, department: user.department, employeeId: user.employeeId},
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
  static staffProfile = async(req,res) => {
    res.send({"user": req.user})
  }

  // Change Password
  static changeStaffPassword = async (req,res) =>{
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
  static sendStaffPasswordResetEmail = async (req, res) =>{
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

      // Check if user is a staff member
      const staffRoles = ['staff1', 'staff2', 'staff3', 'staff4', 'staff5'];
      if(!staffRoles.includes(user.role)){
        return res.status(403).json({status:"failed", message:"Access denied. Not a staff member."});
      }

      // Generate token for password reset
      const secret = user._id + process.env.JWT_ACCESS_TOKEN_SECRECT_KEY;
      const token = jwt.sign({userId: user._id}, secret, {expiresIn: '15m'});
      // Reset Link
      const resetLink = `${process.env.FRONTEND_HOST}/account/staff-reset-password-confirm/${user._id}/${token}`;
      console.log("ResetLink->", resetLink);

      // Send password reset email
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "Password Reset Link - Staff Portal",
        html: `<p>Hello ${user.name},</p>
        <p>Please <a href='${resetLink}'>click here</a> to reset your password.</p>
        <p>This link will expire in 15 minutes.</p>`,
      });

      // send success response
      res.status(200).json({status:"success", message:"Password reset email sent. Please check your email."})

    } catch (error) {
      console.error(error);
      res.status(500).json({status: "failed", message: "Unable to send password reset email. Please try again later."});
    }
  }

  // Password Reset
  static staffPasswordReset = async (req,res) =>{
    try {
      const {password, password_confirmation} = req.body;
      const {id, token} = req.params;
      
      // Find user by ID
      const user = await UserModel.findById(id);
      console.log("user for password reset:", user);
      if(!user){
        return res.status(400).json({status: "failed", message:"User not found."});
      }

      // Check if user is a staff member
      const staffRoles = ['staff1', 'staff2', 'staff3', 'staff4', 'staff5'];
      if(!staffRoles.includes(user.role)){
        return res.status(403).json({status: "failed", message:"Access denied. Not a staff member."});
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
  static staffLogout = async (req,res) =>{
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

  // Get staff list
  static getStaffList = async (req, res) => {
    try {
      const staff = await User.find({ role: { $in: ['staff1', 'staff2', 'staff3', 'staff4', 'staff5'] } })
        .select('-password')
        .sort({ createdAt: -1 });

      res.status(200).json({
        status: "success",
        message: "Staff list retrieved successfully",
        data: staff
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "failed",
        message: "Unable to retrieve staff list"
      });
    }
  }
}

export default StaffController;
