import { HomeLayout } from '@components/layout/common-layout';
import { SEO } from '@components/common/seo';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button-shadcn';
import { useAuth } from '@lib/context/auth-context';
import { useRouter } from 'next/router';
import { ArrowLeft, Heart, X, Meh, BarChart3 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getUserRatings, getRatingStats } from '@lib/firebase/utils/rating';
import { Loading } from '@components/ui/loading';
import Image from 'next/image';
import type { MediaRating } from '@lib/types/rating';

export default function RatingsPage(): JSX.Element {
  const { user } = useAuth();
  const router = useRouter();
  const [ratings, setRatings] = useState<MediaRating[]>([]);
  const [stats, setStats] = useState({ love: 0, hate: 0, meh: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRatings = async (): Promise<void> => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const [userRatings, userStats] = await Promise.all([
          getUserRatings(user.id),
          getRatingStats(user.id)
        ]);

        setRatings(userRatings);
        setStats(userStats);
      } catch (error) {
        console.error('Error fetching ratings:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchRatings();
  }, [user?.id]);

  const handleBackToHome = (): void => {
    void router.push('/');
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'love':
        return <Heart className='h-4 w-4 fill-red-500 text-red-500' />;
      case 'hate':
        return <X className='h-4 w-4 text-gray-500' />;
      case 'meh':
        return <Meh className='h-4 w-4 text-yellow-500' />;
      default:
        return null;
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'love':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'hate':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      case 'meh':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <HomeLayout>
        <div className='min-h-96 flex items-center justify-center'>
          <Card className='mx-auto max-w-md'>
            <CardContent className='p-6 text-center'>
              <p className='mb-4 text-gray-600 dark:text-gray-400'>
                Please sign in to view your ratings
              </p>
              <Button onClick={handleBackToHome}>Back to Home</Button>
            </CardContent>
          </Card>
        </div>
      </HomeLayout>
    );
  }

  return (
    <HomeLayout>
      <SEO title='My Ratings - Buzzwin' />

      <div className='min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800'>
        <div className='container mx-auto px-4 py-8'>
          {/* Header */}
          <div className='mb-8'>
            <Button variant='ghost' onClick={handleBackToHome} className='mb-4'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Home
            </Button>

            <div className='text-center'>
              <h1 className='mb-2 text-4xl font-bold text-gray-900 dark:text-white'>
                My Ratings
              </h1>
              <p className='text-lg text-gray-600 dark:text-gray-300'>
                Your personal rating history and statistics
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className='mb-8 grid grid-cols-1 gap-4 md:grid-cols-4'>
            <Card>
              <CardContent className='p-4 text-center'>
                <div className='mb-2 flex items-center justify-center'>
                  <Heart className='h-6 w-6 fill-red-500 text-red-500' />
                </div>
                <div className='text-2xl font-bold text-red-600'>
                  {stats.love}
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-400'>
                  Loved
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4 text-center'>
                <div className='mb-2 flex items-center justify-center'>
                  <Meh className='h-6 w-6 text-yellow-500' />
                </div>
                <div className='text-2xl font-bold text-yellow-600'>
                  {stats.meh}
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-400'>
                  Not so much
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4 text-center'>
                <div className='mb-2 flex items-center justify-center'>
                  <X className='h-6 w-6 text-gray-500' />
                </div>
                <div className='text-2xl font-bold text-gray-600'>
                  {stats.hate}
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-400'>
                  Hated
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4 text-center'>
                <div className='mb-2 flex items-center justify-center'>
                  <BarChart3 className='h-6 w-6 text-blue-500' />
                </div>
                <div className='text-2xl font-bold text-blue-600'>
                  {stats.total}
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-400'>
                  Total
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ratings List */}
          {loading ? (
            <div className='min-h-96 flex items-center justify-center'>
              <Loading />
            </div>
          ) : ratings.length === 0 ? (
            <Card className='mx-auto max-w-md'>
              <CardContent className='p-6 text-center'>
                <p className='mb-4 text-gray-600 dark:text-gray-400'>
                  You haven&apos;t rated any shows or movies yet.
                </p>
                <Button onClick={() => router.push('/swipe')}>
                  Start Rating
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className='space-y-4'>
              <h2 className='mb-4 text-2xl font-bold text-gray-900 dark:text-white'>
                Recent Ratings
              </h2>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {ratings.map((rating) => (
                  <Card key={rating.id} className='overflow-hidden'>
                    <div className='relative h-48'>
                      {rating.posterPath && rating.posterPath !== 'null' ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w500${rating.posterPath}`}
                          alt={rating.title}
                          layout='fill'
                          className='object-cover'
                          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                        />
                      ) : (
                        <div className='h-full w-full bg-gradient-to-br from-purple-400 to-pink-400' />
                      )}

                      {/* Rating Badge */}
                      <div className='absolute top-2 right-2'>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${getRatingColor(
                            rating.rating
                          )}`}
                        >
                          {getRatingIcon(rating.rating)}
                        </span>
                      </div>
                    </div>

                    <CardContent className='p-4'>
                      <h3 className='mb-1 truncate font-semibold text-gray-900 dark:text-white'>
                        {rating.title}
                      </h3>

                      <div className='mb-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                        <span className='capitalize'>{rating.mediaType}</span>
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
                            <span>⭐ {rating.voteAverage.toFixed(1)}</span>
                          </>
                        )}
                      </div>

                      {rating.overview && (
                        <p className='line-clamp-2 text-sm text-gray-600 dark:text-gray-400'>
                          {rating.overview}
                        </p>
                      )}

                      <div className='mt-2 text-xs text-gray-500 dark:text-gray-500'>
                        Rated on {rating.createdAt.toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </HomeLayout>
  );
}
