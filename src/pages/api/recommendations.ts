import { getUserRatings } from '@lib/firebase/utils/review';
import { saveAIRecommendations } from '@lib/firebase/utils/recommendations';
import { adminDb } from '@lib/firebase/admin';
import { callGeminiAPI, extractJSONFromResponse } from '@lib/api/gemini';
import type { NextApiRequest, NextApiResponse } from 'next';

// Simple in-memory cache for poster paths
const posterCache = new Map<string, string>();

// Function to get real poster paths from TMDB API
async function getPosterPathFromTMDB(title: string, mediaType: 'movie' | 'tv', year?: string): Promise<string> {
  const cacheKey = `${title}-${mediaType}-${year || ''}`;
  
  // Check cache first
  if (posterCache.has(cacheKey)) {
    console.log(`Using cached poster for ${title}`);
    const cached = posterCache.get(cacheKey);
    return (cached as string) || '/api/placeholder/154/231';
  }
  
  const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  
  if (!TMDB_API_KEY) {
    console.log('TMDB API key not found, using fallback poster');
    return '/api/placeholder/154/231';
  }

  try {
    // Search for the movie/show on TMDB
    const searchUrl = `https://api.themoviedb.org/3/search/${mediaType}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&year=${year || ''}`;
    
    const response = await fetch(searchUrl);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      if (result.poster_path) {
        console.log(`Found TMDB poster for ${title}: ${result.poster_path}`);
        // Cache the result
        posterCache.set(cacheKey, result.poster_path);
        return result.poster_path as string;
      }
    }
    
    console.log(`No poster found for ${title} on TMDB`);
    // Cache the fallback result too
    posterCache.set(cacheKey, '/api/placeholder/154/231');
    return '/api/placeholder/154/231';
    
  } catch (error) {
    console.error(`Error fetching TMDB poster for ${title}:`, error);
    // Cache the fallback result for errors too
    posterCache.set(cacheKey, '/api/placeholder/154/231');
    return '/api/placeholder/154/231';
  }
}

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

  // Create a set of already-rated items to exclude them
  const ratedItems = new Set<string>();
  ratings.forEach(rating => {
    ratedItems.add(`${rating.tmdbId}-${rating.mediaType}`);
  });
  console.log('Already-rated items to exclude:', ratedItems.size);

  // Fetch dismissed recommendations (gracefully handle if Admin SDK not available)
  let dismissedRecommendations = new Set<string>();
  if (adminDb) {
    try {
      const dismissedSnapshot = await adminDb
        .collection('dismissed_recommendations')
        .where('userId', '==', userId)
        .get();
      
      dismissedSnapshot.forEach((doc) => {
        const data = doc.data();
        dismissedRecommendations.add(`${data.tmdbId}-${data.mediaType}`);
      });
      
      console.log('Dismissed recommendations count:', dismissedRecommendations.size);
    } catch (error) {
      // If Admin SDK not configured, continue without filtering dismissed recommendations
      console.warn('Could not fetch dismissed recommendations (Admin SDK not configured):', error instanceof Error ? error.message : 'Unknown error');
      dismissedRecommendations = new Set<string>();
    }
  } else {
    console.warn('Admin SDK not available, skipping dismissed recommendations filter');
  }

  // Generate AI recommendations using Gemini
  // For users with no ratings, suggest popular content
  // For users with ratings, use their preferences
  const currentYear = new Date().getFullYear();
  const targetYear = currentYear - 1; // One year prior to current year

  try {
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

Return ONLY a valid JSON object with movie/show titles and basic info. DO NOT include posterPath as it will be added automatically:

{
  "recommendations": [
    {
      "tmdbId": "1234567",
      "title": "Real Movie/Show Title from ${targetYear}",
      "mediaType": "movie" or "tv",
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

      : `You are a movie and TV show recommendation expert specializing in American popular culture. Based on the user's ratings, suggest PERSONALIZED recommendations from ${targetYear} for the "Tonight's Picks" section.

CRITICAL REQUIREMENT: ONLY suggest movies and TV shows released in ${targetYear}. This is for PERSONALIZED RECOMMENDATIONS - focus on content similar to what they've loved.

IMPORTANT: DO NOT suggest content the user has already rated. They have already rated these items:
${ratings.map(r => `- ${r.title} (${r.mediaType}) - ${r.rating}`).join('\n')}

You must carefully analyze the user's preferences based on their ratings. Pay special attention to:
- Content they LOVED: Suggest similar content (same genres, themes, styles, directors, or actors)
- Content they HATED: AVOID suggesting anything similar (genres, themes, styles, directors, or actors)
- Content they found MEH: Avoid similar content, but don't treat it as harshly as hated content

Always consider ALL the user's ratings to provide better recommendations.
Focus on personalized content from ${targetYear} that:
- Released in ${targetYear} (MANDATORY)
- NOT already rated by the user (check the list above)
- Similar to what they LOVED (genres, themes, styles, directors, actors)
- NOT similar to what they HATED (genres, themes, styles, directors, actors)
- Highly rated and critically acclaimed
- Popular on major streaming platforms (Netflix, Hulu, Prime Video, HBO Max, Disney+, Apple TV+)

Based on these ratings, suggest 5 personalized shows/movies from ${targetYear} that match their taste. Consider ALL ratings to avoid disliked content. DOUBLE-CHECK that every single item is from ${targetYear} and NOT in the already-rated list:

LIKED (love):
${ratings.filter(r => r.rating === 'love').map(r => `- ${r.title} (${r.mediaType})`).join('\n') || '- None yet'}

DISLIKED (hate):
${ratings.filter(r => r.rating === 'hate').map(r => `- ${r.title} (${r.mediaType})`).join('\n') || '- None yet'}

NEUTRAL (meh):
${ratings.filter(r => r.rating === 'meh').map(r => `- ${r.title} (${r.mediaType})`).join('\n') || '- None yet'}

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

    // Filter out dismissed recommendations and already-rated items
    const nonDismissedRecommendations = filteredRecommendations.filter(rec => {
      const isDismissed = dismissedRecommendations.has(`${rec.tmdbId}-${rec.mediaType}`);
      const isRated = ratedItems.has(`${rec.tmdbId}-${rec.mediaType}`);
      return !isDismissed && !isRated;
    });
    
    console.log(`Filtered out ${filteredRecommendations.length - nonDismissedRecommendations.length} dismissed/rated recommendations`);

    // Add real poster paths to recommendations using TMDB API
    const recommendationsWithPosters = await Promise.all(
      nonDismissedRecommendations.map(async (rec) => ({
        ...rec,
        posterPath: await getPosterPathFromTMDB(rec.title, rec.mediaType, rec.year)
      }))
    );

    // Update analysis to reflect target year focus
    const updatedAnalysis = {
      ...parsedResponse.analysis,
      preferredYears: [targetYear.toString()],
      ratingPattern: parsedResponse.analysis.ratingPattern || `Content from ${targetYear}`
    };

    // Save recommendations to Firestore
    let sessionId: string | undefined;
    try {
      sessionId = await saveAIRecommendations(
        userId,
        recommendationsWithPosters,
        updatedAnalysis,
        ratings.length,
        targetYear,
        'ai_generated'
      );
      console.log('AI recommendations saved to Firestore with session ID:', sessionId);
    } catch (error) {
      console.error('Failed to save recommendations to Firestore:', error);
      // Continue without failing the API call
    }

    res.status(200).json({
      recommendations: recommendationsWithPosters,
      analysis: updatedAnalysis,
      cached: false,
      sessionId
    });

  } catch (error) {
    console.error('Error generating recommendations:', error);
    
    // Return fallback recommendations on error
    const fallbackRecommendations = [
      {
        tmdbId: '550',
        title: 'Fight Club',
        mediaType: 'movie' as const,
        posterPath: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
        reason: 'A mind-bending psychological thriller that explores themes of consumerism and identity. Perfect for fans of complex narratives.',
        confidence: 0.85,
        genre: 'Drama',
        year: '1999'
      },
      {
        tmdbId: '238',
        title: 'The Godfather',
        mediaType: 'movie' as const,
        posterPath: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
        reason: 'A cinematic masterpiece about family, power, and loyalty. Essential viewing for any film enthusiast.',
        confidence: 0.92,
        genre: 'Crime',
        year: '1972'
      },
      {
        tmdbId: '13',
        title: 'Forrest Gump',
        mediaType: 'movie' as const,
        posterPath: '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
        reason: 'A heartwarming tale of an extraordinary man\'s journey through American history. Timeless and inspiring.',
        confidence: 0.88,
        genre: 'Drama',
        year: '1994'
      }
    ];

    const fallbackAnalysis = {
      preferredGenres: ['Drama', 'Thriller', 'Crime'],
      preferredYears: ['1990s', '2000s'],
      ratingPattern: 'You enjoy complex narratives and character-driven stories',
      suggestions: [
        'Try rating more movies to get personalized recommendations',
        'Explore different genres to help us understand your preferences'
      ]
    };

    // Save fallback recommendations to Firestore
    let sessionId: string | undefined;
    try {
      sessionId = await saveAIRecommendations(
        userId,
        fallbackRecommendations,
        fallbackAnalysis,
        ratings.length,
        targetYear,
        'fallback'
      );
      console.log('Fallback recommendations saved to Firestore with session ID:', sessionId);
    } catch (error) {
      console.error('Failed to save fallback recommendations to Firestore:', error);
      // Continue without failing the API call
    }

    res.status(200).json({
      recommendations: fallbackRecommendations,
      analysis: fallbackAnalysis,
      cached: false,
      fallback: true,
      sessionId
    });
  }
} 