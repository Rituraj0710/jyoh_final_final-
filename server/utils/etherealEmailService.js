import nodemailer from 'nodemailer';

// Ethereal Email Service for testing (no real emails sent)
class EtherealEmailService {
  constructor() {
    this.transporter = null;
    this.testAccount = null;
  }

  async createTestAccount() {
    try {
      this.testAccount = await nodemailer.createTestAccount();
      console.log('📧 Ethereal test account created:', this.testAccount.user);
      return this.testAccount;
    } catch (error) {
      console.error('❌ Failed to create Ethereal test account:', error.message);
      throw error;
    }
  }

  async getTransporter() {
    if (!this.transporter) {
      if (!this.testAccount) {
        await this.createTestAccount();
      }
      
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: this.testAccount.user,
          pass: this.testAccount.pass,
        },
      });
    }
    return this.transporter;
  }

  async sendOTPEmail(user, otp) {
    try {
      const transporter = await this.getTransporter();
      
      const mailOptions = {
        from: '"Document Management System" <noreply@ethereal.email>',
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
            <p><strong>Note:</strong> This is a test email sent via Ethereal Email. No real email was sent.</p>
            <p>Best regards,<br>Document Management Team</p>
          </div>
        `
      };

      const result = await transporter.sendMail(mailOptions);
      const previewUrl = nodemailer.getTestMessageUrl(result);
      
      console.log('📧 Test email sent via Ethereal Email');
      console.log('🔗 Preview URL:', previewUrl);
      console.log('📬 Message ID:', result.messageId);
      
      return {
        ...result,
        previewUrl,
        isTestEmail: true
      };
    } catch (error) {
      console.error('❌ Error sending test email:', error.message);
      throw error;
    }
  }

  async testConnection() {
    try {
      const transporter = await this.getTransporter();
      await transporter.verify();
      console.log('✅ Ethereal Email connection verified');
      return true;
    } catch (error) {
      console.error('❌ Ethereal Email connection failed:', error.message);
      return false;
    }
  }
}

export default new EtherealEmailService();
