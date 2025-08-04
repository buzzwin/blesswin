import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserRatings } from '@lib/firebase/utils/review';
import { getGlobalRecommendations } from '@lib/firebase/utils/admin-recommendations';

interface RecommendedContent {
  tmdbId: string;
  title: string;
  mediaType: 'movie' | 'tv';
  posterPath: string;
  overview: string;
  releaseDate: string;
  voteAverage: number;
  reason: string;
  confidence: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { userId } = req.body;

    // Handle anonymous users
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // For authenticated users, fetch their ratings
    const ratings = await getUserRatings(userId as string);
    
    if (ratings.length === 0) {
      // User has no ratings, return empty content
      res.status(200).json({
        content: [],
        cached: false
      });
      return;
    }

    // Generate AI recommendations for users with ratings
    // Always generate fresh recommendations to include latest ratings
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a movie and TV show recommendation expert specializing in American popular culture. Based on the user's ratings, suggest the MOST POPULAR and well-known content they might enjoy.
            IMPORTANT: Always consider ALL the user's ratings (likes, dislikes, and meh) to provide better recommendations.
            Avoid suggesting content similar to what they've disliked.
            Focus on popular American content from CURRENT YEAR and recent years that are widely known and accessible.
            Prioritize shows and movies that are:
            - Highly rated and critically acclaimed
            - Popular on major streaming platforms (Netflix, Hulu, Prime Video, HBO Max, Disney+, Apple TV+)
            - Well-known and culturally significant
            - Currently trending or recently released
            Return ONLY a valid JSON object with this exact structure:
            {
              "content": [
                {
                  "tmdbId": "string (TMDB ID)",
                  "title": "string (title)",
                  "mediaType": "movie" or "tv",
                  "posterPath": "string (poster path)",
                  "overview": "string (brief description)",
                  "releaseDate": "string (release year)",
                  "voteAverage": number (0-10),
                  "reason": "string (why this is recommended)",
                  "confidence": number (0-1)
                }
              ]
            }`
          },
          {
            role: 'user',
            content: `Based on these ratings, suggest 10 diverse shows/movies for rating. Consider ALL ratings to avoid disliked content:
            ${ratings.map(r => `${r.title} (${r.mediaType}) - ${r.rating}`).join('\n')}`
          }
        ],
        max_tokens: 1500,
        temperature: 0.7
      })
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    const content = openAIData.choices[0]?.message?.content;

    if (!content || typeof content !== 'string') {
      throw new Error('No content received from OpenAI');
    }

    // Parse the response
    let parsedResponse: { content: RecommendedContent[] };
    try {
      parsedResponse = JSON.parse(content);
    } catch (parseError) {
      // console.error('Failed to parse OpenAI response:', content);
      throw new Error('Invalid response format from OpenAI');
    }

    // Validate the response structure
    if (!parsedResponse.content || !Array.isArray(parsedResponse.content)) {
      throw new Error('Invalid response format from OpenAI');
    }

    res.status(200).json({
      content: parsedResponse.content,
      cached: false
    });

  } catch (error) {
    // console.error('Error generating recommended content:', error);
    
    // Return empty content on error
    res.status(500).json({ error: 'Failed to generate recommended content' });
  }
} 