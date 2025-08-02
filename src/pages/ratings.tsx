import { useEffect, useState } from 'react';
import { HomeLayout } from '@components/layout/common-layout';
import { SEO } from '@components/common/seo';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button-shadcn';
import { Loading } from '@components/ui/loading';
import { Heart, X, Meh, Trash2, Film, Tv } from 'lucide-react';
import Image from 'next/image';
import {
  getUserRatings,
  getRatingStats,
  deleteRating
} from '@lib/firebase/utils/rating';
import type { MediaRating } from '@lib/types/rating';
import { useAuth } from '@lib/context/auth-context';
import { getTMDBImageUrl } from '@lib/utils';
import { FallbackImage } from '@components/ui/fallback-image';

interface RatingStats {
  love: number;
  hate: number;
  meh: number;
  total: number;
}

export default function RatingsPage(): JSX.Element {
  const { user } = useAuth();
  const [ratings, setRatings] = useState<MediaRating[]>([]);
  const [stats, setStats] = useState<RatingStats>({
    love: 0,
    hate: 0,
    meh: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const fetchRatings = async (): Promise<void> => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      console.log('Fetching ratings for user:', user.id);
      const userRatings = await getUserRatings(user.id);
      console.log('Fetched ratings:', userRatings);

      setRatings(userRatings);

      const ratingStats = await getRatingStats(user.id);
      setStats(ratingStats);
    } catch (err) {
      console.error('Error fetching ratings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch ratings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRating = async (ratingId: string): Promise<void> => {
    if (!user) return;

    try {
      await deleteRating(ratingId, user.id);
      setRatings((prev) => prev.filter((rating) => rating.id !== ratingId));

      // Update stats
      const updatedStats = await getRatingStats(user.id);
      setStats(updatedStats);
    } catch (err) {
      console.error('Error deleting rating:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete rating');
    }
  };

  const handleImageError = (imageUrl: string) => {
    setImageErrors((prev) => new Set(prev).add(imageUrl));
  };

  useEffect(() => {
    void fetchRatings();
  }, [user]);

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'love':
        return <Heart className='h-5 w-5 text-red-500' />;
      case 'hate':
        return <X className='h-5 w-5 text-gray-500' />;
      case 'meh':
        return <Meh className='h-5 w-5 text-yellow-500' />;
      default:
        return null;
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'love':
        return 'border-red-200 bg-red-50 dark:border-red-800/30 dark:bg-red-900/20';
      case 'hate':
        return 'border-gray-200 bg-gray-50 dark:border-gray-800/30 dark:bg-gray-900/20';
      case 'meh':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800/30 dark:bg-yellow-900/20';
      default:
        return 'border-gray-200 bg-white dark:border-gray-800/30 dark:bg-gray-800';
    }
  };

  if (loading) {
    return (
      <HomeLayout>
        <SEO title='My Ratings - Buzzwin' />
        <div className='flex min-h-screen items-center justify-center'>
          <div className='text-center'>
            <Loading className='mx-auto mb-4 h-8 w-8' />
            <p className='text-gray-600 dark:text-gray-400'>
              Loading your ratings...
            </p>
          </div>
        </div>
      </HomeLayout>
    );
  }

  if (error) {
    return (
      <HomeLayout>
        <SEO title='My Ratings - Buzzwin' />
        <div className='flex min-h-screen items-center justify-center'>
          <div className='text-center'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30'>
              <X className='h-8 w-8 text-red-600 dark:text-red-400' />
            </div>
            <h2 className='mb-2 text-xl font-bold text-gray-900 dark:text-white'>
              Error Loading Ratings
            </h2>
            <p className='mb-4 text-gray-600 dark:text-gray-400'>{error}</p>
            <Button onClick={() => void fetchRatings()}>Try Again</Button>
          </div>
        </div>
      </HomeLayout>
    );
  }

  return (
    <HomeLayout>
      <SEO title='My Ratings - Buzzwin' />

      <div className='mx-auto max-w-4xl px-4 py-8'>
        <div className='mb-8'>
          <h1 className='mb-2 text-3xl font-bold text-gray-900 dark:text-white'>
            My Ratings
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>
            Your personalized collection of rated shows and movies
          </p>
        </div>

        {/* Stats Cards */}
        <div className='mb-8 grid grid-cols-1 gap-4 sm:grid-cols-4'>
          <Card className='border-green-200 bg-green-50 dark:border-green-800/30 dark:bg-green-900/20'>
            <CardContent className='p-4'>
              <div className='flex items-center gap-2'>
                <Heart className='h-5 w-5 text-green-600 dark:text-green-400' />
                <span className='text-sm font-medium text-green-800 dark:text-green-200'>
                  Loved
                </span>
              </div>
              <p className='mt-1 text-2xl font-bold text-green-900 dark:text-green-100'>
                {stats.love}
              </p>
            </CardContent>
          </Card>

          <Card className='border-red-200 bg-red-50 dark:border-red-800/30 dark:bg-red-900/20'>
            <CardContent className='p-4'>
              <div className='flex items-center gap-2'>
                <X className='h-5 w-5 text-red-600 dark:text-red-400' />
                <span className='text-sm font-medium text-red-800 dark:text-red-200'>
                  Hated
                </span>
              </div>
              <p className='mt-1 text-2xl font-bold text-red-900 dark:text-red-100'>
                {stats.hate}
              </p>
            </CardContent>
          </Card>

          <Card className='border-yellow-200 bg-yellow-50 dark:border-yellow-800/30 dark:bg-yellow-900/20'>
            <CardContent className='p-4'>
              <div className='flex items-center gap-2'>
                <Meh className='h-5 w-5 text-yellow-600 dark:text-yellow-400' />
                <span className='text-sm font-medium text-yellow-800 dark:text-yellow-200'>
                  Meh
                </span>
              </div>
              <p className='mt-1 text-2xl font-bold text-yellow-900 dark:text-yellow-100'>
                {stats.meh}
              </p>
            </CardContent>
          </Card>

          <Card className='border-blue-200 bg-blue-50 dark:border-blue-800/30 dark:bg-blue-900/20'>
            <CardContent className='p-4'>
              <div className='flex items-center gap-2'>
                <Film className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                <span className='text-sm font-medium text-blue-800 dark:text-blue-200'>
                  Total
                </span>
              </div>
              <p className='mt-1 text-2xl font-bold text-blue-900 dark:text-blue-100'>
                {stats.total}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Ratings List */}
        {ratings.length === 0 ? (
          <Card>
            <CardContent className='py-12 text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800'>
                <Film className='h-8 w-8 text-gray-400' />
              </div>
              <h3 className='mb-2 text-lg font-medium text-gray-900 dark:text-white'>
                No Ratings Yet
              </h3>
              <p className='text-gray-600 dark:text-gray-400'>
                Start rating shows and movies to see them here!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className='grid gap-4'>
            {ratings.map((rating) => {
              const imageUrl = getTMDBImageUrl(rating.posterPath, 'w154');
              const hasImageError = imageUrl ? imageErrors.has(imageUrl) : true;

              return (
                <Card key={rating.id} className={getRatingColor(rating.rating)}>
                  <CardContent className='p-4'>
                    <div className='flex gap-4'>
                      {/* Poster */}
                      <div className='relative h-20 w-14 flex-shrink-0 overflow-hidden rounded-lg shadow-md'>
                        {imageUrl && !hasImageError ? (
                          <Image
                            src={imageUrl}
                            alt={rating.title}
                            width={56}
                            height={80}
                            className='object-cover'
                            onError={() => handleImageError(imageUrl)}
                          />
                        ) : (
                          <FallbackImage
                            mediaType={rating.mediaType}
                            className='h-full w-full'
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className='min-w-0 flex-1'>
                        <div className='mb-2 flex items-start justify-between'>
                          <div className='min-w-0 flex-1'>
                            <h3 className='truncate text-lg font-semibold text-gray-900 dark:text-white'>
                              {rating.title}
                            </h3>
                            <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                              <span className='capitalize'>
                                {rating.mediaType}
                              </span>
                              {rating.releaseDate && (
                                <>
                                  <span>•</span>
                                  <span>
                                    {new Date(rating.releaseDate).getFullYear()}
                                  </span>
                                </>
                              )}
                              {rating.voteAverage && rating.voteAverage > 0 && (
                                <>
                                  <span>•</span>
                                  <span>
                                    ⭐ {rating.voteAverage.toFixed(1)}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className='flex items-center gap-2'>
                            {getRatingIcon(rating.rating)}
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => void handleDeleteRating(rating.id)}
                              className='text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300'
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </div>

                        {rating.overview && (
                          <p className='line-clamp-2 text-sm text-gray-600 dark:text-gray-400'>
                            {rating.overview}
                          </p>
                        )}

                        <div className='mt-2 text-xs text-gray-500 dark:text-gray-500'>
                          Rated on {rating.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </HomeLayout>
  );
}
