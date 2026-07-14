import type { NextApiRequest, NextApiResponse } from 'next';
import { getDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { buzzesCollection, usersCollection } from '@lib/firebase/collections';
import { createTransport } from 'nodemailer';
import type { Transporter } from 'nodemailer';

const OCCASION_EMOJI: Record<string, string> = {
  birthday: '🎂', anniversary: '💍', graduation: '🎓', trip: '✈️',
  movie: '🎬', series: '📺', gamenight: '🎮', bookclub: '📚',
  diwali: '🪔', christmas: '🎄', eid: '🌙', custom: '✨'
};

const GROUP_OCCASIONS = new Set(['trip', 'movie', 'series', 'gamenight', 'bookclub']);

function createTransporter(): Transporter {
  const emailApi = process.env.EMAIL_API;
  const emailPassword = process.env.EMAIL_API_PASSWORD?.replace(/\s/g, '');
  if (!emailApi || !emailPassword) {
    throw new Error(
      'Email service is not configured: EMAIL_API / EMAIL_API_PASSWORD are missing'
    );
  }
  return createTransport({
    service: 'gmail',
    auth: { user: emailApi, pass: emailPassword }
  });
}

function buildEmailHtml(opts: {
  senderName: string;
  buzzTitle: string;
  recipientName: string;
  occasion: string;
  isGroup: boolean;
  shareUrl: string;
  siteUrl: string;
}): string {
  const { senderName, buzzTitle, recipientName, occasion, isGroup, shareUrl, siteUrl } = opts;
  const emoji = OCCASION_EMOJI[occasion] ?? '✨';
  const cta = isGroup
    ? `${senderName} invited you to add your page to the <strong>${buzzTitle}</strong> Buzzbook!`
    : `${senderName} is putting together a Buzzbook for <strong>${recipientName}</strong> and wants you to add your page.`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're invited to add your page to a Buzzbook</title>
</head>
<body style="margin:0;padding:0;background:#F0F5FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" style="width:100%;border-collapse:collapse;">
    <tr>
      <td style="padding:40px 16px;text-align:center;">
        <table role="presentation" style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 32px rgba(43,94,167,0.12);border:1px solid #C4D6E8;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#3B82C4 0%,#5BB8D4 100%);padding:36px 24px;text-align:center;">
              <div style="font-size:48px;margin-bottom:8px;">${emoji}</div>
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">
                You're invited to add your page!
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 28px;">
              <p style="margin:0 0 20px;color:#0D1B2A;font-size:16px;line-height:1.6;">
                ${cta}
              </p>
              <div style="margin:0 0 28px;padding:18px 20px;background:#F0F5FA;border-left:4px solid #3B82C4;border-radius:8px;">
                <p style="margin:0;color:#3D5A78;font-size:14px;line-height:1.6;">
                  📖 <strong>What's a Buzzbook?</strong><br>
                  Everyone adds a page — a message, memory, or photo. When the time comes, the whole thing is revealed as a beautiful Buzzbook.
                </p>
              </div>
              <table role="presentation" style="width:100%;margin:0 0 24px;">
                <tr>
                  <td style="text-align:center;">
                    <a href="${shareUrl}"
                       style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#3B82C4 0%,#5BB8D4 100%);color:#ffffff;text-decoration:none;border-radius:12px;font-weight:700;font-size:16px;letter-spacing:-0.3px;">
                      ✨ Add my page
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;color:#7A8FA3;font-size:13px;text-align:center;word-break:break-all;">
                Or open: <a href="${shareUrl}" style="color:#5BB8D4;text-decoration:none;">${shareUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 28px;background:#F0F5FA;border-top:1px solid #C4D6E8;text-align:center;">
              <p style="margin:0;color:#7A8FA3;font-size:12px;line-height:1.6;">
                Sent by ${senderName} via <a href="${siteUrl}" style="color:#5BB8D4;text-decoration:none;">Buzzwin</a>.
                If you didn't expect this, you can safely ignore it.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { buzzId, emails, userIds, senderUserId } = req.body as {
    buzzId?: string;
    emails?: unknown;
    userIds?: unknown;
    senderUserId?: string;
  };

  if (!buzzId || typeof buzzId !== 'string') {
    res.status(400).json({ error: 'buzzId is required' });
    return;
  }
  if (!senderUserId || typeof senderUserId !== 'string') {
    res.status(400).json({ error: 'senderUserId is required' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const validEmails = Array.isArray(emails)
    ? (emails as unknown[])
        .filter((e): e is string => typeof e === 'string' && emailRegex.test(e.trim()))
        .map((e) => e.trim().toLowerCase())
        .slice(0, 20)
    : [];

  const validUserIds = Array.isArray(userIds)
    ? (userIds as unknown[])
        .filter((u): u is string => typeof u === 'string' && u.trim().length > 0)
        .slice(0, 20)
    : [];

  if (validEmails.length === 0 && validUserIds.length === 0) {
    res.status(400).json({ error: 'Provide at least one email or user to invite' });
    return;
  }

  try {
    const [buzzDoc, senderDoc] = await Promise.all([
      getDoc(doc(buzzesCollection, buzzId)),
      getDoc(doc(usersCollection, senderUserId))
    ]);

    if (!buzzDoc.exists()) {
      res.status(404).json({ error: 'Buzz not found' });
      return;
    }

    const buzz = buzzDoc.data();
    const sender = senderDoc.exists() ? senderDoc.data() : null;
    const senderName = sender?.name || sender?.username || 'A friend';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://buzzwin.com';
    const shareUrl = `${siteUrl}/b/${buzz.shareToken}`;
    const isGroup = GROUP_OCCASIONS.has(buzz.occasion);

    let sent = 0;
    let failed = 0;
    let sentEmails: string[] = [];

    if (validEmails.length > 0) {
      // Isolate the email path: a transport/config failure must not discard
      // the in-app (userIds) invites, which are persisted below regardless.
      try {
        const transporter = createTransporter();
        await transporter.verify();

        const subject = isGroup
          ? `${senderName} invited you to add your page to "${buzz.title}" 📖`
          : `${senderName} is making a Buzzbook for ${buzz.recipientName} — add your page! 📖`;

        const html = buildEmailHtml({
          senderName,
          buzzTitle: buzz.title,
          recipientName: buzz.recipientName,
          occasion: buzz.occasion,
          isGroup,
          shareUrl,
          siteUrl
        });

        const text = `${senderName} invited you to add your page to the "${buzz.title}" Buzzbook!\n\nAdd your page here: ${shareUrl}\n\nIf you didn't expect this, you can safely ignore it.`;

        const emailApi = process.env.EMAIL_API as string;

        const results = await Promise.allSettled(
          validEmails.map((to) =>
            transporter.sendMail({
              from: `"${senderName} via Buzzwin" <${emailApi}>`,
              to,
              subject,
              html,
              text
            })
          )
        );

        sent = results.filter((r) => r.status === 'fulfilled').length;
        failed = results.length - sent;
        sentEmails = validEmails.filter((_, i) => results[i].status === 'fulfilled');
      } catch (emailError) {
        console.error('[buzz-invite] email transport error:', emailError);
        failed = validEmails.length;
      }
    }

    // Persist sent emails + user IDs to the Buzz document
    const updates: Record<string, ReturnType<typeof arrayUnion>> = {};
    if (sentEmails.length > 0) updates['invitedEmails'] = arrayUnion(...sentEmails);
    if (validUserIds.length > 0) updates['invitedUserIds'] = arrayUnion(...validUserIds);
    if (Object.keys(updates).length > 0) {
      await updateDoc(doc(buzzesCollection, buzzId), updates);
    }

    res.status(200).json({ sent, failed, usersAdded: validUserIds.length });
  } catch (error) {
    console.error('[buzz-invite] error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to send invites' });
  }
}
