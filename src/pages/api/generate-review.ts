import OpenAI from 'openai';
import type { NextApiRequest, NextApiResponse } from 'next';

if (!process.env.OPENAI_KEY) {
  throw new Error('Missing OPENAI_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { title, overview } = req.body;

    if (!title || !overview) {
      return res.status(400).json({ 
        message: 'Missing required fields' 
      });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a friendly movie/TV show reviewer. Keep reviews casual and engaging.'
        },
        {
          role: 'user',
          content: `Write a short, engaging review for "${title}". Overview: ${overview}. Keep it casual and personal, around 2-3 sentences.`
        }
      ],
      temperature: 0.7,
      max_tokens: 150
    });

    const review = completion.choices[0]?.message?.content;

    if (!review) {
      throw new Error('No review generated');
    }

    res.status(200).json({ review });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to generate review'
    });
  }
} 