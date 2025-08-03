import { useAuth } from '@lib/context/auth-context';
import { useModal } from '@lib/hooks/useModal';
import { useWatchlists } from '@lib/hooks/useWatchlists';
import { useWindow } from '@lib/context/window-context';
import { HeroIcon } from '@components/ui/hero-icon';
import { cn } from '@lib/utils';
import Link from 'next/link';
import { useState } from 'react';
import type { Watchlist } from '@lib/types/bookmark';
import { WatchlistShare } from '@components/share/watchlist-share';

type WatchlistsProps = {
  watchlists: Watchlist[];
  loading?: boolean;
  compact?: boolean;
};

export function Watchlists({
  watchlists,
  loading,
  compact
}: WatchlistsProps): JSX.Element {
  const { isMobile, width } = useWindow();
  const [selectedWatchlist, setSelectedWatchlist] = useState<Watchlist | null>(
    null
  );

  const getGridCols = () => {
    if (compact ?? isMobile) return 'grid-cols-1';
    if (width < 640) return 'grid-cols-1';
    if (width < 1024) return 'grid-cols-2';
    if (width < 1280) return 'grid-cols-3';
    if (width < 1536) return 'grid-cols-4';
    return 'grid-cols-5';
  };

  if (loading)
    return (
      <div className={cn('grid w-full gap-4', getGridCols())}>
        {Array.from({ length: isMobile ? 4 : 8 }).map((_, i) => (
          <div
            key={i}
            className='h-48 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800'
          />
        ))}
      </div>
    );

  return (
    <div className={cn('grid w-full gap-4', getGridCols())}>
      {watchlists.map((watchlist) => (
        <div
          key={watchlist.id}
          className='block h-full overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md dark:bg-gray-800'
        >
          <div className='flex h-full flex-col p-4'>
            <div className='mb-2 flex items-center justify-between'>
              <Link href={`/watchlist/${watchlist.id}`}>
                <a
                  className={cn(
                    'line-clamp-1 font-medium',
                    isMobile ? 'text-base' : 'text-lg'
                  )}
                >
                  {watchlist.name}
                </a>
              </Link>
              <div className='flex items-center gap-2'>
                {watchlist.isPublic && (
                  <span className='inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'>
                    <HeroIcon iconName='GlobeAltIcon' className='h-3 w-3' />
                    Public
                  </span>
                )}
                <button
                  onClick={() => setSelectedWatchlist(watchlist)}
                  className='rounded-full p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                >
                  <HeroIcon className='h-5 w-5' iconName='ShareIcon' />
                </button>
              </div>
            </div>
            {watchlist.description && (
              <p
                className={cn(
                  'line-clamp-2 mb-3 flex-grow text-gray-500 dark:text-gray-400',
                  isMobile ? 'text-xs' : 'text-sm'
                )}
              >
                {watchlist.description}
              </p>
            )}
            <div className='mt-auto flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <div className='flex -space-x-2'>
                  <div className='rounded-full bg-gray-100 p-1 dark:bg-gray-700'>
                    <HeroIcon
                      className={cn(
                        'text-gray-500 dark:text-gray-400',
                        isMobile ? 'h-3 w-3' : 'h-4 w-4'
                      )}
                      iconName='FilmIcon'
                    />
                  </div>
                  <div className='rounded-full bg-gray-100 p-1 dark:bg-gray-700'>
                    <HeroIcon
                      className={cn(
                        'text-gray-500 dark:text-gray-400',
                        isMobile ? 'h-3 w-3' : 'h-4 w-4'
                      )}
                      iconName='TvIcon'
                    />
                  </div>
                </div>
                <span
                  className={cn(
                    'text-gray-500 dark:text-gray-400',
                    isMobile ? 'text-xs' : 'text-sm'
                  )}
                >
                  {watchlist.totalItems} items
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {selectedWatchlist && (
        <WatchlistShare
          watchlist={selectedWatchlist}
          isOpen={!!selectedWatchlist}
          onClose={() => setSelectedWatchlist(null)}
        />
      )}
    </div>
  );
}
