import { getUserRatings } from '@lib/firebase/utils/review';
import { callGeminiAPI, extractJSONFromResponse } from '@lib/api/gemini';
import type { NextApiRequest, NextApiResponse } from 'next';

interface Recommendation {
  tmdbId: string;
  title: string;
  mediaType: 'movie' | 'tv';
  posterPath: string;
  reason: string;
  confidence: number;
  genre: string;
  year: string;
}

interface GeminiResponse {
  recommendations: Recommendation[];
  analysis: {
    preferredGenres: string[];
    preferredYears: string[];
    ratingPattern: string;
    suggestions: string[];
  };
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

    // For authenticated users, always generate fresh recommendations
    // Removed caching to ensure fresh recommendations after each rating

    // Fetch user's ratings
    const ratings = await getUserRatings(userId as string);
    
    if (ratings.length === 0) {
      // User has no ratings, return empty recommendations
      res.status(200).json({
        recommendations: [],
        analysis: {
          preferredGenres: [],
          preferredYears: [],
          ratingPattern: 'No ratings yet',
          suggestions: ['Start rating shows and movies to get personalized recommendations']
        },
        cached: false
      });
      return;
    }

    // Calculate current year and related years
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
    const nextYear = currentYear + 1;

    // Generate AI recommendations using Gemini
    const prompt = `You are a movie and TV show recommendation expert specializing in American popular culture.

Your task is to analyze the user's ratings and provide 5 personalized recommendations for REAL and CURRENT content from TMDB.

🚨 CRITICAL: You MUST provide REAL content with ACTUAL TMDB IDs, titles, and poster paths. DO NOT make up fake titles like "Example TV Show" or "Sci Fi Series 2025".

🔁 Consider ALL the user's ratings: likes, dislikes, and "meh" to detect patterns and avoid recommending similar content they disliked.

📅 Very Important: Only recommend content released in **${previousYear}, ${currentYear}, or ${nextYear}**. Ignore content older than ${previousYear}.

🎯 Focus on REAL shows and movies that are:
- Recently released or currently trending (${previousYear}–${nextYear})
- Popular on major streaming platforms (Netflix, Hulu, Prime Video, HBO Max, Disney+, Apple TV+)
- Highly rated and culturally relevant
- Widely known and accessible

🔍 Examples of REAL content to include:
- "The Bear" (TV series)
- "Oppenheimer" (movie)
- "Succession" (TV series)
- "Barbie" (movie)
- "Wednesday" (TV series)
- "Everything Everywhere All at Once" (movie)
- "Stranger Things" (TV series)
- "Top Gun: Maverick" (movie)

🔍 Ratings Input:
${ratings.map(r => `${r.title} (${r.mediaType}) - ${r.rating}`).join('\n')}

💡 Output Format:
Return ONLY a valid JSON object with REAL TMDB data:

{
  "recommendations": [
    {
      "tmdbId": "1234567",
      "title": "Real Movie/Show Title",
      "mediaType": "movie" or "tv",
      "posterPath": "/real-poster-path.jpg",
      "reason": "Why this real show/movie is recommended",
      "confidence": 0.9,
      "genre": "Real genre",
      "year": "2024"
    }
  ],
  "analysis": {
    "preferredGenres": ["genre1", "genre2", ...],
    "preferredYears": ["${previousYear}", "${currentYear}", "${nextYear}"],
    "ratingPattern": "Brief description of what the user's ratings suggest",
    "suggestions": [
      "Optional tips for better matches",
      "Optional ideas to improve recommendations"
    ]
  }
}

⚠️ IMPORTANT: Use ONLY real TMDB IDs, real titles, and real poster paths. NO fake or example data.`;

    const content = await callGeminiAPI(prompt, 1000, 0.7);

    if (!content || typeof content !== 'string') {
      throw new Error('No content received from Gemini API');
    }

    // Parse the response
    let parsedResponse: GeminiResponse;
    try {
      const rawResponse = extractJSONFromResponse(content);
      parsedResponse = rawResponse as unknown as GeminiResponse;
    } catch (parseError) {
      // console.error('Failed to parse Gemini response:', content);
      throw new Error('Invalid response format from Gemini API');
    }

    // Validate the response structure
    if (!parsedResponse.recommendations || !Array.isArray(parsedResponse.recommendations)) {
      throw new Error('Invalid response format from Gemini API');
    }

    // Removed caching to ensure fresh recommendations after each rating

    res.status(200).json({
      recommendations: parsedResponse.recommendations,
      analysis: parsedResponse.analysis,
      cached: false
    });

  } catch (error) {
    // console.error('Error generating recommendations:', error);
    
    // Return empty recommendations on error
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
} 