import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SwipeableMediaCard } from './media-card';
import { Loading } from '@components/ui/loading';
import { Button } from '@components/ui/button-shadcn';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Heart, X, Meh, RefreshCw, Filter } from 'lucide-react';
import { useAuth } from '@lib/context/auth-context';
import { toast } from 'react-hot-toast';
import type { MediaCard, RatingType } from '@lib/types/rating';

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

  // Fetch popular movies and shows from TMDB
  useEffect(() => {
    const fetchMedia = async (): Promise<void> => {
      try {
        setLoading(true);

        // Fetch popular movies
        const moviesResponse = await fetch(
          `https://api.themoviedb.org/3/movie/popular?api_key=${
            process.env.NEXT_PUBLIC_TMDB_API_KEY ||
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

        // Fetch popular TV shows
        const tvResponse = await fetch(
          `https://api.themoviedb.org/3/tv/popular?api_key=${
            process.env.NEXT_PUBLIC_TMDB_API_KEY ||
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

        // Combine and format the data
        const movies = moviesData.results
          .slice(0, 10)
          .map(
            (movie: {
              id: number;
              title: string;
              poster_path: string;
              backdrop_path: string;
              overview: string;
              release_date: string;
              vote_average: number;
            }) => ({
              id: `movie-${movie.id}`,
              tmdbId: movie.id.toString(),
              title: movie.title,
              mediaType: 'movie' as const,
              posterPath: movie.poster_path,
              backdropPath: movie.backdrop_path,
              overview: movie.overview,
              releaseDate: movie.release_date,
              voteAverage: movie.vote_average,
              genres: [] // We'll fetch genres separately if needed
            })
          );

        const shows = tvData.results
          .slice(0, 10)
          .map(
            (show: {
              id: number;
              name: string;
              poster_path: string;
              backdrop_path: string;
              overview: string;
              first_air_date: string;
              vote_average: number;
            }) => ({
              id: `tv-${show.id}`,
              tmdbId: show.id.toString(),
              title: show.name,
              mediaType: 'tv' as const,
              posterPath: show.poster_path,
              backdropPath: show.backdrop_path,
              overview: show.overview,
              releaseDate: show.first_air_date,
              voteAverage: show.vote_average,
              genres: [] // We'll fetch genres separately if needed
            })
          );

        const allMedia = [...movies, ...shows];

        // Shuffle the array for randomness
        const shuffled = allMedia.sort(() => Math.random() - 0.5);

        setMediaCards(shuffled);
      } catch (error) {
        console.error('Error fetching media:', error);
        toast.error('Failed to load media');
      } finally {
        setLoading(false);
      }
    };

    void fetchMedia();
  }, []);

  const handleSwipe = (rating: RatingType): void => {
    if (currentIndex >= mediaCards.length) return;

    const currentMedia = mediaCards[currentIndex];

    // Call the callback if provided
    if (onRatingSubmit) {
      onRatingSubmit(currentMedia.tmdbId, rating, currentMedia);
    }

    // Show toast based on rating
    const ratingMessages = {
      love: '❤️ Loved it!',
      hate: '💔 Hated it!',
      meh: '😐 Not so much...'
    };

    toast.success(ratingMessages[rating]);

    // Move to next card
    setCurrentIndex((prev) => prev + 1);
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
    <div className='mx-auto w-full max-w-md space-y-6'>
      {/* Filter Buttons */}
      <div className='flex justify-center gap-2'>
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size='sm'
          onClick={() => handleFilterChange('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'movie' ? 'default' : 'outline'}
          size='sm'
          onClick={() => handleFilterChange('movie')}
        >
          Movies
        </Button>
        <Button
          variant={filter === 'tv' ? 'default' : 'outline'}
          size='sm'
          onClick={() => handleFilterChange('tv')}
        >
          TV Shows
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className='text-center text-sm text-gray-600'>
        {currentIndex + 1} of {filteredCards.length}
      </div>

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
          onClick={() => handleSwipe('hate')}
          className='h-12 w-12 rounded-full p-0'
        >
          <X className='h-6 w-6' />
        </Button>

        <Button
          variant='outline'
          size='lg'
          onClick={() => handleSwipe('meh')}
          className='h-12 w-12 rounded-full p-0'
        >
          <Meh className='h-6 w-6' />
        </Button>

        <Button
          variant='outline'
          size='lg'
          onClick={() => handleSwipe('love')}
          className='h-12 w-12 rounded-full p-0'
        >
          <Heart className='h-6 w-6' />
        </Button>
      </div>

      {/* Reset Button */}
      <div className='text-center'>
        <Button variant='ghost' onClick={handleReset} size='sm'>
          <RefreshCw className='mr-2 h-4 w-4' />
          Reset
        </Button>
      </div>
    </div>
  );
}
