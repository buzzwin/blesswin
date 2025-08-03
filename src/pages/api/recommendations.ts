import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserRatings } from '@lib/firebase/utils/rating';
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
      // console.log('Anonymous user requesting recommendations');
      
      // Check cache first
      const cached = await getCachedRecommendations(null);
      if (cached) {
        res.status(200).json({
          recommendations: cached.recommendations,
          analysis: cached.analysis,
          cached: true
        });
        return;
      }

      // For anonymous users, return global recommendations
      const globalRecommendations = getGlobalRecommendations();
      
      // Cache the global recommendations
      void cacheRecommendations(null, globalRecommendations, {
        preferredGenres: ['Action', 'Drama', 'Comedy'],
        preferredYears: ['1990-2010'],
        ratingPattern: 'Mixed preferences',
        suggestions: ['Try different genres to discover your taste']
      });

      res.status(200).json({
        recommendations: globalRecommendations,
        analysis: {
          preferredGenres: ['Action', 'Drama', 'Comedy'],
          preferredYears: ['1990-2010'],
          ratingPattern: 'Mixed preferences',
          suggestions: ['Try different genres to discover your taste']
        },
        cached: false
      });
      return;
    }

    // For authenticated users, always generate fresh recommendations
    // Removed caching to ensure fresh recommendations after each rating

    // Fetch user's ratings
    const ratings = await getUserRatings(userId as string);
    
    if (ratings.length === 0) {
      // User has no ratings, return global recommendations
      const globalRecommendations = getGlobalRecommendations();
      
      void cacheRecommendations(userId as string, globalRecommendations, {
        preferredGenres: ['Action', 'Drama', 'Comedy'],
        preferredYears: ['1990-2010'],
        ratingPattern: 'No ratings yet',
        suggestions: ['Start rating shows and movies to get personalized recommendations']
      });

      res.status(200).json({
        recommendations: globalRecommendations,
        analysis: {
          preferredGenres: ['Action', 'Drama', 'Comedy'],
          preferredYears: ['1990-2010'],
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
            content: `You are a movie and TV show recommendation expert. Analyze the user's ratings and provide personalized recommendations. 
            IMPORTANT: Always consider ALL the user's ratings (likes, dislikes, and meh) to provide better recommendations.
            Avoid suggesting content similar to what they've disliked.
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
    
    // Fallback to global recommendations on error
    try {
      const globalRecommendations = getGlobalRecommendations();
      res.status(200).json({
        recommendations: globalRecommendations,
        analysis: {
          preferredGenres: ['Action', 'Drama', 'Comedy'],
          preferredYears: ['1990-2010'],
          ratingPattern: 'Fallback recommendations',
          suggestions: ['Try rating some content to get personalized recommendations']
        },
        cached: false,
        error: 'Using fallback recommendations due to API error'
      });
    } catch (fallbackError) {
      res.status(500).json({ error: 'Failed to generate recommendations' });
    }
  }
} 