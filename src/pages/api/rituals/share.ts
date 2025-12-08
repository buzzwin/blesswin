import type { NextApiRequest, NextApiResponse } from 'next';
import { getDoc, doc } from 'firebase/firestore';
import { usersCollection } from '@lib/firebase/collections';
import nodemailer from 'nodemailer';
import type { ImpactTag, EffortLevel } from '@lib/types/impact-moment';

interface ShareRitualRequest {
  userId: string;
  ritualId?: string;
  ritualTitle: string;
  ritualDescription: string;
  ritualTags: ImpactTag[];
  ritualEffortLevel: EffortLevel;
  friendEmail?: string;
  friendPhone?: string;
  friendName?: string;
  message?: string;
  shareMethod?: 'email' | 'sms';
}

interface ShareRitualResponse {
  success: boolean;
  error?: string;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ShareRitualResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const {
      userId,
      ritualTitle,
      ritualDescription,
      ritualTags,
      ritualEffortLevel,
      friendEmail,
      friendPhone,
      friendName,
      message,
      shareMethod = 'email'
    } = req.body as ShareRitualRequest;

    // Validate input
    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ success: false, error: 'User ID is required' });
      return;
    }

    // Validate based on share method
    if (shareMethod === 'email') {
      if (!friendEmail || typeof friendEmail !== 'string') {
        res.status(400).json({ success: false, error: 'Friend email is required' });
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(friendEmail)) {
        res.status(400).json({ success: false, error: 'Invalid email address' });
        return;
      }
    } else if (shareMethod === 'sms') {
      if (!friendPhone || typeof friendPhone !== 'string') {
        res.status(400).json({ success: false, error: 'Friend phone number is required' });
        return;
      }

      // Basic phone validation (at least 10 digits)
      const phoneRegex = /\d{10,}/;
      const cleanPhone = friendPhone.replace(/\D/g, '');
      if (!phoneRegex.test(cleanPhone) || cleanPhone.length < 10) {
        res.status(400).json({ success: false, error: 'Invalid phone number' });
        return;
      }
    } else {
      res.status(400).json({ success: false, error: 'Invalid share method. Use "email" or "sms"' });
      return;
    }

    if (!ritualTitle || !ritualDescription) {
      res.status(400).json({ success: false, error: 'Ritual title and description are required' });
      return;
    }

    // Get user data
    const userDoc = await getDoc(doc(usersCollection, userId));
    if (!userDoc.exists()) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const user = userDoc.data();
    const userName = user.name || user.username || 'a friend';
    const siteURL = process.env.NEXT_PUBLIC_SITE_URL || 'https://buzzwin.com';

    // Handle SMS sharing
    if (shareMethod === 'sms') {
      // Check if Twilio is configured
      const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
      const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

      if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
        // Use Twilio to send SMS
        try {
          // Dynamic require to avoid adding Twilio as a required dependency
          // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
          let twilio: any = null;
          try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            twilio = require('twilio');
          } catch {
            // Twilio not installed - handled below
          }
          
          if (!twilio || !twilio.default) {
            res.status(500).json({
              success: false,
              error: 'Twilio package not installed. Run: npm install twilio'
            });
            return;
          }

          const client = twilio.default(twilioAccountSid, twilioAuthToken);
          
          // Format tags
          const tagsDisplay = ritualTags.map(tag => {
            const tagLabels: Record<ImpactTag, string> = {
              mind: 'Mind',
              body: 'Body',
              relationships: 'Relationships',
              nature: 'Nature',
              community: 'Community'
            };
            return tagLabels[tag] || tag;
          }).join(', ');

          // Format effort level
          const effortLabels: Record<EffortLevel, string> = {
            tiny: 'Tiny Effort',
            medium: 'Medium Effort',
            deep: 'Deep Effort'
          };
          const effortDisplay = effortLabels[ritualEffortLevel] || ritualEffortLevel;

          // Create SMS message
          const smsMessage = message || `Hi${friendName ? ` ${friendName}` : ''}! ${userName} thought you'd love this daily ritual from Buzzwin.`;
          const smsBody = `${smsMessage}

🌱 ${ritualTitle}
${ritualDescription}

Tags: ${tagsDisplay}
Effort: ${effortDisplay}

Try it: ${siteURL}/rituals`;

          // Send SMS via Twilio
          await client.messages.create({
            body: smsBody,
            from: twilioPhoneNumber,
            to: friendPhone!
          });

          res.status(200).json({
            success: true,
            message: 'Ritual shared via SMS successfully!'
          });
          return;
        } catch (smsError) {
          console.error('Error sending SMS via Twilio:', smsError);
          res.status(500).json({
            success: false,
            error: `Failed to send SMS: ${smsError instanceof Error ? smsError.message : 'Unknown error'}`
          });
          return;
        }
      } else {
        // Twilio not configured - return error suggesting native SMS or configuration
        res.status(500).json({
          success: false,
          error: 'SMS service not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER environment variables, or use the native SMS link on mobile devices.'
        });
        return;
      }
    }

    // Prepare email content (existing email sharing logic)
    const shareSubject = `${userName} shared a daily ritual with you 🌱`;
    const shareMessage = message || `Hi${friendName ? ` ${friendName}` : ''}! ${userName} thought you'd love this daily ritual from Buzzwin.`;

    // Format tags
    const tagsDisplay = ritualTags.map(tag => {
      const tagLabels: Record<ImpactTag, string> = {
        mind: 'Mind',
        body: 'Body',
        relationships: 'Relationships',
        nature: 'Nature',
        community: 'Community'
      };
      return tagLabels[tag] || tag;
    }).join(', ');

    // Format effort level
    const effortLabels: Record<EffortLevel, string> = {
      tiny: 'Tiny Effort',
      medium: 'Medium Effort',
      deep: 'Deep Effort'
    };
    const effortDisplay = effortLabels[ritualEffortLevel] || ritualEffortLevel;

    const shareHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Daily Ritual Shared with You</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 40px 20px; text-align: center;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                        🌱 Daily Ritual Shared with You
                      </h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        ${shareMessage}
                      </p>

                      <!-- Ritual Card -->
                      <div style="margin: 30px 0; padding: 25px; background-color: #f3e8ff; border-left: 4px solid #9333ea; border-radius: 8px;">
                        <div style="margin-bottom: 15px;">
                          <span style="font-size: 32px; margin-right: 10px;">🌱</span>
                          <h2 style="margin: 0; display: inline-block; color: #333333; font-size: 22px; font-weight: 700;">
                            ${ritualTitle}
                          </h2>
                        </div>
                        <p style="margin: 15px 0; color: #333333; font-size: 15px; line-height: 1.6;">
                          ${ritualDescription}
                        </p>
                        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #d8b4fe;">
                          <div style="margin-bottom: 8px;">
                            <strong style="color: #333333;">Tags:</strong>
                            <span style="color: #666666; margin-left: 8px;">${tagsDisplay}</span>
                          </div>
                          <div>
                            <strong style="color: #333333;">Effort Level:</strong>
                            <span style="color: #666666; margin-left: 8px;">${effortDisplay}</span>
                          </div>
                        </div>
                      </div>

                      <div style="margin: 30px 0; padding: 20px; background-color: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 4px;">
                        <p style="margin: 0; color: #333333; font-size: 15px; line-height: 1.6;">
                          <strong>What is Buzzwin?</strong><br>
                          A storytelling studio that amplifies good causes. Share your ritual participations, discover inspiring real stories, practice daily rituals, and join a community of do-gooders making positive change.
                        </p>
                      </div>

                      <!-- CTA Button -->
                      <table role="presentation" style="width: 100%; margin: 30px 0;">
                        <tr>
                          <td style="text-align: center;">
                            <a href="${siteURL}/rituals"
                               style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                              Try This Ritual
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 20px 0 0; color: #666666; font-size: 14px; line-height: 1.6; text-align: center;">
                        Or visit: <a href="${siteURL}/rituals" style="color: #9333ea; text-decoration: none;">${siteURL}/rituals</a>
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 30px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; color: #666666; font-size: 12px; line-height: 1.6;">
                        This ritual was shared by ${userName}. If you didn't expect this email, you can safely ignore it.
                      </p>
                      <p style="margin: 10px 0 0; color: #666666; font-size: 12px;">
                        <a href="${siteURL}" style="color: #9333ea; text-decoration: none;">Buzzwin</a> - Amplifying Good Causes
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const shareText = `
${userName} shared a daily ritual with you 🌱

${shareMessage}

Ritual: ${ritualTitle}
${ritualDescription}

Tags: ${tagsDisplay}
Effort Level: ${effortDisplay}

Try this ritual: ${siteURL}/rituals

What is Buzzwin?
A storytelling studio that amplifies good causes. Share your impact moments, discover inspiring real stories, practice daily rituals, and join a community of do-gooders making positive change.

This ritual was shared by ${userName}. If you didn't expect this email, you can safely ignore it.
    `.trim();

    // Send email directly using nodemailer
    const emailApi = process.env.EMAIL_API || 'link2sources@gmail.com';
    const emailPassword = process.env.EMAIL_API_PASSWORD || 'dyiqmkcl driu tmke';

    if (!emailPassword) {
      console.error('EMAIL_API_PASSWORD not set in environment variables');
      res.status(500).json({
        success: false,
        error: 'Email service not configured. Please set EMAIL_API_PASSWORD environment variable.'
      });
      return;
    }

    // Remove spaces from app password
    const cleanPassword = emailPassword.replace(/\s/g, '');

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailApi,
        pass: cleanPassword
      }
    });

    // Verify connection first
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error('Email server verification failed:', verifyError);
      res.status(500).json({
        success: false,
        error: `Email service error: ${verifyError instanceof Error ? verifyError.message : 'Failed to connect to email server'}`
      });
      return;
    }

    // Send email
    try {
      const info = await transporter.sendMail({
        from: `"${userName} via Buzzwin" <${emailApi}>`,
        to: friendEmail,
        subject: shareSubject,
        html: shareHtml,
        text: shareText
      });

      res.status(200).json({
        success: true,
        message: 'Ritual shared successfully!'
      });
    } catch (sendError) {
      console.error('Error sending ritual share email:', sendError);
      res.status(500).json({
        success: false,
        error: `Failed to send email: ${sendError instanceof Error ? sendError.message : 'Unknown error'}`
      });
    }
  } catch (error) {
    console.error('Error sharing ritual:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to share ritual'
    });
  }
}

