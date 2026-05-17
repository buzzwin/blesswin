import type { NextApiRequest, NextApiResponse } from 'next';
import { callGeminiAPI, extractJSONFromResponse } from '@lib/api/gemini';
import type { BuzzOccasion } from '@lib/types/buzz';

const VALID_OCCASIONS: BuzzOccasion[] = [
  'birthday', 'anniversary', 'trip', 'movie', 'series',
  'gamenight', 'bookclub', 'graduation', 'diwali', 'christmas', 'eid', 'custom'
];

interface ParseResult {
  occasion: BuzzOccasion;
  recipientName: string;
  title: string;
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

  const { description } = req.body as { description?: string };
  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    res.status(400).json({ error: 'description is required' });
    return;
  }

  const prompt = `You are helping create a "Buzzbook" — a collaborative memory book people create together for a special occasion.

The user described what they want to do: "${description.trim()}"

Pick the single best occasion from this list:
- birthday (someone's birthday)
- anniversary (wedding anniversary or relationship milestone)
- graduation (finishing school/university/course)
- trip (group travel, holiday, road trip)
- movie (movie night, watching a film together)
- series (watching a TV series together)
- gamenight (board games, video games, poker night)
- bookclub (reading a book together)
- diwali (Diwali festival)
- christmas (Christmas celebration)
- eid (Eid celebration)
- custom (anything else)

Also extract or infer:
- recipientName: the name of the person being celebrated, OR the place/event name for group occasions (trip/movie/series/gamenight/bookclub). Keep it short (1-3 words). If unclear, return empty string.
- title: a warm, short Buzzbook title (4-8 words). Make it feel celebratory and personal.

Return ONLY valid JSON, no explanation:
{
  "occasion": "<one of the valid occasions above>",
  "recipientName": "<name or empty string>",
  "title": "<short warm title>"
}`;

  try {
    const responseText = await callGeminiAPI(prompt, 200, 0.2);
    const parsed = extractJSONFromResponse(responseText) as unknown as ParseResult;

    const occasion: BuzzOccasion = VALID_OCCASIONS.includes(parsed.occasion)
      ? parsed.occasion
      : 'custom';

    const recipientName = typeof parsed.recipientName === 'string'
      ? parsed.recipientName.slice(0, 60)
      : '';

    const title = typeof parsed.title === 'string'
      ? parsed.title.slice(0, 100)
      : '';

    res.status(200).json({ occasion, recipientName, title });
  } catch (error) {
    console.error('[buzz-ai-parse] error:', error);
    res.status(500).json({ error: 'Failed to parse description' });
  }
}
