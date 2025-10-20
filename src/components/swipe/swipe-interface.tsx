import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  X,
  Meh,
  RefreshCw,
  Filter,
  LogIn,
  Star,
  TrendingUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@lib/context/auth-context';
import { Loading } from '@components/ui/loading';
import { Button } from '@components/ui/button-shadcn';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { SwipeableMediaCard } from './media-card';
import { useRouter } from 'next/router';
import { SimpleSocialShare as SocialShare } from '@components/share/simple-social-share';
import type { MediaCard, RatingType } from '@lib/types/review';

interface SwipeInterfaceProps {
  onRatingSubmit?: (
    mediaId: string | number,
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
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Fetch AI-recommended content or trending content
  useEffect(() => {
    const fetchMedia = async (): Promise<void> => {
      try {
        setLoading(true);
        console.log(
          'Fetching media for user:',
          user?.id ? 'logged in' : 'not logged in'
        );

        if (user?.id) {
          // For logged-in users, try AI recommendations first
          try {
            console.log('Attempting AI recommendations...');
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

              console.log('AI recommendations response:', data);

              // Check if we got actual content
              if (data.content && data.content.length > 0) {
                console.log(
                  'Setting AI recommendations:',
                  data.content.length,
                  'items'
                );
                // Convert AI recommendations to MediaCard format
                const aiMedia = data.content.map((item) => ({
                  id: `${item.mediaType}-${item.tmdbId}`,
                  tmdbId: Number(item.tmdbId),
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
              } else {
                console.log('AI recommendations returned empty content');
              }
            } else {
              console.log(
                'AI recommendations failed with status:',
                response.status
              );
            }
          } catch (aiError) {
            console.error(
              'AI recommendations failed, falling back to trending content:',
              aiError
            );
          }
        }

        // For both logged-in and non-logged-in users, fall back to diverse content
        console.log('Falling back to diverse content...');

        // Final fallback to diverse content if all else fails
        console.log('Attempting diverse content fallback...');
        await fetchMoreDiverseContent();
      } catch (error) {
        console.error('Error fetching media:', error);
        setMediaCards([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchMedia();
  }, [user?.id]);

  const fetchMoreDiverseContent = async (): Promise<void> => {
    try {
      console.log('Starting fetchMoreDiverseContent...');
      // Fetch diverse content from multiple TMDB endpoints
      const apiKey =
        process.env.NEXT_PUBLIC_TMDB_API_KEY ??
        '0af4f0642998fa986fe260078ab69ab6';
      console.log(
        'Using TMDB API key:',
        apiKey ? 'configured' : 'using fallback'
      );

      const endpoints = [
        { url: 'movie/popular', type: 'movie' },
        { url: 'tv/popular', type: 'tv' },
        { url: 'movie/now_playing', type: 'movie' },
        { url: 'tv/on_the_air', type: 'tv' },
        { url: 'movie/top_rated', type: 'movie' },
        { url: 'tv/top_rated', type: 'tv' }
      ];

      const allMedia: MediaCard[] = [];

      for (const endpoint of endpoints) {
        try {
          console.log(`Fetching from ${endpoint.url}...`);
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
                popularity: number;
              }>;
            };

            console.log(
              `Got ${data.results.length} results from ${endpoint.url}`
            );

            const items = data.results.slice(0, 5).map((item) => ({
              id: `${endpoint.type}-${item.id}`,
              tmdbId: item.id,
              title:
                (endpoint.type === 'movie' ? item.title : item.name) ??
                'Unknown Title',
              mediaType: endpoint.type as 'movie' | 'tv',
              posterPath: item.poster_path,
              backdropPath: item.poster_path, // Use poster as backdrop fallback
              overview: item.overview,
              releaseDate:
                (endpoint.type === 'movie'
                  ? item.release_date
                  : item.first_air_date) ?? '',
              voteAverage: item.vote_average,
              genres: [],
              reason: 'Popular content',
              confidence: item.popularity / 100
            }));

            allMedia.push(...items);
          } else {
            console.log(
              `Failed to fetch from ${endpoint.url}, status:`,
              response.status
            );
          }
        } catch (endpointError) {
          console.error(`Error fetching from ${endpoint.url}:`, endpointError);
          // Continue with other endpoints
          continue;
        }
      }

      console.log(`Total media items collected: ${allMedia.length}`);

      // Remove duplicates and shuffle
      const uniqueMedia = allMedia.filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.tmdbId === item.tmdbId)
      );

      console.log(
        `Unique media items after deduplication: ${uniqueMedia.length}`
      );

      const shuffledMedia = uniqueMedia.sort(() => Math.random() - 0.5);
      console.log('Setting diverse content:', shuffledMedia.length, 'items');
      setMediaCards(shuffledMedia);
    } catch (error) {
      console.error('Error fetching diverse content:', error);
      setMediaCards([]);
    }
  };

  const handleSwipe = async (
    direction: 'left' | 'right' | 'middle'
  ): Promise<void> => {
    if (!currentCard) {
      console.error('No current card available');
      return;
    }

    // Check if user is authenticated before allowing rating
    if (!user) {
      setShowSignInPrompt(true);
      return;
    }

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
      // Ensure tmdbId is a valid number
      const tmdbId =
        typeof currentCard.tmdbId === 'number'
          ? currentCard.tmdbId
          : Number(currentCard.tmdbId);

      if (isNaN(tmdbId)) {
        console.error('Invalid tmdbId:', currentCard.tmdbId);
        return;
      }

      onRatingSubmit(tmdbId, rating, currentCard);
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
              tmdbId: Number(item.tmdbId),
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
          // For unauthenticated users, fetch more diverse content
          await fetchMoreDiverseContent();
        }
      } catch (error) {
        // console.error('Error fetching new recommendations:', error);
        // Silently fail - user can continue with existing cards
      } finally {
        setFetchingMore(false);
      }
    }
  };

  const handleSignIn = () => {
    void router.push('/login');
  };

  const handleClosePrompt = () => {
    setShowSignInPrompt(false);
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
      <div className='min-h-96 flex flex-col items-center justify-center space-y-4'>
        <Loading />
        <div className='text-center'>
          <h3 className='mb-2 text-lg font-semibold text-gray-900 dark:text-white'>
            Loading Content
          </h3>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            {user
              ? 'Getting personalized recommendations...'
              : 'Fetching popular shows and movies...'}
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
            {mediaCards.length === 0
              ? 'No Content Available'
              : 'No more cards!'}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4 text-center'>
          <p className='text-gray-600'>
            {mediaCards.length === 0
              ? 'Unable to load content. This might be due to API issues or network problems.'
              : "You've gone through all the available shows and movies."}
          </p>
          <div className='space-y-4'>
            <div className='flex justify-center gap-2'>
              <Button
                onClick={() => window.location.reload()}
                className='flex-1'
              >
                <RefreshCw className='mr-2 h-4 w-4' />
                Reload Page
              </Button>
              {mediaCards.length > 0 && (
                <Button onClick={handleReset} className='flex-1'>
                  <RefreshCw className='mr-2 h-4 w-4' />
                  Start Over
                </Button>
              )}
            </div>

            {/* Compact Social Share */}
            <div className='border-t border-gray-200 pt-4 dark:border-gray-700'>
              <SocialShare
                title="I'm discovering shows and movies on Buzzwin!"
                description='Join me in rating and discovering the best content with AI-powered recommendations!'
                url={typeof window !== 'undefined' ? window.location.href : ''}
                hashtags={['Buzzwin', 'RateShows', 'Movies', 'TVShows']}
                showTitle={false}
                size='sm'
                variant='compact'
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='mx-auto w-full max-w-md space-y-4'>
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
          <div className='absolute bottom-4 right-4 rounded-full bg-white/90 p-2 shadow-lg dark:bg-gray-800/90'>
            <div className='h-4 w-4 animate-spin rounded-full border-b-2 border-amber-500'></div>
          </div>
        )}
      </div>

      {/* Prominent Sign-In Prompt Modal */}
      {showSignInPrompt && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
          <div className='w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800'>
            <div className='text-center'>
              {/* Icon */}
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30'>
                <LogIn className='h-8 w-8 text-amber-600 dark:text-amber-400' />
              </div>

              {/* Title */}
              <h3 className='mb-2 text-xl font-bold text-gray-900 dark:text-white'>
                Sign In to Rate Shows!
              </h3>

              {/* Description */}
              <p className='mb-6 text-sm text-gray-600 dark:text-gray-300'>
                Join thousands of users who are rating and discovering amazing
                shows and movies. Your ratings help others find great content!
              </p>

              {/* Benefits */}
              <div className='mb-6 space-y-2 text-left'>
                <div className='flex items-center gap-2'>
                  <Heart className='h-4 w-4 text-red-500' />
                  <span className='text-sm text-gray-600 dark:text-gray-300'>
                    Rate shows you love or hate
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <TrendingUp className='h-4 w-4 text-green-500' />
                  <span className='text-sm text-gray-600 dark:text-gray-300'>
                    Get personalized recommendations
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <Star className='h-4 w-4 text-amber-500' />
                  <span className='text-sm text-gray-600 dark:text-gray-300'>
                    Discover great content
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex gap-3'>
                <Button
                  onClick={handleSignIn}
                  className='flex-1 bg-amber-600 text-white hover:bg-amber-700'
                >
                  <LogIn className='mr-2 h-4 w-4' />
                  Sign In
                </Button>
                <Button
                  onClick={handleClosePrompt}
                  variant='outline'
                  className='flex-1'
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
