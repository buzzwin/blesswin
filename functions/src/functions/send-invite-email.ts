import { onRequest } from 'firebase-functions/v2/https';
import { regionalFunctions } from '../lib/utils';
import { sendEmail } from '../lib/email';
import { EMAIL_API, EMAIL_API_PASSWORD } from '../lib/env';

interface InviteEmailRequest {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export const sendInviteEmail = regionalFunctions.https.onRequest(
  async (req, res): Promise<void> => {
    // CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      const { to, subject, html, text } = req.body as InviteEmailRequest;

      // Validate input
      if (!to || !subject || !html) {
        res.status(400).json({ error: 'Missing required fields: to, subject, html' });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(to)) {
        res.status(400).json({ error: 'Invalid email address' });
        return;
      }

      // Send email
      await sendEmail({
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''),
      });

      res.status(200).json({
        success: true,
        message: 'Invitation email sent successfully'
      });
    } catch (error) {
      console.error('Error sending invite email:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to send invitation email'
      });
    }
  }
);

