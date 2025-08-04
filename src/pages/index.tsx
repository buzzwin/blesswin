import { HomeLayout } from '@components/layout/common-layout';
import { SEO } from '@components/common/seo';
import { ModernInput } from '@components/input/modern-input';
import { UpdateUsername } from '@components/home/update-username';
import { ModernTweetList } from '@components/tweet/modern-tweet-card';
import { Tweet } from '@components/tweet/tweet';
import { UserAvatar } from '@components/user/user-avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button-shadcn';
import { useInfiniteScroll } from '@lib/hooks/useInfiniteScroll';
import { tweetsCollection } from '@lib/firebase/collections';
import { where, orderBy } from 'firebase/firestore';
import { cn } from '@lib/utils';
import { useAuth } from '@lib/context/auth-context';
import { createReview, createRating } from '@lib/firebase/utils/review';
import { sendTweet } from '@lib/firebase/utils/tweet';
import { manageLike } from '@lib/firebase/utils';
import { SwipeInterface } from '@components/swipe/swipe-interface';
import { RecommendationsCard } from '@components/recommendations/recommendations-card';
import { MobileRecommendationsCard } from '@components/recommendations/mobile-recommendations-card';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { LogOut, X, Heart, Meh, Sparkles } from 'lucide-react';
import { BookOpen, Filter, TrendingUp, BarChart3 } from 'lucide-react';
import LogoIcon from '@components/ui/logo';
import type { ReactElement, ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import type { RatingType, MediaCard } from '@lib/types/review';

export default function Home(): JSX.Element {
  const [inputValue, setInputValue] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleRatingSubmit = async (
    mediaId: string,
    rating: RatingType,
    mediaData?: MediaCard
  ): Promise<void> => {
    if (!user?.id) {
      toast.error('Please sign in to rate shows');
      return;
    }

    try {
      // Use the media data if available, otherwise use defaults
      const title = mediaData?.title ?? 'Unknown Title';
      const mediaType = mediaData?.mediaType ?? 'movie';
      const posterPath = mediaData?.posterPath ?? '';
      const overview = mediaData?.overview ?? '';
      const releaseDate = mediaData?.releaseDate ?? '';
      const voteAverage = mediaData?.voteAverage ?? 0;

      await createRating({
        tmdbId: Number(mediaId),
        userId: user.id,
        title,
        mediaType,
        posterPath,
        rating,
        overview,
        releaseDate,
        voteAverage
      });

      // console.log('Rating saved:', { mediaId, rating, userId: user.id });
      toast.success(`Rated "${title}" as ${rating}!`);

      // Trigger recommendations refresh to include the new rating
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      // console.error('Error saving rating:', error);
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

  const handleLogout = async (): Promise<void> => {
    try {
      await signOut();
      void router.push('/');
    } catch (error) {
      // console.error('Logout error:', error);
    }
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
          rating: 'love' as RatingType, // Default rating for reviews
          overview: selectedMedia.overview,
          releaseDate: selectedMedia.releaseDate,
          voteAverage: selectedMedia.vote_average
        });
      } catch (ratingError) {
        // console.error('Error saving rating:', ratingError);
        // Don't fail the review if rating fails
      }

      // Create the tweet with viewing activity
      const viewingActivity = {
        tmdbId: String(selectedMedia.id),
        title: selectedMedia.title,
        mediaType: selectedMedia.mediaType,
        poster_path: selectedMedia.poster_path,
        releaseDate: selectedMedia.releaseDate,
        overview: selectedMedia.overview,
        review: inputValue,
        tags: [],
        status: 'watching',
        username: user.username ?? '',
        photoURL: user.photoURL ?? ''
      };

      const userData = {
        id: user.id,
        name: user.name ?? '',
        username: user.username ?? '',
        photoURL: user.photoURL ?? '',
        verified: user.verified ?? false
      };

      await sendTweet(viewingActivity, userData);

      // Clear the form
      setInputValue('');
      setSelectedMedia(null);

      toast.success('Review posted successfully!');
    } catch (error) {
      // console.error('Error submitting review:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to post review';
      toast.error(message);
    }
  };

  return (
    <div className='dark:to-amber-950/10 min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50/30 dark:from-gray-900 dark:via-gray-900'>
      <SEO title='Buzzwin - What will you watch next?' />

      {/* Professional Header - Desktop Only */}
      <header className='sticky top-0 z-50 hidden border-b border-gray-200 bg-white/95 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/95 md:block'>
        <div className='mx-auto max-w-7xl px-6 py-3'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <button
                onClick={() => router.push('/')}
                className='flex items-center gap-4 transition-opacity hover:opacity-80'
              >
                <div className='flex h-16 w-16 items-center justify-center'>
                  <LogoIcon className='h-16 w-16' />
                </div>
                <div>
                  <h1 className='mb-1 text-2xl font-bold text-gray-900 dark:text-white'>
                    Buzzwin
                  </h1>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                    What will you watch next?
                  </p>
                </div>
              </button>
            </div>

            {/* Quick Actions - Integrated in Header */}
            <div className='flex items-center gap-3'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => router.push('/ratings')}
                className='border-blue-300 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20'
              >
                <BarChart3 className='mr-2 h-4 w-4' />
                My Ratings
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => router.push('/trends')}
                className='border-purple-300 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-900/20'
              >
                <TrendingUp className='mr-2 h-4 w-4' />
                Trending
              </Button>
            </div>

            <div className='flex items-center gap-4'>
              <UpdateUsername />

              {!user ? (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleSignIn}
                  className='border-amber-300 px-6 py-2 font-medium text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/20'
                >
                  Sign In
                </Button>
              ) : (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleLogout}
                  className='border-amber-300 px-6 py-2 font-medium text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/20'
                >
                  <LogOut className='mr-2 h-4 w-4' />
                  Sign Out
                </Button>
              )}
            </div>
          </div>

          {/* Compact Input Section - Only for logged-in users */}
          {user && (
            <div className='mx-auto max-w-2xl'>
              <div className='rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800'>
                <ModernInput
                  value={inputValue}
                  onChange={setInputValue}
                  placeholder='Share what you are watching...'
                  onSignIn={handleSignIn}
                  onMediaSelect={setSelectedMedia}
                  onSubmit={handleSubmitReview}
                  compact={true}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Input Section - Only for logged-in users */}
      {user && (
        <div className='px-3 py-2 md:hidden'>
          <div className='rounded-lg border border-gray-200 bg-white/80 shadow-sm dark:border-gray-700 dark:bg-gray-800/80'>
            <ModernInput
              value={inputValue}
              onChange={setInputValue}
              placeholder='Share what you are watching...'
              onSignIn={handleSignIn}
              onMediaSelect={setSelectedMedia}
              onSubmit={handleSubmitReview}
              compact={true}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className='flex-1'>
        <div className='mx-auto max-w-7xl px-3 py-2 md:px-6 md:py-6'>
          {/* Mobile Layout - Swipe Interface */}
          <div className='md:hidden'>
            <div className='mb-1 text-center'>
              <h2 className='mb-1 text-lg font-bold text-gray-900 dark:text-white'>
                {user ? 'Rate Shows & Movies' : 'Trending Shows & Movies'}
              </h2>
              <p className='mb-1 text-xs text-gray-600 dark:text-gray-300'>
                {user 
                  ? 'Swipe right to love, left to hate, or tap middle for "meh"'
                  : 'Discover what\'s trending right now. Sign in to rate and get personalized recommendations!'
                }
              </p>
            </div>

            <div className='flex justify-center'>
              <SwipeInterface onRatingSubmit={handleRatingSubmit} />
            </div>

            {/* Mobile AI Recommendations - Only for logged-in users */}
            {user && (
              <div className='mt-6'>
                <MobileRecommendationsCard refreshKey={refreshKey} />
              </div>
            )}
          </div>

          {/* Desktop Layout - Three Column */}
          <div className='hidden md:block'>
            <div className='grid grid-cols-12 gap-6'>
              {/* Left Pane - Recent Reviews */}
              <div className='col-span-3'>
                <div className='sticky top-24'>
                  <div className='mb-4'>
                    <h3 className='mb-2 text-lg font-semibold text-gray-900 dark:text-white'>
                      Recent Reviews
                    </h3>
                    <p className='mb-2 text-xs text-gray-600 dark:text-gray-400'>
                      Latest activity from the community
                    </p>
                  </div>

                  <div className='space-y-3'>
                    {data &&
                      data.slice(0, 6).map((tweet, index) => (
                        <Card
                          key={tweet.id}
                          className='border-amber-200 bg-white shadow-sm dark:border-amber-800/30 dark:bg-gray-800'
                        >
                          <CardContent className='p-3'>
                            {/* User Info */}
                            <div className='mb-2 flex items-center gap-2'>
                              <UserAvatar
                                src={tweet.user?.photoURL ?? ''}
                                alt={tweet.user?.name ?? ''}
                                username={tweet.user?.username ?? ''}
                                className='h-6 w-6'
                              />
                              <span className='truncate text-xs font-medium text-gray-900 dark:text-white'>
                                {tweet.user?.username ?? 'Anonymous'}
                              </span>
                            </div>

                            {/* Media Title */}
                            {tweet.viewingActivity?.title && (
                              <h4 className='line-clamp-1 mb-2 text-sm font-bold text-gray-900 dark:text-white'>
                                {tweet.viewingActivity.title}
                              </h4>
                            )}

                            {/* Review Text */}
                            <p className='line-clamp-3 mb-2 text-xs text-gray-600 dark:text-gray-300'>
                              {tweet.text ??
                                tweet.viewingActivity?.review ??
                                'No content'}
                            </p>

                            {/* Date */}
                            <div className='text-xs text-gray-500 dark:text-gray-400'>
                              {tweet.createdAt
                                ? new Date(
                                    tweet.createdAt.toDate()
                                  ).toLocaleDateString()
                                : 'Unknown date'}
                            </div>

                            {/* Action Buttons - Compact */}
                            <div className='mt-2 flex items-center justify-between'>
                              <div className='flex items-center gap-3'>
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
                                    'flex items-center gap-1 text-xs transition-colors',
                                    tweet.userLikes?.includes(user?.id ?? '')
                                      ? 'text-red-500 dark:text-red-400'
                                      : 'text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400'
                                  )}
                                >
                                  <Heart
                                    className={cn(
                                      'h-3 w-3',
                                      tweet.userLikes?.includes(
                                        user?.id ?? ''
                                      ) && 'fill-current'
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
                                  className='flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400'
                                >
                                  <svg
                                    className='h-3 w-3'
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
                                className='text-xs text-gray-500 transition-colors hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400'
                              >
                                <svg
                                  className='h-3 w-3'
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
                      <Card className='border-amber-200 bg-white shadow-sm dark:border-amber-800/30 dark:bg-gray-800'>
                        <CardContent className='p-3 text-center'>
                          <p className='text-xs text-gray-500 dark:text-gray-400'>
                            No reviews yet
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </div>

              {/* Middle Pane - Swipe Interface */}
              <div className='col-span-6'>
                <div className='sticky top-24'>
                  <div className='mb-4 text-center'>
                    <h2 className='mb-2 text-xl font-bold text-gray-900 dark:text-white'>
                      {user ? 'Rate Shows & Movies' : 'Trending Shows & Movies'}
                    </h2>

                    {/* Compact Instructions */}
                    {user ? (
                      <div className='mb-4 flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400'>
                        <div className='flex items-center gap-1'>
                          <X className='h-3 w-3 text-red-500' />
                          <span>Swipe left to hate</span>
                        </div>
                        <div className='flex items-center gap-1'>
                          <Meh className='h-3 w-3 text-yellow-500' />
                          <span>Tap middle for meh</span>
                        </div>
                        <div className='flex items-center gap-1'>
                          <Heart className='h-3 w-3 text-green-500' />
                          <span>Swipe right to love</span>
                        </div>
                      </div>
                    ) : (
                      <div className='mb-4 text-center'>
                        <p className='text-sm text-gray-600 dark:text-gray-400'>
                          Discover what&apos;s trending right now. Sign in to rate and get personalized recommendations!
                        </p>
                      </div>
                    )}
                  </div>

                  <div className='flex justify-center'>
                    <SwipeInterface onRatingSubmit={handleRatingSubmit} />
                  </div>
                </div>
              </div>

              {/* Right Pane - Recommendations */}
              <div className='col-span-3'>
                <div className='sticky top-24 space-y-4'>
                  {/* My Recommendations - Only for logged-in users */}
                  {user && <RecommendationsCard refreshKey={refreshKey} />}

                  {/* Sign In Card for non-logged-in users */}
                  {!user && (
                    <Card className='border-amber-200 bg-white shadow-lg dark:border-amber-800/30 dark:bg-gray-800'>
                      <CardHeader>
                        <CardTitle className='text-lg'>Get Personalized Recommendations</CardTitle>
                      </CardHeader>
                      <CardContent className='space-y-3'>
                        <p className='text-sm text-gray-600 dark:text-gray-400'>
                          Sign in to rate shows and get AI-powered recommendations tailored just for you!
                        </p>
                        <Button 
                          onClick={handleSignIn}
                          className='w-full border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/20'
                        >
                          Sign In
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Quick Stats */}
                  <Card className='border-amber-200 bg-white shadow-lg dark:border-amber-800/30 dark:bg-gray-800'>
                    <CardHeader>
                      <CardTitle className='text-lg'>Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-3'>
                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-600 dark:text-gray-400'>
                          Total Reviews
                        </span>
                        <span className='font-semibold'>
                          {data?.length ?? 0}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-600 dark:text-gray-400'>
                          Active Users
                        </span>
                        <span className='font-semibold'>1.2k</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

Home.getLayout = (page: ReactElement): ReactNode => (
  <HomeLayout>{page}</HomeLayout>
);
