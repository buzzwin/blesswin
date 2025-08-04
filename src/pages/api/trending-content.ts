import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchGeminiTrends } from '@lib/api/gemini';

interface TrendingContent {
  tmdbId: string;
  title: string;
  mediaType: 'movie' | 'tv';
  posterPath: string;
  overview: string;
  releaseDate: string;
  voteAverage: number;
  popularity: number;
  description: string;
  network?: string;
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
    // Fetch trending shows from Gemini
    let geminiTrends;
    try {
      geminiTrends = await fetchGeminiTrends();
    } catch (geminiError) {
      // Gemini API failed, using TMDB fallback
      geminiTrends = { trendingShows: [] };
    }
    
    if (!geminiTrends.trendingShows || geminiTrends.trendingShows.length === 0) {
      // If no Gemini data, go directly to TMDB fallback
      throw new Error('No trending data from Gemini');
    }

    // Get detailed information from TMDB for each trending show
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY ?? '0af4f0642998fa986fe260078ab69ab6';
    const trendingContent: TrendingContent[] = [];

    for (const show of geminiTrends.trendingShows.slice(0, 10)) { // Limit to 10 shows
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/${show.mediaType}/${show.mediaId}?api_key=${apiKey}&language=en-US`
        );

        if (response.ok) {
          const tmdbData = await response.json();
          
          trendingContent.push({
            tmdbId: show.mediaId,
            title: tmdbData.title || tmdbData.name || show.title,
            mediaType: show.mediaType,
            posterPath: tmdbData.poster_path || show.posterPath,
            overview: tmdbData.overview || show.description,
            releaseDate: tmdbData.release_date || tmdbData.first_air_date || show.releaseDate || '',
            voteAverage: tmdbData.vote_average || 0,
            popularity: show.popularity,
            description: show.description,
            network: show.network
          });
        }
      } catch (error) {
        // If TMDB fetch fails, use Gemini data as fallback
        trendingContent.push({
          tmdbId: show.mediaId,
          title: show.title,
          mediaType: show.mediaType,
          posterPath: show.posterPath,
          overview: show.description,
          releaseDate: show.releaseDate || '',
          voteAverage: 0,
          popularity: show.popularity,
          description: show.description,
          network: show.network
        });
      }
    }

    res.status(200).json({ 
      content: trendingContent,
      source: 'gemini-tmdb'
    });

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

      const fallbackContent: TrendingContent[] = [];

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
              tmdbId: item.id.toString(),
              title: (endpoint.type === 'movie' ? item.title : item.name) ?? 'Unknown Title',
              mediaType: endpoint.type as 'movie' | 'tv',
              posterPath: item.poster_path,
              overview: item.overview,
              releaseDate: (endpoint.type === 'movie' ? item.release_date : item.first_air_date) ?? '',
              voteAverage: item.vote_average,
              popularity: item.popularity,
              description: item.overview,
              network: undefined
            }));
            
            fallbackContent.push(...items);
          }
        } catch (endpointError) {
          // Failed to fetch from endpoint, continuing with others
          continue; // Continue with other endpoints
        }
      }

      // Remove duplicates and shuffle
      const uniqueContent = fallbackContent.filter(
        (item, index, self) => index === self.findIndex(t => t.tmdbId === item.tmdbId)
      );

      const shuffledContent = uniqueContent
        .sort(() => Math.random() - 0.5)
        .slice(0, 15); // Return up to 15 items

      res.status(200).json({ 
        content: shuffledContent,
        source: 'tmdb-fallback'
      });
    } catch (fallbackError) {
      // TMDB fallback also failed
      res.status(500).json({ error: 'Failed to fetch trending content' });
    }
  }
} 