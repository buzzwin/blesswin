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
    
    // Create a set of already-rated items to exclude them
    const ratedItems = new Set<string>();
    ratings.forEach(rating => {
      ratedItems.add(`${rating.tmdbId}-${rating.mediaType}`);
    });
    console.log('Already-rated items to exclude:', ratedItems.size);
    
    // Generate AI recommendations using Gemini
    // For users with no ratings, suggest popular content
    // For users with ratings, use their preferences
    const currentYear = new Date().getFullYear();
    // Use current year for Discover & Rate to get fresh content
    const targetYear = currentYear;
    const prompt = ratings.length === 0 
      ? `You are a movie and TV show recommendation expert specializing in American popular culture. This user is new and has no ratings yet. Suggest DIVERSE and DISCOVERABLE content from ${targetYear} for the Discover & Rate section.

CRITICAL REQUIREMENT: ONLY suggest movies and TV shows released in ${targetYear}. This is for DISCOVERY - focus on hidden gems, critically acclaimed indie films, international hits, and underrated content that users might not have heard of yet.

Focus on diverse American and international content from ${targetYear} that is:
- Released in ${targetYear} (MANDATORY)
- Not necessarily the most mainstream - include indie films, foreign films, documentaries, and niche TV shows
- Highly rated and critically acclaimed (even if not widely known)
- Available on streaming platforms (Netflix, Hulu, Prime Video, HBO Max, Disney+, Apple TV+)
- Great for discovery and exploration

Suggest 30 diverse shows/movies from ${targetYear} that are perfect for discovery and rating. Include a mix of genres, styles, and popularity levels. DOUBLE-CHECK that every single item is from ${targetYear}.`

      : `You are a movie and TV show recommendation expert specializing in American popular culture. Based on the user's ratings, suggest DIVERSE and DISCOVERABLE content from ${targetYear} for the Discover & Rate section.

CRITICAL REQUIREMENT: ONLY suggest movies and TV shows released in ${targetYear}. This is for DISCOVERY - focus on content that matches their taste but they haven't discovered yet.

IMPORTANT: DO NOT suggest content the user has already rated. They have already rated these items:
${ratings.map(r => `- ${r.title} (${r.mediaType}) - ${r.rating}`).join('\n')}

Always consider ALL the user's ratings (likes, dislikes, and meh) to provide better recommendations.
Avoid suggesting content similar to what they've disliked.
Focus on diverse content from ${targetYear} that:
- Released in ${targetYear} (MANDATORY)
- NOT already rated by the user (check the list above)
- Matches their taste based on their ratings
- Includes indie films, foreign films, documentaries, and niche TV shows
- Highly rated and critically acclaimed
- Available on streaming platforms (Netflix, Hulu, Prime Video, HBO Max, Disney+, Apple TV+)

Based on these ratings, suggest 30 diverse shows/movies from ${targetYear} for discovery and rating. Include a mix of genres, styles, and popularity levels. Consider ALL ratings to avoid disliked content. DOUBLE-CHECK that every single item is from ${targetYear} and NOT in the already-rated list.`;

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

    // Filter to only include target year content and exclude already-rated items
    const filteredContent = parsedResponse.content.filter(item => {
      const year = item.releaseDate ? new Date(item.releaseDate).getFullYear() : null;
      const isFromTargetYear = year === targetYear;
      const isNotRated = !ratedItems.has(`${item.tmdbId}-${item.mediaType}`);
      return isFromTargetYear && isNotRated;
    });

    console.log(`Filtered content: ${filteredContent.length} out of ${parsedResponse.content.length} are from ${targetYear} and not already rated`);

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