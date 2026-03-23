import type { NextApiRequest, NextApiResponse } from 'next';
import { callGeminiAPI, extractJSONFromResponse } from '@lib/api/gemini';
import { adminDb } from '@lib/firebase/admin';

interface MoodRecommendationRequest {
  userId: string;
  mood: 'family-night' | 'light-relief' | 'teen-safe' | 'date-night' | 'solo-chill';
  context?: string;
}

interface MoodRecommendation {
  tmdbId: string;
  title: string;
  mediaType: 'movie' | 'tv';
  posterPath: string;
  reason: string;
  runtime?: number; // in minutes
  episodeRuntime?: number; // for TV shows
  rating?: string; // MPAA/TV rating
  genres?: string[];
}

interface MoodRecommendationsResponse {
  success: boolean;
  recommendations?: MoodRecommendation[];
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MoodRecommendationsResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const { userId, mood, context } = req.body as MoodRecommendationRequest;

    if (!userId || !mood) {
      res.status(400).json({ success: false, error: 'User ID and mood are required' });
      return;
    }

    // Get user's ratings to personalize recommendations
    let ratings: Array<{ title: string; mediaType: string; rating: string }> = [];
    
    if (adminDb) {
      try {
        const ratingsSnapshot = await adminDb
          .collection('reviews')
          .where('userId', '==', userId)
          .get();

        ratings = ratingsSnapshot.docs.map(doc => ({
          title: doc.data().title,
          mediaType: doc.data().mediaType,
          rating: doc.data().rating
        }));
      } catch (error) {
        console.error('Error fetching user ratings:', error);
        // Continue without ratings if fetch fails
      }
    }

    // Define mood-based prompts
    const moodPrompts: Record<string, string> = {
      'family-night': `Recommend 5 TV shows or movies that are perfect for family viewing tonight. Focus on:
- Runtime: 20-30 minutes per episode (for TV) or 90-120 minutes (for movies)
- Family-friendly content (PG or PG-13 equivalent)
- Engaging for multiple age groups
- Light, positive, or educational themes
- Available on major streaming platforms
- Great for watching together and discussing

Context: ${context || 'Family wants to watch something together tonight'}

Avoid content the user has already rated: ${ratings.map(r => `${r.title} (${r.rating})`).join(', ') || 'None'}`,

      'light-relief': `Recommend 5 TV shows or movies that are perfect for unwinding after a hard day. Focus on:
- Light, uplifting, or comedic content
- Low-stakes, feel-good stories
- Easy to watch without heavy emotional investment
- Comforting and relaxing
- Available on major streaming platforms

Context: ${context || 'User wants something light after a hard day'}

Avoid content the user has already rated: ${ratings.map(r => `${r.title} (${r.rating})`).join(', ') || 'None'}`,

      'teen-safe': `Recommend 5 TV shows or movies that are teen-safe but not boring. Focus on:
- Appropriate for teens (PG-13 or TV-14 equivalent)
- Engaging and interesting for teen audiences
- Not childish or overly mature
- Relatable themes for teenagers
- Available on major streaming platforms

Context: ${context || 'Teen-safe content that keeps teens engaged'}

Avoid content the user has already rated: ${ratings.map(r => `${r.title} (${r.rating})`).join(', ') || 'None'}`,

      'date-night': `Recommend 5 TV shows or movies perfect for a date night. Focus on:
- Romantic, engaging, or conversation-starting content
- 90-120 minutes for movies or bingeable TV shows
- Appeals to couples
- Memorable and shareable experiences
- Available on major streaming platforms

Context: ${context || 'Perfect for a date night'}

Avoid content the user has already rated: ${ratings.map(r => `${r.title} (${r.rating})`).join(', ') || 'None'}`,

      'solo-chill': `Recommend 5 TV shows or movies perfect for solo viewing and relaxation. Focus on:
- Thoughtful, immersive, or meditative content
- Great for personal enjoyment
- Can be watched at your own pace
- Engaging but not overwhelming
- Available on major streaming platforms

Context: ${context || 'Solo viewing and relaxation'}

Avoid content the user has already rated: ${ratings.map(r => `${r.title} (${r.rating})`).join(', ') || 'None'}`
    };

    const prompt = moodPrompts[mood] || moodPrompts['light-relief'];

    const fullPrompt = `${prompt}

Return ONLY a valid JSON object with this exact structure:
{
  "recommendations": [
    {
      "tmdbId": "string (real TMDB ID)",
      "title": "string (real title)",
      "mediaType": "movie" or "tv",
      "posterPath": "/real-poster-path.jpg",
      "reason": "string (why this fits the mood)",
      "runtime": number (for movies, in minutes),
      "episodeRuntime": number (for TV shows, in minutes),
      "rating": "string (MPAA/TV rating like PG, PG-13, TV-14)",
      "genres": ["genre1", "genre2"]
    }
  ]
}

IMPORTANT: Use REAL TMDB IDs and titles. Verify the content exists and matches the mood requirements.`;

    const response = await callGeminiAPI(fullPrompt);
    const jsonData = extractJSONFromResponse(response) as {
      recommendations?: Array<{
        tmdbId: string;
        title: string;
        mediaType: 'movie' | 'tv';
        posterPath?: string;
        reason: string;
        runtime?: number;
        episodeRuntime?: number;
        rating?: string;
        genres?: string[];
      }>;
    };

    if (!jsonData || !jsonData.recommendations || !Array.isArray(jsonData.recommendations)) {
      throw new Error('Invalid response from AI');
    }

    // Fetch poster paths from TMDB if not provided
    const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    const recommendationsWithPosters: MoodRecommendation[] = await Promise.all(
      jsonData.recommendations.map(async (rec): Promise<MoodRecommendation> => {
        let posterPath = rec.posterPath || '/api/placeholder/154/231';
        
        if (!rec.posterPath || rec.posterPath.startsWith('/api/placeholder')) {
          if (TMDB_API_KEY) {
            try {
              const searchUrl = `https://api.themoviedb.org/3/search/${rec.mediaType}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(rec.title)}`;
              const tmdbResponse = await fetch(searchUrl);
              if (tmdbResponse.ok) {
                const tmdbData = await tmdbResponse.json() as { results?: Array<{ poster_path?: string; id: number }> };
                if (tmdbData.results && tmdbData.results.length > 0) {
                  const result = tmdbData.results[0];
                  posterPath = result.poster_path 
                    ? `https://image.tmdb.org/t/p/w500${result.poster_path}`
                    : '/api/placeholder/154/231';
                  return {
                    tmdbId: result.id.toString(),
                    title: rec.title,
                    mediaType: rec.mediaType,
                    posterPath,
                    reason: rec.reason,
                    runtime: rec.runtime,
                    episodeRuntime: rec.episodeRuntime,
                    rating: rec.rating,
                    genres: rec.genres
                  };
                }
              }
            } catch (error) {
              console.error(`Error fetching TMDB data for ${rec.title}:`, error);
            }
          }
        }

        return {
          tmdbId: rec.tmdbId,
          title: rec.title,
          mediaType: rec.mediaType,
          posterPath: posterPath || '/api/placeholder/154/231',
          reason: rec.reason,
          runtime: rec.runtime,
          episodeRuntime: rec.episodeRuntime,
          rating: rec.rating,
          genres: rec.genres
        };
      })
    );

    res.status(200).json({
      success: true,
      recommendations: recommendationsWithPosters
    });
  } catch (error) {
    console.error('Error generating mood recommendations:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate recommendations'
    });
  }
}
