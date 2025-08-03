import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SwipeableMediaCard } from './media-card';
import { Loading } from '@components/ui/loading';
import { Button } from '@components/ui/button-shadcn';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Heart, X, Meh, RefreshCw, Filter } from 'lucide-react';
import { useAuth } from '@lib/context/auth-context';
import type { MediaCard, RatingType } from '@lib/types/rating';
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
  const [filter, setFilter] = useState<'all' | 'movie' | 'tv'>('all');
  const { user } = useAuth();

  // Fetch AI-recommended content or fallback to popular content
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
              const data = await response.json() as { content: Array<{
                tmdbId: string;
                title: string;
                mediaType: 'movie' | 'tv';
                posterPath: string;
                overview: string;
                releaseDate: string;
                voteAverage: number;
                reason?: string;
                confidence?: number;
              }>; source: string };
              
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
              
              toast.success('Showing AI-recommended content based on your preferences!');
              return;
            }
          } catch (aiError) {
            // console.error('AI recommendations failed, falling back to popular content:', aiError);
          }
        }

        // Fallback to popular content from TMDB
        const moviesResponse = await fetch(
          `https://api.themoviedb.org/3/movie/popular?api_key=${
            process.env.NEXT_PUBLIC_TMDB_API_KEY ??
            '0af4f0642998fa986fe260078ab69ab6'
          }&language=en-US&page=1`
        );
        const moviesData = (await moviesResponse.json()) as {
          results: Array<{
            id: number;
            title: string;
            poster_path: string;
            backdrop_path: string;
            overview: string;
            release_date: string;
            vote_average: number;
          }>;
        };

        const tvResponse = await fetch(
          `https://api.themoviedb.org/3/tv/popular?api_key=${
            process.env.NEXT_PUBLIC_TMDB_API_KEY ??
            '0af4f0642998fa986fe260078ab69ab6'
          }&language=en-US&page=1`
        );
        const tvData = (await tvResponse.json()) as {
          results: Array<{
            id: number;
            name: string;
            poster_path: string;
            backdrop_path: string;
            overview: string;
            first_air_date: string;
            vote_average: number;
          }>;
        };

        const movies = moviesData.results
          .slice(0, 10)
          .map((movie) => ({
            id: `movie-${movie.id}`,
            tmdbId: movie.id.toString(),
            title: movie.title,
            mediaType: 'movie' as const,
            posterPath: movie.poster_path,
            backdropPath: movie.backdrop_path,
            overview: movie.overview,
            releaseDate: movie.release_date,
            voteAverage: movie.vote_average,
            genres: []
          }));

        const shows = tvData.results
          .slice(0, 10)
          .map((show) => ({
            id: `tv-${show.id}`,
            tmdbId: show.id.toString(),
            title: show.name,
            mediaType: 'tv' as const,
            posterPath: show.poster_path,
            backdropPath: show.backdrop_path,
            overview: show.overview,
            releaseDate: show.first_air_date,
            voteAverage: show.vote_average,
            genres: []
          }));

        const allMedia = [...movies, ...shows];
        const shuffled = allMedia.sort(() => Math.random() - 0.5);
        setMediaCards(shuffled);
        
        toast.success('Showing popular content! Rate more to get personalized recommendations.');
      } catch (error) {
        // console.error('Error fetching media:', error);
        toast.error('Failed to load media');
      } finally {
        setLoading(false);
      }
    };

    void fetchMedia();
  }, [user?.id]);

  const handleSwipe = async (direction: 'left' | 'right' | 'middle'): Promise<void> => {
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
    if (user?.id && currentIndex >= mediaCards.length - 3) {
      try {
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
          const data = await response.json() as { content: Array<{
            tmdbId: string;
            title: string;
            mediaType: 'movie' | 'tv';
            posterPath: string;
            overview: string;
            releaseDate: string;
            voteAverage: number;
            reason?: string;
            confidence?: number;
          }>; source: string };
          
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
          setMediaCards(prev => [...prev, ...newMedia as MediaCard[]]);
        }
      } catch (error) {
        // console.error('Error fetching new recommendations:', error);
        // Silently fail - user can continue with existing cards
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
      <div className='min-h-96 flex items-center justify-center'>
        <Loading />
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
            <RefreshCw className='mr-2 h-4 w-4' />
            Start Over
          </Button>
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
      </div>

      {/* Quick Action Buttons */}
      <div className='flex justify-center gap-4'>
        <Button
          variant='outline'
          size='lg'
          onClick={() => handleSwipe('left')}
          className='h-12 w-12 rounded-full p-0'
        >
          <X className='h-6 w-6' />
        </Button>

        <Button
          variant='outline'
          size='lg'
          onClick={() => handleSwipe('middle')}
          className='h-12 w-12 rounded-full p-0'
        >
          <Meh className='h-6 w-6' />
        </Button>

        <Button
          variant='outline'
          size='lg'
          onClick={() => handleSwipe('right')}
          className='h-12 w-12 rounded-full p-0'
        >
          <Heart className='h-6 w-6' />
        </Button>
      </div>
    </div>
  );
}
