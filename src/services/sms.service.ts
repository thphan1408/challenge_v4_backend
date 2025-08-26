import { ENV } from '@/configs/env.config';
import twilio from 'twilio';

export class SmsService {
  private client: twilio.Twilio | null = null;
  private isDev: boolean;

  constructor() {
    this.isDev = process.env.NODE_ENV === 'development';

    if (this.isDev) {
      return;
    }

    // Chỉ khởi tạo Twilio trong production
    if (ENV.TWILIO_ACCOUNT_SID && ENV.TWILIO_AUTH_TOKEN) {
      this.client = twilio(ENV.TWILIO_ACCOUNT_SID, ENV.TWILIO_AUTH_TOKEN);
    }
  }

  async sendSms(to: string, message: string) {
    // ✅ MOCK MODE - Không gửi SMS thật
    if (this.isDev) {
      console.log('📱═══════════════════════════════════════');
      console.log('📱 MOCK SMS (Development Mode)');
      console.log('📱 To:', to);
      console.log('📱 Message:', message);
      console.log('📱 Status: Successfully delivered (MOCK)');
      console.log('📱═══════════════════════════════════════');

      // Trả về mock response giống Twilio
      return {
        sid: `SM_MOCK_${Date.now()}`,
        status: 'delivered',
        to: to,
        from: ENV.TWILIO_PHONE_NUMBER || '+1234567890',
        body: message,
      };
    }

    // Production code (sẽ không chạy trong dev)
    if (!this.client) {
      throw new Error('Twilio client not initialized');
    }

    return await this.client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
  }

  async sendVerificationCode(to: string, code: string) {
    const message = `Your verification code is: ${code}. Valid for 5 minutes.`;
    return this.sendSms(to, message);
  }
}
