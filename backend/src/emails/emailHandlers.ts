import { createWelcomeEmailTemplate } from '../emails/emailTemplates.js';
import { ENV } from '../lib/env.js';
import { resendClient, sender } from '../lib/resend.js';

export const sendWelcomeEmail = async (
  email: string,
  name: string,
  clientURL: string
): Promise<void> => {
  // Skip email in development (Resend free tier only allows sending to your own email)
  if (ENV.NODE_ENV !== 'production') {
    console.log(`[DEV] Welcome email skipped for: ${email}`);
    return;
  }

  const { data, error } = await resendClient.emails.send({
    from: `${sender.name} <${sender.email}>`,
    to: email,
    subject: 'Welcome to Chatify!',
    html: createWelcomeEmailTemplate(name, clientURL),
  });

  if (error) {
    console.error('Error sending welcome email:', error);
    throw new Error('Failed to send welcome email');
  }

  console.log('Welcome Email sent successfully', data);
};

