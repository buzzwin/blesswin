import { useEffect, useState } from 'react';
import { TrendingUp, Tv, Wifi, Radio } from 'lucide-react';
import { cn } from '@lib/utils';
import { Loading } from '@components/ui/loading';

// Local interface since we removed it from the unified API
interface TrendingNetwork {
  name: string;
  type: 'streaming' | 'cable' | 'broadcast';
  popularity: number;
  description: string;
  topShows: string[];
  logoUrl?: string;
}

type TrendingNetworksProps = {
  networksData: TrendingNetwork[];
  variant?: 'default' | 'dark';
};

export function TrendingNetworks({
  networksData,
  variant = 'default'
}: TrendingNetworksProps): JSX.Element {
  const [networks, setNetworks] = useState<TrendingNetwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (networksData && networksData.length > 0) {
      setNetworks(networksData);
      setLoading(false);
    } else {
      // If no data provided, show loading state briefly then empty state
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [networksData]);

  const getNetworkIcon = (type: string) => {
    switch (type) {
      case 'streaming':
        return <Wifi className='h-4 w-4 text-blue-500' />;
      case 'cable':
        return <Tv className='h-4 w-4 text-purple-500' />;
      case 'broadcast':
        return <Radio className='h-4 w-4 text-green-500' />;
      default:
        return <Tv className='h-4 w-4 text-gray-500' />;
    }
  };

  const getNetworkTypeLabel = (type: string) => {
    switch (type) {
      case 'streaming':
        return 'Streaming';
      case 'cable':
        return 'Cable';
      case 'broadcast':
        return 'Broadcast';
      default:
        return 'Network';
    }
  };

  if (loading) return <Loading />;

  return (
    <div className='space-y-3'>
      {networks.length === 0 ? (
        <div className='py-6 text-center'>
          <Tv className='mx-auto mb-3 h-10 w-10 text-amber-400' />
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            No trending networks data available.
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-3'>
          {networks.map((network, index) => (
            <div
              key={network.name}
              className={cn(
                'group rounded-lg border p-4 transition-all duration-200 hover:shadow-md',
                variant === 'dark'
                  ? 'border-amber-800/30 bg-gray-800 hover:border-amber-700'
                  : 'border-amber-200 bg-white hover:border-amber-300'
              )}
            >
              <div className='flex items-start gap-3'>
                <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30'>
                  <span className='text-sm font-bold text-amber-700 dark:text-amber-300'>
                    {index + 1}
                  </span>
                </div>

                <div className='min-w-0 flex-1'>
                  <div className='mb-1 flex items-center gap-2'>
                    <h3
                      className={cn(
                        'break-words text-sm font-semibold transition-colors group-hover:text-amber-700',
                        variant === 'dark'
                          ? 'text-white group-hover:text-amber-300'
                          : 'text-gray-900'
                      )}
                    >
                      {network.name}
                    </h3>
                    {getNetworkIcon(network.type)}
                    <span
                      className={cn(
                        'rounded-full px-2 py-1 text-xs',
                        variant === 'dark'
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-gray-100 text-gray-600'
                      )}
                    >
                      {getNetworkTypeLabel(network.type)}
                    </span>
                  </div>

                  <p
                    className={cn(
                      'line-clamp-2 mb-2 text-xs',
                      variant === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    )}
                  >
                    {network.description}
                  </p>

                  <div className='flex items-center gap-2'>
                    <TrendingUp className='h-3 w-3 text-green-500' />
                    <span
                      className={cn(
                        'text-xs font-medium',
                        variant === 'dark' ? 'text-green-400' : 'text-green-600'
                      )}
                    >
                      {network.popularity}% trending
                    </span>
                  </div>

                  {network.topShows && network.topShows.length > 0 && (
                    <div className='mt-2'>
                      <p
                        className={cn(
                          'mb-1 text-xs font-medium',
                          variant === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        )}
                      >
                        Top Shows:
                      </p>
                      <div className='flex flex-wrap gap-1'>
                        {network.topShows.slice(0, 3).map((show, showIndex) => (
                          <span
                            key={showIndex}
                            className={cn(
                              'rounded-full px-2 py-1 text-xs',
                              variant === 'dark'
                                ? 'bg-gray-700 text-gray-300'
                                : 'bg-gray-100 text-gray-600'
                            )}
                          >
                            {show}
                          </span>
                        ))}
                        {network.topShows.length > 3 && (
                          <span
                            className={cn(
                              'rounded-full px-2 py-1 text-xs',
                              variant === 'dark'
                                ? 'bg-gray-700 text-gray-300'
                                : 'bg-gray-100 text-gray-600'
                            )}
                          >
                            +{network.topShows.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
