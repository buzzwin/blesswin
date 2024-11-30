import { useAuth } from '@lib/context/auth-context';
import { useModal } from '@lib/hooks/useModal';
import { useWatchlists } from '@lib/hooks/useWatchlists';
import { HeroIcon } from '@components/ui/hero-icon';
import { cn } from '@lib/utils';
import Link from 'next/link';
import type { Watchlist } from '@lib/types/bookmark';

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
  if (loading)
    return (
      <div className='grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className='h-48 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800'
          />
        ))}
      </div>
    );

  return (
    <div
      className={cn(
        'grid w-full gap-4',
        compact
          ? 'grid-cols-1'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
      )}
    >
      {watchlists.map((watchlist) => (
        <Link key={watchlist.id} href={`/watchlist/${watchlist.id}`}>
          <a className='block h-full overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md dark:bg-gray-800'>
            <div className='flex h-full flex-col p-4'>
              <div className='mb-2 flex items-center justify-between'>
                <h3 className='line-clamp-1 text-lg font-medium'>
                  {watchlist.name}
                </h3>
                {watchlist.isPublic && (
                  <span className='ml-2 inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'>
                    <HeroIcon iconName='GlobeAltIcon' className='h-3 w-3' />
                    Public
                  </span>
                )}
              </div>
              {watchlist.description && (
                <p className='line-clamp-2 mb-3 flex-grow text-sm text-gray-500 dark:text-gray-400'>
                  {watchlist.description}
                </p>
              )}
              <div className='mt-auto flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='flex -space-x-2'>
                    <div className='rounded-full bg-gray-100 p-1 dark:bg-gray-700'>
                      <HeroIcon
                        className='h-4 w-4 text-gray-500 dark:text-gray-400'
                        iconName='FilmIcon'
                      />
                    </div>
                    <div className='rounded-full bg-gray-100 p-1 dark:bg-gray-700'>
                      <HeroIcon
                        className='h-4 w-4 text-gray-500 dark:text-gray-400'
                        iconName='TvIcon'
                      />
                    </div>
                  </div>
                  <span className='text-sm text-gray-500 dark:text-gray-400'>
                    {watchlist.totalItems} items
                  </span>
                </div>
              </div>
            </div>
          </a>
        </Link>
      ))}
    </div>
  );
}
