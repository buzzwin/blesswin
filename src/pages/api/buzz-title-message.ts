import type { NextApiRequest, NextApiResponse } from 'next';
import { callGeminiAPI } from '@lib/api/gemini';

const GROUP_OCCASIONS = new Set(['trip', 'movie', 'series', 'gamenight', 'bookclub']);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { occasion, recipientName, title, creatorName } = req.body as {
    occasion?: string;
    recipientName?: string;
    title?: string;
    creatorName?: string;
  };

  if (!occasion || !recipientName) {
    res.status(400).json({ error: 'occasion and recipientName are required' });
    return;
  }

  const isGroup = GROUP_OCCASIONS.has(occasion);
  const creator = creatorName || 'Someone special';

  const prompt = isGroup
    ? `Write a warm, enthusiastic opening message for a group Buzzbook called "${title ?? recipientName}".
The occasion is a ${occasion} (e.g. a group trip, movie night, or game night).
This message is from ${creator} — it's the first page that kicks off the Buzzbook before everyone else adds theirs.
Keep it 2-3 sentences: set the scene, build excitement, invite everyone to add their page.
Tone: warm, fun, casual, celebratory. No hashtags. No quotes around the message. Just the message text.`
    : `Write a warm, heartfelt opening message for a Buzzbook for ${recipientName}.
The occasion is ${occasion}. This message is from ${creator} — it's the first page that opens the Buzzbook.
Keep it 2-3 sentences: express love/excitement for ${recipientName}, hint that pages from others are waiting inside.
Tone: personal, warm, celebratory. No hashtags. No quotes around the message. Just the message text.`;

  try {
    const message = await callGeminiAPI(prompt, 200, 0.8);
    res.status(200).json({ message: message.trim() });
  } catch (error) {
    console.error('[buzz-title-message] error:', error);
    res.status(500).json({ error: 'Failed to generate message' });
  }
}
