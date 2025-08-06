import { callGeminiAPI } from '@lib/api/gemini';
import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  review?: string;
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
): Promise<void> {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const { title, overview } = req.body as { title: string; overview: string };

    // console.log('Received request:', { title, overview: overview?.substring(0, 100) + '...' });

    if (!title || !overview) {
      // console.error('Missing required fields:', { title: !!title, overview: !!overview });
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const prompt = `You are a friendly American movie/TV show reviewer specializing in popular culture. Write a concise, engaging review that is exactly 4 lines long. Keep the tone casual and personal, focusing on what makes this content popular and appealing to American audiences.

Write a 4-line review for "${title}". Overview: ${overview}. Make it engaging, personal, and exactly 4 lines. Each line should be a complete thought, focusing on why this content is popular and appealing to American audiences.

Return only the review text, no additional formatting or explanations.`;

    const review = await callGeminiAPI(prompt, 200, 0.8);

    if (!review) throw new Error('No review generated');

    res.status(200).json({ review });
  } catch (error) {
    // console.error('Gemini API Error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to generate review';
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        errorMessage = 'Gemini API key is invalid';
      } else if (error.message.includes('429')) {
        errorMessage = 'Gemini API rate limit exceeded';
      } else if (error.message.includes('500')) {
        errorMessage = 'Gemini API server error';
      } else {
        errorMessage = error.message;
      }
    }
    
    res.status(500).json({ message: errorMessage });
  }
} 