import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Timestamp } from 'firebase/firestore';
import {
  collection,
  query,
  where,
  deleteDoc,
  doc,
  onSnapshot
} from 'firebase/firestore';
import { useAuth } from '@lib/context/auth-context';
import { db } from '@lib/firebase/app';
import type { Bookmark } from '@lib/types/bookmark';
import { HeroIcon } from '@components/ui/hero-icon';

type WatchlistProps = {
  watchlistId: string;
};

export function Watchlist({ watchlistId }: WatchlistProps): JSX.Element {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !watchlistId) return;

    const bookmarksRef = collection(db, 'bookmarks');
    const q = query(
      bookmarksRef,
      where('userId', '==', user.id),
      where('watchlistId', '==', watchlistId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newBookmarks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Bookmark[];

      newBookmarks.sort((a, b) => {
        const timeA = a.createdAt.toMillis();
        const timeB = b.createdAt.toMillis();
        return timeB - timeA;
      });

      setBookmarks(newBookmarks);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.id, watchlistId]);

  const removeFromWatchlist = async (bookmarkId: string) => {
    try {
      await deleteDoc(doc(db, 'bookmarks', bookmarkId));
    } catch (error) {
      // console.error('Error removing bookmark:', error);
    }
  };

  if (loading) {
    return (
      <div className='flex h-40 items-center justify-center'>
        <div className='animate-spin'>
          <HeroIcon className='h-8 w-8' iconName='ArrowPathIcon' />
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {bookmarks.length === 0 ? (
        <p className='py-8 text-center text-gray-500 dark:text-gray-400'>
          No items in this watchlist yet
        </p>
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {bookmarks.map((bookmark: Bookmark) => (
            <div
              key={bookmark.id}
              className='relative overflow-hidden rounded-lg bg-white shadow transition-shadow hover:shadow-md dark:bg-gray-800'
            >
              <div className='relative aspect-[2/3]'>
                {bookmark.posterPath ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${bookmark.posterPath}`}
                    alt={bookmark.title}
                    width={300}
                    height={500}
                    className='h-full w-full object-cover'
                    unoptimized
                  />
                ) : (
                  <div className='flex h-full items-center justify-center bg-gray-100 dark:bg-gray-700'>
                    <HeroIcon
                      className='h-12 w-12 text-gray-400'
                      iconName='PhotoIcon'
                    />
                  </div>
                )}
                <button
                  onClick={() => removeFromWatchlist(bookmark.id)}
                  className='absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70'
                >
                  <HeroIcon className='h-5 w-5' iconName='TrashIcon' />
                </button>
              </div>
              <div className='p-4'>
                <h3 className='line-clamp-1 font-medium'>{bookmark.title}</h3>
                {bookmark.description && (
                  <p className='line-clamp-2 mt-1 text-sm text-gray-500 dark:text-gray-400'>
                    {bookmark.description}
                  </p>
                )}
                {bookmark.tags && bookmark.tags.length > 0 && (
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {bookmark.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className='rounded-full bg-gray-100 px-2 py-1 text-xs dark:bg-gray-700'
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
