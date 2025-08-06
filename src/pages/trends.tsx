import { useRouter } from 'next/router';
import { useEffect, useCallback, useState } from 'react';
import { BarChart3, TrendingUp, LogOut, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@lib/context/auth-context';
import { SEO } from '@components/common/seo';
import { Button } from '@components/ui/button-shadcn';
import { Loading } from '@components/ui/loading';
import { UpdateUsername } from '@components/home/update-username';
import { TrendingShows } from '@components/trending/trending-shows';
import { NetworkTrendsAnalysis } from '@components/trending/network-trends-analysis';
import LogoIcon from '@components/ui/logo';
import type { ReactElement, ReactNode } from 'react';

interface TrendingShow {
  title: string;
  mediaId: string;
  mediaType: 'movie' | 'tv';
  posterPath: string;
  popularity: number;
  description: string;
  network?: string;
  releaseDate?: string;
}

interface NetworkTrend {
  network: string;
  type: 'streaming' | 'cable' | 'broadcast';
  trendingShows: Array<{
    title: string;
    tmdbId: string;
    mediaType: 'movie' | 'tv';
    posterPath: string;
    overview: string;
    releaseDate: string;
    voteAverage?: number;
    reason: string;
    culturalImpact: string;
  }>;
  networkInsight: string;
  overallTrend: string;
}

export default function Trends(): JSX.Element {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [trendingShows, setTrendingShows] = useState<TrendingShow[]>([]);
  const [networkTrends, setNetworkTrends] = useState<NetworkTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrends = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Fetch general trending content
      const trendingResponse = await fetch('/api/trending-content');
      if (trendingResponse.ok) {
        const trendingData = (await trendingResponse.json()) as {
          content?: TrendingShow[];
        };
        if (trendingData.content && Array.isArray(trendingData.content)) {
          setTrendingShows(trendingData.content);
        } else {
          setTrendingShows([]);
        }
      }

      // Fetch network-specific trends
      const networkResponse = await fetch('/api/trends/network-trends');
      if (networkResponse.ok) {
        const networkData = (await networkResponse.json()) as {
          networks?: NetworkTrend[];
        };
        if (networkData.networks && Array.isArray(networkData.networks)) {
          setNetworkTrends(networkData.networks);
        } else {
          setNetworkTrends([]);
        }
      } else {
        setNetworkTrends([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trends');
      setTrendingShows([]);
      setNetworkTrends([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshTrends = useCallback(async (): Promise<void> => {
    await fetchTrends();
  }, [fetchTrends]);

  useEffect(() => {
    void fetchTrends();
  }, [fetchTrends]);



  const handleSignIn = (): void => {
    void router.push('/login');
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await signOut();
      void router.push('/');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const handleRefresh = async (): Promise<void> => {
    setIsRefreshing(true);
    try {
      await refreshTrends();
      toast.success('Trends refreshed!');
    } catch (error) {
      toast.error('Failed to refresh trends');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className='dark:to-amber-950/10 min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50/30 dark:from-gray-900 dark:via-gray-900'>
        <SEO title='Trends - Buzzwin' />
        <div className='flex min-h-screen items-center justify-center'>
          <Loading />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='dark:to-amber-950/10 min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50/30 dark:from-gray-900 dark:via-gray-900'>
        <SEO title='Trends - Buzzwin' />
        <div className='flex min-h-screen items-center justify-center'>
          <div className='text-center'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30'>
              <TrendingUp className='h-8 w-8 text-red-600 dark:text-red-400' />
            </div>
            <h2 className='mb-2 text-xl font-bold text-gray-900 dark:text-white'>
              Error Loading Trends
            </h2>
            <p className='mb-4 text-gray-600 dark:text-gray-400'>{error}</p>
            <Button onClick={handleRefresh}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='dark:to-amber-950/10 min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50/30 dark:from-gray-900 dark:via-gray-900'>
      <SEO title='Trends - Buzzwin' />

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
                onClick={() => router.push('/')}
                className='border-blue-300 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20'
              >
                <BarChart3 className='mr-2 h-4 w-4' />
                Home
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => router.push('/ratings')}
                className='border-purple-300 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-900/20'
              >
                <BarChart3 className='mr-2 h-4 w-4' />
                My Ratings
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={handleRefresh}
                disabled={isRefreshing}
                className='border-green-300 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/20'
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${
                    isRefreshing ? 'animate-spin' : ''
                  }`}
                />
                Refresh
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
        </div>
      </header>

      {/* Mobile Header */}
      <header className='sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/95 md:hidden'>
        <div className='flex items-center justify-between px-3 py-2'>
          <button
            onClick={() => router.push('/')}
            className='flex items-center gap-2 transition-opacity hover:opacity-80'
          >
            <div className='flex h-6 w-6 items-center justify-center'>
              <LogoIcon className='h-6 w-6' />
            </div>
            <div>
              <h1 className='text-sm font-bold text-gray-900 dark:text-white'>
                Buzzwin
              </h1>
            </div>
          </button>

          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={handleRefresh}
              disabled={isRefreshing}
              className='border-green-300 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/20'
            >
              <RefreshCw
                className={`mr-1 h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='mx-auto max-w-7xl px-6 py-8'>
        <div className='mb-8'>
          <h2 className='mb-2 text-3xl font-bold text-gray-900 dark:text-white'>
            Today&apos;s Trends
          </h2>
          <p className='text-gray-600 dark:text-gray-400'>
            Powered by AI - Discover what&apos;s trending in TV and streaming
            today, with network-specific insights
          </p>
        </div>

        <div className='space-y-8'>
          {/* Network Trends Analysis - Show first if we have network data */}
          {networkTrends.length > 0 && (
            <div className='space-y-4'>
              <h3 className='text-xl font-semibold text-gray-900 dark:text-white'>
                Network Trends & Insights
              </h3>
              <NetworkTrendsAnalysis networks={networkTrends} variant='dark' />
            </div>
          )}

          {/* Trending Shows */}
          <div className='space-y-4'>
            <h3 className='text-xl font-semibold text-gray-900 dark:text-white'>
              Trending TV Shows
            </h3>
            <TrendingShows trendingData={trendingShows} variant='dark' />
          </div>


        </div>
      </main>
    </div>
  );
}

Trends.getLayout = (page: ReactElement): ReactNode => page;
