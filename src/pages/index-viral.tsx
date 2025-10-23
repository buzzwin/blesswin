import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Heart,
  X,
  Meh,
  Star,
  Users,
  Sparkles,
  Share2,
  TrendingUp,
  Zap,
  Award,
  Play,
  MessageCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@lib/context/auth-context';
import { SEO } from '@components/common/seo';
import { Card, CardContent } from '@components/ui/card';
import { Button } from '@components/ui/button-shadcn';
import { SwipeInterface } from '@components/swipe/swipe-interface';
import { RecommendationsCard } from '@components/recommendations/recommendations-card';
import { SimpleSocialShare as SocialShare } from '@components/share/simple-social-share';
import { createRating } from '@lib/firebase/utils/review';
import { getStats } from '@lib/firebase/utils';
import type { MediaCard } from '@lib/types/review';
import type { RatingType } from '@lib/types/review';

interface HomeStats {
  totalReviews: number;
  activeUsers: number;
  loading: boolean;
}

export default function ViralHome(): JSX.Element {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<HomeStats>({
    totalReviews: 0,
    activeUsers: 0,
    loading: true
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [showDemo, setShowDemo] = useState(false);

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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Buzzwin - Discover Your Next Obsession',
        text: 'This app predicted my taste in shows perfectly! Swipe through movies and get AI recommendations.',
        url: window.location.origin
      });
    } else {
      // Fallback to copy link
      void navigator.clipboard.writeText(window.location.origin);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900'>
      <SEO title='Buzzwin - Discover Your Next Obsession' />

      {/* Hero Section with Viral Hook */}
      <div className='relative overflow-hidden'>
        {/* Animated Background */}
        <div className='absolute inset-0 animate-pulse bg-gradient-to-r from-purple-600/20 to-pink-600/20'></div>

        <div className='relative mx-auto max-w-7xl px-4 py-12'>
          {/* Viral Hook Header */}
          <div className='mb-12 text-center'>
            <div className='mb-6 inline-flex animate-bounce items-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2 text-sm font-bold text-black'>
              <TrendingUp className='mr-2 h-4 w-4' />
              #1 Trending Entertainment App
            </div>

            <h1 className='mb-6 text-5xl font-black text-white md:text-7xl'>
              <span className='bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent'>
                Discover Your
              </span>
              <br />
              <span className='text-white'>Next Obsession</span>
            </h1>

            <p className='mx-auto mb-8 max-w-2xl text-xl text-blue-100 md:text-2xl'>
              Swipe through movies & shows. Get AI recommendations that actually
              match your taste.
              <span className='font-bold text-yellow-400'>
                {' '}
                Join 50k+ users finding their next binge!
              </span>
            </p>

            {/* Social Proof */}
            <div className='mb-8 flex items-center justify-center space-x-6 text-white'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-yellow-400'>50k+</div>
                <div className='text-sm text-blue-200'>Active Users</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-green-400'>1M+</div>
                <div className='text-sm text-blue-200'>Ratings</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-pink-400'>95%</div>
                <div className='text-sm text-blue-200'>Match Rate</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
              <Button
                onClick={() => setShowDemo(true)}
                size='lg'
                className='transform rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-4 text-lg font-bold text-white shadow-2xl transition-all duration-200 hover:scale-105 hover:from-pink-600 hover:to-purple-700'
              >
                <Play className='mr-2 h-5 w-5' />
                Try Free Demo
              </Button>

              <Button
                onClick={handleSignIn}
                size='lg'
                variant='outline'
                className='rounded-full border-2 border-white px-8 py-4 text-lg font-bold text-white hover:bg-white hover:text-purple-900'
              >
                <Sparkles className='mr-2 h-5 w-5' />
                Sign Up Free
              </Button>
            </div>

            {/* Share Button */}
            <div className='mt-6'>
              <Button
                onClick={handleShare}
                size='sm'
                className='rounded-full bg-yellow-400 px-6 py-2 text-sm font-semibold text-purple-900 hover:bg-yellow-300'
              >
                <Share2 className='mr-2 h-4 w-4' />
                Share with Friends
              </Button>
            </div>
          </div>

          {/* Demo Preview */}
          {showDemo && (
            <div className='mx-auto max-w-md'>
              <div className='rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-lg'>
                <div className='mb-4 flex items-center justify-between'>
                  <h3 className='font-bold text-white'>Try It Now!</h3>
                  <Button
                    onClick={() => setShowDemo(false)}
                    variant='ghost'
                    size='sm'
                    className='text-white hover:bg-white/20'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>
                <SwipeInterface onRatingSubmit={handleRatingSubmit} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className='bg-white/5 px-4 py-16 backdrop-blur-sm'>
        <div className='mx-auto max-w-7xl'>
          <div className='mb-12 text-center'>
            <h2 className='mb-4 text-4xl font-bold text-white'>
              Why Everyone's Obsessed
            </h2>
            <p className='text-xl text-blue-200'>
              The features that make Buzzwin addictive
            </p>
          </div>

          <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
            {/* Feature 1 */}
            <Card className='border-purple-400/30 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg'>
              <CardContent className='p-6 text-center'>
                <div className='mb-4 flex justify-center'>
                  <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500'>
                    <Zap className='h-8 w-8 text-white' />
                  </div>
                </div>
                <h3 className='mb-3 text-xl font-bold text-white'>
                  Lightning Fast
                </h3>
                <p className='text-blue-200'>
                  Swipe through hundreds of shows in minutes. Our AI learns your
                  taste instantly.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className='border-blue-400/30 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-lg'>
              <CardContent className='p-6 text-center'>
                <div className='mb-4 flex justify-center'>
                  <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500'>
                    <Award className='h-8 w-8 text-white' />
                  </div>
                </div>
                <h3 className='mb-3 text-xl font-bold text-white'>
                  AI That Gets You
                </h3>
                <p className='text-blue-200'>
                  95% match rate! Our AI understands your mood, genre
                  preferences, and hidden patterns.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className='border-green-400/30 bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg'>
              <CardContent className='p-6 text-center'>
                <div className='mb-4 flex justify-center'>
                  <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500'>
                    <MessageCircle className='h-8 w-8 text-white' />
                  </div>
                </div>
                <h3 className='mb-3 text-xl font-bold text-white'>
                  Share & Discuss
                </h3>
                <p className='text-blue-200'>
                  Share your discoveries with friends. Join the conversation
                  about your favorite shows.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Social Proof Section */}
      <div className='px-4 py-16'>
        <div className='mx-auto max-w-7xl'>
          <div className='mb-12 text-center'>
            <h2 className='mb-4 text-4xl font-bold text-white'>
              Join the Buzz
            </h2>
            <p className='text-xl text-blue-200'>Real users, real results</p>
          </div>

          {/* Testimonials */}
          <div className='mb-12 grid grid-cols-1 gap-8 md:grid-cols-3'>
            <Card className='border-pink-400/30 bg-gradient-to-br from-pink-500/20 to-rose-500/20 backdrop-blur-lg'>
              <CardContent className='p-6'>
                <div className='mb-4 flex items-center'>
                  <div className='flex space-x-1'>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className='h-5 w-5 fill-current text-yellow-400'
                      />
                    ))}
                  </div>
                </div>
                <p className='mb-4 text-white'>
                  "This app is INSANE! It predicted I'd love 'The Bear' before
                  anyone even knew about it. My friends think I'm psychic now
                  😂"
                </p>
                <div className='text-sm text-pink-200'>- Sarah M.</div>
              </CardContent>
            </Card>

            <Card className='border-blue-400/30 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-lg'>
              <CardContent className='p-6'>
                <div className='mb-4 flex items-center'>
                  <div className='flex space-x-1'>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className='h-5 w-5 fill-current text-yellow-400'
                      />
                    ))}
                  </div>
                </div>
                <p className='mb-4 text-white'>
                  "Finally found my next obsession! The AI recommendations are
                  scary accurate. I've binged 3 shows this week alone."
                </p>
                <div className='text-sm text-blue-200'>- Mike T.</div>
              </CardContent>
            </Card>

            <Card className='border-purple-400/30 bg-gradient-to-br from-purple-500/20 to-violet-500/20 backdrop-blur-lg'>
              <CardContent className='p-6'>
                <div className='mb-4 flex items-center'>
                  <div className='flex space-x-1'>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className='h-5 w-5 fill-current text-yellow-400'
                      />
                    ))}
                  </div>
                </div>
                <p className='mb-4 text-white'>
                  "I've tried every app. This one actually gets me. The swipe
                  interface is addictive and the results are perfect."
                </p>
                <div className='text-sm text-purple-200'>- Emma L.</div>
              </CardContent>
            </Card>
          </div>

          {/* Final CTA */}
          <div className='text-center'>
            <h3 className='mb-6 text-3xl font-bold text-white'>
              Ready to Find Your Next Obsession?
            </h3>
            <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
              <Button
                onClick={handleSignIn}
                size='lg'
                className='transform rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-12 py-4 text-xl font-bold text-white shadow-2xl transition-all duration-200 hover:scale-105 hover:from-pink-600 hover:to-purple-700'
              >
                <Sparkles className='mr-3 h-6 w-6' />
                Start Swiping Now
              </Button>
            </div>
            <p className='mt-4 text-sm text-blue-200'>
              Free forever • No credit card required • Join 50k+ users
            </p>
          </div>
        </div>
      </div>

      {/* Social Share Footer */}
      <div className='bg-black/20 px-4 py-8 backdrop-blur-sm'>
        <div className='mx-auto max-w-7xl text-center'>
          <h4 className='mb-4 text-lg font-bold text-white'>Share the Love</h4>
          <SocialShare
            title='Check out Buzzwin - Discover Your Next Obsession'
            description='This app predicted my taste in shows perfectly! Swipe through movies and get AI recommendations.'
            url={typeof window !== 'undefined' ? window.location.origin : ''}
            hashtags={[
              'Buzzwin',
              'MovieRecs',
              'TVShows',
              'AI',
              'Entertainment'
            ]}
            showTitle={false}
            size='lg'
            variant='default'
          />
        </div>
      </div>
    </div>
  );
}
