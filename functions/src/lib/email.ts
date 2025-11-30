import { createTransport, type Transporter } from 'nodemailer';
import { EMAIL_API, EMAIL_API_PASSWORD } from './env';
import { functions } from './utils';

let emailClient: Transporter | null = null;

function getEmailClient(): Transporter {
  if (!emailClient) {
    emailClient = createTransport({
      service: 'Gmail',
      auth: {
        user: EMAIL_API.value(),
        pass: EMAIL_API_PASSWORD.value()
      }
    });
  }
  return emailClient;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    const client = getEmailClient();
    await client.sendMail({
      from: `Buzzwin <${EMAIL_API.value()}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.subject
    });
    functions.logger.info(`Email sent to ${options.to}: ${options.subject}`);
  } catch (error) {
    functions.logger.error('Error sending email:', error);
    throw error;
  }
}

// Email template helpers
export function getEmailTemplate(content: string, ctaText?: string, ctaUrl?: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Buzzwin</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🌱 Buzzwin</h1>
              <p style="margin: 8px 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">Amplifying Good Causes</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          
          <!-- CTA Button -->
          ${ctaText && ctaUrl ? `
          <tr>
            <td style="padding: 0 40px 40px; text-align: center;">
              <a href="${ctaUrl}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">${ctaText}</a>
            </td>
          </tr>
          ` : ''}
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; border-top: 1px solid #e5e5e5; background-color: #fafafa; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 10px; color: #666666; font-size: 14px;">
                <a href="https://buzzwin.com" style="color: #9333ea; text-decoration: none;">Visit Buzzwin</a>
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                You're receiving this email because you're part of the Buzzwin community.
                <br>
                <a href="https://buzzwin.com/settings" style="color: #999999; text-decoration: underline;">Manage email preferences</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

