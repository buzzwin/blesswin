import { callGeminiAPI, extractJSONFromResponse } from '@lib/api/gemini';
import type { NextApiRequest, NextApiResponse } from 'next';

interface TrendingShow {
  title: string;
  tmdbId: string;
  mediaType: 'movie' | 'tv';
  posterPath: string;
  overview: string;
  releaseDate: string;
  voteAverage: number;
  reason?: string;
  confidence?: number;
}

interface GeminiResponseItem {
  tmdbId: string;
  title: string;
  mediaType: 'movie' | 'tv';
  posterPath: string;
  overview: string;
  releaseDate: string;
  voteAverage?: number;
  reason?: string;
  confidence?: number;
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
    // Calculate current year and related years
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
    const nextYear = currentYear + 1;

    // Use the same prompt as recommendations API for consistency
    const prompt = `You are a movie and TV show recommendation expert specializing in American popular culture.

Your task is to provide 10 REAL and CURRENT popular shows and movies from TMDB (The Movie Database).

🚨 CRITICAL: You MUST provide REAL content with ACTUAL TMDB IDs, titles, and poster paths. DO NOT make up fake titles like "Example TV Show" or "Sci Fi Series 2025".

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

💡 Output Format:
Return ONLY a valid JSON object with REAL TMDB data:

{
  "content": [
    {
      "tmdbId": "1234567",
      "title": "Real Movie/Show Title",
      "mediaType": "movie" or "tv",
      "posterPath": "/real-poster-path.jpg",
      "overview": "Real description from TMDB",
      "releaseDate": "2024",
      "voteAverage": 8.5,
      "reason": "Why this real show/movie is popular",
      "confidence": 0.9
    }
  ]
}

⚠️ IMPORTANT: Use ONLY real TMDB IDs, real titles, and real poster paths. NO fake or example data.`;

    // Fetch trending content using the same prompt as recommendations
    let trendingContent: TrendingShow[] = [];
    
    try {
      const responseText = await callGeminiAPI(prompt, 1500, 0.7);
      const parsedResponse = extractJSONFromResponse(responseText);
      
      if (parsedResponse.content && Array.isArray(parsedResponse.content)) {
        trendingContent = parsedResponse.content.map((item: GeminiResponseItem) => ({
          title: item.title,
          tmdbId: item.tmdbId,
          mediaType: item.mediaType,
          posterPath: item.posterPath,
          overview: item.overview,
          releaseDate: item.releaseDate,
          voteAverage: item.voteAverage ?? 7.0,
          reason: item.reason,
          confidence: item.confidence
        }));
      }
    } catch (geminiError) {
      // Gemini API failed, will use TMDB fallback
      // console.error('Gemini API failed:', geminiError);
    }
    
    // If we got content from Gemini, return it
    if (trendingContent.length > 0) {
      res.status(200).json({ 
        content: trendingContent,
        source: 'unified-prompt'
      });
    } else {
      // No Gemini data available, proceed to TMDB fallback
      throw new Error('No trending data from Gemini');
    }

  } catch (error) {
    // Error fetching trending content, using fallback
    
    // Fallback to popular TMDB content if Gemini fails
    try {
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY ?? '0af4f0642998fa986fe260078ab69ab6';
      const endpoints = [
        { url: 'movie/popular', type: 'movie' },
        { url: 'tv/popular', type: 'tv' },
        { url: 'movie/now_playing', type: 'movie' },
        { url: 'tv/on_the_air', type: 'tv' },
        { url: 'movie/top_rated', type: 'movie' },
        { url: 'tv/top_rated', type: 'tv' }
      ];

      const trendingContent: TrendingShow[] = [];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(
            `https://api.themoviedb.org/3/${endpoint.url}?api_key=${apiKey}&language=en-US&page=1`
          );
          
          if (response.ok) {
            const data = await response.json() as {
              results: Array<{
                id: number;
                title?: string;
                name?: string;
                poster_path: string;
                overview: string;
                release_date?: string;
                first_air_date?: string;
                vote_average: number;
                popularity: number;
              }>;
            };
            const items = data.results.slice(0, 3).map((item) => ({
              title: (endpoint.type === 'movie' ? item.title : item.name) ?? 'Unknown Title',
              tmdbId: item.id.toString(),
              mediaType: endpoint.type as 'movie' | 'tv',
              posterPath: item.poster_path,
              overview: item.overview,
              releaseDate: (endpoint.type === 'movie' ? item.release_date : item.first_air_date) ?? '',
              voteAverage: item.vote_average,
              reason: 'Popular content',
              confidence: item.popularity / 100
            }));
            
            trendingContent.push(...items);
          }
        } catch (endpointError) {
          // Failed to fetch from endpoint, continuing with others
          continue; // Continue with other endpoints
        }
      }

      // Remove duplicates and shuffle
      const uniqueContent = trendingContent.filter(
        (item, index, self) => index === self.findIndex(t => t.tmdbId === item.tmdbId)
      );

      const shuffledContent = uniqueContent
        .sort(() => Math.random() - 0.5)
        .slice(0, 15); // Return up to 15 items

      if (shuffledContent.length > 0) {
        res.status(200).json({ 
          content: shuffledContent,
          source: 'tmdb-fallback'
        });
      } else {
        // Even TMDB fallback failed, return a basic error
        res.status(500).json({ error: 'Failed to fetch trending content' });
      }
    } catch (fallbackError) {
      // TMDB fallback also failed
      res.status(500).json({ error: 'Failed to fetch trending content' });
    }
  }
} 