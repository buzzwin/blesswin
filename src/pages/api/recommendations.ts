import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserRatings } from '@lib/firebase/utils/rating';
import { getCachedRecommendations, cacheRecommendations } from '@lib/firebase/utils/recommendations';

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
    const { userId, forceRefresh = false } = req.body;

    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    // Check cache first (unless force refresh is requested)
    if (!forceRefresh) {
      const cachedRecommendations = await getCachedRecommendations(userId);
      if (cachedRecommendations) {
        console.log('Returning cached recommendations for user:', userId);
        res.status(200).json({
          recommendations: cachedRecommendations.recommendations,
          analysis: cachedRecommendations.analysis,
          cached: true,
          createdAt: cachedRecommendations.createdAt,
          expiresAt: cachedRecommendations.expiresAt
        });
        return;
      }
    }

    // Fetch user's ratings
    const ratings = await getUserRatings(userId);

    if (ratings.length === 0) {
      res.status(200).json({
        recommendations: [],
        analysis: {
          preferredGenres: [],
          preferredYears: [],
          ratingPattern: 'No ratings yet',
          suggestions: ['Start rating shows and movies to get personalized recommendations!']
        },
        cached: false
      });
      return;
    }

    // Prepare data for OpenAI
    const ratingData = ratings.map(rating => ({
      title: rating.title,
      rating: rating.rating,
      mediaType: rating.mediaType,
      overview: rating.overview ?? '',
      releaseDate: rating.releaseDate ?? '',
      voteAverage: rating.voteAverage ?? 0
    }));

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a movie and TV show recommendation expert. Analyze the user's ratings and provide personalized recommendations.

IMPORTANT: You must respond with ONLY a valid JSON object. No additional text, explanations, or formatting outside the JSON.

The user has rated the following content:
${JSON.stringify(ratingData, null, 2)}

Analyze their preferences and return a JSON object with this EXACT structure:
{
  "recommendations": [
    {
      "tmdbId": "string (must be a valid TMDB ID)",
      "title": "string (exact movie/show title)",
      "mediaType": "movie" or "tv",
      "posterPath": "string (TMDB poster path starting with /)",
      "reason": "string (brief explanation)",
      "confidence": number (between 0.1 and 1.0),
      "genre": "string (comma-separated genres)",
      "year": "string (4-digit year)"
    }
  ],
  "analysis": {
    "preferredGenres": ["string array of genres"],
    "preferredYears": ["string array of year ranges"],
    "ratingPattern": "string (brief analysis)",
    "suggestions": ["string array of suggestions"]
  }
}

Rules:
- Provide exactly 5-8 recommendations
- Use only valid TMDB IDs
- Ensure all fields are properly formatted
- No text outside the JSON object`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.statusText}`);
    }

    const openAIData = await openAIResponse.json();
    const content = openAIData.choices?.[0]?.message?.content;

    if (!content || typeof content !== 'string') {
      throw new Error('No content received from OpenAI');
    }

    // Clean the content to extract only JSON
    let jsonContent = content.trim();
    
    // Remove any text before the first {
    const firstBraceIndex = jsonContent.indexOf('{');
    if (firstBraceIndex > 0) {
      jsonContent = jsonContent.substring(firstBraceIndex);
    }
    
    // Remove any text after the last }
    const lastBraceIndex = jsonContent.lastIndexOf('}');
    if (lastBraceIndex !== -1 && lastBraceIndex < jsonContent.length - 1) {
      jsonContent = jsonContent.substring(0, lastBraceIndex + 1);
    }

    // Parse the JSON response
    let recommendations: OpenAIResponse;
    try {
      recommendations = JSON.parse(jsonContent);
    } catch (error) {
      console.error('Failed to parse OpenAI response:', content);
      console.error('Cleaned content:', jsonContent);
      throw new Error('Invalid response format from OpenAI');
    }

    // Validate the response structure
    if (!recommendations.recommendations || !Array.isArray(recommendations.recommendations)) {
      throw new Error('Invalid recommendations structure');
    }

    if (!recommendations.analysis || typeof recommendations.analysis !== 'object') {
      throw new Error('Invalid analysis structure');
    }

    // Cache the recommendations
    await cacheRecommendations(userId, recommendations.recommendations, recommendations.analysis);

    res.status(200).json({
      ...recommendations,
      cached: false,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + (3 * 24 * 60 * 60 * 1000)) // 3 days from now
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ 
      error: 'Failed to generate recommendations',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 