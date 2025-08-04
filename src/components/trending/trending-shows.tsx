import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { cn } from '@lib/utils';
import { Loading } from '@components/ui/loading';
import { BookOpen, Star, TrendingUp } from 'lucide-react';
import type { TrendingShow } from '@lib/api/gemini';

type ViewingActivity = {
  title: string;
  tmdbId: string;
  mediaType: 'movie' | 'tv';
  poster_path: string;
};

type FirestoreTrendingShow = {
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

type TrendingShowsProps = {
  trendingData?: TrendingShow[];
  limit?: number;
  variant?: 'default' | 'dark';
  useFirestore?: boolean;
};

export function TrendingShows({
  trendingData,
  limit: showLimit = 5,
  variant = 'default',
  useFirestore = false
}: TrendingShowsProps): JSX.Element {
  const [trending, setTrending] = useState<
    (TrendingShow | FirestoreTrendingShow)[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrendingShows(): Promise<void> {
      try {
        setLoading(true);

        if (trendingData && trendingData.length > 0) {
          // Use provided Gemini data
          setTrending(trendingData);
        } else if (useFirestore) {
          // Fallback to Firestore data
          const tweetsRef = collection(db, 'tweets');
          const q = query(
            tweetsRef,
            orderBy('totalWatchers', 'desc'),
            limit(showLimit)
          );
          const querySnapshot = await getDocs(q);

          const shows: FirestoreTrendingShow[] = [];
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
        } else {
          setTrending([]);
        }
      } catch (error) {
        // Error fetching trending shows
        setTrending([]);
      } finally {
        setLoading(false);
      }
    }

    void fetchTrendingShows();
  }, [trendingData, showLimit, useFirestore]);

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
          {trending.map((show, index) => {
            // Handle both Gemini and Firestore data structures
            const isGeminiData = 'popularity' in show;
            const title = show.title;
            const mediaId = isGeminiData ? show.mediaId : show.mediaId;
            const mediaType = show.mediaType;
            const posterPath = isGeminiData ? show.posterPath : show.posterPath;
            const popularity = isGeminiData ? show.popularity : show.watchCount;
            const description = isGeminiData ? show.description : undefined;
            const network = isGeminiData ? show.network : undefined;

            return (
              <Link
                key={`${mediaId}-${index}`}
                href={`/media/${mediaType}/${mediaId}`}
              >
                <div
                  className={cn(
                    'group rounded-lg border p-3 transition-all duration-200 hover:shadow-md',
                    variant === 'dark'
                      ? 'border-amber-800/30 bg-gray-800 hover:border-amber-700'
                      : 'border-amber-200 bg-white hover:border-amber-300'
                  )}
                >
                  <div className='flex items-center gap-3'>
                    <div className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30'>
                      <span className='text-xs font-bold text-amber-700 dark:text-amber-300'>
                        {index + 1}
                      </span>
                    </div>
                    {posterPath && (
                      <div className='relative h-12 w-8 flex-shrink-0 overflow-hidden rounded-md shadow-sm'>
                        <Image
                          src={`https://image.tmdb.org/t/p/w92${posterPath}`}
                          alt={title}
                          width={32}
                          height={48}
                          className='object-cover'
                          unoptimized
                          priority={index < 3}
                        />
                      </div>
                    )}
                    <div className='min-w-0 flex-1'>
                      <h3
                        className={cn(
                          'break-words text-sm font-medium transition-colors group-hover:text-amber-700',
                          variant === 'dark'
                            ? 'text-white group-hover:text-amber-300'
                            : 'text-gray-900'
                        )}
                      >
                        {title}
                      </h3>

                      {description && (
                        <p
                          className={cn(
                            'line-clamp-2 mt-1 text-xs',
                            variant === 'dark'
                              ? 'text-gray-400'
                              : 'text-gray-600'
                          )}
                        >
                          {description}
                        </p>
                      )}

                      <div className='mt-1 flex items-center gap-2'>
                        {isGeminiData ? (
                          <>
                            <TrendingUp className='h-3 w-3 text-green-500' />
                            <span
                              className={cn(
                                'text-xs font-medium',
                                variant === 'dark'
                                  ? 'text-green-400'
                                  : 'text-green-600'
                              )}
                            >
                              {popularity}% trending
                            </span>
                          </>
                        ) : (
                          <>
                            <Star className='h-3 w-3 text-amber-500' />
                            <span
                              className={cn(
                                'text-xs font-medium',
                                variant === 'dark'
                                  ? 'text-amber-400'
                                  : 'text-amber-600'
                              )}
                            >
                              {popularity} watchers
                            </span>
                          </>
                        )}
                      </div>

                      {network && (
                        <div className='mt-1'>
                          <span
                            className={cn(
                              'rounded-full px-2 py-1 text-xs',
                              variant === 'dark'
                                ? 'bg-gray-700 text-gray-300'
                                : 'bg-gray-100 text-gray-600'
                            )}
                          >
                            {network}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
