import transporter from "../config/emailConfig.js";
import logger from "../config/logger.js";

// Email validation function
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const sendSignupEmail = async (email, otp, name) => {
  try {
    // Validate email format
    if (!isValidEmail(email)) {
      logger.error(`Invalid email format: ${email}`);
      throw new Error(`Invalid email format: ${email}`);
    }

    // Verify transporter connection before sending
    try {
      await transporter.verify();
      logger.info(`📧 SMTP connection verified`);
    } catch (verifyError) {
      logger.error(`❌ SMTP connection failed:`, {
        error: verifyError.message,
        code: verifyError.code,
        smtpHost: process.env.EMAIL_HOST,
        smtpUser: process.env.EMAIL_USER
      });
      throw new Error('SMTP server connection failed. Please check email configuration.');
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@example.com',
      to: email,
      subject: 'Email Verification - Document Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to Document Management System!</h2>
          <p>Hello ${name},</p>
          <p>Thank you for signing up! Please use the following verification code to complete your registration:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #1f2937; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't create an account, please ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    logger.info(`✅ Verification email sent successfully: ${email}`, {
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected
    });
    
    // Warn if email was rejected by SMTP server
    if (info.rejected && info.rejected.length > 0) {
      logger.warn(`⚠️ Email rejected by SMTP server: ${email}`, {
        rejected: info.rejected,
        response: info.response
      });
    }
    
    console.log(`Verification email sent to ${email}`);
    return true;
  } catch (error) {
    logger.error(`❌ Error sending verification email to ${email}:`, {
      error: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
    
    // Re-throw with more context
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

export default sendSignupEmail;
