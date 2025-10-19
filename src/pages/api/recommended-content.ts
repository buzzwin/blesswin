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
    console.log('Recommended content API called with userId:', userId);

    // Handle anonymous users
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // For authenticated users, fetch their ratings
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

Suggest 10 diverse shows/movies from ${targetYear} that are perfect for someone just starting to rate content. DOUBLE-CHECK that every single item is from ${targetYear}.`

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

Based on these ratings, suggest 10 diverse shows/movies from ${targetYear} for rating. Consider ALL ratings to avoid disliked content. DOUBLE-CHECK that every single item is from ${targetYear}:
${ratings.map(r => `${r.title} (${r.mediaType}) - ${r.rating}`).join('\n')}`;

    const fullPrompt = `${prompt}

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

    console.log('Calling Gemini API with prompt length:', fullPrompt.length);
    const content = await callGeminiAPI(fullPrompt, 1500, 0.7);
    console.log('Gemini API response length:', content?.length || 0);

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
      console.error('Invalid response format from Gemini API:', parsedResponse);
      throw new Error('Invalid response format from Gemini API');
    }

    // Filter to only include target year content (one year prior to current year)
    const filteredContent = parsedResponse.content.filter(item => {
      const year = item.releaseDate ? new Date(item.releaseDate).getFullYear() : null;
      return year === targetYear;
    });

    console.log(`Filtered content: ${filteredContent.length} out of ${parsedResponse.content.length} are from ${targetYear}`);

    res.status(200).json({
      content: filteredContent,
      cached: false,
      source: ratings.length === 0 ? 'ai-popular-content' : 'ai-personalized'
    });

  } catch (error) {
    // console.error('Error generating recommended content:', error);
    
    // Return empty content on error
    res.status(200).json({
      content: [],
      cached: false,
      source: 'error-fallback'
    });
  }
} 