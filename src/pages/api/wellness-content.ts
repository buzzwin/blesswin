import { NextApiRequest, NextApiResponse } from 'next';
import { callGeminiAPI, extractJSONFromResponse } from '@lib/api/gemini';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

interface WellnessContent {
  tmdbId: string;
  title: string;
  mediaType: 'movie' | 'tv';
  posterPath: string;
  overview: string;
  releaseDate: string;
  voteAverage: number;
  reason: string;
  wellnessThemes: string[];
  category: 'yoga' | 'meditation' | 'harmony' | 'holistic' | 'wellness';
}

interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

interface TMDBTVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  first_air_date: string;
  vote_average: number;
  genre_ids: number[];
}

// Wellness-related genre IDs from TMDB
const wellnessGenres = {
  documentary: 99,
  health: 99 // Using documentary as proxy
};

// Function to search TMDB for wellness content
async function searchTMDBWellnessContent(
  query: string,
  mediaType: 'movie' | 'tv' = 'movie',
  limit = 20
): Promise<Array<TMDBMovie | TMDBTVShow>> {
  if (!TMDB_API_KEY) {
    console.warn('TMDB API key not found');
    return [];
  }

  try {
    const searchUrl = `https://api.themoviedb.org/3/search/${mediaType}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`;
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data = await response.json() as { results?: Array<TMDBMovie | TMDBTVShow> };
    return (data.results || []).slice(0, limit);
  } catch (error) {
    console.error('Error searching TMDB:', error);
    return [];
  }
}

