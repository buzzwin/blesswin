import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Heart, X, Meh, Star, Users, Play, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@lib/context/auth-context';
import { SEO } from '@components/common/seo';
import { Card, CardContent } from '@components/ui/card';
import { Button } from '@components/ui/button-shadcn';
import { UserAvatar } from '@components/user/user-avatar';
import { SwipeInterface } from '@components/swipe/swipe-interface';
import { RecommendationsCard } from '@components/recommendations/recommendations-card';
import { createRating } from '@lib/firebase/utils/review';
import { manageLike, getTweets, getStats } from '@lib/firebase/utils';
import { cn } from '@lib/utils';
import type { Tweet } from '@lib/types/tweet';
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
  const [data, setData] = useState<Tweet[] | null>(null);
  const [stats, setStats] = useState<HomeStats>({
    totalReviews: 0,
    activeUsers: 0,
    loading: true
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    void getTweets().then(setData);
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

      {/* Clean Minimal Design */}
      <div className='min-h-screen bg-white dark:bg-gray-900'>
        <div className='mx-auto max-w-6xl px-4 py-12'>
          {/* Simple Header */}
          <div className='mb-16 text-center'>
            <div className='mb-6 flex justify-center'>
              <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-900 dark:bg-white'>
                <Sparkles className='h-8 w-8 text-white dark:text-gray-900' />
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

          {/* Main Content Grid */}
          <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
            {/* Left Sidebar - Recent Reviews */}
            <div className='lg:col-span-1'>
              <div className='sticky top-8'>
                <h2 className='mb-6 text-xl font-semibold text-gray-900 dark:text-white'>
                  Recent Reviews
                </h2>
                <div className='space-y-4'>
                  {data &&
                    data.slice(0, 3).map((tweet) => (
                      <Card
                        key={tweet.id}
                        className='border border-gray-200 dark:border-gray-700'
                      >
                        <CardContent className='p-4'>
                          <div className='mb-3 flex items-center gap-3'>
                            <UserAvatar
                              src={tweet.user?.photoURL ?? ''}
                              alt={tweet.user?.name ?? ''}
                              username={tweet.user?.username ?? ''}
                              className='h-8 w-8'
                            />
                            <div>
                              <div className='text-sm font-medium text-gray-900 dark:text-white'>
                                {tweet.user?.username ?? 'Anonymous'}
                              </div>
                              <div className='text-xs text-gray-500 dark:text-gray-400'>
                                {tweet.createdAt
                                  ? new Date(
                                      tweet.createdAt.toDate()
                                    ).toLocaleDateString()
                                  : 'Unknown date'}
                              </div>
                            </div>
                          </div>

                          {tweet.viewingActivity?.title && (
                            <h3 className='mb-2 text-sm font-semibold text-gray-900 dark:text-white'>
                              {tweet.viewingActivity.title}
                            </h3>
                          )}

                          <p className='mb-3 text-sm text-gray-600 dark:text-gray-400'>
                            {(() => {
                              const reviewText =
                                tweet.text ??
                                tweet.viewingActivity?.review ??
                                'No content';
                              return reviewText.length > 100
                                ? reviewText.substring(0, 100) + '...'
                                : reviewText;
                            })()}
                          </p>

                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-4'>
                              <button
                                onClick={async () => {
                                  if (!user?.id) {
                                    toast.error(
                                      'Please sign in to like reviews'
                                    );
                                    return;
                                  }
                                  const isLiked = tweet.userLikes?.includes(
                                    user.id
                                  );
                                  try {
                                    await manageLike(
                                      isLiked ? 'unlike' : 'like',
                                      user.id,
                                      tweet.id
                                    )();
                                    toast.success(
                                      isLiked ? 'Unliked' : 'Liked!'
                                    );
                                  } catch (error) {
                                    toast.error('Failed to update like');
                                  }
                                }}
                                className={cn(
                                  'flex items-center gap-1 text-xs font-medium transition-colors',
                                  tweet.userLikes?.includes(user?.id ?? '')
                                    ? 'text-red-500'
                                    : 'text-gray-500 hover:text-red-500'
                                )}
                              >
                                <Heart
                                  className={cn(
                                    'h-4 w-4',
                                    tweet.userLikes?.includes(user?.id ?? '') &&
                                      'fill-current'
                                  )}
                                />
                                {tweet.userLikes?.length ?? 0}
                              </button>
                            </div>
                            <button
                              onClick={() => router.push(`/buzz/${tweet.id}`)}
                              className='text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            >
                              View
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  {(!data || data.length === 0) && (
                    <Card className='border border-gray-200 dark:border-gray-700'>
                      <CardContent className='p-8 text-center'>
                        <Play className='mx-auto mb-3 h-8 w-8 text-gray-400' />
                        <p className='text-sm text-gray-500 dark:text-gray-400'>
                          No reviews yet
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>

            {/* Center - Swipe Interface */}
            <div className='lg:col-span-1'>
              <div className='sticky top-8'>
                <div className='mb-8 text-center'>
                  <h2 className='mb-4 text-2xl font-semibold text-gray-900 dark:text-white'>
                    {user ? 'Rate Shows & Movies' : 'Trending Shows & Movies'}
                  </h2>

                  {user ? (
                    <div className='mb-6 flex justify-center gap-4'>
                      <div className='flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 dark:bg-red-900/20'>
                        <X className='h-4 w-4 text-red-500' />
                        <span className='text-sm font-medium text-red-700 dark:text-red-300'>
                          Swipe left to hate
                        </span>
                      </div>
                      <div className='flex items-center gap-2 rounded-full bg-yellow-50 px-4 py-2 dark:bg-yellow-900/20'>
                        <Meh className='h-4 w-4 text-yellow-500' />
                        <span className='text-sm font-medium text-yellow-700 dark:text-yellow-300'>
                          Tap for meh
                        </span>
                      </div>
                      <div className='flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 dark:bg-green-900/20'>
                        <Heart className='h-4 w-4 text-green-500' />
                        <span className='text-sm font-medium text-green-700 dark:text-green-300'>
                          Swipe right to love
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className='text-gray-600 dark:text-gray-400'>
                      Discover what's trending right now. Sign in to rate and
                      get personalized recommendations!
                    </p>
                  )}
                </div>

                <div className='flex justify-center'>
                  <SwipeInterface onRatingSubmit={handleRatingSubmit} />
                </div>
              </div>
            </div>

            {/* Right Sidebar - Recommendations & Stats */}
            <div className='lg:col-span-1'>
              <div className='sticky top-8 space-y-6'>
                {/* Recommendations */}
                {user && <RecommendationsCard refreshKey={refreshKey} />}

                {/* Sign In Card for non-logged-in users */}
                {!user && (
                  <Card className='border border-gray-200 dark:border-gray-700'>
                    <CardContent className='p-6 text-center'>
                      <h3 className='mb-2 text-lg font-semibold text-gray-900 dark:text-white'>
                        Get Personalized Recommendations
                      </h3>
                      <p className='mb-4 text-sm text-gray-600 dark:text-gray-400'>
                        Sign in to rate shows and get AI-powered recommendations
                        tailored just for you!
                      </p>
                      <Button
                        onClick={handleSignIn}
                        className='w-full bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100'
                      >
                        Sign In
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Stats */}
                <Card className='border border-gray-200 dark:border-gray-700'>
                  <CardContent className='p-6'>
                    <h3 className='mb-4 text-lg font-semibold text-gray-900 dark:text-white'>
                      Community Stats
                    </h3>
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20'>
                            <Star className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                          </div>
                          <span className='text-sm font-medium text-gray-900 dark:text-white'>
                            Total Reviews
                          </span>
                        </div>
                        <span className='font-semibold text-gray-900 dark:text-white'>
                          {stats.loading
                            ? '...'
                            : formatNumber(stats.totalReviews)}
                        </span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20'>
                            <Users className='h-4 w-4 text-green-600 dark:text-green-400' />
                          </div>
                          <span className='text-sm font-medium text-gray-900 dark:text-white'>
                            Active Users
                          </span>
                        </div>
                        <span className='font-semibold text-gray-900 dark:text-white'>
                          {stats.loading
                            ? '...'
                            : formatNumber(stats.activeUsers)}
                        </span>
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
