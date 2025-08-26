import { ENV } from '@/configs/env.config';

export class EmailService {
  private isDev: boolean;

  constructor() {
    this.isDev = ENV.NODE_ENV === 'development';

    if (this.isDev) {
      console.log('📧 Email Service initialized in MOCK mode (no real emails)');
    } else {
      console.log('📧 Email Service initialized in production mode');
    }
  }

  sendEmail = async (to: string, subject: string, text?: string, html?: string) => {
    try {
      // ✅ MOCK MODE - Không gửi email thật
      if (this.isDev) {
        console.log('📧═══════════════════════════════════════');
        console.log('📧 MOCK EMAIL (Development Mode)');
        console.log('📧 To:', to);
        console.log('📧 Subject:', subject);
        console.log('📧 Text:', text || 'N/A');
        console.log('📧 HTML:', html || 'N/A');
        console.log('📧 Status: Successfully delivered (MOCK)');
        console.log('📧═══════════════════════════════════════');

        // Trả về mock response giống Nodemailer
        return {
          messageId: `MOCK_EMAIL_${Date.now()}@mock.local`,
          envelope: {
            from: 'noreply@yourapp.com',
            to: [to],
          },
          accepted: [to],
          rejected: [],
          pending: [],
          response: '250 Mock email accepted for delivery',
        };
      }

      // ✅ Production code (chỉ chạy khi deploy)
      /* 
      const info = await emailTransporter.sendMail({
        ...mailOptions,
        to,
        subject,
        text,
        html,
      });
      return info;
      */

      // Tạm thời return mock cho production cũng
      return {
        messageId: `PROD_MOCK_${Date.now()}@mock.local`,
        envelope: { from: 'noreply@yourapp.com', to: [to] },
        accepted: [to],
        rejected: [],
        pending: [],
        response: '250 Production mock email accepted',
      };
    } catch (error) {
      throw error;
    }
  };

  // ✅ Thêm method cho verification code qua email
  sendVerificationCode = async (to: string, code: string) => {
    const subject = 'Your Verification Code';
    const text = `Your verification code is: ${code}. Valid for 5 minutes.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Verification Code</h2>
        <p>Your verification code is:</p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; font-size: 32px; margin: 0;">${code}</h1>
        </div>
        <p>This code is valid for <strong>5 minutes</strong>.</p>
        <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
      </div>
    `;

    return this.sendEmail(to, subject, text, html);
  };
}
