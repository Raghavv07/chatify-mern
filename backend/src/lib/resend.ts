import { Resend } from 'resend';
import { EmailSender } from '../types/index.js';
import { ENV } from './env.js';

export const resendClient = new Resend(ENV.RESEND_API_KEY);

export const sender: EmailSender = {
  email: ENV.EMAIL_FROM,
  name: ENV.EMAIL_FROM_NAME,
};

