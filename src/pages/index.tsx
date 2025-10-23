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
  MessageCircle,
  Copy
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@lib/context/auth-context';
import { SEO } from '@components/common/seo';
import { Card, CardContent } from '@components/ui/card';
import { Button } from '@components/ui/button-shadcn';
import { SwipeInterface } from '@components/swipe/swipe-interface';
import { RecommendationsCard } from '@components/recommendations/recommendations-card';
import { PastRecommendations } from '@components/recommendations/past-recommendations';
import { SimpleSocialShare as SocialShare } from '@components/share/simple-social-share';
import { AchievementSystem } from '@components/gamification/achievement-system';
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
    <HomeLayout>
      <SEO title='Buzzwin - Discover Your Next Obsession' />

      {/* Cinematic Hero Section - Only show for non-authenticated users */}
      {!user && (
        <div className='dark:bg-gray-950 relative flex h-[90vh] items-center overflow-hidden bg-main-background'>
          {/* Cinematic Background */}
          <div className='from-gray-950 dark:from-gray-950 absolute inset-0 bg-gradient-to-br via-gray-900 to-black dark:via-gray-900 dark:to-black'></div>
          <div className='absolute inset-0 bg-gradient-to-r from-red-600/10 via-blue-600/10 to-purple-600/10'></div>
          <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent'></div>

          <div className='relative mx-auto w-full max-w-[1440px] px-6 py-16 md:px-12 lg:px-24'>
            {/* Cinematic Hero Content */}
            <div className='mb-12 text-left'>
              <div className='mb-6 inline-flex items-center rounded-full bg-gradient-to-r from-red-600 to-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-red-500/25'>
                <TrendingUp className='mr-2 h-4 w-4' />
                #1 Trending Entertainment App
              </div>

              <h1 className='mb-6 text-4xl font-extrabold tracking-tight text-white dark:text-white md:text-6xl lg:text-7xl'>
                <span className='bg-gradient-to-r from-red-600 via-blue-600 to-purple-600 bg-clip-text text-transparent'>
                  Discover Your
                </span>
                <br />
                <span className='text-white dark:text-white'>
                  Next Obsession
                </span>
              </h1>

              <p className='mb-8 max-w-2xl text-lg leading-relaxed text-gray-300 dark:text-gray-300 md:text-xl'>
                Swipe through movies & shows. Get AI recommendations that
                actually match your taste.
                <span className='block font-bold text-red-400 dark:text-red-400'>
                  Join 50k+ users finding their next binge!
                </span>
              </p>

              {/* Social Proof */}
              <div className='mb-8 flex items-center space-x-8 text-white dark:text-white'>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-red-400 dark:text-red-400 md:text-3xl'>
                    50k+
                  </div>
                  <div className='text-sm text-gray-400 dark:text-gray-400'>
                    Active Users
                  </div>
                </div>
                <div className='h-8 w-px bg-gray-600 dark:bg-gray-600'></div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-blue-400 dark:text-blue-400 md:text-3xl'>
                    1M+
                  </div>
                  <div className='text-sm text-gray-400 dark:text-gray-400'>
                    Ratings
                  </div>
                </div>
                <div className='h-8 w-px bg-gray-600 dark:bg-gray-600'></div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-purple-400 dark:text-purple-400 md:text-3xl'>
                    95%
                  </div>
                  <div className='text-sm text-gray-400 dark:text-gray-400'>
                    Match Rate
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className='flex flex-col gap-4 sm:flex-row'>
                <Button
                  onClick={() => setShowDemo(true)}
                  size='lg'
                  className='group rounded-lg bg-gradient-to-r from-red-600 to-blue-600 px-8 py-4 text-lg font-bold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/25'
                >
                  <Play className='mr-2 h-6 w-6 group-hover:scale-110' />
                  Try Free Demo
                </Button>

                <Button
                  onClick={handleSignIn}
                  size='lg'
                  variant='outline'
                  className='group rounded-lg border-2 border-gray-600 bg-gray-800/50 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-gray-400 hover:bg-gray-700/50'
                >
                  <Sparkles className='mr-2 h-6 w-6 group-hover:scale-110' />
                  Sign Up Free
                </Button>
              </div>

              {/* Share Button */}
              <div className='mt-4 sm:mt-6'>
                <Button
                  onClick={handleShare}
                  size='sm'
                  className='rounded-full bg-yellow-400 px-4 py-2 text-xs font-semibold text-purple-900 hover:bg-yellow-300 sm:px-6 sm:py-2 sm:text-sm'
                >
                  <Share2 className='mr-1.5 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4' />
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
      )}

      {/* Features Section - Only show for non-authenticated users */}
      {!user && (
        <div className='relative bg-gradient-to-b from-muted to-background px-4 py-12 dark:from-gray-900 dark:to-black sm:py-20'>
          <div className='mx-auto max-w-7xl'>
            <div className='mb-8 text-center sm:mb-16'>
              <h2 className='mb-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-3xl font-bold text-transparent sm:mb-6 sm:text-5xl'>
                Why Everyone's Obsessed
              </h2>
              <p className='mx-auto max-w-2xl text-lg text-muted-foreground dark:text-gray-300 sm:text-xl'>
                The features that make Buzzwin addictive
              </p>
            </div>

            <div className='grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3'>
              {/* Feature 1 */}
              <Card className='h-full border-purple-500/50 bg-gradient-to-br from-purple-900/40 to-pink-900/40 shadow-2xl backdrop-blur-lg transition-all duration-300 hover:scale-105 hover:shadow-purple-500/20'>
                <CardContent className='flex h-full flex-col p-6 text-center sm:p-8'>
                  <div className='mb-4 flex justify-center sm:mb-6'>
                    <div className='flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg sm:h-20 sm:w-20'>
                      <Zap className='h-8 w-8 text-white sm:h-10 sm:w-10' />
                    </div>
                  </div>
                  <h3 className='mb-3 text-xl font-bold text-foreground dark:text-white sm:mb-4 sm:text-2xl'>
                    Lightning Fast
                  </h3>
                  <p className='flex-grow text-base leading-relaxed text-muted-foreground dark:text-gray-300 sm:text-lg'>
                    Swipe through hundreds of shows in minutes. Our AI learns
                    your taste instantly.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 2 */}
              <Card className='h-full border-blue-500/50 bg-gradient-to-br from-blue-900/40 to-cyan-900/40 shadow-2xl backdrop-blur-lg transition-all duration-300 hover:scale-105 hover:shadow-blue-500/20'>
                <CardContent className='flex h-full flex-col p-6 text-center sm:p-8'>
                  <div className='mb-4 flex justify-center sm:mb-6'>
                    <div className='flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg sm:h-20 sm:w-20'>
                      <Award className='h-8 w-8 text-white sm:h-10 sm:w-10' />
                    </div>
                  </div>
                  <h3 className='mb-3 text-xl font-bold text-foreground dark:text-white sm:mb-4 sm:text-2xl'>
                    AI That Gets You
                  </h3>
                  <p className='flex-grow text-base leading-relaxed text-muted-foreground dark:text-gray-300 sm:text-lg'>
                    95% match rate! Our AI understands your mood, genre
                    preferences, and hidden patterns.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 3 */}
              <Card className='h-full border-green-500/50 bg-gradient-to-br from-green-900/40 to-emerald-900/40 shadow-2xl backdrop-blur-lg transition-all duration-300 hover:scale-105 hover:shadow-green-500/20'>
                <CardContent className='flex h-full flex-col p-6 text-center sm:p-8'>
                  <div className='mb-4 flex justify-center sm:mb-6'>
                    <div className='flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg sm:h-20 sm:w-20'>
                      <MessageCircle className='h-8 w-8 text-white sm:h-10 sm:w-10' />
                    </div>
                  </div>
                  <h3 className='mb-3 text-xl font-bold text-foreground dark:text-white sm:mb-4 sm:text-2xl'>
                    Share & Discuss
                  </h3>
                  <p className='flex-grow text-base leading-relaxed text-muted-foreground dark:text-gray-300 sm:text-lg'>
                    Share your discoveries with friends. Join the conversation
                    about your favorite shows.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Main Content for Authenticated Users */}
      {user && (
        <div className='dark:bg-gray-950 bg-main-background'>
          <div className='mx-auto max-w-[1440px] px-6 py-8 md:px-12 md:py-16 lg:px-24'>
            {/* Cinematic Grid Layout */}
            <div className='grid grid-cols-1 gap-8 lg:grid-cols-12'>
              {/* Swipe Interface Section */}
              <div className='lg:col-span-8'>
                <div className='mb-8 text-left'>
                  <h2 className='mb-6 text-3xl font-extrabold tracking-tight text-light-primary dark:text-white md:text-4xl'>
                    Rate Shows & Movies
                  </h2>

                  <div className='mb-8 flex flex-wrap gap-3'>
                    <div className='hover:bg-red-500/15 group flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/5 px-4 py-2 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 dark:border-red-500/40 dark:bg-red-500/10 dark:hover:bg-red-500/20'>
                      <X className='h-4 w-4 text-red-500 group-hover:text-red-400 dark:text-red-400 dark:group-hover:text-red-300' />
                      <span className='text-sm font-medium text-red-600 group-hover:text-red-500 dark:text-red-300 dark:group-hover:text-red-200'>
                        Swipe left to skip
                      </span>
                    </div>
                    <div className='hover:bg-yellow-500/15 group flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/5 px-4 py-2 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20 dark:border-yellow-500/40 dark:bg-yellow-500/10 dark:hover:bg-yellow-500/20'>
                      <Meh className='h-4 w-4 text-yellow-500 group-hover:text-yellow-400 dark:text-yellow-400 dark:group-hover:text-yellow-300' />
                      <span className='text-sm font-medium text-yellow-600 group-hover:text-yellow-500 dark:text-yellow-300 dark:group-hover:text-yellow-200'>
                        Tap for neutral
                      </span>
                    </div>
                    <div className='hover:bg-green-500/15 group flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/5 px-4 py-2 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 dark:border-green-500/40 dark:bg-green-500/10 dark:hover:bg-green-500/20'>
                      <Heart className='h-4 w-4 text-green-500 group-hover:text-green-400 dark:text-green-400 dark:group-hover:text-green-300' />
                      <span className='text-sm font-medium text-green-600 group-hover:text-green-500 dark:text-green-300 dark:group-hover:text-green-200'>
                        Swipe right to love
                      </span>
                    </div>
                  </div>
                </div>

                <div className='flex justify-start'>
                  <div className='w-full max-w-md'>
                    <SwipeInterface onRatingSubmit={handleRatingSubmit} />
                  </div>
                </div>

                {/* Past Recommendations Section */}
                <div className='mt-8'>
                  <PastRecommendations userId={user?.id || null} />
                </div>
              </div>

              {/* Widgets Section - 4 columns on desktop, stacked on mobile */}
              <div className='lg:col-span-4'>
                <div className='space-y-6'>
                  {/* AI Recommendations Card */}
                  <Card className='group h-full border-0 bg-card/50 shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10 dark:bg-gray-900/50'>
                    <CardContent className='p-6'>
                      <div className='mb-6 flex items-center gap-4'>
                        <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25'>
                          <Sparkles className='h-6 w-6 text-white' />
                        </div>
                        <div>
                          <h3 className='text-xl font-bold text-foreground dark:text-white'>
                            AI Recommendations
                          </h3>
                          <p className='text-sm text-muted-foreground dark:text-gray-400'>
                            Personalized for you
                          </p>
                        </div>
                      </div>
                      <div className='max-h-80 space-y-4 overflow-y-auto'>
                        <RecommendationsCard refreshKey={refreshKey} />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Achievement System */}
                  <AchievementSystem
                    userStats={{
                      totalRatings: stats.totalReviews,
                      consecutiveDays: 7,
                      sharedCount: 5,
                      discoveredShows: 20
                    }}
                  />

                  {/* Community Stats Card */}
                  <Card className='group h-full border-0 bg-card/50 shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-green-500/10 dark:bg-gray-900/50'>
                    <CardContent className='p-6'>
                      <div className='mb-6 flex items-center gap-4'>
                        <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg shadow-green-500/25'>
                          <Users className='h-6 w-6 text-white' />
                        </div>
                        <div>
                          <h3 className='text-xl font-bold text-foreground dark:text-white'>
                            Community Stats
                          </h3>
                          <p className='text-sm text-muted-foreground dark:text-gray-400'>
                            Join the conversation
                          </p>
                        </div>
                      </div>
                      <div className='grid grid-cols-2 gap-4'>
                        <div className='group/stat rounded-xl bg-muted/50 p-4 text-center backdrop-blur-sm transition-all duration-300 hover:bg-muted/70 hover:shadow-lg hover:shadow-blue-500/20 dark:bg-gray-800/50 dark:hover:bg-gray-800/70'>
                          <div className='mb-3 flex justify-center'>
                            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20'>
                              <Star className='h-5 w-5 text-blue-400' />
                            </div>
                          </div>
                          <div className='mb-2 text-2xl font-bold text-foreground dark:text-white'>
                            {stats.loading
                              ? '...'
                              : formatNumber(stats.totalReviews)}
                          </div>
                          <div className='text-sm font-medium text-muted-foreground dark:text-gray-400'>
                            Reviews
                          </div>
                        </div>
                        <div className='group/stat rounded-xl bg-muted/50 p-4 text-center backdrop-blur-sm transition-all duration-300 hover:bg-muted/70 hover:shadow-lg hover:shadow-green-500/20 dark:bg-gray-800/50 dark:hover:bg-gray-800/70'>
                          <div className='mb-3 flex justify-center'>
                            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20'>
                              <Users className='h-5 w-5 text-green-400' />
                            </div>
                          </div>
                          <div className='mb-2 text-2xl font-bold text-foreground dark:text-white'>
                            {stats.loading
                              ? '...'
                              : formatNumber(stats.activeUsers)}
                          </div>
                          <div className='text-sm font-medium text-muted-foreground dark:text-gray-400'>
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
      )}

      {/* Social Share Section - Only show for non-authenticated users */}
      {!user && (
        <div className='bg-gradient-to-b from-background to-muted dark:from-black dark:to-gray-900'>
          <div className='mx-auto max-w-6xl px-4 py-16 sm:py-20'>
            <div className='text-center'>
              <h4 className='mb-6 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl'>
                Share the Love
              </h4>
              <p className='mb-12 text-lg text-muted-foreground dark:text-gray-300 sm:text-xl'>
                Help your friends discover their next obsession
              </p>
            </div>

            {/* Custom Social Share Grid */}
            <div className='mx-auto max-w-4xl'>
              <div className='grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8'>
                {/* Twitter */}
                <button
                  onClick={() => {
                    const shareText =
                      'Check out Buzzwin - Discover Your Next Obsession! This app predicted my taste in shows perfectly!';
                    const url =
                      typeof window !== 'undefined'
                        ? window.location.origin
                        : '';
                    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      shareText
                    )}&url=${encodeURIComponent(
                      url
                    )}&hashtags=Buzzwin,MovieRecs,TVShows,AI`;
                    window.open(shareUrl, '_blank', 'width=600,height=400');
                  }}
                  className='group flex h-20 flex-col items-center justify-center gap-2 rounded-xl bg-muted/50 p-4 transition-all duration-200 hover:scale-105 hover:bg-muted/70 dark:bg-white/5 dark:hover:bg-white/10'
                >
                  <span className='text-2xl'>𝕏</span>
                  <span className='text-xs font-medium text-muted-foreground group-hover:text-foreground dark:text-gray-300 dark:group-hover:text-white'>
                    Twitter
                  </span>
                </button>

                {/* Facebook */}
                <button
                  onClick={() => {
                    const shareText =
                      'Check out Buzzwin - Discover Your Next Obsession!';
                    const url =
                      typeof window !== 'undefined'
                        ? window.location.origin
                        : '';
                    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      url
                    )}&quote=${encodeURIComponent(shareText)}`;
                    window.open(shareUrl, '_blank', 'width=600,height=400');
                  }}
                  className='group flex h-20 flex-col items-center justify-center gap-2 rounded-xl bg-muted/50 p-4 transition-all duration-200 hover:scale-105 hover:bg-muted/70 dark:bg-white/5 dark:hover:bg-white/10'
                >
                  <span className='text-2xl'>f</span>
                  <span className='text-xs font-medium text-muted-foreground group-hover:text-foreground dark:text-gray-300 dark:group-hover:text-white'>
                    Facebook
                  </span>
                </button>

                {/* WhatsApp */}
                <button
                  onClick={() => {
                    const shareText =
                      'Check out Buzzwin - Discover Your Next Obsession! This app predicted my taste in shows perfectly!';
                    const url =
                      typeof window !== 'undefined'
                        ? window.location.origin
                        : '';
                    const shareUrl = `https://wa.me/?text=${encodeURIComponent(
                      shareText + ' ' + url
                    )}`;
                    window.open(shareUrl, '_blank', 'width=600,height=400');
                  }}
                  className='group flex h-20 flex-col items-center justify-center gap-2 rounded-xl bg-muted/50 p-4 transition-all duration-200 hover:scale-105 hover:bg-muted/70 dark:bg-white/5 dark:hover:bg-white/10'
                >
                  <span className='text-2xl'>W</span>
                  <span className='text-xs font-medium text-muted-foreground group-hover:text-foreground dark:text-gray-300 dark:group-hover:text-white'>
                    WhatsApp
                  </span>
                </button>

                {/* LinkedIn */}
                <button
                  onClick={() => {
                    const shareText =
                      'Check out Buzzwin - Discover Your Next Obsession!';
                    const url =
                      typeof window !== 'undefined'
                        ? window.location.origin
                        : '';
                    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                      url
                    )}`;
                    window.open(shareUrl, '_blank', 'width=600,height=400');
                  }}
                  className='group flex h-20 flex-col items-center justify-center gap-2 rounded-xl bg-muted/50 p-4 transition-all duration-200 hover:scale-105 hover:bg-muted/70 dark:bg-white/5 dark:hover:bg-white/10'
                >
                  <span className='text-2xl'>in</span>
                  <span className='text-xs font-medium text-muted-foreground group-hover:text-foreground dark:text-gray-300 dark:group-hover:text-white'>
                    LinkedIn
                  </span>
                </button>

                {/* Reddit */}
                <button
                  onClick={() => {
                    const shareText =
                      'Check out Buzzwin - Discover Your Next Obsession!';
                    const url =
                      typeof window !== 'undefined'
                        ? window.location.origin
                        : '';
                    const shareUrl = `https://reddit.com/submit?url=${encodeURIComponent(
                      url
                    )}&title=${encodeURIComponent(shareText)}`;
                    window.open(shareUrl, '_blank', 'width=600,height=400');
                  }}
                  className='group flex h-20 flex-col items-center justify-center gap-2 rounded-xl bg-muted/50 p-4 transition-all duration-200 hover:scale-105 hover:bg-muted/70 dark:bg-white/5 dark:hover:bg-white/10'
                >
                  <span className='text-2xl'>r</span>
                  <span className='text-xs font-medium text-muted-foreground group-hover:text-foreground dark:text-gray-300 dark:group-hover:text-white'>
                    Reddit
                  </span>
                </button>

                {/* Telegram */}
                <button
                  onClick={() => {
                    const shareText =
                      'Check out Buzzwin - Discover Your Next Obsession!';
                    const url =
                      typeof window !== 'undefined'
                        ? window.location.origin
                        : '';
                    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
                      url
                    )}&text=${encodeURIComponent(shareText)}`;
                    window.open(shareUrl, '_blank', 'width=600,height=400');
                  }}
                  className='group flex h-20 flex-col items-center justify-center gap-2 rounded-xl bg-muted/50 p-4 transition-all duration-200 hover:scale-105 hover:bg-muted/70 dark:bg-white/5 dark:hover:bg-white/10'
                >
                  <span className='text-2xl'>T</span>
                  <span className='text-xs font-medium text-muted-foreground group-hover:text-foreground dark:text-gray-300 dark:group-hover:text-white'>
                    Telegram
                  </span>
                </button>

                {/* Email */}
                <button
                  onClick={() => {
                    const shareText =
                      'Check out Buzzwin - Discover Your Next Obsession! This app predicted my taste in shows perfectly!';
                    const url =
                      typeof window !== 'undefined'
                        ? window.location.origin
                        : '';
                    const shareUrl = `mailto:?subject=${encodeURIComponent(
                      'Check out Buzzwin'
                    )}&body=${encodeURIComponent(shareText + ' ' + url)}`;
                    window.open(shareUrl);
                  }}
                  className='group flex h-20 flex-col items-center justify-center gap-2 rounded-xl bg-muted/50 p-4 transition-all duration-200 hover:scale-105 hover:bg-muted/70 dark:bg-white/5 dark:hover:bg-white/10'
                >
                  <span className='text-2xl'>@</span>
                  <span className='text-xs font-medium text-muted-foreground group-hover:text-foreground dark:text-gray-300 dark:group-hover:text-white'>
                    Email
                  </span>
                </button>

                {/* Copy Link */}
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(
                        typeof window !== 'undefined'
                          ? window.location.origin
                          : ''
                      );
                      toast.success('Link copied to clipboard!');
                    } catch (error) {
                      toast.error('Failed to copy link');
                    }
                  }}
                  className='group flex h-20 flex-col items-center justify-center gap-2 rounded-xl bg-muted/50 p-4 transition-all duration-200 hover:scale-105 hover:bg-muted/70 dark:bg-white/5 dark:hover:bg-white/10'
                >
                  <Copy className='h-6 w-6 text-gray-300 group-hover:text-white' />
                  <span className='text-xs font-medium text-muted-foreground group-hover:text-foreground dark:text-gray-300 dark:group-hover:text-white'>
                    Copy Link
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </HomeLayout>
  );
}
