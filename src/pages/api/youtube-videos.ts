import type { NextApiRequest, NextApiResponse } from 'next';

interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  viewCount?: string;
  duration?: string;
  category: 'yoga' | 'meditation';
}

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!YOUTUBE_API_KEY) {
    res.status(500).json({ 
      error: 'YouTube API key not configured',
      videos: []
    });
    return;
  }

  try {
    const { category = 'all', limit = '6' } = req.query;
    const videoLimit = parseInt(limit as string, 10);

    const videos: YouTubeVideo[] = [];

    // Search queries for different categories
    const searchQueries: Record<string, string[]> = {
      yoga: [
        'yoga for beginners',
        'morning yoga',
        'yoga flow',
        'yoga practice',
        'yoga tutorial'
      ],
      meditation: [
        'guided meditation',
        'meditation for beginners',
        'mindfulness meditation',
        'sleep meditation',
        'morning meditation'
      ]
    };

    // Determine which categories to search
    const categoriesToSearch =
      category === 'all' ? ['yoga', 'meditation'] : [category as string];

    for (const cat of categoriesToSearch) {
      const queries = searchQueries[cat] || [];
      
      // Search for videos using the first query (most relevant)
      if (queries.length > 0) {
        const searchQuery = queries[0];
        // Get recent videos (published in last 30 days, sorted by date)
        const publishedAfter = new Date();
        publishedAfter.setDate(publishedAfter.getDate() - 30);
        const publishedAfterISO = publishedAfter.toISOString();
        
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(
          searchQuery
        )}&maxResults=${Math.ceil(videoLimit / categoriesToSearch.length)}&order=date&publishedAfter=${publishedAfterISO}&relevanceLanguage=en&key=${YOUTUBE_API_KEY}`;

        try {
          const searchResponse = await fetch(searchUrl);
          if (!searchResponse.ok) {
            const errorData = await searchResponse.json().catch(() => ({}));
            const errorMessage = errorData.error?.message || `HTTP ${searchResponse.status}`;
            const errorReason = errorData.error?.errors?.[0]?.reason || '';
            console.error(`YouTube API error: ${searchResponse.status}`, errorMessage);
            
            // Check for quota exceeded error
            if (searchResponse.status === 403 && (errorMessage.includes('quota') || errorReason === 'quotaExceeded' || errorMessage.includes('exceeded'))) {
              throw new Error('QUOTA_EXCEEDED: YouTube API daily quota has been exceeded. The quota resets at midnight Pacific Time. Please try again later.');
            }
            
            // If API is blocked, throw a more specific error
            if (searchResponse.status === 403 && errorMessage.includes('blocked')) {
              throw new Error('YouTube Data API v3 is not enabled. Please enable it in Google Cloud Console.');
            }
            continue;
          }

          const searchData = await searchResponse.json() as {
            items?: Array<{
              id: { videoId: string };
              snippet: {
                title: string;
                description: string;
                thumbnails: {
                  high?: { url: string };
                  default?: { url: string };
                  medium?: { url: string };
                };
                channelTitle: string;
                publishedAt: string;
              };
            }>;
          };

          if (searchData.items && searchData.items.length > 0) {
            // Get video details for view counts
            const videoIds = searchData.items
              .map((item) => item.id.videoId)
              .join(',');

            const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
            const detailsResponse = await fetch(detailsUrl);
            if (!detailsResponse.ok) {
              console.error(`YouTube Details API error: ${detailsResponse.status}`);
              // Continue without view counts if details API fails
            }
            const detailsData = await detailsResponse.json().catch(() => ({ items: [] })) as {
              items?: Array<{
                statistics?: { viewCount?: string };
                contentDetails?: { duration?: string };
              }>;
            };

            searchData.items.forEach((item, idx) => {
              const details = detailsData.items?.[idx];
              videos.push({
                videoId: item.id.videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
                channelTitle: item.snippet.channelTitle,
                publishedAt: item.snippet.publishedAt,
                viewCount: details?.statistics?.viewCount,
                duration: details?.contentDetails?.duration,
                category: cat as 'yoga' | 'meditation'
              });
            });
          }
        } catch (error) {
          console.error(`Error fetching ${cat} videos:`, error);
        }
      }
    }

    // Sort by publish date (most recent first) and limit
    const sortedVideos = videos
      .sort((a, b) => {
        const dateA = new Date(a.publishedAt).getTime();
        const dateB = new Date(b.publishedAt).getTime();
        return dateB - dateA; // Most recent first
      })
      .slice(0, videoLimit);

    console.log(`Returning ${sortedVideos.length} videos for category: ${category}`);
    
    // If no videos found and it's not a quota error, return empty array with success
    if (sortedVideos.length === 0) {
      res.status(200).json({ 
        videos: [],
        message: 'No videos found. This may be due to API quota limits or no recent videos matching the search criteria.'
      });
      return;
    }
    
    res.status(200).json({ videos: sortedVideos });
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    // Return specific status code for quota errors
    if (errorMessage.includes('QUOTA_EXCEEDED')) {
      res.status(429).json({
        error: errorMessage,
        videos: []
      });
      return;
    }
    
    res.status(500).json({
      error: errorMessage,
      videos: []
    });
  }
}

