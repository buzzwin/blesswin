import type { NextApiRequest, NextApiResponse } from 'next';
import { callGeminiAPI } from '@lib/api/gemini';

interface AssistRequest {
  currentText: string;
  tags?: string[];
  effortLevel?: string;
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
    const { currentText, tags, effortLevel } = req.body as AssistRequest;

    if (!currentText || typeof currentText !== 'string') {
      res.status(400).json({ error: 'currentText is required' });
      return;
    }

    const tagsText = tags && tags.length > 0 
      ? `Tags: ${tags.join(', ')}. ` 
      : '';
    const effortText = effortLevel 
      ? `Effort Level: ${effortLevel}. ` 
      : '';

    const prompt = `You are a helpful writing assistant for a social platform focused on sharing positive impact moments - small good deeds and acts of kindness.

The user is writing about their Impact Moment. Help them articulate it better.

Current text: "${currentText}"
${tagsText}${effortText}

Your task:
1. If the text is very short or incomplete, help them expand it naturally and authentically
2. If the text is already good, suggest a small improvement or refinement
3. Keep it personal, authentic, and warm - don't make it sound corporate or overly polished
4. Maintain their voice and style
5. Keep it concise (under 280 characters)
6. Focus on the positive impact and how it made them feel

Return ONLY the improved text, nothing else. No quotes, no explanation, just the improved version of their impact moment.

Improved text:`;

    const improvedText = await callGeminiAPI(prompt, 300, 0.7);

    // Clean up the response - remove quotes if present, trim whitespace
    let cleanedText = improvedText.trim();
    if (cleanedText.startsWith('"') && cleanedText.endsWith('"')) {
      cleanedText = cleanedText.slice(1, -1);
    }
    if (cleanedText.startsWith("'") && cleanedText.endsWith("'")) {
      cleanedText = cleanedText.slice(1, -1);
    }

    // Ensure it doesn't exceed the character limit
    if (cleanedText.length > 280) {
      cleanedText = cleanedText.substring(0, 277) + '...';
    }

    res.status(200).json({ improvedText: cleanedText });
  } catch (error) {
    console.error('Error generating AI assistance:', error);
    res.status(500).json({ 
      error: 'Failed to generate AI assistance',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

