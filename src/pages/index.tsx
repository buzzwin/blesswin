import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Heart, X, Meh, Star, Users, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@lib/context/auth-context';
import { SEO } from '@components/common/seo';
import { Card, CardContent } from '@components/ui/card';
import { Button } from '@components/ui/button-shadcn';
import { SwipeInterface } from '@components/swipe/swipe-interface';
import { RecommendationsCard } from '@components/recommendations/recommendations-card';
import { createRating } from '@lib/firebase/utils/review';
import { getStats } from '@lib/firebase/utils';
import type { MediaCard } from '@lib/types/review';
import type { RatingType } from '@lib/types/review';

interface HomeStats {
  totalReviews: number;
  activeUsers: number;
  loading: boolean;
}
import { HomeLayout } from '@components/layout/common-layout';

export default function Home(): JSX.Element {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<HomeStats>({
    totalReviews: 0,
    activeUsers: 0,
    loading: true
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    void getStats().then(setStats);
  }, []);

  const handleRatingSubmit = async (
    mediaId: string | number,
    rating: RatingType,
    mediaData?: MediaCard
  ): Promise<void> => {
    if (!user?.id) {
      toast.error('Please sign in to rate shows and movies');
      return;
    }

    const title = mediaData?.title ?? 'Unknown';
    const mediaType = mediaData?.mediaType ?? 'movie';
    const posterPath = mediaData?.posterPath ?? '';
    const overview = mediaData?.overview ?? '';
    const releaseDate = mediaData?.releaseDate ?? '';
    const voteAverage = mediaData?.voteAverage ?? 0;

    await createRating({
      tmdbId: typeof mediaId === 'string' ? Number(mediaId) : mediaId,
      userId: user.id,
      title,
      mediaType,
      posterPath,
      rating,
      overview,
      releaseDate,
      voteAverage
    });

    toast.success('Rating saved!');
    setRefreshKey((prev) => prev + 1);
  };

  const handleSignIn = (): void => {
    void router.push('/login');
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <HomeLayout>
      <SEO title='Buzzwin - Rate Shows & Movies' />

      {/* Wide Screen Optimized Design */}
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900/20'>
        <div className='px-4 py-6 mx-auto w-full xl:max-w-none 2xl:px-8'>
          {/* Compact Hero Section */}
          <div className='mb-8 text-center'>
            <div className='flex justify-center mb-4'>
              <div className='flex justify-center items-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl'>
                <Sparkles className='w-8 h-8 text-white' />
              </div>
            </div>
            <h1 className='mb-4 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl'>
              {user ? 'Rate Shows & Movies' : 'Discover What to Watch'}
            </h1>
            <p className='mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400'>
              {user
                ? 'Swipe to rate and get personalized recommendations powered by AI'
                : 'Join thousands of users discovering and rating the best shows and movies!'}
            </p>
          </div>

          {/* Wide Screen Main Content - Optimized for Large Screens */}
          <div className='grid grid-cols-1 gap-6 xl:grid-cols-4 2xl:grid-cols-5'>
            {/* Swipe Interface - Takes up 2-3 columns on large screens */}
            <div className='xl:col-span-2 2xl:col-span-3'>
              <div className='mb-4 text-center'>
                <h2 className='mb-3 text-xl font-bold text-gray-900 dark:text-white'>
                  {user ? 'Rate Shows & Movies' : 'Trending Shows & Movies'}
                </h2>

                {user ? (
                  <div className='flex gap-2 justify-center mb-3'>
                    <div className='flex gap-1 items-center px-3 py-1 bg-red-50 rounded-lg dark:bg-red-900/20'>
                      <X className='w-3 h-3 text-red-500' />
                      <span className='text-xs font-semibold text-red-700 dark:text-red-300'>
                        Swipe left to hate
                      </span>
                    </div>
                    <div className='flex gap-1 items-center px-3 py-1 bg-yellow-50 rounded-lg dark:bg-yellow-900/20'>
                      <Meh className='w-3 h-3 text-yellow-500' />
                      <span className='text-xs font-semibold text-yellow-700 dark:text-yellow-300'>
                        Tap for meh
                      </span>
                    </div>
                    <div className='flex gap-1 items-center px-3 py-1 bg-green-50 rounded-lg dark:bg-green-900/20'>
                      <Heart className='w-3 h-3 text-green-500' />
                      <span className='text-xs font-semibold text-green-700 dark:text-green-300'>
                        Swipe right to love
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    Discover what&apos;s trending right now. Sign in to rate and
                    get personalized recommendations!
                  </p>
                )}
              </div>

              <div className='flex justify-center'>
                <div className='w-full max-w-md xl:max-w-lg 2xl:max-w-xl'>
                  <SwipeInterface onRatingSubmit={handleRatingSubmit} />
                </div>
              </div>
            </div>

            {/* Wide Sidebar - Optimized for Large Screens */}
            <div className='xl:col-span-2 2xl:col-span-2'>
              <div className='grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-1'>
                {/* Compact Recommendations Card */}
                {user && (
                  <Card className='bg-gradient-to-br from-purple-50 to-blue-50 border-0 shadow-lg dark:from-purple-900/20 dark:to-blue-900/20'>
                    <CardContent className='p-4'>
                      <div className='flex gap-2 items-center mb-3'>
                        <div className='flex justify-center items-center w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg'>
                          <Sparkles className='w-4 h-4 text-white' />
                        </div>
                        <div>
                          <h3 className='text-sm font-bold text-gray-900 dark:text-white'>
                            AI Recommendations
                          </h3>
                        </div>
                      </div>
                      <RecommendationsCard refreshKey={refreshKey} />
                    </CardContent>
                  </Card>
                )}

                {/* Compact Sign In Card for non-logged-in users */}
                {!user && (
                  <Card className='bg-gradient-to-br from-gray-50 to-blue-50 border-0 shadow-lg dark:from-gray-800 dark:to-blue-900/20'>
                    <CardContent className='p-4 text-center'>
                      <div className='flex justify-center mb-3'>
                        <div className='flex justify-center items-center w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl'>
                          <Sparkles className='w-5 h-5 text-white' />
                        </div>
                      </div>
                      <h3 className='mb-2 text-sm font-bold text-gray-900 dark:text-white'>
                        Get Personalized Recommendations
                      </h3>
                      <p className='mb-3 text-xs text-gray-600 dark:text-gray-400'>
                        Sign in to rate shows and get AI-powered
                        recommendations!
                      </p>
                      <Button
                        onClick={handleSignIn}
                        size='sm'
                        className='px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                      >
                        <Sparkles className='mr-1 w-3 h-3' />
                        Sign In
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Compact Stats Card */}
                <Card className='bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-lg dark:from-green-900/20 dark:to-emerald-900/20'>
                  <CardContent className='p-4'>
                    <div className='flex gap-2 items-center mb-3'>
                      <div className='flex justify-center items-center w-8 h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg'>
                        <Users className='w-4 h-4 text-white' />
                      </div>
                      <div>
                        <h3 className='text-sm font-bold text-gray-900 dark:text-white'>
                          Community Stats
                        </h3>
                      </div>
                    </div>
                    <div className='grid grid-cols-2 gap-3'>
                      <div className='p-3 text-center rounded-lg bg-white/60 dark:bg-gray-800/60'>
                        <div className='flex justify-center mb-1'>
                          <div className='flex justify-center items-center w-6 h-6 bg-blue-100 rounded-md dark:bg-blue-900/30'>
                            <Star className='w-3 h-3 text-blue-600 dark:text-blue-400' />
                          </div>
                        </div>
                        <div className='text-lg font-bold text-gray-900 dark:text-white'>
                          {stats.loading
                            ? '...'
                            : formatNumber(stats.totalReviews)}
                        </div>
                        <div className='text-xs font-medium text-gray-600 dark:text-gray-400'>
                          Reviews
                        </div>
                      </div>
                      <div className='p-3 text-center rounded-lg bg-white/60 dark:bg-gray-800/60'>
                        <div className='flex justify-center mb-1'>
                          <div className='flex justify-center items-center w-6 h-6 bg-green-100 rounded-md dark:bg-green-900/30'>
                            <Users className='w-3 h-3 text-green-600 dark:text-green-400' />
                          </div>
                        </div>
                        <div className='text-lg font-bold text-gray-900 dark:text-white'>
                          {stats.loading
                            ? '...'
                            : formatNumber(stats.activeUsers)}
                        </div>
                        <div className='text-xs font-medium text-gray-600 dark:text-gray-400'>
                          Users
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
