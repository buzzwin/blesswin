import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Heart,
  X,
  Meh,
  Star,
  Users,
  Sparkles,
  Copy,
  Bot,
  Trophy,
  Users2,
  MessageCircle,
  TrendingUp,
  Zap,
  Flame,
  CheckCircle2,
  Film
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@lib/context/auth-context';
import { SEO } from '@components/common/seo';
import { Button } from '@components/ui/button-shadcn';
import { SwipeInterface } from '@components/swipe/swipe-interface';
import { RecommendationsCard } from '@components/recommendations/recommendations-card';
import { PastRecommendations } from '@components/recommendations/past-recommendations';
import { AchievementSystem } from '@components/gamification/achievement-system';
import { createRating } from '@lib/firebase/utils/review';
import { getStats } from '@lib/firebase/utils';
import type { MediaCard } from '@lib/types/review';
import type { RatingType } from '@lib/types/review';
import { HomeLayout } from '@components/layout/common-layout';
import { SectionShell } from '@components/layout/section-shell';
import { CuratorChat } from '@components/chat/curator-chat';

interface HomeStats {
  totalReviews: number;
  activeUsers: number;
  loading: boolean;
}

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
    // Store redirect path to go to curator chat after login
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('redirectAfterLogin', '/curator');
    }
    void router.push('/login?redirect=/curator');
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
      <SEO title='Buzzwin - Your AI Taste Agent' />

      {/* Landing Page Sections - Horizontal Scroll on Desktop */}
      {!user && (
        <div className='flex flex-col lg:h-screen lg:snap-x lg:snap-mandatory lg:flex-row lg:overflow-x-auto'>
          {/* HERO SECTION */}
          <SectionShell className='flex-shrink-0 lg:h-screen lg:w-screen lg:snap-start'>
            <div className='flex relative flex-col justify-center items-center px-6 py-16 mx-auto max-w-7xl h-full min-h-screen sm:py-20 lg:py-24'>
              {/* top text */}
              <div className='w-full max-w-3xl text-center'>
                <h1 className='text-[clamp(2rem,2vw+1rem,3rem)] font-black leading-[1.05] text-gray-900 dark:text-white'>
                  Your AI Taste Agent.
                </h1>
                <h2 className='bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-[clamp(2rem,2vw+1rem,3rem)] font-black leading-[1.05] text-transparent'>
                  Your Next Obsession.
                </h2>

                <p className='mx-auto mt-4 max-w-xl text-[clamp(1rem,0.4vw+0.875rem,1.125rem)] text-gray-600 dark:text-purple-200'>
                  Buzzwin gives you a personal Curator that knows your vibe,
                  battles other curators for better picks, and negotiates movie
                  night so nobody rage-quits.
                </p>
              </div>

              {/* Interactive Chat */}
              <div className='mt-10 w-full max-w-2xl'>
                <div className='rounded-2xl border backdrop-blur-md border-white/20 bg-white/10 dark:border-white/20 dark:bg-white/5'>
                  <CuratorChat
                    className='max-h-[500px] min-h-[400px]'
                    onLoginRequest={handleSignIn}
                  />
                </div>
              </div>

              {/* proof + ctas */}
              <div className='flex flex-col gap-8 items-center mt-10 w-full'>
                {/* proof row */}
                <div className='flex flex-wrap items-center justify-center gap-4 text-[12px] text-gray-600 dark:text-purple-200'>
                  <div className='flex gap-2 items-center'>
                    <Bot className='w-4 h-4' />
                    <span>50k+ taste profiles trained</span>
                  </div>
                  <div className='w-px h-4 bg-gray-300 dark:bg-white/20' />
                  <div className='flex gap-2 items-center'>
                    <Star className='w-4 h-4' />
                    <span>1M+ ratings absorbed</span>
                  </div>
                  <div className='w-px h-4 bg-gray-300 dark:bg-white/20' />
                  <div className='flex gap-2 items-center'>
                    <Trophy className='w-4 h-4' />
                    <span>95% "yeah I'd watch that" match</span>
                  </div>
                </div>

                {/* CTA buttons */}
                <div className='flex flex-col gap-4 items-center sm:flex-row sm:justify-center'>
                  <Button
                    onClick={handleSignIn}
                    size='lg'
                    className='px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg transition-all group shadow-purple-500/30 hover:scale-105 hover:from-purple-500 hover:to-pink-500'
                  >
                    <Bot className='mr-2 w-5 h-5 group-hover:animate-spin' />
                    Get My Curator
                  </Button>

                  <Button
                    onClick={() => setShowDemo(true)}
                    size='lg'
                    variant='outline'
                    className='px-8 py-4 text-base font-semibold text-gray-700 rounded-full border-2 border-gray-300 hover:bg-gray-100 dark:border-white/30 dark:text-white dark:backdrop-blur-sm dark:hover:bg-white/10'
                  >
                    See Battles
                  </Button>
                </div>
              </div>

              {/* demo modal */}
              {showDemo && (
                <div className='flex fixed inset-0 z-50 justify-center items-center p-4 backdrop-blur-sm bg-black/50'>
                  <div className='relative p-6 w-full max-w-md rounded-2xl border shadow-2xl backdrop-blur-md border-white/20 bg-slate-900'>
                    <Button
                      onClick={() => setShowDemo(false)}
                      size='icon'
                      variant='ghost'
                      className='absolute top-4 right-4 text-white hover:bg-white/20'
                    >
                      <X className='w-4 h-4' />
                    </Button>
                    <h3 className='mb-4 text-xl font-bold text-white'>
                      Try it now
                    </h3>
                    <SwipeInterface onRatingSubmit={handleRatingSubmit} />
                  </div>
                </div>
              )}
            </div>
          </SectionShell>

          {/* BATTLE MODE */}
          <SectionShell
            variant='dark'
            className='flex-shrink-0 lg:h-screen lg:w-screen lg:snap-start'
          >
            <div className='flex flex-col justify-center px-6 py-24 mx-auto max-w-3xl h-full min-h-screen text-center lg:py-32'>
              <h2 className='text-[clamp(2rem,2vw+1rem,3rem)] font-black leading-tight text-gray-900 dark:text-white'>
                Taste Battles
              </h2>
              <p className='mx-auto mt-4 max-w-2xl text-[clamp(1rem,0.4vw+0.875rem,1.125rem)] leading-relaxed text-gray-600 dark:text-purple-200'>
                Your Curator and other AIs go head-to-head. Who can predict the
                next obsession before it blows up?
              </p>
              <div className='mt-8'>
                <Button
                  onClick={() => setShowDemo(true)}
                  size='lg'
                  variant='outline'
                  className='px-8 py-4 text-base font-semibold text-gray-700 rounded-full border-2 border-gray-300 hover:bg-gray-100 dark:border-white/30 dark:text-white dark:backdrop-blur-sm dark:hover:bg-white/10'
                >
                  Watch My Curator Fight
                </Button>
              </div>
            </div>
          </SectionShell>

          {/* FINAL CTA: Spin Up Your Curator */}
          <SectionShell
            variant='dark'
            className='flex-shrink-0 lg:h-screen lg:w-screen lg:snap-start'
          >
            {/* Subtle background glow */}
            <div className='absolute inset-0 bg-gradient-to-t to-transparent from-purple-500/5' />

            <div className='flex relative flex-col justify-center px-6 py-32 mx-auto max-w-3xl h-full min-h-screen text-center'>
              <h2 className='mb-6 text-5xl font-black text-gray-900 dark:text-white sm:text-6xl lg:text-7xl'>
                Spin up your Curator.
              </h2>
              <p className='mb-12 text-xl text-gray-600 dark:text-purple-200 sm:text-2xl'>
                30 seconds of swiping. After that, it knows you scarily well.
              </p>

              <div className='mb-10'>
                <Button
                  onClick={handleSignIn}
                  size='lg'
                  className='px-12 py-7 text-xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-xl transition-all transform group shadow-purple-500/40 hover:scale-105 hover:from-purple-500 hover:to-pink-500'
                >
                  <Bot className='mr-3 w-6 h-6 group-hover:animate-spin' />
                  Get My Curator
                </Button>
              </div>

              {/* Trust Text */}
              <div className='px-6 py-4 mx-auto max-w-xl bg-gray-50 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-sm'>
                <p className='text-sm leading-relaxed text-gray-600 dark:text-gray-400'>
                  <strong className='text-gray-900 dark:text-white'>
                    You control your Curator.
                  </strong>{' '}
                  You can wipe its memory or delete your data anytime.
                </p>
              </div>
            </div>
          </SectionShell>
        </div>
      )}

      {/* Authenticated User Home */}
      {user && (
        <SectionShell>
          <div className='px-6 py-12 mx-auto max-w-7xl'>
            {/* Header */}
            <div className='mb-8 text-center'>
              <h1 className='text-[clamp(2rem,2vw+1rem,3rem)] font-black leading-tight text-gray-900 dark:text-white'>
                Your AI Taste Agent.
              </h1>
              <p className='mx-auto mt-4 max-w-2xl text-[clamp(1rem,0.4vw+0.875rem,1.125rem)] text-gray-600 dark:text-purple-200'>
                Rate shows to train your Curator. It learns your chaos.
              </p>
            </div>

            {/* Main Content */}
            <div className='space-y-8'>
              {/* Swipe Interface */}
              <div className='mx-auto max-w-4xl'>
                <div className='p-6 bg-white rounded-2xl border border-gray-200 shadow-lg dark:border-gray-700 dark:bg-gray-800/50 dark:backdrop-blur-sm'>
                  <div className='flex justify-between items-center mb-4'>
                    <h2 className='text-lg font-bold text-gray-900 dark:text-white'>
                      Discover & Rate
                    </h2>
                    <div className='flex gap-2'>
                      <div className='flex gap-1 items-center px-2 py-1 text-xs bg-red-50 rounded-full dark:bg-red-900/20'>
                        <X className='w-3 h-3 text-red-500' />
                        <span className='hidden sm:inline'>Pass</span>
                      </div>
                      <div className='flex gap-1 items-center px-2 py-1 text-xs bg-yellow-50 rounded-full dark:bg-yellow-900/20'>
                        <Meh className='w-3 h-3 text-yellow-500' />
                        <span className='hidden sm:inline'>Maybe</span>
                      </div>
                      <div className='flex gap-1 items-center px-2 py-1 text-xs bg-green-50 rounded-full dark:bg-green-900/20'>
                        <Heart className='w-3 h-3 text-green-500' />
                        <span className='hidden sm:inline'>Love</span>
                      </div>
                    </div>
                  </div>
                  <SwipeInterface onRatingSubmit={handleRatingSubmit} />
                </div>
              </div>

              {/* Fresh AI Recommendations */}
              <div className='mx-auto max-w-4xl'>
                <div className='p-6 bg-white rounded-2xl border border-gray-200 shadow-lg dark:border-gray-700 dark:bg-gray-800/50 dark:backdrop-blur-sm'>
                  <div className='flex gap-2 items-center mb-4'>
                    <Sparkles className='w-5 h-5 text-purple-500' />
                    <div>
                      <h2 className='text-lg font-bold text-gray-900 dark:text-white'>
                        Tonight&apos;s Picks
                      </h2>
                      <p className='text-xs text-gray-600 dark:text-gray-400'>
                        Fresh recommendations based on your latest ratings
                      </p>
                    </div>
                  </div>
                  <RecommendationsCard refreshKey={refreshKey} />
                </div>
              </div>

              {/* Recommendation History */}
              <div className='mx-auto max-w-4xl'>
                <div className='p-6 bg-white rounded-2xl border border-gray-200 shadow-lg dark:border-gray-700 dark:bg-gray-800/50 dark:backdrop-blur-sm'>
                  <PastRecommendations userId={user?.id || null} />
                </div>
              </div>
            </div>
          </div>
        </SectionShell>
      )}
    </HomeLayout>
  );
}
