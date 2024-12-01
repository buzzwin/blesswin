import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { cn } from '@lib/utils';
import { HeroIcon } from '@components/ui/hero-icon';
import { Loading } from '@components/ui/loading';
import type { ImageProps } from 'next/image';

type ViewingActivity = {
  title: string;
  tmdbId: string;
  mediaType: 'movie' | 'tv';
  poster_path: string;
};

type TrendingShow = {
  title: string;
  mediaId: string;
  mediaType: 'movie' | 'tv';
  posterPath: string;
  watchCount: number;
};

type FirestoreData = {
  viewingActivity: ViewingActivity;
  totalWatchers: number;
};

export function TrendingShows({
  limit: showLimit = 5,
  variant = 'default'
}: {
  limit?: number;
  variant?: 'default' | 'dark';
}): JSX.Element {
  const [trending, setTrending] = useState<TrendingShow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrendingShows(): Promise<void> {
      try {
        const tweetsRef = collection(db, 'tweets');
        const q = query(
          tweetsRef,
          orderBy('totalWatchers', 'desc'),
          limit(showLimit)
        );
        const querySnapshot = await getDocs(q);

        const shows: TrendingShow[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as FirestoreData;
          if (data.viewingActivity && data.totalWatchers > 0) {
            shows.push({
              title: data.viewingActivity.title,
              mediaId: data.viewingActivity.tmdbId,
              mediaType: data.viewingActivity.mediaType,
              posterPath: data.viewingActivity.poster_path,
              watchCount: data.totalWatchers
            });
          }
        });

        setTrending(shows);
      } catch (error) {
        // Log error but don't expose to user
        console.error('Error fetching trending shows:', error);
      } finally {
        setLoading(false);
      }
    }

    void fetchTrendingShows();
  }, [showLimit]);

  if (loading) return <Loading />;

  return (
    <div
      className={cn(
        'rounded-xl shadow-md',
        variant === 'dark'
          ? 'bg-white/5 hover:bg-white/10 dark:bg-black/20 dark:hover:bg-black/40'
          : 'bg-white dark:bg-gray-900'
      )}
    >
      <h2
        className={cn(
          'border-b px-4 py-3 text-xl font-bold',
          variant === 'dark'
            ? 'border-white/10 text-white dark:border-gray-800/60'
            : 'border-gray-100 text-gray-900 dark:border-gray-800 dark:text-white'
        )}
      >
        Trending Now
      </h2>
      <div
        className={cn(
          'divide-y',
          variant === 'dark'
            ? 'divide-white/10 dark:divide-gray-800/60'
            : 'divide-gray-100 dark:divide-gray-800'
        )}
      >
        {trending.map((show, index) => (
          <Link
            key={show.mediaId}
            href={`/media/${show.mediaType}/${show.mediaId}`}
          >
            <div
              className={cn(
                'flex items-center gap-3 p-4',
                'cursor-pointer transition-colors duration-200',
                variant === 'dark'
                  ? 'hover:bg-white/5 dark:hover:bg-gray-800/50'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
              )}
            >
              <span
                className={cn(
                  'text-lg font-bold',
                  variant === 'dark' ? 'text-gray-400/80' : 'text-gray-400'
                )}
              >
                {index + 1}
              </span>
              {show.posterPath && (
                <div className='relative h-16 w-12 overflow-hidden rounded-md'>
                  <Image
                    src={`https://image.tmdb.org/t/p/w92${show.posterPath}`}
                    alt={show.title}
                    width={48}
                    height={64}
                    className='object-cover'
                    unoptimized
                    priority={index < 3}
                  />
                </div>
              )}
              <div className='min-w-0 flex-1'>
                <h3
                  className={cn(
                    'truncate font-medium',
                    variant === 'dark'
                      ? 'text-white group-hover:text-emerald-400'
                      : 'text-gray-900 dark:text-white'
                  )}
                >
                  {show.title}
                </h3>
                <p
                  className={cn(
                    'flex items-center gap-1 text-sm',
                    variant === 'dark'
                      ? 'text-gray-400/80'
                      : 'text-gray-500 dark:text-gray-400'
                  )}
                >
                  <HeroIcon iconName='UsersIcon' className='h-4 w-4' />
                  {show.watchCount}{' '}
                  {show.watchCount === 1 ? 'watcher' : 'watchers'}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
