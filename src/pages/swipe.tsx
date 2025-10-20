import { useRouter } from 'next/router';
import { ArrowLeft, Heart, X, Meh } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@lib/context/auth-context';
import { createRating } from '@lib/firebase/utils/review';
import { HomeLayout } from '@components/layout/common-layout';
import { SEO } from '@components/common/seo';
import { SwipeInterface } from '@components/swipe/swipe-interface';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button-shadcn';
// import { SimpleSocialShare as SocialShare } from '@components/share/simple-social-share';
import type { RatingType, MediaCard } from '@lib/types/review';

export default function SwipePage(): JSX.Element {
  const { user } = useAuth();
  const router = useRouter();

  const handleRatingSubmit = async (
    mediaId: string | number,
    rating: RatingType,
    mediaData?: MediaCard
  ): Promise<void> => {
    if (!user?.id) {
      // The sign-in prompt is now handled in the SwipeInterface component
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

      // console.log('Rating saved:', { mediaId, rating, userId: user.id });
    } catch (error) {
      // console.error('Error saving rating:', error);
      toast.error('Failed to save rating');
    }
  };

  const handleBackToHome = (): void => {
    void router.push('/');
  };

  return (
    <HomeLayout>
      <SEO title='Swipe - Rate Shows & Movies' />

      <div className='min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800'>
        <div className='container mx-auto px-4 py-8'>
          {/* Compact Header with Instructions */}
          <div className='mb-6'>
            <Button variant='ghost' onClick={handleBackToHome} className='mb-3'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Home
            </Button>

            <div className='mb-4 text-center'>
              <h1 className='mb-1 text-2xl font-bold text-gray-900 dark:text-white'>
                Rate Shows & Movies
              </h1>
              <p className='text-sm text-gray-600 dark:text-gray-300'>
                Swipe right to love, left to hate, or tap middle for &quot;not
                so much&quot;
              </p>
            </div>

            {/* Compact Instructions */}
            <div className='mb-4 flex items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-400'>
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
          </div>

          {/* Swipe Interface */}
          <div className='flex justify-center'>
            <SwipeInterface onRatingSubmit={handleRatingSubmit} />
          </div>

          {/* Stats or Additional Info */}
          {user && (
            <div className='mt-12 text-center'>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Your ratings will be saved to your profile
              </p>
            </div>
          )}

          {/* Social Share Section - Temporarily disabled */}
          {/* <div className='mt-8'>
            <Card className='border-0 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg dark:from-green-900/20 dark:to-emerald-900/20'>
              <CardContent className='p-6'>
                <SocialShare
                  title="I'm rating shows and movies on Buzzwin!"
                  description='Join me in discovering and rating the best shows and movies with AI-powered recommendations!'
                  url={
                    typeof window !== 'undefined' ? window.location.href : ''
                  }
                  hashtags={['Buzzwin', 'RateShows', 'Movies', 'TVShows']}
                  showTitle={true}
                  size='md'
                  variant='default'
                />
              </CardContent>
            </Card>
          </div> */}
        </div>
      </div>
    </HomeLayout>
  );
}
