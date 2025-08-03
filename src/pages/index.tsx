import { HomeLayout } from '@components/layout/common-layout';
import { SEO } from '@components/common/seo';
import { ModernInput } from '@components/input/modern-input';
import { UpdateUsername } from '@components/home/update-username';
import { ModernTweetList } from '@components/tweet/modern-tweet-card';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button-shadcn';
import { useInfiniteScroll } from '@lib/hooks/useInfiniteScroll';
import { tweetsCollection } from '@lib/firebase/collections';
import { where, orderBy } from 'firebase/firestore';
import { cn } from '@lib/utils';
import { useAuth } from '@lib/context/auth-context';
import { createReview } from '@lib/firebase/utils/review';
import { sendTweet } from '@lib/firebase/utils/tweet';
import { SwipeInterface } from '@components/swipe/swipe-interface';
import { saveRating } from '@lib/firebase/utils/rating';
import { RecommendationsCard } from '@components/recommendations/recommendations-card';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { LogOut, X, Heart, Meh, Sparkles } from 'lucide-react';
import { BookOpen, Filter, TrendingUp, BarChart3 } from 'lucide-react';
import LogoIcon from '@components/ui/logo';
import { toast } from 'react-hot-toast';
import type { ReactElement, ReactNode } from 'react';
import type { RatingType, MediaCard } from '@lib/types/rating';

