/*
import nodemailer from 'nodemailer';
import { ENV } from './env.config';

export const emailTransporter = nodemailer.createTransporter({
  // Real SMTP config
});

export const mailOptions = {
  from: ENV.EMAIL_FROM,
};
*/

// ✅ Export mock configs để tránh import error
export const emailTransporter = {
  sendMail: async (options: any) => {
    console.log('📧 Mock email transporter called');
    return Promise.resolve({
      messageId: 'mock-message-id',
      response: 'Mock email sent',
    });
  },
};

export const mailOptions = {
  from: 'noreply@mockapp.com',
};