// Function to get popular wellness content from TMDB
async function getPopularWellnessContent(
  mediaType: 'movie' | 'tv' = 'movie',
  limit = 20
): Promise<Array<TMDBMovie | TMDBTVShow>> {
  if (!TMDB_API_KEY) {
    return [];
  }

  try {
    // Search for documentaries and wellness-related content
    const discoverUrl = `https://api.themoviedb.org/3/discover/${mediaType}?api_key=${TMDB_API_KEY}&with_genres=99&sort_by=popularity.desc&vote_average.gte=6&page=1`;
    const response = await fetch(discoverUrl);
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data = await response.json() as { results?: Array<TMDBMovie | TMDBTVShow> };
    return (data.results || []).slice(0, limit);
  } catch (error) {
    console.error('Error fetching popular wellness content:', error);
    return [];
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { category: rawCategory, limit: rawLimit = '10' } = req.query;
    let category: string | undefined;
    if (typeof rawCategory === 'string') {
      category = rawCategory;
    }
    const limit = typeof rawLimit === 'string' ? rawLimit : '10';
    
    // Redirect mindfulness to meditation
    if (category === 'mindfulness') {
      category = 'meditation';
    }
    
    const contentLimit = parseInt(limit, 10);

    // Search terms for different wellness categories
    const searchTerms: Record<string, string[]> = {
      yoga: ['yoga', 'yoga documentary', 'yoga practice', 'mindful movement', 'yoga journey'],
      meditation: ['meditation', 'meditation documentary', 'zen', 'mindfulness meditation', 'inner peace', 'mindfulness', 'mindfulness documentary', 'present moment', 'awareness', 'mindful living'],
      harmony: ['harmony', 'peace', 'balance', 'wellness', 'holistic health', 'spiritual'],
      holistic: ['holistic health', 'wellness', 'natural healing', 'alternative medicine', 'wellbeing'],
      wellness: ['wellness', 'health', 'wellbeing', 'self-care', 'mental health', 'spiritual growth']
    };

    const categoryKey = (category as string) || 'wellness';
    const terms = searchTerms[categoryKey] || searchTerms.wellness;

    // Fetch content from TMDB
    const tmdbResults: Array<TMDBMovie | TMDBTVShow> = [];
    
    // Search for movies
    for (const term of terms.slice(0, 3)) {
      const movies = await searchTMDBWellnessContent(term, 'movie', 10);
      tmdbResults.push(...movies);
    }

    // Search for TV shows
    for (const term of terms.slice(0, 3)) {
      const shows = await searchTMDBWellnessContent(term, 'tv', 10);
      tmdbResults.push(...shows);
    }

    // Also get popular documentaries
    const popularDocs = await getPopularWellnessContent('movie', 10);
    tmdbResults.push(...popularDocs);

    // Remove duplicates
    const uniqueResults = Array.from(
      new Map(tmdbResults.map(item => [item.id, item])).values()
    ).slice(0, 50); // Get more results for Gemini to filter

    // Use Gemini to identify and categorize wellness content
    const prompt = `You are an expert in wellness, holistic health, yoga, mindfulness, meditation, and spiritual content. 

Analyze the following movies and TV shows from TMDB and identify which ones are related to wellness, holistic health, yoga, meditation (including mindfulness), harmony, spiritual growth, or personal transformation.

For each item, determine:
1. If it's wellness-related (yes/no)
2. Which wellness category it fits: yoga, meditation (which includes mindfulness), harmony, holistic, or wellness
3. What wellness themes it explores
4. Why it's relevant to wellness seekers

TMDB Content to analyze:
${uniqueResults.map((item, idx) => {
  const isMovie = 'title' in item;
  return `${idx + 1}. ${isMovie ? item.title : item.name} (${isMovie ? 'movie' : 'tv'}) - TMDB ID: ${item.id}
   Overview: ${item.overview || 'No overview available'}
   Release Date: ${isMovie ? item.release_date : item.first_air_date}
   Rating: ${item.vote_average}/10`;
}).join('\n\n')}

Return ONLY a valid JSON object with this structure:
{
  "wellnessContent": [
    {
      "tmdbId": "string (TMDB ID)",
      "title": "string (exact title from TMDB)",
      "mediaType": "movie" or "tv",
      "posterPath": "string (poster path from TMDB)",
      "overview": "string (overview from TMDB)",
      "releaseDate": "string (release date)",
      "voteAverage": number (0-10),
      "reason": "string (why this is wellness-related)",
      "wellnessThemes": ["theme1", "theme2", ...],
      "category": "yoga" | "meditation" | "harmony" | "holistic" | "wellness"
    }
  ]
}

Only include content that is genuinely related to wellness, holistic health, yoga, meditation (including mindfulness), spiritual growth, or personal transformation. Exclude content that is only tangentially related or not wellness-focused.

Limit to the top ${contentLimit} most relevant wellness content items.`;

    console.log('Calling Gemini API to analyze wellness content...');
    const geminiResponse = await callGeminiAPI(prompt, 4096, 0.7);

    if (!geminiResponse || typeof geminiResponse !== 'string') {
      throw new Error('No content received from Gemini API');
    }

    // Parse Gemini response
    let parsedResponse: { wellnessContent: WellnessContent[] };
    try {
      const rawResponse = extractJSONFromResponse(geminiResponse);
      parsedResponse = rawResponse as unknown as { wellnessContent: WellnessContent[] };
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      throw new Error('Invalid response format from Gemini API');
    }

    // Validate response
    if (!parsedResponse.wellnessContent || !Array.isArray(parsedResponse.wellnessContent)) {
      throw new Error('Invalid response format from Gemini API');
    }

    // Match TMDB data with Gemini analysis
    const enrichedContent = parsedResponse.wellnessContent.map((item) => {
      const tmdbItem = uniqueResults.find(
        (r) => String(r.id) === String(item.tmdbId)
      );

      if (tmdbItem) {
        const isMovie = 'title' in tmdbItem;
        return {
          ...item,
          title: isMovie ? tmdbItem.title : tmdbItem.name,
          posterPath: tmdbItem.poster_path || '/api/placeholder/500/750',
          overview: tmdbItem.overview || item.overview,
          releaseDate: isMovie ? tmdbItem.release_date : tmdbItem.first_air_date,
          voteAverage: tmdbItem.vote_average || item.voteAverage,
          posterUrl: tmdbItem.poster_path
            ? `https://image.tmdb.org/t/p/w500${tmdbItem.poster_path}`
            : '/api/placeholder/500/750'
        };
      }

      return {
        ...item,
        posterUrl: item.posterPath
          ? `https://image.tmdb.org/t/p/w500${item.posterPath}`
          : '/api/placeholder/500/750'
      };
    }).filter((item) => {
      // Filter by category if specified
      if (category && category !== 'all') {
        return item.category === category;
      }
      return true;
    }).slice(0, contentLimit);

    res.status(200).json({
      content: enrichedContent,
      count: enrichedContent.length,
      category: categoryKey
    });

  } catch (error) {
    console.error('Error fetching wellness content:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch wellness content',
      content: []
    });
  }
}

