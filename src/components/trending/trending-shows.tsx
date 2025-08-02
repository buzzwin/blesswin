import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { cn } from '@lib/utils';
import { HeroIcon } from '@components/ui/hero-icon';
import { Loading } from '@components/ui/loading';
import { BookOpen, Star } from 'lucide-react';
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
    <div className='space-y-3'>
      {trending.length === 0 ? (
        <div className='py-6 text-center'>
          <BookOpen className='mx-auto mb-3 h-10 w-10 text-amber-400' />
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            No trending shows yet. Start watching and sharing!
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
          {trending.map((show, index) => (
            <Link
              key={show.mediaId}
              href={`/media/${show.mediaType}/${show.mediaId}`}
            >
              <div className='group rounded-lg border border-amber-200 bg-white p-3 transition-all duration-200 hover:border-amber-300 hover:shadow-md dark:border-amber-800/30 dark:bg-gray-800 dark:hover:border-amber-700'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30'>
                    <span className='text-xs font-bold text-amber-700 dark:text-amber-300'>
                      {index + 1}
                    </span>
                  </div>
                  {show.posterPath && (
                    <div className='relative h-12 w-8 flex-shrink-0 overflow-hidden rounded-md shadow-sm'>
                      <Image
                        src={`https://image.tmdb.org/t/p/w92${show.posterPath}`}
                        alt={show.title}
                        width={32}
                        height={48}
                        className='object-cover'
                        unoptimized
                        priority={index < 3}
                      />
                    </div>
                  )}
                  <div className='min-w-0 flex-1'>
                    <h3 className='text-sm font-medium text-gray-900 transition-colors group-hover:text-amber-700 dark:text-white dark:group-hover:text-amber-300 break-words'>
                      {show.title}
                    </h3>
                    <div className='mt-1 flex items-center gap-1'>
                      <Star className='h-3 w-3 text-amber-500' />
                      <span className='text-xs font-medium text-amber-600 dark:text-amber-400'>
                        {show.watchCount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
