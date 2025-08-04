import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserRatings } from '@lib/firebase/utils/review';
import { getCachedRecommendations, cacheRecommendations, getGlobalRecommendations } from '@lib/firebase/utils/admin-recommendations';

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

interface OpenAIResponse {
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

    // Generate AI recommendations
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
            content: `You are a movie and TV show recommendation expert specializing in American popular culture. Analyze the user's ratings and provide personalized recommendations for the MOST POPULAR content. 
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
              "recommendations": [
                {
                  "tmdbId": "string (TMDB ID)",
                  "title": "string (title)",
                  "mediaType": "movie" or "tv",
                  "posterPath": "string (poster path)",
                  "reason": "string (why this is recommended)",
                  "confidence": number (0-1),
                  "genre": "string (primary genre)",
                  "year": "string (release year)"
                }
              ],
              "analysis": {
                "preferredGenres": ["array of preferred genres"],
                "preferredYears": ["array of preferred years"],
                "ratingPattern": "string (description of rating pattern)",
                "suggestions": ["array of suggestions"]
              }
            }`
          },
          {
            role: 'user',
            content: `Analyze these ratings and provide 5 personalized recommendations. Consider ALL ratings (likes, dislikes, and meh) to avoid suggesting content similar to what they've disliked:
            ${ratings.map(r => `${r.title} (${r.mediaType}) - ${r.rating}`).join('\n')}`
          }
        ],
        max_tokens: 1000,
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
    let parsedResponse: OpenAIResponse;
    try {
      parsedResponse = JSON.parse(content);
    } catch (parseError) {
      // console.error('Failed to parse OpenAI response:', content);
      throw new Error('Invalid response format from OpenAI');
    }

    // Validate the response structure
    if (!parsedResponse.recommendations || !Array.isArray(parsedResponse.recommendations)) {
      throw new Error('Invalid response format from OpenAI');
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