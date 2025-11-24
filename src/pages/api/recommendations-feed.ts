import type { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '@lib/firebase/admin';
import type { RecommendationItem, ItemType } from '@lib/types/recommendation-item';

interface UserPreference {
  itemId: string;
  itemType: ItemType;
  preference: 'like' | 'dislike' | 'neutral';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { userId, limit = 20, cursor } = req.body;

  if (!userId) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    // Get user preferences
    let userPreferences: UserPreference[] = [];
    if (adminDb) {
      const prefsSnapshot = await adminDb
        .collection('user_preferences')
        .where('userId', '==', userId)
        .get();

      userPreferences = prefsSnapshot.docs.map((doc) => ({
        itemId: doc.data().itemId,
        itemType: doc.data().itemType,
        preference: doc.data().preference
      }));
    }

    // Get liked items to find similar recommendations
    const likedItems = userPreferences.filter((p) => p.preference === 'like');
    const dislikedItemIds = new Set(
      userPreferences.filter((p) => p.preference === 'dislike').map((p) => p.itemId)
    );

    // Generate recommendations based on preferences
    const recommendations: RecommendationItem[] = [];

    // If user has preferences, generate personalized recommendations
    if (likedItems.length > 0) {
      // For movies/TV: use existing recommendation logic
      const movieTvLikes = likedItems.filter(
        (item) => item.itemType === 'movie' || item.itemType === 'tv'
      );

      if (movieTvLikes.length > 0) {
        // Fetch movie/TV recommendations
        try {
          const recResponse = await fetch(
            `${req.headers.origin || 'http://localhost:3000'}/api/recommended-content`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                userId,
                count: Math.min(limit, 10)
              })
            }
          );

          if (recResponse.ok) {
            const recData = (await recResponse.json()) as {
              content: Array<{
                tmdbId: string;
                title: string;
                mediaType: 'movie' | 'tv';
                posterPath: string;
                overview: string;
                releaseDate: string;
                voteAverage: number;
                reason?: string;
                confidence?: number;
              }>;
            };

            const movieRecs = recData.content.map((item) => ({
              id: `${item.mediaType}-${item.tmdbId}`,
              itemType: item.mediaType as ItemType,
              title: item.title,
              description: item.overview,
              imageUrl: item.posterPath
                ? `https://image.tmdb.org/t/p/w500${item.posterPath}`
                : '/api/placeholder/500/500',
              tmdbId: Number(item.tmdbId),
              mediaType: item.mediaType,
              releaseDate: item.releaseDate,
              voteAverage: item.voteAverage,
              reason: item.reason,
              confidence: item.confidence || 0.7,
              source: 'ai' as const
            }));

            recommendations.push(...movieRecs);
          }
        } catch (error) {
          console.error('Error fetching movie recommendations:', error);
        }
      }

      // Add product recommendations (mock for now, can integrate with Amazon API later)
      if (recommendations.length < limit) {
        const productRecs = generateProductRecommendations(likedItems, limit - recommendations.length);
        recommendations.push(...productRecs);
      }
    } else {
      // New user: show trending/popular items
      const trendingRecs = await generateTrendingRecommendations(limit);
      recommendations.push(...trendingRecs);
    }

    // Filter out disliked items
    const filteredRecs = recommendations.filter(
      (rec) => !dislikedItemIds.has(rec.id)
    );

    // Remove duplicates
    const uniqueRecs = Array.from(
      new Map(filteredRecs.map((rec) => [rec.id, rec])).values()
    );

    const limitedRecs = uniqueRecs.slice(0, limit);
    const hasMoreItems = uniqueRecs.length > limit;

    res.status(200).json({
      items: limitedRecs,
      hasMore: hasMoreItems,
      nextCursor: hasMoreItems ? `cursor_${Date.now()}` : undefined
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
}

function generateProductRecommendations(
  likedItems: UserPreference[],
  count: number
): RecommendationItem[] {
  // Mock product recommendations based on liked items
  // In production, this would integrate with Amazon Product Advertising API
  const mockProducts: RecommendationItem[] = [
    {
      id: 'product-1',
      itemType: 'product',
      title: 'Wireless Bluetooth Headphones',
      description: 'Premium noise-cancelling headphones with 30-hour battery life',
      imageUrl: '/api/placeholder/500/500',
      productUrl: 'https://amazon.com/dp/example1',
      price: '$99.99',
      brand: 'TechBrand',
      category: 'Electronics',
      rating: 4.5,
      confidence: 0.75,
      source: 'ai'
    },
    {
      id: 'product-2',
      itemType: 'product',
      title: 'Smart Watch',
      description: 'Fitness tracker with heart rate monitor and GPS',
      imageUrl: '/api/placeholder/500/500',
      productUrl: 'https://amazon.com/dp/example2',
      price: '$199.99',
      brand: 'TechBrand',
      category: 'Wearables',
      rating: 4.3,
      confidence: 0.72,
      source: 'ai'
    }
  ];

  return mockProducts.slice(0, count);
}

async function generateTrendingRecommendations(
  count: number
): Promise<RecommendationItem[]> {
  // Fetch trending movies/TV from TMDB
  const apiKey =
    process.env.NEXT_PUBLIC_TMDB_API_KEY ?? '0af4f0642998fa986fe260078ab69ab6';

  const recommendations: RecommendationItem[] = [];

  try {
    const endpoints = [
      { url: 'movie/popular', type: 'movie' as ItemType },
      { url: 'tv/popular', type: 'tv' as ItemType }
    ];

    for (const endpoint of endpoints) {
      const response = await fetch(
        `https://api.themoviedb.org/3/${endpoint.url}?api_key=${apiKey}&language=en-US&page=1`
      );

      if (response.ok) {
        const data = (await response.json()) as {
          results: Array<{
            id: number;
            title?: string;
            name?: string;
            poster_path: string;
            overview: string;
            release_date?: string;
            first_air_date?: string;
            vote_average: number;
          }>;
        };

        const items = data.results.slice(0, Math.ceil(count / 2)).map((item) => ({
          id: `${endpoint.type}-${item.id}`,
          itemType: endpoint.type,
          title: (endpoint.type === 'movie' ? item.title : item.name) ?? 'Unknown',
          description: item.overview,
          imageUrl: item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : '/api/placeholder/500/500',
          tmdbId: item.id,
          mediaType: endpoint.type === 'movie' ? ('movie' as const) : ('tv' as const),
          releaseDate:
            endpoint.type === 'movie' ? item.release_date : item.first_air_date,
          voteAverage: item.vote_average,
          confidence: 0.6,
          source: 'trending' as const
        }));

        recommendations.push(...items);
      }
    }
  } catch (error) {
    console.error('Error fetching trending content:', error);
  }

  return recommendations.slice(0, count);
}

