import type { NextApiRequest, NextApiResponse } from 'next';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { usersCollection, ritualCardsCollection } from '@lib/firebase/collections';
import { getDoc, doc } from 'firebase/firestore';
import type { CreateRitualCardRequest, RitualCard } from '@lib/types/ritual-card';
import nodemailer from 'nodemailer';

interface CreateCardResponse {
  success: boolean;
  cardId?: string;
  error?: string;
}

// User custom rituals collection
const userCustomRitualsCollection = (userId: string) => 
  collection(db, 'users', userId, 'custom_rituals');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateCardResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const {
      userId,
      title,
      description,
      cardType,
      recipientName,
      eventDate,
      invitedEmails,
      cardDesign
    } = req.body as CreateRitualCardRequest;

    if (!userId || typeof userId !== 'string') {
      res.status(401).json({ success: false, error: 'Unauthorized. User ID required.' });
      return;
    }

    // Validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      res.status(400).json({ success: false, error: 'Title is required' });
      return;
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      res.status(400).json({ success: false, error: 'Description is required' });
      return;
    }

    if (!invitedEmails || !Array.isArray(invitedEmails) || invitedEmails.length === 0) {
      res.status(400).json({ success: false, error: 'At least one email address is required' });
      return;
    }

    // Get user data
    const userDoc = await getDoc(doc(usersCollection, userId));
    if (!userDoc.exists()) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    const user = userDoc.data();

    // Create ritual card document
    const cardDoc: Omit<RitualCard, 'id' | 'createdAt'> & { 
      createdAt: ReturnType<typeof serverTimestamp>;
      createdBy?: string;
    } = {
      type: 'card',
      title: title.trim(),
      description: description.trim(),
      tags: ['community'], // Cards are always community-focused
      effortLevel: 'tiny',
      scope: 'personalized', // Cards are always personalized/invite-only
      suggestedTimeOfDay: 'anytime',
      durationEstimate: '5 minutes',
      prefillTemplate: `Signed the card: ${title.trim()}`,
      cardType,
      recipientName: recipientName?.trim() || undefined,
      eventDate: eventDate || undefined,
      isInviteOnly: true,
      invitedEmails,
      cardSignatures: [],
      cardDesign: cardDesign || {
        backgroundColor: '#fff8e1',
        borderColor: '#f59e0b',
        pattern: 'solid'
      },
      createdAt: serverTimestamp(),
      usageCount: 0,
      completionRate: 0,
      createdBy: userId,
      joinedByUsers: [userId] // Creator automatically joins
    };

    // Create in user's custom rituals collection
    const docRef = await addDoc(userCustomRitualsCollection(userId), cardDoc as any);
    
    // Also create in dedicated cards collection for easier lookup
    await addDoc(ritualCardsCollection, {
      ...cardDoc,
      id: docRef.id,
      cardCreatorId: userId
    } as any);

    // Send invitation emails
    const emailApi = process.env.EMAIL_API;
    const emailPassword = process.env.EMAIL_API_PASSWORD;

    if (emailApi && emailPassword) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: emailApi,
            pass: emailPassword.replace(/\s/g, '')
          }
        });

        const siteURL = process.env.NEXT_PUBLIC_SITE_URL || 'https://buzzwin.com';
        const cardURL = `${siteURL}/ritual-cards/${docRef.id}`;

        const emailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>You're Invited to Sign a Card!</title>
            </head>
            <body style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px;">
              <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h1 style="color: #9333ea; text-align: center;">💌 You're Invited!</h1>
                <p style="font-size: 16px; line-height: 1.6; color: #333;">
                  ${user.name || user.username} has invited you to sign a special card:
                </p>
                <div style="background: #fff8e1; border: 3px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                  <h2 style="color: #333; margin: 0 0 10px 0;">${title}</h2>
                  ${recipientName ? `<p style="color: #666; margin: 0;">For ${recipientName}</p>` : ''}
                </div>
                <p style="font-size: 16px; line-height: 1.6; color: #333;">
                  Click the button below to sign the card and add your message:
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${cardURL}" style="display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                    Sign the Card ✍️
                  </a>
                </div>
                <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
                  Or copy this link: <a href="${cardURL}" style="color: #9333ea;">${cardURL}</a>
                </p>
              </div>
            </body>
          </html>
        `;

        // Send emails to all invited addresses
        const emailPromises = invitedEmails.map(email =>
          transporter.sendMail({
            from: `"${user.name || user.username} via Buzzwin" <${emailApi}>`,
            to: email,
            subject: `💌 You're Invited to Sign a Card: ${title}`,
            html: emailHtml,
            text: `${user.name || user.username} has invited you to sign a card: ${title}. Visit ${cardURL} to sign it!`
          })
        );

        await Promise.all(emailPromises);
      } catch (emailError) {
        console.error('Error sending invitation emails:', emailError);
        // Don't fail the request if emails fail, just log it
      }
    }

    res.status(200).json({
      success: true,
      cardId: docRef.id
    });
  } catch (error) {
    console.error('Error creating ritual card:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create ritual card'
    });
  }
}
