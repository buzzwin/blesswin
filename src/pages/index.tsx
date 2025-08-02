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
import { useState } from 'react';
import { useRouter } from 'next/router';
import { LogOut } from 'lucide-react';
import { BookOpen, Filter, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { ReactElement, ReactNode } from 'react';

export default function Home(): JSX.Element {
  const [inputValue, setInputValue] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const { user, signOut } = useAuth();
  const router = useRouter();

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
      const message = error instanceof Error ? error.message : 'Failed to post review';
      toast.error(message);
    }
  };

  return (
    <div className='dark:to-amber-950/10 min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50/30 dark:from-gray-900 dark:via-gray-900'>
      <SEO title='Buzzwin - What will you watch next?' />

      {/* Professional Header */}
      <header className='sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/95'>
        <div className='mx-auto max-w-7xl px-6 py-6'>
          <div className='mb-8 flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg'>
                <BookOpen className='h-6 w-6 text-white' />
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

          {/* Enhanced Input Section */}
          <div className='mx-auto max-w-4xl'>
            <div className='rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800'>
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

      {/* Main Content */}
      <main className='flex-1'>
        <div className='mx-auto max-w-7xl px-6 py-12'>
          {/* Content Header */}
          <div className='mb-12'>
            <div className='mb-6 flex items-center justify-between'>
              <div>
                <h2 className='mb-2 text-3xl font-bold text-gray-900 dark:text-white'>
                  Recent Reviews
                </h2>
                <p className='max-w-2xl text-lg text-gray-600 dark:text-gray-400'>
                  Discover what others are watching and sharing. Get inspired by
                  the latest reviews from our community.
                </p>
              </div>
              <Button
                variant='outline'
                size='sm'
                className='border-amber-300 px-6 py-2 font-medium text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/20'
              >
                <Filter className='mr-2 h-4 w-4' />
                Filter
              </Button>
            </div>
          </div>

          {/* Reviews Grid */}
          <div className='space-y-8'>
            <ModernTweetList
              tweets={data || []}
              loading={loading}
              error={!data && !loading}
            />

            {/* Load More */}
            {data && data.length > 0 && (
              <div className='flex justify-center pt-8'>
                <Card className='border-amber-200 bg-white shadow-lg dark:border-amber-800/30 dark:bg-gray-800'>
                  <CardContent className='p-6 text-center'>
                    <LoadMore />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

Home.getLayout = (page: ReactElement): ReactNode => (
  <HomeLayout>{page}</HomeLayout>
);
