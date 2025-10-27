import mongoose from "mongoose";

// Defining Schema
const emailVerificationSchema = new mongoose.Schema({
  email: {type: String, required: true},
  userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  otp: {type: String, required: true},
  otpExpiry: {type: Date, required: true},
  userType: {type: String, required: true},
  // TTL index to expire documents after 15 minutes
  // Mongo expects seconds for TTL values
  createdAt: {type: Date, default: Date.now, expires: 60 * 15},
});

// Model
const EmailVerificationModel = mongoose.model("EmailVerification", emailVerificationSchema);

export default EmailVerificationModel;

