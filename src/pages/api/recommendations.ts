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
    console.log('Recommendations API called with userId:', userId);

    // Handle anonymous users
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // For authenticated users, always generate fresh recommendations
    // Removed caching to ensure fresh recommendations after each rating

    // Fetch user's ratings
    const ratings = await getUserRatings(userId as string);
    console.log('User ratings count:', ratings.length);
    
    // Generate AI recommendations using Gemini
    // For users with no ratings, suggest popular content
    // For users with ratings, use their preferences
    const currentYear = new Date().getFullYear();
    const targetYear = currentYear - 1; // One year prior to current year
    const prompt = ratings.length === 0 
      ? `You are a movie and TV show recommendation expert specializing in American popular culture. This user is new and has no ratings yet. Suggest the MOST POPULAR and well-known content from ${targetYear} ONLY.

CRITICAL REQUIREMENT: ONLY suggest movies and TV shows released in ${targetYear}. ABSOLUTELY NO content from ${currentYear}, ${currentYear - 2}, ${currentYear - 3}, or any other year. Every single recommendation MUST be from ${targetYear}.

Focus on popular American content from ${targetYear} that are widely known and accessible.
Prioritize shows and movies that are:
- Released in ${targetYear} (MANDATORY)
- Highly rated and critically acclaimed
- Popular on major streaming platforms (Netflix, Hulu, Prime Video, HBO Max, Disney+, Apple TV+)
- Well-known and culturally significant
- Currently trending or recently released in ${targetYear}
- Great for new users to start their rating journey

Suggest 5 diverse shows/movies from ${targetYear} that are perfect for someone just starting to rate content. DOUBLE-CHECK that every single item is from ${targetYear}.

Return ONLY a valid JSON object with REAL TMDB data:

{
  "recommendations": [
    {
      "tmdbId": "1234567",
      "title": "Real Movie/Show Title from ${targetYear}",
      "mediaType": "movie" or "tv",
      "posterPath": "/real-poster-path.jpg",
      "reason": "Why this real ${targetYear} show/movie is recommended",
      "confidence": 0.9,
      "genre": "Real genre",
      "year": "${targetYear}"
    }
  ],
  "analysis": {
    "preferredGenres": ["Popular", "Trending"],
    "preferredYears": ["${targetYear}"],
    "ratingPattern": "New user - exploring ${targetYear} content",
    "suggestions": [
      "Start rating shows and movies to get personalized recommendations",
      "Try different genres to help us understand your preferences"
    ]
  }
}`

      : `You are a movie and TV show recommendation expert specializing in American popular culture. Based on the user's ratings, suggest the MOST POPULAR and well-known content from ${targetYear} ONLY.

CRITICAL REQUIREMENT: ONLY suggest movies and TV shows released in ${targetYear}. ABSOLUTELY NO content from ${currentYear}, ${currentYear - 2}, ${currentYear - 3}, or any other year. Every single recommendation MUST be from ${targetYear}.

Always consider ALL the user's ratings (likes, dislikes, and meh) to provide better recommendations.
Avoid suggesting content similar to what they've disliked.
Focus on popular American content from ${targetYear} that are widely known and accessible.
Prioritize shows and movies that are:
- Released in ${targetYear} (MANDATORY)
- Highly rated and critically acclaimed
- Popular on major streaming platforms (Netflix, Hulu, Prime Video, HBO Max, Disney+, Apple TV+)
- Well-known and culturally significant
- Currently trending or recently released in ${targetYear}

Based on these ratings, suggest 5 diverse shows/movies from ${targetYear} for rating. Consider ALL ratings to avoid disliked content. DOUBLE-CHECK that every single item is from ${targetYear}:
${ratings.map(r => `${r.title} (${r.mediaType}) - ${r.rating}`).join('\n')}

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
      "year": "${targetYear}"
    }
  ],
  "analysis": {
    "preferredGenres": ["genre1", "genre2", ...],
    "preferredYears": ["${targetYear}"],
    "ratingPattern": "Brief description of what the user's ratings suggest",
    "suggestions": [
      "Optional tips for better matches",
      "Optional ideas to improve recommendations"
    ]
  }
}`;

    console.log('Calling Gemini API with prompt length:', prompt.length);
    const content = await callGeminiAPI(prompt, 1000, 0.7);
    console.log('Gemini API response length:', content?.length || 0);

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

    // Filter to only include target year content (one year prior to current year)
    const filteredRecommendations = parsedResponse.recommendations.filter(rec => {
      const year = rec.year ? parseInt(rec.year) : null;
      return year === targetYear;
    });

    console.log(`Filtered recommendations: ${filteredRecommendations.length} out of ${parsedResponse.recommendations.length} are from ${targetYear}`);

    // Update analysis to reflect target year focus
    const updatedAnalysis = {
      ...parsedResponse.analysis,
      preferredYears: [targetYear.toString()],
      ratingPattern: parsedResponse.analysis.ratingPattern || `Content from ${targetYear}`
    };

    res.status(200).json({
      recommendations: filteredRecommendations,
      analysis: updatedAnalysis,
      cached: false
    });

  } catch (error) {
    // console.error('Error generating recommendations:', error);
    
    // Return empty recommendations on error
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
} 