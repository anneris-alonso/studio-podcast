import nodemailer from 'nodemailer';
import { logger } from '@/lib/logger';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

export async function sendEmail(options: SendEmailOptions) {
  const { to, subject, text, html, attachments } = options;

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Dubai Podcast Studio" <no-reply@yourdomain.com>',
      to,
      subject,
      text,
      html,
      attachments,
    });

    logger.info("Email sent successfully", { messageId: info.messageId, to });
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    logger.error("Email delivery failed", { error: error.message, to });
    throw error;
  }
}
