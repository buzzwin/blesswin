import type { NextApiRequest, NextApiResponse } from 'next';
import { getDoc, doc } from 'firebase/firestore';
import { usersCollection } from '@lib/firebase/collections';
import nodemailer from 'nodemailer';
import type { ImpactTag, EffortLevel } from '@lib/types/impact-moment';

interface ShareActionRequest {
  userId: string;
  momentId: string;
  momentText: string;
  momentTags: ImpactTag[];
  momentEffortLevel: EffortLevel;
  creatorName: string;
  creatorUsername: string;
  joinCount: number;
  friendEmail: string;
  friendName?: string;
  message?: string;
}

interface ShareActionResponse {
  success: boolean;
  error?: string;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ShareActionResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const {
      userId,
      momentText,
      momentTags,
      momentEffortLevel,
      creatorName,
      creatorUsername,
      joinCount,
      friendEmail,
      friendName,
      message
    } = req.body as ShareActionRequest;

    // Validate input
    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ success: false, error: 'User ID is required' });
      return;
    }

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

    if (!momentText) {
      res.status(400).json({ success: false, error: 'Action text is required' });
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
    const rippleUrl = `${siteURL}/impact/${req.body.momentId}/ripple`;

    // Prepare email content
    const shareSubject = `${userName} shared an action with you 🌱`;
    const shareMessage = message || `Hi${friendName ? ` ${friendName}` : ''}! ${userName} thought you'd love to join this action on Buzzwin.`;

    // Format tags
    const tagsDisplay = momentTags.map(tag => {
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
    const effortDisplay = effortLabels[momentEffortLevel] || momentEffortLevel;

    // Truncate text for preview
    const previewText = momentText.length > 200 ? momentText.substring(0, 200) + '...' : momentText;

    const shareHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Join This Action on Buzzwin</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 40px 20px; text-align: center;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                        🌱 Join This Action!
                      </h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        ${shareMessage}
                      </p>

                      <!-- Action Card -->
                      <div style="margin: 30px 0; padding: 25px; background-color: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 8px;">
                        <div style="margin-bottom: 15px;">
                          <h2 style="margin: 0 0 10px; color: #333333; font-size: 20px; font-weight: 700;">
                            ${creatorName}'s Action
                          </h2>
                          <p style="margin: 0; color: #666666; font-size: 13px;">
                            @${creatorUsername}
                          </p>
                        </div>
                        <p style="margin: 15px 0; color: #333333; font-size: 15px; line-height: 1.6;">
                          ${previewText}
                        </p>
                        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #bbf7d0;">
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

                      ${joinCount > 0 ? `
                        <div style="margin: 20px 0; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                          <p style="margin: 0; color: #333333; font-size: 15px; line-height: 1.6;">
                            <strong>🌟 ${joinCount} ${joinCount === 1 ? 'ripple' : 'ripples'}</strong><br>
                            Be part of the ripple of positive impact!
                          </p>
                        </div>
                      ` : ''}

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
                            <a href="${rippleUrl}"
                               style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                              View Ritual Participation 🌱
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 20px 0 0; color: #666666; font-size: 14px; line-height: 1.6; text-align: center;">
                        Or copy this link: <a href="${rippleUrl}" style="color: #22c55e; text-decoration: none;">${rippleUrl}</a>
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 30px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; color: #666666; font-size: 12px; line-height: 1.6;">
                        This action was shared by ${userName}. If you didn't expect this email, you can safely ignore it.
                      </p>
                      <p style="margin: 10px 0 0; color: #666666; font-size: 12px;">
                        <a href="${siteURL}" style="color: #22c55e; text-decoration: none;">Buzzwin</a> - Amplifying Good Causes
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
${userName} shared an action with you 🌱

${shareMessage}

Action by ${creatorName} (@${creatorUsername}):
${previewText}

Tags: ${tagsDisplay}
Effort Level: ${effortDisplay}
${joinCount > 0 ? `\n🌟 ${joinCount} ${joinCount === 1 ? 'person has' : 'people have'} joined this action!` : ''}

Join this action: ${rippleUrl}

What is Buzzwin?
A storytelling studio that amplifies good causes. Share your impact moments, discover inspiring real stories, practice daily rituals, and join a community of do-gooders making positive change.

This action was shared by ${userName}. If you didn't expect this email, you can safely ignore it.
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
        message: 'Action shared successfully!'
      });
    } catch (sendError) {
      console.error('Error sending action share email:', sendError);
      res.status(500).json({
        success: false,
        error: `Failed to send email: ${sendError instanceof Error ? sendError.message : 'Unknown error'}`
      });
    }
  } catch (error) {
    console.error('Error sharing action:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to share action'
    });
  }
}

