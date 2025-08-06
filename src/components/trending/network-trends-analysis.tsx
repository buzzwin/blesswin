import { useState } from 'react';
import {
  TrendingUp,
  Play,
  Star,
  Users,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button-shadcn';
import { Loading } from '@components/ui/loading';
import { cn } from '@lib/utils';

interface NetworkTrendShow {
  title: string;
  tmdbId: string;
  mediaType: 'movie' | 'tv';
  posterPath: string;
  overview: string;
  releaseDate: string;
  voteAverage?: number;
  reason: string;
  culturalImpact: string;
}

interface NetworkTrend {
  network: string;
  type: 'streaming' | 'cable' | 'broadcast';
  trendingShows: NetworkTrendShow[];
  networkInsight: string;
  overallTrend: string;
}

interface NetworkTrendsAnalysisProps {
  networks: NetworkTrend[];
  loading?: boolean;
  error?: string | null;
  variant?: 'light' | 'dark';
}

const getNetworkIcon = (network: string): string => {
  const networkLower = network.toLowerCase();
  if (networkLower.includes('netflix')) return '🔴';
  if (networkLower.includes('hbo') || networkLower.includes('max')) return '🟣';
  if (networkLower.includes('hulu')) return '🟢';
  if (networkLower.includes('disney')) return '🔵';
  if (networkLower.includes('prime') || networkLower.includes('amazon'))
    return '🟠';
  if (networkLower.includes('apple')) return '⚫';
  if (networkLower.includes('peacock')) return '🦚';
  if (networkLower.includes('paramount')) return '🔵';
  if (networkLower.includes('amc')) return '🟡';
  if (networkLower.includes('fx')) return '🟠';
  if (networkLower.includes('abc')) return '🔵';
  if (networkLower.includes('cbs')) return '🔵';
  if (networkLower.includes('nbc')) return '🟡';
  if (networkLower.includes('fox')) return '🟠';
  return '📺';
};

const getNetworkColor = (network: string): string => {
  const networkLower = network.toLowerCase();
  if (networkLower.includes('netflix'))
    return 'bg-red-500/20 border-red-500/30';
  if (networkLower.includes('hbo') || networkLower.includes('max'))
    return 'bg-purple-500/20 border-purple-500/30';
  if (networkLower.includes('hulu'))
    return 'bg-green-500/20 border-green-500/30';
  if (networkLower.includes('disney'))
    return 'bg-blue-500/20 border-blue-500/30';
  if (networkLower.includes('prime') || networkLower.includes('amazon'))
    return 'bg-orange-500/20 border-orange-500/30';
  if (networkLower.includes('apple'))
    return 'bg-gray-500/20 border-gray-500/30';
  if (networkLower.includes('peacock'))
    return 'bg-indigo-500/20 border-indigo-500/30';
  if (networkLower.includes('paramount'))
    return 'bg-blue-500/20 border-blue-500/30';
  if (networkLower.includes('amc'))
    return 'bg-yellow-500/20 border-yellow-500/30';
  if (networkLower.includes('fx'))
    return 'bg-orange-500/20 border-orange-500/30';
  return 'bg-gray-500/20 border-gray-500/30';
};

export function NetworkTrendsAnalysis({
  networks,
  loading = false,
  error = null,
  variant = 'dark'
}: NetworkTrendsAnalysisProps): JSX.Element {
  const [expandedNetwork, setExpandedNetwork] = useState<string | null>(null);

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <Card
        className={cn(
          'border shadow-xl backdrop-blur-sm',
          variant === 'dark'
            ? 'border-white/20 bg-white/10'
            : 'border-gray-200 bg-white'
        )}
      >
        <CardContent className='p-6 text-center'>
          <div className='mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20'>
            <TrendingUp className='h-6 w-6 text-red-400' />
          </div>
          <p
            className={cn(
              'text-sm',
              variant === 'dark' ? 'text-white/60' : 'text-gray-600'
            )}
          >
            {error}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!networks || networks.length === 0) {
    return (
      <Card
        className={cn(
          'border shadow-xl backdrop-blur-sm',
          variant === 'dark'
            ? 'border-white/20 bg-white/10'
            : 'border-gray-200 bg-white'
        )}
      >
        <CardContent className='p-6 text-center'>
          <div className='mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/10'>
            <TrendingUp className='h-6 w-6 text-white/60' />
          </div>
          <p
            className={cn(
              'text-sm',
              variant === 'dark' ? 'text-white/60' : 'text-gray-600'
            )}
          >
            No network trends available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      {networks.map((network) => (
        <Card
          key={network.network}
          className={cn(
            'border shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl',
            variant === 'dark'
              ? 'hover:bg-white/15 border-white/20 bg-white/10'
              : 'border-gray-200 bg-white hover:shadow-lg'
          )}
        >
          <CardHeader>
            <div className='flex items-start justify-between'>
              <div className='flex items-center gap-3'>
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full text-2xl',
                    getNetworkColor(network.network)
                  )}
                >
                  {getNetworkIcon(network.network)}
                </div>
                <div>
                  <CardTitle
                    className={cn(
                      'text-xl font-bold',
                      variant === 'dark' ? 'text-white' : 'text-gray-900'
                    )}
                  >
                    {network.network}
                  </CardTitle>
                  <div className='mt-1 flex items-center gap-2'>
                    <span
                      className={cn(
                        'rounded-full px-2 py-1 text-xs font-medium',
                        variant === 'dark'
                          ? 'bg-white/10 text-white/80'
                          : 'bg-gray-100 text-gray-600'
                      )}
                    >
                      {network.type}
                    </span>
                    <span
                      className={cn(
                        'text-sm',
                        variant === 'dark' ? 'text-white/60' : 'text-gray-500'
                      )}
                    >
                      {network.trendingShows.length} trending shows
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant='ghost'
                size='sm'
                onClick={() =>
                  setExpandedNetwork(
                    expandedNetwork === network.network ? null : network.network
                  )
                }
                className={cn(
                  'transition-all duration-200',
                  variant === 'dark'
                    ? 'text-white/60 hover:bg-white/10 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                {expandedNetwork === network.network ? 'Collapse' : 'Expand'}
              </Button>
            </div>
          </CardHeader>

          <CardContent className='space-y-4'>
            {/* Network Insights */}
            <div className='space-y-3'>
              <div className='flex items-start gap-2'>
                <Sparkles
                  className={cn(
                    'mt-0.5 h-4 w-4',
                    variant === 'dark' ? 'text-purple-400' : 'text-purple-600'
                  )}
                />
                <div>
                  <h4
                    className={cn(
                      'mb-1 text-sm font-semibold',
                      variant === 'dark' ? 'text-white' : 'text-gray-900'
                    )}
                  >
                    Network Insight
                  </h4>
                  <p
                    className={cn(
                      'text-sm leading-relaxed',
                      variant === 'dark' ? 'text-white/80' : 'text-gray-600'
                    )}
                  >
                    {network.networkInsight}
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-2'>
                <TrendingUp
                  className={cn(
                    'mt-0.5 h-4 w-4',
                    variant === 'dark' ? 'text-green-400' : 'text-green-600'
                  )}
                />
                <div>
                  <h4
                    className={cn(
                      'mb-1 text-sm font-semibold',
                      variant === 'dark' ? 'text-white' : 'text-gray-900'
                    )}
                  >
                    Overall Trend
                  </h4>
                  <p
                    className={cn(
                      'text-sm leading-relaxed',
                      variant === 'dark' ? 'text-white/80' : 'text-gray-600'
                    )}
                  >
                    {network.overallTrend}
                  </p>
                </div>
              </div>
            </div>

            {/* Trending Shows */}
            {expandedNetwork === network.network &&
              network.trendingShows.length > 0 && (
                <div className='space-y-4 border-t border-white/10 pt-4'>
                  <h4
                    className={cn(
                      'text-lg font-semibold',
                      variant === 'dark' ? 'text-white' : 'text-gray-900'
                    )}
                  >
                    Trending Shows
                  </h4>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                    {network.trendingShows.map((show) => (
                      <Card
                        key={show.tmdbId}
                        className={cn(
                          'border transition-all duration-300 hover:shadow-lg',
                          variant === 'dark'
                            ? 'border-white/10 bg-white/5 hover:bg-white/10'
                            : 'border-gray-200 bg-white hover:shadow-md'
                        )}
                      >
                        <CardContent className='p-4'>
                          <div className='flex gap-3'>
                            <div className='flex-shrink-0'>
                              <img
                                src={`https://image.tmdb.org/t/p/w92${show.posterPath}`}
                                alt={show.title}
                                className='h-24 w-16 rounded object-cover'
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/assets/no-media.png';
                                }}
                              />
                            </div>
                            <div className='min-w-0 flex-1'>
                              <h5
                                className={cn(
                                  'line-clamp-2 mb-1 text-sm font-semibold',
                                  variant === 'dark'
                                    ? 'text-white'
                                    : 'text-gray-900'
                                )}
                              >
                                {show.title}
                              </h5>
                              <div className='mb-2 flex items-center gap-2'>
                                {show.voteAverage && (
                                  <div className='flex items-center gap-1'>
                                    <Star
                                      className={cn(
                                        'h-3 w-3',
                                        variant === 'dark'
                                          ? 'text-yellow-400'
                                          : 'text-yellow-500'
                                      )}
                                    />
                                    <span
                                      className={cn(
                                        'text-xs',
                                        variant === 'dark'
                                          ? 'text-white/80'
                                          : 'text-gray-600'
                                      )}
                                    >
                                      {show.voteAverage.toFixed(1)}
                                    </span>
                                  </div>
                                )}
                                <div className='flex items-center gap-1'>
                                  <Calendar
                                    className={cn(
                                      'h-3 w-3',
                                      variant === 'dark'
                                        ? 'text-white/60'
                                        : 'text-gray-500'
                                    )}
                                  />
                                  <span
                                    className={cn(
                                      'text-xs',
                                      variant === 'dark'
                                        ? 'text-white/60'
                                        : 'text-gray-500'
                                    )}
                                  >
                                    {show.releaseDate}
                                  </span>
                                </div>
                              </div>
                              <p
                                className={cn(
                                  'line-clamp-3 mb-2 text-xs leading-relaxed',
                                  variant === 'dark'
                                    ? 'text-white/70'
                                    : 'text-gray-600'
                                )}
                              >
                                {show.reason}
                              </p>
                              <div className='flex items-center gap-1'>
                                <Users
                                  className={cn(
                                    'h-3 w-3',
                                    variant === 'dark'
                                      ? 'text-blue-400'
                                      : 'text-blue-500'
                                  )}
                                />
                                <span
                                  className={cn(
                                    'text-xs',
                                    variant === 'dark'
                                      ? 'text-white/60'
                                      : 'text-gray-500'
                                  )}
                                >
                                  Cultural Impact
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
