import type { NextApiRequest, NextApiResponse } from 'next';
import { callGeminiAPI } from '@lib/api/gemini';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const prompt = `Generate an inspiring, warm, and encouraging placeholder text for users to share their Impact Moments. 

An Impact Moment is a small good deed or positive action someone takes - like cooking a healthy meal, picking up trash, calling an old friend, meditating, or helping someone in need.

The placeholder should:
- Be friendly and inviting
- Give 2-3 concrete examples of Impact Moments
- Be concise (under 100 characters)
- Inspire action and positivity
- Feel personal and authentic

Return ONLY the placeholder text, nothing else. No quotes, no explanation, just the text itself.

Example format: "What small act of kindness did you share today? (e.g., 'Cooked a healthy meal for my family', 'Called an old friend to check in')"

Generate a fresh, inspiring placeholder:`;

    const placeholderText = await callGeminiAPI(prompt, 200, 0.8);

    // Clean up the response - remove quotes if present, trim whitespace
    let cleanedText = placeholderText.trim();
    if (cleanedText.startsWith('"') && cleanedText.endsWith('"')) {
      cleanedText = cleanedText.slice(1, -1);
    }
    if (cleanedText.startsWith("'") && cleanedText.endsWith("'")) {
      cleanedText = cleanedText.slice(1, -1);
    }

    res.status(200).json({ placeholder: cleanedText });
  } catch (error) {
    console.error('Error generating placeholder:', error);
    // Fallback placeholder if Gemini fails
    res.status(200).json({ 
      placeholder: 'What small good deed did you do today? (e.g., "Cooked a healthy meal for my family", "Picked up trash on my walk", "Called an old friend")'
    });
  }
}

