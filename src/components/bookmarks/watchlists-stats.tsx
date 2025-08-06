import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { cn } from '@lib/utils';
import { HeroIcon } from '@components/ui/hero-icon';
import type { IconName } from '@components/ui/hero-icon';

type WatchlistStats = {
  total: number;
  public: number;
  movies: number;
  tvShows: number;
};

type StatCardProps = {
  icon: IconName;
  label: string;
  value: number;
  className?: string;
};

function StatCard({
  icon,
  label,
  value,
  className
}: StatCardProps): JSX.Element {
  return (
    <div className='rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800'>
      <div className='flex items-center gap-3'>
        <div
          className={cn(
            'rounded-lg p-2',
            'bg-gray-100 dark:bg-gray-700',
            className
          )}
        >
          <HeroIcon iconName={icon} className='h-5 w-5' />
        </div>
        <div>
          <p className='text-sm text-gray-500 dark:text-gray-400'>{label}</p>
          <p className='text-2xl font-bold'>{value}</p>
        </div>
      </div>
    </div>
  );
}

export function WatchlistsStats({ userId }: { userId: string }): JSX.Element {
  const [stats, setStats] = useState<WatchlistStats>({
    total: 0,
    public: 0,
    movies: 0,
    tvShows: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats(): Promise<void> {
      if (!userId) return;

      try {
        const watchlistsRef = collection(db, 'watchlists');
        const q = query(watchlistsRef, where('userId', '==', userId));
        const snapshot = await getDocs(q);

        let publicLists = 0;
        let movies = 0;
        let tvShows = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.isPublic) publicLists++;
          movies += data.movies ?? 0;
          tvShows += data.tvShows ?? 0;
        });

        setStats({
          total: snapshot.size,
          public: publicLists,
          movies,
          tvShows
        });
      } catch (error) {
        // console.error('Error fetching watchlist stats:', error);
      } finally {
        setLoading(false);
      }
    }

    void fetchStats();
  }, [userId]);

  if (loading) {
    return (
      <div className='h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800' />
    );
  }

  return (
    <div className='grid grid-cols-4 gap-4'>
      <StatCard
        icon='BookmarkIcon'
        label='Total Lists'
        value={stats.total}
        className='text-blue-600 dark:text-blue-400'
      />
      <StatCard
        icon='GlobeAltIcon'
        label='Public Lists'
        value={stats.public}
        className='text-green-600 dark:text-green-400'
      />
      {/* <StatCard
        icon='FilmIcon'
        label='Movies'
        value={stats.movies}
        className='text-purple-600 dark:text-purple-400'
      />
      <StatCard
        icon='TvIcon'
        label='TV Shows'
        value={stats.tvShows}
        className='text-orange-600 dark:text-orange-400'
      /> */}
    </div>
  );
}
