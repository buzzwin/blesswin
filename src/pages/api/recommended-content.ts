import { getUserRatings } from '@lib/firebase/utils/review';
import { callGeminiAPI, extractJSONFromResponse } from '@lib/api/gemini';
import type { NextApiRequest, NextApiResponse } from 'next';

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
      // User has no ratings, return trending content instead of empty
      try {
        const trendingResponse = await fetch(`${req.headers.host ? `http://${req.headers.host}` : 'http://localhost:3000'}/api/trending-content`);
        if (trendingResponse.ok) {
          const trendingData = await trendingResponse.json();
          res.status(200).json({
            content: trendingData.content || [],
            cached: false,
            source: 'trending-fallback'
          });
          return;
        }
      } catch (trendingError) {
        // If trending content also fails, return empty but don't error
        res.status(200).json({
          content: [],
          cached: false,
          source: 'no-ratings'
        });
        return;
      }
    }

    // Generate AI recommendations for users with ratings using Gemini
    // Always generate fresh recommendations to include latest ratings
    const prompt = `You are a movie and TV show recommendation expert specializing in American popular culture. Based on the user's ratings, suggest the MOST POPULAR and well-known content they might enjoy.
IMPORTANT: Always consider ALL the user's ratings (likes, dislikes, and meh) to provide better recommendations.
Avoid suggesting content similar to what they've disliked.
Focus on popular American content from CURRENT YEAR and recent years that are widely known and accessible.
Prioritize shows and movies that are:
- Highly rated and critically acclaimed
- Popular on major streaming platforms (Netflix, Hulu, Prime Video, HBO Max, Disney+, Apple TV+)
- Well-known and culturally significant
- Currently trending or recently released

Based on these ratings, suggest 10 diverse shows/movies for rating. Consider ALL ratings to avoid disliked content:
${ratings.map(r => `${r.title} (${r.mediaType}) - ${r.rating}`).join('\n')}

Return ONLY a valid JSON object with this exact structure:
{
  "content": [
    {
      "tmdbId": "string (TMDB ID)",
      "title": "string (title)",
      "mediaType": "movie" or "tv",
      "posterPath": "/real-poster-path.jpg",
      "overview": "string (brief description)",
      "releaseDate": "string (release year)",
      "voteAverage": number (0-10),
      "reason": "string (why this is recommended)",
      "confidence": number (0-1)
    }
  ]
}`;

    const content = await callGeminiAPI(prompt, 1500, 0.7);

    if (!content || typeof content !== 'string') {
      throw new Error('No content received from Gemini API');
    }

    // Parse the response
    let parsedResponse: { content: RecommendedContent[] };
    try {
      const rawResponse = extractJSONFromResponse(content);
      parsedResponse = rawResponse as unknown as { content: RecommendedContent[] };
    } catch (parseError) {
      // console.error('Failed to parse Gemini response:', content);
      throw new Error('Invalid response format from Gemini API');
    }

    // Validate the response structure
    if (!parsedResponse.content || !Array.isArray(parsedResponse.content)) {
      throw new Error('Invalid response format from Gemini API');
    }

    res.status(200).json({
      content: parsedResponse.content,
      cached: false
    });

  } catch (error) {
    // console.error('Error generating recommended content:', error);
    
    // Try to fallback to trending content instead of returning empty
    try {
      const trendingResponse = await fetch(`${req.headers.host ? `http://${req.headers.host}` : 'http://localhost:3000'}/api/trending-content`);
      if (trendingResponse.ok) {
        const trendingData = await trendingResponse.json();
        res.status(200).json({
          content: trendingData.content || [],
          cached: false,
          source: 'trending-fallback'
        });
        return;
      }
    } catch (fallbackError) {
      // If even trending content fails, return empty but don't error
      res.status(200).json({
        content: [],
        cached: false,
        source: 'error-fallback'
      });
      return;
    }
  }
} 