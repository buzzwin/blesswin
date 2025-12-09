import type { NextApiRequest, NextApiResponse } from 'next';
import { callGeminiAPI, extractJSONFromResponse } from '@lib/api/gemini';

interface ParseRequest {
  text: string;
}

interface ParsedImpactMoment {
  tags: Array<'mind' | 'body' | 'relationships' | 'nature' | 'community' | 'chores'>;
  effortLevel: 'tiny' | 'medium' | 'deep';
  moodCheckIn?: {
    before?: number;
    after?: number;
  };
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

  try {
    const { text } = req.body as ParseRequest;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      res.status(400).json({ error: 'Text is required' });
      return;
    }

    const prompt = `Analyze the following Impact Moment text and extract relevant information.

Impact Moment Text: "${text}"

An Impact Moment is a small good deed or positive action. Analyze the text and determine:

1. **Tags** (select ALL that apply from: mind, body, relationships, nature, community, chores):
   - "mind": Mental wellness, meditation, mindfulness, learning, reflection
   - "body": Physical health, exercise, yoga, healthy eating, fitness
   - "relationships": Connecting with others, helping friends/family, social connections
   - "nature": Environmental actions, spending time outdoors, eco-friendly actions
   - "community": Community service, volunteering, helping neighbors, local impact
   - "chores": Household tasks, cleaning, organizing, maintenance, daily responsibilities

2. **Effort Level** (select ONE: tiny, medium, deep):
   - "tiny": Very quick/easy actions (e.g., "took 3 deep breaths", "smiled at a stranger")
   - "medium": Moderate effort/time (e.g., "cooked a healthy meal", "called a friend", "went for a 20-min walk")
   - "deep": Significant effort/time/commitment (e.g., "volunteered for 3 hours", "organized a community event", "helped someone move")

3. **Mood Check-in** (optional, only if mood is mentioned):
   - If the text mentions feeling stressed/anxious/sad before and better after, infer mood ratings (1-5 scale)
   - If mood is not mentioned, omit this field

Return your analysis as JSON in this exact format:
{
  "tags": ["tag1", "tag2"],
  "effortLevel": "tiny" | "medium" | "deep",
  "moodCheckIn": {
    "before": 1-5,
    "after": 1-5
  }
}

If moodCheckIn cannot be inferred, omit it entirely.`;

    const responseText = await callGeminiAPI(prompt, 500, 0.3);
    const parsed = extractJSONFromResponse(responseText) as unknown as ParsedImpactMoment;

    // Validate and sanitize the response
    const validTags: Array<'mind' | 'body' | 'relationships' | 'nature' | 'community' | 'chores'> = 
      ['mind', 'body', 'relationships', 'nature', 'community', 'chores'];
    
    const tags = Array.isArray(parsed.tags)
      ? parsed.tags.filter(tag => validTags.includes(tag))
      : [];

    const validEffortLevels: Array<'tiny' | 'medium' | 'deep'> = ['tiny', 'medium', 'deep'];
    const effortLevel = validEffortLevels.includes(parsed.effortLevel)
      ? parsed.effortLevel
      : 'medium'; // Default to medium if invalid

    // Validate mood check-in
    let moodCheckIn: { before: number; after: number } | undefined;
    if (parsed.moodCheckIn) {
      const before = parsed.moodCheckIn.before;
      const after = parsed.moodCheckIn.after;
      if (
        typeof before === 'number' &&
        typeof after === 'number' &&
        before >= 1 &&
        before <= 5 &&
        after >= 1 &&
        after <= 5
      ) {
        moodCheckIn = { before, after };
      }
    }

    res.status(200).json({
      tags: tags.length > 0 ? tags : undefined,
      effortLevel,
      moodCheckIn
    });
  } catch (error) {
    console.error('Error parsing impact moment:', error);
    res.status(500).json({
      error: 'Failed to parse impact moment',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