export default function Home(): JSX.Element {
  const [inputValue, setInputValue] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
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
      const title = mediaData?.title || 'Unknown Title';
      const mediaType = mediaData?.mediaType || 'movie';
      const posterPath = mediaData?.posterPath || '';
      const overview = mediaData?.overview || '';
      const releaseDate = mediaData?.releaseDate || '';
      const voteAverage = mediaData?.voteAverage || 0;

      await saveRating({
        userId: user.id,
        tmdbId: mediaId,
        title,
        mediaType,
        posterPath,
        rating,
        overview,
        releaseDate,
        voteAverage
      });

      console.log('Rating saved:', { mediaId, rating, userId: user.id });
      toast.success(`Rated "${title}" as ${rating}!`);
    } catch (error) {
      console.error('Error saving rating:', error);
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
      console.error('Logout error:', error);
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
        rating: '', // No rating for now
        review: inputValue,
        tags: [], // No tags for now
        posterPath: selectedMedia.poster_path
        // tweetId will be added later if needed
      };

      // Create the review first
      const newReview = await createReview(reviewData);

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
        username: user.username || '',
        photoURL: user.photoURL || ''
      };

      const userData = {
        id: user.id,
        name: user.name || '',
        username: user.username || '',
        photoURL: user.photoURL || '',
        verified: user.verified || false
      };

      await sendTweet(viewingActivity, userData);

      // Clear the form
      setInputValue('');
      setSelectedMedia(null);

      toast.success('Review posted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to post review';
      toast.error(message);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white dark:to-amber-950/10 to-amber-50/30 dark:from-gray-900 dark:via-gray-900'>
      <SEO title='Buzzwin - What will you watch next?' />

      {/* Professional Header - Desktop Only */}
      <header className='hidden sticky top-0 z-50 border-b border-gray-200 backdrop-blur-xl bg-white/95 dark:border-gray-800 dark:bg-gray-900/95 md:block'>
        <div className='px-6 py-6 mx-auto max-w-7xl'>
          <div className='flex justify-between items-center mb-8'>
            <div className='flex gap-4 items-center'>
              <div className='flex justify-center items-center w-16 h-16'>
                <LogoIcon className='w-16 h-16' />
              </div>
              <div>
                <h1 className='mb-1 text-2xl font-bold text-gray-900 dark:text-white'>
                  Buzzwin
                </h1>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  What will you watch next?
                </p>
              </div>
            </div>
            <div className='flex gap-4 items-center'>
              <UpdateUsername />

              {/* Ratings History Link - Only show on desktop */}
              {user && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => router.push('/ratings')}
                  className='px-6 py-2 font-medium text-blue-700 border-blue-300 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20'
                >
                  <BarChart3 className='mr-2 w-4 h-4' />
                  My Ratings
                </Button>
              )}

              {!user ? (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleSignIn}
                  className='px-6 py-2 font-medium text-amber-700 border-amber-300 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/20'
                >
                  Sign In
                </Button>
              ) : (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleLogout}
                  className='px-6 py-2 font-medium text-amber-700 border-amber-300 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/20'
                >
                  <LogOut className='mr-2 w-4 h-4' />
                  Sign Out
                </Button>
              )}
            </div>
          </div>

          {/* Enhanced Input Section */}
          <div className='mx-auto max-w-4xl'>
            <div className='bg-white rounded-2xl border border-gray-200 shadow-lg dark:border-gray-700 dark:bg-gray-800'>
              <ModernInput
                value={inputValue}
                onChange={setInputValue}
                placeholder={
                  user
                    ? 'Share what you are watching...'
                    : 'Sign in to share what you are watching...'
                }
                onSignIn={handleSignIn}
                onMediaSelect={setSelectedMedia}
                onSubmit={handleSubmitReview}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Input Section - Collapsed */}
      <div className='px-3 py-2 md:hidden'>
        <div className='rounded-lg border border-gray-200 shadow-sm bg-white/80 dark:border-gray-700 dark:bg-gray-800/80'>
          <ModernInput
            value={inputValue}
            onChange={setInputValue}
            placeholder={
              user
                ? 'Share what you are watching...'
                : 'Sign in to share what you are watching...'
            }
            onSignIn={handleSignIn}
            onMediaSelect={setSelectedMedia}
            onSubmit={handleSubmitReview}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className='flex-1'>
        <div className='px-3 py-4 mx-auto max-w-7xl md:px-6 md:py-12'>
          {/* Mobile Layout - Swipe Interface */}
          <div className='md:hidden'>
            <div className='mb-3 text-center'>
              <h2 className='mb-1 text-xl font-bold text-gray-900 dark:text-white'>
                Rate Shows & Movies and get AI Recommendations
              </h2>
              <p className='mb-2 text-xs text-gray-600 dark:text-gray-300'>
                Swipe right to love, left to hate, or tap middle for &quot;not
                so much&quot;
              </p>
              {user && (
                <div className='mb-2'>
                  <Button
                    variant='link'
                    size='sm'
                    onClick={() => router.push('/recommendations')}
                    className='text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300'
                  >
                    <Sparkles className='mr-1 w-3 h-3' />
                    Rate Movies and Shows to get AI Recommendations
                  </Button>
                </div>
              )}

              {/* Compact Instructions */}
              <div className='flex gap-3 justify-center items-center mb-3 text-xs text-gray-500 dark:text-gray-400'>
                <div className='flex gap-1 items-center'>
                  <X className='w-3 h-3 text-red-500' />
                  <span>Swipe left to hate</span>
                </div>
                <div className='flex gap-1 items-center'>
                  <Meh className='w-3 h-3 text-yellow-500' />
                  <span>Tap middle for meh</span>
                </div>
                <div className='flex gap-1 items-center'>
                  <Heart className='w-3 h-3 text-green-500' />
                  <span>Swipe right to love</span>
                </div>
              </div>
            </div>

            <div className='flex justify-center'>
              <SwipeInterface onRatingSubmit={handleRatingSubmit} />
            </div>
          </div>

          {/* Desktop Layout - Three Column */}
          <div className='hidden md:block'>
            <div className='grid grid-cols-12 gap-6'>
              {/* Left Pane - Recent Reviews */}
              <div className='col-span-3'>
                <div className='sticky top-24'>
                  <div className='mb-6'>
                    <h3 className='mb-3 text-lg font-semibold text-gray-900 dark:text-white'>
                      Recent Reviews
                    </h3>
                    <p className='mb-4 text-xs text-gray-600 dark:text-gray-400'>
                      Latest activity from the community
                    </p>
                  </div>

                  <div className='space-y-3'>
                    {data &&
                      data.slice(0, 6).map((tweet, index) => (
                        <Card
                          key={tweet.id}
                          className='bg-white border-amber-200 shadow-sm dark:border-amber-800/30 dark:bg-gray-800'
                        >
                          <CardContent className='p-3'>
                            <div className='flex gap-2 items-center mb-2'>
                              <div className='flex justify-center items-center w-6 h-6 bg-gray-200 rounded-full dark:bg-gray-700'>
                                <span className='text-xs font-medium'>
                                  {tweet.user?.username
                                    ?.charAt(0)
                                    ?.toUpperCase() || 'U'}
                                </span>
                              </div>
                              <span className='text-xs font-medium text-gray-900 truncate dark:text-white'>
                                {tweet.user?.username || 'Anonymous'}
                              </span>
                            </div>

                            {/* Show Title - Bold and Prominent */}
                            {tweet.viewingActivity?.title && (
                              <h4 className='mb-2 text-sm font-bold text-gray-900 line-clamp-1 dark:text-white'>
                                {tweet.viewingActivity.title}
                              </h4>
                            )}

                            <p className='mb-2 text-xs text-gray-600 line-clamp-2 dark:text-gray-300'>
                              {tweet.text || 'No content'}
                            </p>
                            <div className='text-xs text-gray-500 dark:text-gray-400'>
                              {tweet.createdAt
                                ? new Date(
                                    tweet.createdAt.toDate()
                                  ).toLocaleDateString()
                                : 'Unknown date'}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    {(!data || data.length === 0) && (
                      <Card className='bg-white border-amber-200 shadow-sm dark:border-amber-800/30 dark:bg-gray-800'>
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
                  <div className='mb-6 text-center'>
                    <h2 className='mb-2 text-xl font-bold text-gray-900 dark:text-white'>
                      Rate Shows & Movies
                    </h2>
                    <p className='mb-4 text-sm text-gray-600 dark:text-gray-300'>
                      Swipe right to love, left to hate, or tap middle for
                      &quot;not so much&quot;
                    </p>

                    {/* Compact Instructions */}
                    <div className='flex gap-4 justify-center items-center mb-6 text-xs text-gray-500 dark:text-gray-400'>
                      <div className='flex gap-1 items-center'>
                        <X className='w-3 h-3 text-red-500' />
                        <span>Swipe left to hate</span>
                      </div>
                      <div className='flex gap-1 items-center'>
                        <Meh className='w-3 h-3 text-yellow-500' />
                        <span>Tap middle for meh</span>
                      </div>
                      <div className='flex gap-1 items-center'>
                        <Heart className='w-3 h-3 text-green-500' />
                        <span>Swipe right to love</span>
                      </div>
                    </div>
                  </div>

                  <div className='flex justify-center'>
                    <SwipeInterface onRatingSubmit={handleRatingSubmit} />
                  </div>
                </div>
              </div>

              {/* Right Pane - Recommendations */}
              <div className='col-span-3'>
                <div className='sticky top-24 space-y-6'>
                  {/* My Recommendations */}
                  <RecommendationsCard />

                  {/* Quick Stats */}
                  <Card className='bg-white border-amber-200 shadow-lg dark:border-amber-800/30 dark:bg-gray-800'>
                    <CardHeader>
                      <CardTitle className='text-lg'>Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-3'>
                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-600 dark:text-gray-400'>
                          Total Reviews
                        </span>
                        <span className='font-semibold'>
                          {data?.length || 0}
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

                  {/* Quick Actions */}
                  <Card className='bg-white border-amber-200 shadow-lg dark:border-amber-800/30 dark:bg-gray-800'>
                    <CardHeader>
                      <CardTitle className='text-lg'>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-3'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => router.push('/ratings')}
                        className='w-full text-blue-700 border-blue-300 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20'
                      >
                        <BarChart3 className='mr-2 w-4 h-4' />
                        View My Ratings
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => router.push('/trends')}
                        className='w-full text-purple-700 border-purple-300 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-900/20'
                      >
                        <TrendingUp className='mr-2 w-4 h-4' />
                        Trending Shows
                      </Button>
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
