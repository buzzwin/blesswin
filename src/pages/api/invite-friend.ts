import type { NextApiRequest, NextApiResponse } from 'next';
import { getDoc, doc } from 'firebase/firestore';
import { usersCollection } from '@lib/firebase/collections';
import nodemailer from 'nodemailer';

interface InviteFriendRequest {
  userId: string;
  friendEmail: string;
  friendName?: string;
  message?: string;
}

interface InviteFriendResponse {
  success: boolean;
  error?: string;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<InviteFriendResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const { userId, friendEmail, friendName, message } = req.body as InviteFriendRequest;

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

    // Get user data
    const userDoc = await getDoc(doc(usersCollection, userId));
    if (!userDoc.exists()) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const user = userDoc.data();
    const userName = user.name || user.username || 'a friend';
    const siteURL = process.env.NEXT_PUBLIC_SITE_URL || 'https://buzzwin.com';

    // Prepare email content
    const inviteSubject = `${userName} invited you to join Buzzwin 🌱`;
    const inviteMessage = message || `Hi${friendName ? ` ${friendName}` : ''}! ${userName} thought you'd love Buzzwin - a platform for positive impact, mindfulness, and community action. Join us to share your impact moments, discover inspiring stories, and connect with others making a difference!`;

    const inviteHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>You're Invited to Buzzwin</title>
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
                        🌱 You're Invited!
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        ${inviteMessage}
                      </p>
                      
                      <div style="margin: 30px 0; padding: 20px; background-color: #f3e8ff; border-left: 4px solid #9333ea; border-radius: 4px;">
                        <p style="margin: 0; color: #333333; font-size: 15px; line-height: 1.6;">
                          <strong>What is Buzzwin?</strong><br>
                          A storytelling studio that amplifies good causes. Share your impact moments, discover inspiring real stories, practice daily rituals, and join a community of do-gooders making positive change.
                        </p>
                      </div>
                      
                      <!-- CTA Button -->
                      <table role="presentation" style="width: 100%; margin: 30px 0;">
                        <tr>
                          <td style="text-align: center;">
                            <a href="${siteURL}/signup?invite=${userId}" 
                               style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                              Join Buzzwin Now
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 20px 0 0; color: #666666; font-size: 14px; line-height: 1.6; text-align: center;">
                        Or copy this link: <a href="${siteURL}/signup?invite=${userId}" style="color: #9333ea; text-decoration: none;">${siteURL}/signup?invite=${userId}</a>
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 30px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; color: #666666; font-size: 12px; line-height: 1.6;">
                        This invitation was sent by ${userName}. If you didn't expect this email, you can safely ignore it.
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

    const inviteText = `
${userName} invited you to join Buzzwin 🌱

${inviteMessage}

What is Buzzwin?
A storytelling studio that amplifies good causes. Share your impact moments, discover inspiring real stories, practice daily rituals, and join a community of do-gooders making positive change.

Join Buzzwin: ${siteURL}/signup?invite=${userId}

This invitation was sent by ${userName}. If you didn't expect this email, you can safely ignore it.
    `.trim();

    // Send email directly using nodemailer
    // Get email credentials from environment variables
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

    // Remove spaces from app password (Gmail app passwords are 16 chars without spaces)
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
        subject: inviteSubject,
        html: inviteHtml,
        text: inviteText
      });

      res.status(200).json({
        success: true,
        message: 'Invitation sent successfully!'
      });
    } catch (sendError) {
      console.error('Error sending email:', sendError);
      res.status(500).json({
        success: false,
        error: `Failed to send email: ${sendError instanceof Error ? sendError.message : 'Unknown error'}`
      });
    }
  } catch (error) {
    console.error('Error sending invite:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send invitation'
    });
  }
}

