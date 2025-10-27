import transporter from "../config/emailConfig.js"
import EmailVerificationModel from "../models/EmailVerification.js"; 

const sendEmailVerificationOTP = async (req, user) => {

  try {
    // Ensure the user object has an _id and email
  if (!user || !user._id || !user.email) {
    throw new Error("Invalid user details provided.");
  }

  // Generate a random 4-digit number and store as string to match schema
  const otp = String(Math.floor(1000 + Math.random() * 9000));

  // Remove any existing OTPs for this user to ensure only one active OTP
  await EmailVerificationModel.deleteMany({ userId: user._id });
  // Save OTP in Database
  const newOtp = new EmailVerificationModel({userId: user._id, otp})
  await newOtp.save();
  console.log("OTP saved successfully:", { otp, userId: user._id }); // Debugging log

  // OTP Verification Link
  const otpVerificationLink = `${process.env.FRONTEND_HOST}/account/verify-email`;

  // Send email with OTP
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: "OTP - Verify your account",
    html: `<p>Dear ${user.name},</p><p>Thankyou for signing up with our website. To complete your registration, please verify your email address by entering the following one-time password (OTP): ${otpVerificationLink} </p>
    <h2>OTP: ${otp}</h2>
    <p>This OTP is valid for 15 minutes. If you didn't request this OTP, please ignore this email.</p>`,
  })
  console.log("OTP email sent successfully to:", user.email);

  return otp; // Return OTP for further validation if necessary
  
  } catch (error) {
    console.error("Error in sendEmailVerificationOTP:", error.message);
    throw error; // Propagate the error to handle it upstream
  }
}

export default sendEmailVerificationOTP;