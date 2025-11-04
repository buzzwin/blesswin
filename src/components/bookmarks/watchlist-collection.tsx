import { useState, useEffect } from 'react';
import { useAuth } from '@lib/context/auth-context';
import { useWatchlists } from '@lib/hooks/useWatchlists';
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button-shadcn';
import { ImageWithFallback } from '@components/ui/image-with-fallback';
import {
  Bookmark,
  Film,
  Tv,
  Calendar,
  Trash2,
  Plus,
  Folder
} from 'lucide-react';
import Link from 'next/link';
import type { Bookmark as BookmarkType, Watchlist } from '@lib/types/bookmark';

interface WatchlistCollectionProps {
  userId?: string;
}

// Helper function to construct image URL from posterPath
const getImageUrl = (
  posterPath: string,
  size: 'w92' | 'w154' | 'w300' = 'w154'
): string => {
  if (!posterPath)
    return `/api/placeholder/${
      size === 'w92' ? '48/64' : size === 'w154' ? '56/80' : '200/300'
    }`;

  if (posterPath.startsWith('http')) {
    return posterPath;
  }

  if (posterPath.startsWith('/api/placeholder')) {
    return posterPath;
  }

  return `https://image.tmdb.org/t/p/${size}${posterPath}`;
};

export function WatchlistCollection({
  userId
}: WatchlistCollectionProps): JSX.Element {
  const { user } = useAuth();
  const { watchlists, loading: watchlistsLoading } = useWatchlists();
  const [watchlistItems, setWatchlistItems] = useState<
    Map<string, BookmarkType[]>
  >(new Map());
  const [loadingItems, setLoadingItems] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const targetUserId = userId || user?.id;

  // Load all bookmarks for all watchlists
  useEffect(() => {
    if (!targetUserId || watchlists.length === 0) {
      setLoadingItems(false);
      return;
    }

    const unsubscribeFunctions: Array<() => void> = [];

    watchlists.forEach((watchlist) => {
      const bookmarksRef = collection(db, 'bookmarks');
      const q = query(
        bookmarksRef,
        where('userId', '==', targetUserId),
        where('watchlistId', '==', watchlist.id)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as BookmarkType[];

        setWatchlistItems((prev) => {
          const newMap = new Map(prev);
          newMap.set(watchlist.id, items);
          return newMap;
        });

        setLoadingItems(false);
      });

      unsubscribeFunctions.push(unsubscribe);
    });

    return () => {
      unsubscribeFunctions.forEach((unsub) => unsub());
    };
  }, [targetUserId, watchlists]);

  const handleRemoveFromWatchlist = async (
    bookmarkId: string,
    title: string
  ): Promise<void> => {
    if (!targetUserId) return;

    try {
      await deleteDoc(doc(db, 'bookmarks', bookmarkId));
      toast.success(`Removed "${title}" from watchlist`);
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  // Group items by media type and year
  const categorizedItems = () => {
    const allItems: Array<
      BookmarkType & { watchlistName: string; watchlistId: string }
    > = [];

    watchlists.forEach((watchlist) => {
      const items = watchlistItems.get(watchlist.id) || [];
      items.forEach((item) => {
        allItems.push({
          ...item,
          watchlistName: watchlist.name,
          watchlistId: watchlist.id
        });
      });
    });

    const byMediaType = {
      movie: allItems.filter((item) => item.mediaType === 'movie'),
      tv: allItems.filter((item) => item.mediaType === 'tv')
    };

    const byYear: Record<string, BookmarkType[]> = {};
    allItems.forEach((item) => {
      // Extract year from createdAt or use "Unknown"
      const year = '2024'; // You might want to add a year field to bookmarks
      if (!byYear[year]) byYear[year] = [];
      byYear[year].push(item);
    });

    return { byMediaType, byYear, all: allItems };
  };

  const categories = categorizedItems();

  if (watchlistsLoading || loadingItems) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold text-foreground dark:text-white'>
            My Watchlists
          </h2>
        </div>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className='h-48 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700'
            />
          ))}
        </div>
      </div>
    );
  }

  const totalItems = categories.all.length;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-foreground dark:text-white'>
            Watchlist Collection
          </h2>
          <p className='mt-1 text-sm text-muted-foreground dark:text-gray-400'>
            {totalItems} items across {watchlists.length} watchlist
            {watchlists.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href='/watchlists'>
          <Button variant='outline' size='sm'>
            <Plus className='mr-2 h-4 w-4' />
            New Watchlist
          </Button>
        </Link>
      </div>

      {/* Categories/Filter */}
      <div className='flex flex-wrap gap-2'>
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          size='sm'
          onClick={() => setSelectedCategory(null)}
        >
          <Folder className='mr-2 h-4 w-4' />
          All ({totalItems})
        </Button>
        <Button
          variant={selectedCategory === 'movie' ? 'default' : 'outline'}
          size='sm'
          onClick={() => setSelectedCategory('movie')}
        >
          <Film className='mr-2 h-4 w-4' />
          Movies ({categories.byMediaType.movie.length})
        </Button>
        <Button
          variant={selectedCategory === 'tv' ? 'default' : 'outline'}
          size='sm'
          onClick={() => setSelectedCategory('tv')}
        >
          <Tv className='mr-2 h-4 w-4' />
          TV Shows ({categories.byMediaType.tv.length})
        </Button>
      </div>

      {/* Watchlists Overview */}
      {watchlists.length > 0 && (
        <div>
          <h3 className='mb-4 text-lg font-semibold text-foreground dark:text-white'>
            By Watchlist
          </h3>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {watchlists.map((watchlist) => {
              const items = watchlistItems.get(watchlist.id) || [];
              return (
                <Card
                  key={watchlist.id}
                  className='border-border dark:border-gray-700'
                >
                  <CardHeader>
                    <div className='flex items-center justify-between'>
                      <CardTitle className='text-base'>
                        {watchlist.name}
                      </CardTitle>
                      <Link href={`/watchlist/${watchlist.id}`}>
                        <Button variant='ghost' size='sm'>
                          View All
                        </Button>
                      </Link>
                    </div>
                    {watchlist.description && (
                      <p className='mt-1 text-sm text-muted-foreground dark:text-gray-400'>
                        {watchlist.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className='mb-2 text-sm text-muted-foreground dark:text-gray-400'>
                      {items.length} item{items.length !== 1 ? 's' : ''}
                    </div>
                    <div className='grid grid-cols-4 gap-2'>
                      {items.slice(0, 4).map((item) => (
                        <div
                          key={item.id}
                          className='relative aspect-[2/3] overflow-hidden rounded'
                        >
                          <ImageWithFallback
                            src={getImageUrl(item.posterPath || '', 'w92')}
                            alt={item.title}
                            width={48}
                            height={64}
                            className='h-full w-full object-cover'
                            fallback='/api/placeholder/48/64'
                          />
                        </div>
                      ))}
                      {items.length > 4 && (
                        <div className='flex aspect-[2/3] items-center justify-center rounded bg-gray-100 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400'>
                          +{items.length - 4}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* All Items Grid */}
      <div>
        <h3 className='mb-4 text-lg font-semibold text-foreground dark:text-white'>
          {selectedCategory === null
            ? 'All Items'
            : selectedCategory === 'movie'
            ? 'Movies'
            : 'TV Shows'}
        </h3>
        {categories.all
          .filter((item) =>
            selectedCategory === null ? true : (item.mediaType === selectedCategory)
          )
          .length === 0 ? (
          <div className='rounded-lg border border-border bg-card p-8 text-center dark:border-gray-700'>
            <Bookmark className='mx-auto h-12 w-12 text-gray-400' />
            <p className='mt-4 text-muted-foreground dark:text-gray-400'>
              No items found in this category
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
            {categories.all
              .filter((item) =>
                selectedCategory === null
                  ? true
                  : (item.mediaType === selectedCategory)
              )
              .map((item) => (
                <div
                  key={item.id}
                  className='group relative overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-lg dark:border-gray-700'
                >
                  <div className='relative aspect-[2/3] overflow-hidden bg-gray-200 dark:bg-gray-700'>
                    <ImageWithFallback
                      src={getImageUrl(item.posterPath || '', 'w300')}
                      alt={item.title}
                      width={200}
                      height={300}
                      className='h-full w-full object-cover transition-transform group-hover:scale-105'
                      fallback='/api/placeholder/200/300'
                    />
                    <button
                      onClick={() =>
                        handleRemoveFromWatchlist(item.id, item.title)
                      }
                      className='absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100'
                    >
                      <Trash2 className='h-4 w-4' />
                    </button>
                    <div className='absolute bottom-2 left-2 right-2'>
                      <span className='rounded-full bg-black/70 px-2 py-1 text-xs text-white'>
                        {item.watchlistName}
                      </span>
                    </div>
                  </div>
                  <div className='p-2'>
                    <h4 className='line-clamp-1 text-xs font-medium text-foreground dark:text-white'>
                      {item.title}
                    </h4>
                    {item.mediaType && (
                      <div className='mt-1 flex items-center gap-1 text-xs text-muted-foreground dark:text-gray-400'>
                        {item.mediaType === 'movie' ? (
                          <Film className='h-3 w-3' />
                        ) : (
                          <Tv className='h-3 w-3' />
                        )}
                        <span className='capitalize'>{item.mediaType}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {watchlists.length === 0 && (
        <div className='rounded-lg border border-border bg-card p-8 text-center dark:border-gray-700'>
          <Bookmark className='mx-auto h-12 w-12 text-gray-400' />
          <h3 className='mt-4 text-lg font-semibold text-foreground dark:text-white'>
            No Watchlists Yet
          </h3>
          <p className='mt-2 text-muted-foreground dark:text-gray-400'>
            Create your first watchlist to start organizing your favorite movies
            and TV shows
          </p>
          <Link href='/watchlists'>
            <Button className='mt-4' size='sm'>
              <Plus className='mr-2 h-4 w-4' />
              Create Watchlist
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
