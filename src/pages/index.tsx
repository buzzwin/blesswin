import { useRouter } from 'next/router';
import { useCallback, useState, useEffect } from 'react';
import {
  Heart,
  X,
  Meh,
  Sparkles,
  TrendingUp,
  Users,
  Star,
  Play,
  Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { tweetsCollection } from '@lib/firebase/collections';
import { useAuth } from '@lib/context/auth-context';
import { createRating } from '@lib/firebase/utils/review';
import { createReview } from '@lib/firebase/utils/review';
import { HomeLayout } from '@components/layout/common-layout';
import { SEO } from '@components/common/seo';
import { SwipeInterface } from '@components/swipe/swipe-interface';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button-shadcn';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import { Loading } from '@components/ui/loading';
import { RecommendationsCard } from '@components/recommendations/recommendations-card';
import { UserAvatar } from '@components/user/user-avatar';
import { useInfiniteScroll } from '@lib/hooks/useInfiniteScroll';
import { manageLike } from '@lib/firebase/utils';
import { cn } from '@lib/utils';
import {
  where,
  orderBy,
  getCountFromServer,
  collection
} from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import type { RatingType, MediaCard } from '@lib/types/review';
import type { ReactElement, ReactNode } from 'react';

interface Stats {
  totalReviews: number;
  activeUsers: number;
  loading: boolean;
}

export default function Home(): JSX.Element {
  const [inputValue, setInputValue] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState<Stats>({
    totalReviews: 0,
    activeUsers: 0,
    loading: true
  });
  const { user } = useAuth();
  const router = useRouter();

  // Fetch real statistics from the database
  const fetchStats = useCallback(async (): Promise<void> => {
    try {
      setStats((prev) => ({ ...prev, loading: true }));

      // Get total reviews count
      const reviewsSnapshot = await getCountFromServer(
        collection(db, 'reviews')
      );
      const totalReviews = reviewsSnapshot.data().count;

      // Get active users count (users who have created reviews in the last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const activeUsersQuery = collection(db, 'reviews');
      const activeUsersSnapshot = await getCountFromServer(activeUsersQuery);
      const activeUsers = activeUsersSnapshot.data().count;

      setStats({
        totalReviews,
        activeUsers: Math.min(activeUsers, 1200), // Cap at 1.2k for now
        loading: false
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        totalReviews: 0,
        activeUsers: 0,
        loading: false
      });
    }
  }, []);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  const handleRatingSubmit = async (
    mediaId: string | number,
    rating: RatingType,
    mediaData?: MediaCard
  ): Promise<void> => {
    if (!user?.id) {
      toast.error('Please sign in to rate shows');
      return;
    }

    try {
      console.log('handleRatingSubmit called with:', {
        mediaId,
        rating,
        mediaData,
        userId: user.id
      });

      // Use the media data if available, otherwise use defaults
      const title = mediaData?.title ?? 'Unknown Title';
      const mediaType = mediaData?.mediaType ?? 'movie';
      const posterPath = mediaData?.posterPath ?? '';
      const overview = mediaData?.overview ?? '';
      const releaseDate = mediaData?.releaseDate ?? '';
      const voteAverage = mediaData?.voteAverage ?? 0;

      // Ensure tmdbId is a valid number
      const tmdbId = Number(mediaId);
      if (isNaN(tmdbId)) {
        throw new Error('Invalid media ID');
      }

      const ratingData = {
        tmdbId,
        userId: user.id,
        title,
        mediaType,
        posterPath,
        rating,
        overview,
        releaseDate,
        voteAverage
      };

      console.log('Calling createRating with data:', ratingData);

      await createRating(ratingData);

      console.log('Rating saved successfully:', {
        mediaId,
        rating,
        userId: user.id
      });
      toast.success(`Rated "${title}" as ${rating}!`);

      // Trigger recommendations refresh to include the new rating
      setRefreshKey((prev) => prev + 1);

      // Refresh stats after rating
      void fetchStats();
    } catch (error) {
      console.error('Error in handleRatingSubmit:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        user: user?.id,
        mediaId,
        rating
      });
      toast.error('Failed to save rating');
    }
  };

  const { data, loading, LoadMore } = useInfiniteScroll(
    tweetsCollection,
    [where('parent', '==', null), orderBy('createdAt', 'desc')],
    { includeUser: true, allowNull: true, preserve: true },
    { initialSize: 12, stepSize: 12 }
  );

  const handleSignIn = (): void => {
    void router.push('/login');
  };

  const handleSubmitReview = async (): Promise<void> => {
    if (!user?.id || !selectedMedia || !inputValue.trim()) {
      toast.error('Please sign in and select a movie/show to review');
      return;
    }

    try {
      // Create review data
      const reviewData = {
        tmdbId: Number(selectedMedia.id),
        userId: user.id,
        title: selectedMedia.title,
        mediaType: selectedMedia.mediaType,
        rating: 'love' as RatingType, // Default rating for reviews
        review: inputValue,
        tags: [], // No tags for now
        posterPath: selectedMedia.poster_path
        // tweetId will be added later if needed
      };

      // Create the review first
      const newReview = await createReview(reviewData);

      // Also save a rating (default to 'love' for reviews)
      try {
        await createRating({
          tmdbId: Number(selectedMedia.id),
          userId: user.id,
          title: selectedMedia.title,
          mediaType: selectedMedia.mediaType,
          posterPath: selectedMedia.poster_path,
          rating: 'love',
          overview: selectedMedia.overview || '',
          releaseDate: selectedMedia.release_date || '',
          voteAverage: selectedMedia.vote_average || 0
        });
      } catch (ratingError) {
        // console.error('Error creating rating:', ratingError);
      }

      // Clear form
      setInputValue('');
      setSelectedMedia(null);

      toast.success('Review submitted successfully!');

      // Refresh stats after review
      void fetchStats();
    } catch (error) {
      // console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  // Format numbers for display
  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <HomeLayout>
      <SEO title='Buzzwin - Rate Shows & Movies' />

      {/* Modern Background with Animated Gradients */}
      <div className='relative min-h-screen overflow-hidden'>
        {/* Animated Background */}
        <div className='absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'>
          <div className='absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:20px_20px] opacity-20'></div>
        </div>

        {/* Floating Elements */}
        <div className='pointer-events-none absolute inset-0 overflow-hidden'>
          <div className='absolute left-10 top-20 h-72 w-72 rounded-full bg-purple-500 opacity-20 mix-blend-multiply blur-xl filter'></div>
          <div className='absolute right-10 top-40 h-72 w-72 rounded-full bg-yellow-500 opacity-20 mix-blend-multiply blur-xl filter'></div>
          <div className='absolute -bottom-8 left-20 h-72 w-72 rounded-full bg-pink-500 opacity-20 mix-blend-multiply blur-xl filter'></div>
        </div>

        {/* Main Content */}
        <div className='relative z-10 mx-auto w-full px-4 py-8'>
          {/* Hero Section */}
          <div className='mb-12 text-center'>
            <h1 className='mb-4 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-5xl font-bold text-transparent'>
              {user ? 'Rate Shows & Movies' : 'Trending Shows & Movies'}
            </h1>

            <p className='mx-auto max-w-4xl text-xl leading-relaxed text-white/80'>
              {user
                ? 'Swipe to rate and get personalized recommendations powered by AI'
                : "Discover what's trending. Sign in to rate and get personalized recommendations!"}
            </p>

            {/* Combined Feature Pills */}
            <div className='mt-8 flex justify-center gap-4'>
              <div className='flex items-center gap-2 rounded-full border border-white/20 bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-4 py-2 backdrop-blur-sm'>
                <Zap className='h-4 w-4 text-yellow-400' />
                <span className='text-sm font-medium text-white/90'>
                  AI-Powered
                </span>
              </div>
              <div className='flex items-center gap-2 rounded-full border border-white/20 bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-4 py-2 backdrop-blur-sm'>
                <Star className='h-4 w-4 text-purple-400' />
                <span className='text-sm font-medium text-white/90'>
                  Smart Ratings
                </span>
              </div>
              <div className='flex items-center gap-2 rounded-full border border-white/20 bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-4 py-2 backdrop-blur-sm'>
                <TrendingUp className='h-4 w-4 text-green-400' />
                <span className='text-sm font-medium text-white/90'>
                  Trending Now
                </span>
              </div>
              <div className='flex items-center gap-2 rounded-full border border-white/20 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 px-4 py-2 backdrop-blur-sm'>
                <Users className='h-4 w-4 text-blue-400' />
                <span className='text-sm font-medium text-white/90'>
                  Community
                </span>
              </div>
            </div>
          </div>

          {/* Main Content Grid - All in Same Line on Desktop */}
          <div className='grid grid-cols-1 gap-8 xl:grid-cols-12'>
            {/* Left Pane - Current Reviews (3 cols on desktop, full width on mobile) */}
            <div className='order-2 xl:order-1 xl:col-span-3 xl:col-start-1'>
              <div className='sticky top-24'>
                <div className='mb-6'>
                  <h3 className='mb-2 text-xl font-bold text-white'>
                    Current Reviews
                  </h3>
                  <p className='text-sm text-white/70'>
                    Latest activity from the community
                  </p>
                </div>

                <div className='space-y-4'>
                  {data &&
                    data.slice(0, 2).map((tweet) => (
                      <Card
                        key={tweet.id}
                        className='hover:bg-white/15 group border border-white/20 bg-white/10 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl'
                      >
                        <CardContent className='p-4'>
                          {/* User Info */}
                          <div className='mb-3 flex items-center gap-3'>
                            <UserAvatar
                              src={tweet.user?.photoURL ?? ''}
                              alt={tweet.user?.name ?? ''}
                              username={tweet.user?.username ?? ''}
                              className='h-8 w-8 ring-2 ring-white/20'
                            />
                            <div>
                              <span className='text-sm font-semibold text-white'>
                                {tweet.user?.username ?? 'Anonymous'}
                              </span>
                              <div className='text-xs text-white/60'>
                                {tweet.createdAt
                                  ? new Date(
                                      tweet.createdAt.toDate()
                                    ).toLocaleDateString()
                                  : 'Unknown date'}
                              </div>
                            </div>
                          </div>

                          {/* Media Title */}
                          {tweet.viewingActivity?.title && (
                            <h4 className='line-clamp-1 mb-2 text-sm font-bold text-white transition-colors group-hover:text-purple-200'>
                              {tweet.viewingActivity.title}
                            </h4>
                          )}

                          {/* Review Text */}
                          <p className='mb-3 text-sm leading-relaxed text-white/80'>
                            {(() => {
                              const reviewText =
                                tweet.text ??
                                tweet.viewingActivity?.review ??
                                'No content';
                              console.log(
                                'Review text length:',
                                reviewText.length,
                                'Text:',
                                reviewText.substring(0, 50)
                              );
                              return reviewText.length > 30
                                ? reviewText.substring(0, 30) + '...'
                                : reviewText;
                            })()}
                          </p>

                          {/* See More Button */}
                          {((tweet.text && tweet.text.length > 30) ||
                            (tweet.viewingActivity?.review &&
                              tweet.viewingActivity.review.length > 30)) && (
                            <button
                              onClick={() => router.push(`/buzz/${tweet.id}`)}
                              className='mb-3 text-xs text-purple-400 transition-colors duration-200 hover:text-purple-300'
                            >
                              See more...
                            </button>
                          )}

                          {/* Action Buttons - Modern */}
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-4'>
                              {/* Like Button */}
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
                                  'flex items-center gap-1 text-xs transition-all duration-300 hover:scale-110',
                                  tweet.userLikes?.includes(user?.id ?? '')
                                    ? 'text-red-400'
                                    : 'text-white/60 hover:text-red-400'
                                )}
                              >
                                <Heart
                                  className={cn(
                                    'h-4 w-4 transition-all duration-300',
                                    tweet.userLikes?.includes(user?.id ?? '') &&
                                      'fill-current'
                                  )}
                                />
                                <span>{tweet.userLikes?.length ?? 0}</span>
                              </button>

                              {/* Reply Button */}
                              <button
                                onClick={() => {
                                  if (!user?.id) {
                                    toast.error('Please sign in to reply');
                                    return;
                                  }
                                  void router.push(`/buzz/${tweet.id}`);
                                }}
                                className='flex items-center gap-1 text-xs text-white/60 transition-all duration-300 hover:scale-110 hover:text-blue-400'
                              >
                                <svg
                                  className='h-4 w-4'
                                  fill='none'
                                  stroke='currentColor'
                                  viewBox='0 0 24 24'
                                >
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                                  />
                                </svg>
                                <span>{tweet.userReplies ?? 0}</span>
                              </button>
                            </div>

                            {/* Share Button */}
                            <button
                              onClick={() => {
                                void (async () => {
                                  try {
                                    await navigator.clipboard.writeText(
                                      `https://www.buzzwin.com/public/${tweet.id}`
                                    );
                                    toast.success('Link copied to clipboard!');
                                  } catch (error) {
                                    toast.error('Failed to copy link');
                                  }
                                })();
                              }}
                              className='text-white/60 transition-all duration-300 hover:scale-110 hover:text-green-400'
                            >
                              <svg
                                className='h-4 w-4'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z'
                                />
                              </svg>
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  {(!data || data.length === 0) && (
                    <Card className='border border-white/20 bg-white/10 shadow-xl backdrop-blur-sm'>
                      <CardContent className='p-6 text-center'>
                        <div className='mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/10'>
                          <Play className='h-6 w-6 text-white/60' />
                        </div>
                        <p className='text-white/60'>No reviews yet</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>

            {/* Middle Pane - Swipe Interface (6 cols on desktop, full width on mobile) */}
            <div className='order-1 xl:order-2 xl:col-span-6 xl:col-start-4'>
              <div className='sticky top-24'>
                <div className='mb-6 text-center'>
                  <h2 className='mb-4 text-2xl font-bold text-white'>
                    {user ? 'Rate Shows & Movies' : 'Trending Shows & Movies'}
                  </h2>

                  {/* Modern Instructions */}
                  {user ? (
                    <div className='mb-6 flex items-center justify-center gap-6'>
                      <div className='flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/20 px-4 py-2 backdrop-blur-sm'>
                        <X className='h-4 w-4 text-red-400' />
                        <span className='text-sm text-white/90'>
                          Swipe left to hate
                        </span>
                      </div>
                      <div className='flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-500/20 px-4 py-2 backdrop-blur-sm'>
                        <Meh className='h-4 w-4 text-yellow-400' />
                        <span className='text-sm text-white/90'>
                          Tap middle for meh
                        </span>
                      </div>
                      <div className='flex items-center gap-2 rounded-full border border-green-400/30 bg-green-500/20 px-4 py-2 backdrop-blur-sm'>
                        <Heart className='h-4 w-4 text-green-400' />
                        <span className='text-sm text-white/90'>
                          Swipe right to love
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className='mb-6'>
                      <p className='text-lg text-white/80'>
                        Discover what&apos;s trending right now. Sign in to rate
                        and get personalized recommendations!
                      </p>
                    </div>
                  )}
                </div>

                <div className='flex justify-center'>
                  <SwipeInterface onRatingSubmit={handleRatingSubmit} />
                </div>
              </div>
            </div>

            {/* Right Pane - Recommendations (3 cols on desktop, full width on mobile) */}
            <div className='order-3 xl:order-3 xl:col-span-3 xl:col-start-10'>
              <div className='sticky top-24 space-y-6'>
                {/* My Recommendations - Only for logged-in users */}
                {user && <RecommendationsCard refreshKey={refreshKey} />}

                {/* Sign In Card for non-logged-in users */}
                {!user && (
                  <Card className='border border-white/20 bg-white/10 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl'>
                    <CardHeader>
                      <CardTitle className='text-lg text-white'>
                        Get Personalized Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <p className='text-sm text-white/80'>
                        Sign in to rate shows and get AI-powered recommendations
                        tailored just for you!
                      </p>
                      <Button
                        onClick={handleSignIn}
                        className='w-full transform rounded-full bg-gradient-to-r from-amber-500 to-orange-500 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-amber-600 hover:to-orange-600 hover:shadow-xl'
                      >
                        <Sparkles className='mr-2 h-4 w-4' />
                        Sign In
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Modern Quick Stats */}
                <Card className='border border-white/20 bg-white/10 shadow-xl backdrop-blur-sm'>
                  <CardHeader>
                    <CardTitle className='text-lg text-white'>
                      Quick Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-sm'>
                      <div className='flex items-center gap-3'>
                        <div className='flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20'>
                          <Star className='h-4 w-4 text-purple-400' />
                        </div>
                        <span className='text-sm text-white/80'>
                          Total Reviews
                        </span>
                      </div>
                      <span className='font-bold text-white'>
                        {stats.loading ? (
                          <div className='h-4 w-6 animate-pulse rounded bg-white/20'></div>
                        ) : (
                          formatNumber(stats.totalReviews)
                        )}
                      </span>
                    </div>
                    <div className='flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-sm'>
                      <div className='flex items-center gap-3'>
                        <div className='flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20'>
                          <Users className='h-4 w-4 text-green-400' />
                        </div>
                        <span className='text-sm text-white/80'>
                          Active Users
                        </span>
                      </div>
                      <span className='font-bold text-white'>
                        {stats.loading ? (
                          <div className='h-4 w-6 animate-pulse rounded bg-white/20'></div>
                        ) : (
                          formatNumber(stats.activeUsers)
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Visual Separator */}
          <div className='my-6 flex items-center justify-center'>
            <div className='h-px w-full max-w-4xl bg-gradient-to-r from-transparent via-white/20 to-transparent'></div>
          </div>

          {/* All Reviews Section - Below swipe interface for both mobile and desktop */}
          <div className='mb-8'>
            <div className='mb-8 text-center'>
              <h3 className='mb-3 text-3xl font-bold text-white'>
                All Reviews
              </h3>
              <p className='text-lg text-white/70'>
                Explore all community reviews and discussions
              </p>
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6'>
              {data &&
                data.map((tweet) => (
                  <Card
                    key={tweet.id}
                    className='hover:bg-white/15 group border border-white/20 bg-white/10 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl'
                  >
                    <CardContent className='p-4'>
                      {/* User Info */}
                      <div className='mb-3 flex items-center gap-3'>
                        <UserAvatar
                          src={tweet.user?.photoURL ?? ''}
                          alt={tweet.user?.name ?? ''}
                          username={tweet.user?.username ?? ''}
                          className='h-8 w-8 ring-2 ring-white/20'
                        />
                        <div>
                          <span className='text-sm font-semibold text-white'>
                            {tweet.user?.username ?? 'Anonymous'}
                          </span>
                          <div className='text-xs text-white/60'>
                            {tweet.createdAt
                              ? new Date(
                                  tweet.createdAt.toDate()
                                ).toLocaleDateString()
                              : 'Unknown date'}
                          </div>
                        </div>
                      </div>

                      {/* Media Title */}
                      {tweet.viewingActivity?.title && (
                        <h4 className='line-clamp-1 mb-2 text-sm font-bold text-white transition-colors group-hover:text-purple-200'>
                          {tweet.viewingActivity.title}
                        </h4>
                      )}

                      {/* Review Text */}
                      <p className='line-clamp-3 mb-3 text-sm leading-relaxed text-white/80'>
                        {tweet.text ??
                          tweet.viewingActivity?.review ??
                          'No content'}
                      </p>

                      {/* Action Buttons - Modern */}
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-4'>
                          {/* Like Button */}
                          <button
                            onClick={async () => {
                              if (!user?.id) {
                                toast.error('Please sign in to like reviews');
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
                                toast.success(isLiked ? 'Unliked' : 'Liked!');
                              } catch (error) {
                                toast.error('Failed to update like');
                              }
                            }}
                            className={cn(
                              'flex items-center gap-1 text-xs transition-all duration-300 hover:scale-110',
                              tweet.userLikes?.includes(user?.id ?? '')
                                ? 'text-red-400'
                                : 'text-white/60 hover:text-red-400'
                            )}
                          >
                            <Heart
                              className={cn(
                                'h-4 w-4 transition-all duration-300',
                                tweet.userLikes?.includes(user?.id ?? '') &&
                                  'fill-current'
                              )}
                            />
                            <span>{tweet.userLikes?.length ?? 0}</span>
                          </button>

                          {/* Reply Button */}
                          <button
                            onClick={() => {
                              if (!user?.id) {
                                toast.error('Please sign in to reply');
                                return;
                              }
                              void router.push(`/buzz/${tweet.id}`);
                            }}
                            className='flex items-center gap-1 text-xs text-white/60 transition-all duration-300 hover:scale-110 hover:text-blue-400'
                          >
                            <svg
                              className='h-4 w-4'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                              />
                            </svg>
                            <span>{tweet.userReplies ?? 0}</span>
                          </button>
                        </div>

                        {/* Share Button */}
                        <button
                          onClick={() => {
                            void (async () => {
                              try {
                                await navigator.clipboard.writeText(
                                  `https://www.buzzwin.com/public/${tweet.id}`
                                );
                                toast.success('Link copied to clipboard!');
                              } catch (error) {
                                toast.error('Failed to copy link');
                              }
                            })();
                          }}
                          className='text-white/60 transition-all duration-300 hover:scale-110 hover:text-green-400'
                        >
                          <svg
                            className='h-4 w-4'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z'
                            />
                          </svg>
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              {(!data || data.length === 0) && (
                <Card className='border border-white/20 bg-white/10 shadow-xl backdrop-blur-sm'>
                  <CardContent className='p-6 text-center'>
                    <div className='mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/10'>
                      <Play className='h-6 w-6 text-white/60' />
                    </div>
                    <p className='text-white/60'>No reviews yet</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
