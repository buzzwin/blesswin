import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { useAuth } from '@lib/context/auth-context';
import { HomeLayout, ProtectedLayout } from '@components/layout/common-layout';
import { MainLayout } from '@components/layout/main-layout';
import { MainContainer } from '@components/home/main-container';
import { MainHeader } from '@components/home/main-header';
import { SEO } from '@components/common/seo';
import { HeroIcon } from '@components/ui/hero-icon';
import { Loading } from '@components/ui/loading';
import type { ReactElement, ReactNode } from 'react';
import type { Bookmark, Watchlist } from '@lib/types/bookmark';
import { cn } from '@lib/utils';
import { IconName } from '@components/ui/hero-icon';
import Link from 'next/link';

type WatchlistStats = {
  totalItems: number;
  movies: number;
  tvShows: number;
};

function StatsCard({
  icon,
  label,
  value,
  className
}: {
  icon: IconName;
  label: string;
  value: number;
  className?: string;
}): JSX.Element {
  return (
    <div className='rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800'>
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

export default function WatchlistPage(): JSX.Element {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState<Watchlist | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [stats, setStats] = useState<WatchlistStats>({
    totalItems: 0,
    movies: 0,
    tvShows: 0
  });
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect((): void => {
    if (!id) return;

    const fetchWatchlist = async (): Promise<void> => {
      try {
        const watchlistRef = doc(db, 'watchlists', id as string);
        const watchlistSnap = await getDoc(watchlistRef);

        if (!watchlistSnap.exists()) {
          await router.push('/watchlists');
          return;
        }

        setWatchlist({
          id: watchlistSnap.id,
          ...watchlistSnap.data()
        } as Watchlist);
      } catch (error) {
        console.error('Error fetching watchlist:', error);
      }
    };

    void fetchWatchlist();
  }, [id, router]);

  useEffect(() => {
    if (!id) return;

    const bookmarksRef = collection(db, 'bookmarks');
    const q = query(bookmarksRef, where('watchlistId', '==', id));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newBookmarks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Bookmark[];

      setBookmarks(newBookmarks);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  const toggleExpand = (bookmarkId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(bookmarkId)) {
        newSet.delete(bookmarkId);
      } else {
        newSet.add(bookmarkId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <MainContainer>
        <Loading />
      </MainContainer>
    );
  }

  if (!watchlist) {
    return (
      <MainContainer>
        <div className='flex flex-col items-center justify-center py-12'>
          <HeroIcon
            className='h-12 w-12 text-gray-400'
            iconName='ExclamationTriangleIcon'
          />
          <p className='mt-4 text-lg font-medium'>Watchlist not found</p>
        </div>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <SEO title={`${watchlist.name} / Buzzwin`} />
      <MainHeader className='flex items-center gap-6'>
        <div className='flex-1'>
          <div className='flex items-center gap-2'>
            <h2 className='text-xl font-bold'>{watchlist.name}</h2>
            {watchlist.isPublic && (
              <span className='inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400'>
                <HeroIcon iconName='GlobeAltIcon' className='h-3 w-3' />
                Public
              </span>
            )}
          </div>
          {watchlist.description && (
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              {watchlist.description}
            </p>
          )}
        </div>
      </MainHeader>

      <div className='mt-6 grid grid-cols-3 gap-4'>
        <StatsCard
          icon='BookmarkIcon'
          label='Total Items'
          value={stats.totalItems}
          className='text-blue-600 dark:text-blue-400'
        />
        <StatsCard
          icon='FilmIcon'
          label='Movies'
          value={stats.movies}
          className='text-emerald-600 dark:text-emerald-400'
        />
        <StatsCard
          icon='TvIcon'
          label='TV Shows'
          value={stats.tvShows}
          className='text-purple-600 dark:text-purple-400'
        />
      </div>

      <div className='mt-6'>
        {bookmarks.length === 0 ? (
          <div className='py-12 text-center'>
            <p className='text-gray-500 dark:text-gray-400'>
              No items in this watchlist yet
            </p>
          </div>
        ) : (
          <div className='space-y-2'>
            {bookmarks.map((bookmark) => {
              const isExpanded = expandedItems.has(bookmark.id);

              return (
                <div
                  key={bookmark.id}
                  className='group w-full rounded-lg bg-white shadow-sm transition-all hover:shadow-md dark:bg-gray-800'
                >
                  {/* Collapsed View */}
                  <div className='flex items-center justify-between p-3'>
                    <div className='flex items-center gap-3'>
                      {bookmark.posterPath ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${bookmark.posterPath}`}
                          alt={bookmark.title}
                          className='h-16 w-12 rounded-md object-cover'
                        />
                      ) : (
                        <div className='flex h-16 w-12 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700'>
                          <HeroIcon
                            iconName={
                              bookmark.mediaType === 'movie'
                                ? 'FilmIcon'
                                : 'TvIcon'
                            }
                            className='h-6 w-6 text-gray-400'
                          />
                        </div>
                      )}
                      <div>
                        <h3 className='font-medium'>{bookmark.title}</h3>
                        <div className='flex items-center gap-2'>
                          <span className='rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300'>
                            {bookmark.mediaType === 'movie'
                              ? 'Movie'
                              : 'TV Show'}
                          </span>
                          {bookmark.tags?.map((tag) => (
                            <span
                              key={tag}
                              className='rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <button
                        className='rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700'
                        onClick={() => toggleExpand(bookmark.id)}
                      >
                        <HeroIcon
                          iconName={
                            isExpanded ? 'ChevronUpIcon' : 'ChevronDownIcon'
                          }
                          className='h-5 w-5'
                        />
                      </button>
                      <button
                        className='rounded-full p-2 text-red-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20'
                        onClick={() => {
                          /* Add remove handler */
                        }}
                      >
                        <HeroIcon iconName='XMarkIcon' className='h-5 w-5' />
                      </button>
                    </div>
                  </div>

                  {/* Expanded View */}
                  {isExpanded && (
                    <div className='border-t border-gray-100 p-4 dark:border-gray-700'>
                      {bookmark.description && (
                        <p className='text-sm text-gray-500 dark:text-gray-400'>
                          {bookmark.description}
                        </p>
                      )}
                      <div className='mt-4 flex items-center gap-4'>
                        <Link href={`/buzz/${bookmark.id}`}>
                          <a className='rounded-lg bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-600'>
                            View Details
                          </a>
                        </Link>
                        {/* <button className='px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'>
                          Edit Tags
                        </button> */}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainContainer>
  );
}

WatchlistPage.getLayout = (page: ReactElement): ReactNode => (
  <ProtectedLayout>
    <MainLayout>
      <HomeLayout>{page}</HomeLayout>
    </MainLayout>
  </ProtectedLayout>
);
