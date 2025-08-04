import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SwipeableMediaCard } from './media-card';
import { Loading } from '@components/ui/loading';
import { Button } from '@components/ui/button-shadcn';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Heart, X, Meh, RefreshCw, Filter } from 'lucide-react';
import { useAuth } from '@lib/context/auth-context';
import type { MediaCard, RatingType } from '@lib/types/review';
import { toast } from 'react-hot-toast';

interface SwipeInterfaceProps {
  onRatingSubmit?: (
    mediaId: string,
    rating: RatingType,
    mediaData?: MediaCard
  ) => void;
}

export function SwipeInterface({
  onRatingSubmit
}: SwipeInterfaceProps): JSX.Element {
  const [mediaCards, setMediaCards] = useState<MediaCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [filter, setFilter] = useState<'all' | 'movie' | 'tv'>('all');
  const { user } = useAuth();

  // Fetch AI-recommended content or trending content
  useEffect(() => {
    const fetchMedia = async (): Promise<void> => {
      try {
        setLoading(true);

        if (user?.id) {
          // Always try to get fresh AI-recommended content first
          try {
            const response = await fetch('/api/recommended-content', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                userId: user.id,
                count: 30
              })
            });

            if (response.ok) {
              const data = (await response.json()) as {
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
                source: string;
              };

              // Convert AI recommendations to MediaCard format
              const aiMedia = data.content.map((item) => ({
                id: `${item.mediaType}-${item.tmdbId}`,
                tmdbId: item.tmdbId,
                title: item.title,
                mediaType: item.mediaType,
                posterPath: item.posterPath,
                backdropPath: item.posterPath, // Use poster as backdrop fallback
                overview: item.overview,
                releaseDate: item.releaseDate,
                voteAverage: item.voteAverage,
                genres: [],
                reason: item.reason,
                confidence: item.confidence
              }));

              setMediaCards(aiMedia as MediaCard[]);
              return;
            }
          } catch (aiError) {
            // console.error('AI recommendations failed, falling back to popular content:', aiError);
          }
        } else {
          // For non-logged-in users, fetch trending content from Gemini + TMDB
          try {
            const response = await fetch('/api/trending-content');

            if (response.ok) {
              const data = (await response.json()) as {
                content: Array<{
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
                }>;
                source: string;
              };

              // Convert trending content to MediaCard format
              const trendingMedia = data.content.map((item) => ({
                id: `${item.mediaType}-${item.tmdbId}`,
                tmdbId: item.tmdbId,
                title: item.title,
                mediaType: item.mediaType,
                posterPath: item.posterPath,
                backdropPath: item.posterPath, // Use poster as backdrop fallback
                overview: item.overview,
                releaseDate: item.releaseDate,
                voteAverage: item.voteAverage,
                genres: [],
                reason: `Trending on ${item.network || 'streaming platforms'}`,
                confidence: item.popularity / 100
              }));

              setMediaCards(trendingMedia as MediaCard[]);
              return;
            }
          } catch (trendingError) {
            // console.error('Trending content failed, falling back to popular content:', trendingError);
          }
        }

        // Fallback to diverse content from multiple TMDB endpoints
        const endpoints = [
          { url: 'movie/popular', type: 'movie' },
          { url: 'tv/popular', type: 'tv' },
          { url: 'movie/top_rated', type: 'movie' },
          { url: 'tv/top_rated', type: 'tv' },
          { url: 'movie/now_playing', type: 'movie' },
          { url: 'tv/on_the_air', type: 'tv' }
        ];

        const allMedia: MediaCard[] = [];
        const apiKey =
          process.env.NEXT_PUBLIC_TMDB_API_KEY ??
          '0af4f0642998fa986fe260078ab69ab6';

        // Fetch from multiple pages and endpoints for variety
        for (const endpoint of endpoints) {
          for (let page = 1; page <= 3; page++) {
            // Fetch 3 pages from each endpoint
            try {
              const response = await fetch(
                `https://api.themoviedb.org/3/${endpoint.url}?api_key=${apiKey}&language=en-US&page=${page}`
              );
              const data = (await response.json()) as {
                results: Array<{
                  id: number;
                  title?: string;
                  name?: string;
                  poster_path: string;
                  backdrop_path: string;
                  overview: string;
                  release_date?: string;
                  first_air_date?: string;
                  vote_average: number;
                }>;
              };

              const items = data.results
                .filter((item) => item.poster_path && item.overview) // Only include items with poster and overview
                .slice(0, 8) // Take 8 items per page to avoid overwhelming
                .map((item) => ({
                  id: `${endpoint.type}-${item.id}`,
                  tmdbId: item.id.toString(),
                  title: endpoint.type === 'movie' ? item.title! : item.name!,
                  mediaType: endpoint.type as 'movie' | 'tv',
                  posterPath: item.poster_path,
                  backdropPath: item.backdrop_path,
                  overview: item.overview,
                  releaseDate:
                    endpoint.type === 'movie'
                      ? item.release_date!
                      : item.first_air_date!,
                  voteAverage: item.vote_average,
                  genres: []
                }));

              allMedia.push(...items);
            } catch (error) {
              // console.error(`Error fetching ${endpoint.url} page ${page}:`, error);
              continue; // Continue with other endpoints if one fails
            }
          }
        }

        // Remove duplicates based on tmdbId
        const uniqueMedia = allMedia.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.tmdbId === item.tmdbId)
        );

        // Shuffle and take a good variety
        const shuffled = uniqueMedia
          .sort(() => Math.random() - 0.5)
          .slice(0, 50);
        setMediaCards(shuffled);
      } catch (error) {
        // console.error('Error fetching media:', error);
        toast.error('Failed to load media');
      } finally {
        setLoading(false);
      }
    };

    void fetchMedia();
  }, [user?.id]);

  // Function to fetch more diverse content for unauthenticated users
  const fetchMoreDiverseContent = async (): Promise<void> => {
    try {
      const apiKey =
        process.env.NEXT_PUBLIC_TMDB_API_KEY ??
        '0af4f0642998fa986fe260078ab69ab6';
      const additionalEndpoints = [
        { url: 'movie/upcoming', type: 'movie' },
        { url: 'tv/airing_today', type: 'tv' },
        {
          url: 'discover/movie',
          type: 'movie',
          params:
            '&sort_by=popularity.desc&include_adult=false&include_video=false&page=1'
        },
        {
          url: 'discover/tv',
          type: 'tv',
          params:
            '&sort_by=popularity.desc&include_adult=false&include_video=false&page=1'
        }
      ];

      const newMedia: MediaCard[] = [];

      for (const endpoint of additionalEndpoints) {
        try {
          const response = await fetch(
            `https://api.themoviedb.org/3/${
              endpoint.url
            }?api_key=${apiKey}&language=en-US${endpoint.params || ''}`
          );
          const data = (await response.json()) as {
            results: Array<{
              id: number;
              title?: string;
              name?: string;
              poster_path: string;
              backdrop_path: string;
              overview: string;
              release_date?: string;
              first_air_date?: string;
              vote_average: number;
            }>;
          };

          const items = data.results
            .filter((item) => item.poster_path && item.overview)
            .slice(0, 5)
            .map((item) => ({
              id: `${endpoint.type}-${item.id}`,
              tmdbId: item.id.toString(),
              title: endpoint.type === 'movie' ? item.title! : item.name!,
              mediaType: endpoint.type as 'movie' | 'tv',
              posterPath: item.poster_path,
              backdropPath: item.backdrop_path,
              overview: item.overview,
              releaseDate:
                endpoint.type === 'movie'
                  ? item.release_date!
                  : item.first_air_date!,
              voteAverage: item.vote_average,
              genres: []
            }));

          newMedia.push(...items);
        } catch (error) {
          // console.error(`Error fetching ${endpoint.url}:`, error);
          continue;
        }
      }

      // Remove duplicates and add to existing cards
      const uniqueNewMedia = newMedia.filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.tmdbId === item.tmdbId)
      );

      setMediaCards((prev) => {
        const existingIds = new Set(prev.map((card) => card.tmdbId));
        const filteredNewMedia = uniqueNewMedia.filter(
          (item) => !existingIds.has(item.tmdbId)
        );
        return [...prev, ...filteredNewMedia];
      });
    } catch (error) {
      // console.error('Error fetching more diverse content:', error);
    }
  };

  const handleSwipe = async (
    direction: 'left' | 'right' | 'middle'
  ): Promise<void> => {
    if (!currentCard) return;

    // Map direction to rating type
    let rating: RatingType;
    switch (direction) {
      case 'left':
        rating = 'hate';
        break;
      case 'right':
        rating = 'love';
        break;
      case 'middle':
        rating = 'meh';
        break;
      default:
        rating = 'meh';
    }

    // Call the callback with the rating
    if (onRatingSubmit) {
      onRatingSubmit(currentCard.tmdbId, rating, currentCard);
    }

    // Move to next card
    setCurrentIndex((prev) => prev + 1);

    // Fetch new recommendations after rating to include the latest rating
    // Also fetch more content for unauthenticated users when running low
    if (
      (user && currentIndex >= mediaCards.length - 3) ||
      (!user && currentIndex >= mediaCards.length - 5)
    ) {
      try {
        setFetchingMore(true);
        // Only fetch AI recommendations for authenticated users
        if (user) {
          const response = await fetch('/api/recommended-content', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              userId: user.id,
              count: 10
            })
          });

          if (response.ok) {
            const data = (await response.json()) as {
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
              source: string;
            };

            // Convert AI recommendations to MediaCard format
            const newMedia = data.content.map((item) => ({
              id: `${item.mediaType}-${item.tmdbId}`,
              tmdbId: item.tmdbId,
              title: item.title,
              mediaType: item.mediaType,
              posterPath: item.posterPath,
              backdropPath: item.posterPath, // Use poster as backdrop fallback
              overview: item.overview,
              releaseDate: item.releaseDate,
              voteAverage: item.voteAverage,
              genres: [],
              reason: item.reason,
              confidence: item.confidence
            }));

            // Add new recommendations to the existing cards
            setMediaCards((prev) => [...prev, ...(newMedia as MediaCard[])]);
          }
        } else {
          // For unauthenticated users, fetch more trending content
          try {
            const response = await fetch('/api/trending-content');
            
            if (response.ok) {
              const data = (await response.json()) as {
                content: Array<{
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
                }>;
                source: string;
              };

              // Convert trending content to MediaCard format
              const newTrendingMedia = data.content.map((item) => ({
                id: `${item.mediaType}-${item.tmdbId}`,
                tmdbId: item.tmdbId,
                title: item.title,
                mediaType: item.mediaType,
                posterPath: item.posterPath,
                backdropPath: item.posterPath, // Use poster as backdrop fallback
                overview: item.overview,
                releaseDate: item.releaseDate,
                voteAverage: item.voteAverage,
                genres: [],
                reason: `Trending on ${item.network || 'streaming platforms'}`,
                confidence: item.popularity / 100
              }));

              // Add new trending content to the existing cards
              setMediaCards((prev) => [...prev, ...(newTrendingMedia as MediaCard[])]);
            } else {
              // Fallback to diverse content if trending fails
              await fetchMoreDiverseContent();
            }
          } catch (trendingError) {
            // Fallback to diverse content if trending fails
            await fetchMoreDiverseContent();
          }
        }
      } catch (error) {
        // console.error('Error fetching new recommendations:', error);
        // Silently fail - user can continue with existing cards
      } finally {
        setFetchingMore(false);
      }
    }
  };

  const handleReset = (): void => {
    setCurrentIndex(0);
    // Shuffle the cards again
    setMediaCards((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  const handleFilterChange = (newFilter: 'all' | 'movie' | 'tv'): void => {
    setFilter(newFilter);
    setCurrentIndex(0);
  };

  const filteredCards = mediaCards.filter((card) => {
    if (filter === 'all') return true;
    return card.mediaType === filter;
  });

  const currentCard = filteredCards[currentIndex];
  const hasMoreCards = currentIndex < filteredCards.length;

  if (loading) {
    return (
      <div className='flex flex-col justify-center items-center min-h-96 space-y-4'>
        <Loading />
        <div className='text-center'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
            Loading Trending Content
          </h3>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            {user ? 'Getting personalized recommendations...' : 'Fetching the most popular shows in America...'}
          </p>
        </div>
      </div>
    );
  }

  if (!hasMoreCards) {
    return (
      <Card className='mx-auto w-full max-w-md'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl font-bold text-gray-800'>
            No more cards!
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4 text-center'>
          <p className='text-gray-600'>
            You&apos;ve gone through all the available shows and movies.
          </p>
          <Button onClick={handleReset} className='w-full'>
            <RefreshCw className='mr-2 w-4 h-4' />
            Start Over
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='mx-auto space-y-4 w-full max-w-md'>
      {/* Card Stack */}
      <div className='relative h-96'>
        <AnimatePresence>
          {currentCard && (
            <motion.div
              key={currentCard.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0, x: 300 }}
              transition={{ duration: 0.3 }}
              className='absolute inset-0'
            >
              <SwipeableMediaCard
                media={currentCard}
                onSwipe={handleSwipe}
                isActive={true}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Loading indicator for fetching more content */}
        {fetchingMore && (
          <div className='absolute bottom-4 right-4 bg-white/90 dark:bg-gray-800/90 rounded-full p-2 shadow-lg'>
            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-amber-500'></div>
          </div>
        )}
      </div>

      {/* Quick Action Buttons */}
      <div className='flex gap-4 justify-center'>
        <Button
          variant='outline'
          size='lg'
          onClick={() => handleSwipe('left')}
          className='p-0 w-12 h-12 rounded-full'
        >
          <X className='w-6 h-6' />
        </Button>

        <Button
          variant='outline'
          size='lg'
          onClick={() => handleSwipe('middle')}
          className='p-0 w-12 h-12 rounded-full'
        >
          <Meh className='w-6 h-6' />
        </Button>

        <Button
          variant='outline'
          size='lg'
          onClick={() => handleSwipe('right')}
          className='p-0 w-12 h-12 rounded-full'
        >
          <Heart className='w-6 h-6' />
        </Button>
      </div>
    </div>
  );
}
