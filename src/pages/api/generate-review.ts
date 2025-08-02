import OpenAIApi from 'openai';
import { NextApiRequest, NextApiResponse } from 'next';

if (!process.env.OPENAI_KEY) throw new Error('Missing OPENAI_KEY environment variable');

const openai = new OpenAIApi({
  apiKey: process.env.OPENAI_KEY
});

type ResponseData = {
  review?: string;
  message?: string;
};

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
): Promise<void> {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  // Check if OpenAI key is available
  if (!process.env.OPENAI_KEY) {
    console.error('OpenAI API key is missing');
    return res.status(500).json({ message: 'OpenAI API key not configured' });
  }

  try {
    const { title, overview } = req.body as { title: string; overview: string };

    console.log('Received request:', { title, overview: overview?.substring(0, 100) + '...' });

    if (!title || !overview) {
      console.error('Missing required fields:', { title: !!title, overview: !!overview });
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are a friendly movie/TV show reviewer. Write concise, engaging reviews that are exactly 4 lines long. Keep the tone casual and personal.'
      },
      {
        role: 'user',
        content: `Write a 4-line review for "${title}". Overview: ${overview}. Make it engaging, personal, and exactly 4 lines. Each line should be a complete thought.`
      }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.8,
      max_tokens: 200
    });

    const review = completion.choices[0]?.message?.content;

    if (!review) throw new Error('No review generated');

    res.status(200).json({ review });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to generate review';
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        errorMessage = 'OpenAI API key is invalid';
      } else if (error.message.includes('429')) {
        errorMessage = 'OpenAI API rate limit exceeded';
      } else if (error.message.includes('500')) {
        errorMessage = 'OpenAI API server error';
      } else {
        errorMessage = error.message;
      }
    }
    
    res.status(500).json({ message: errorMessage });
  }
} 