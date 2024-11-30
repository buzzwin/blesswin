import { useState, useEffect } from 'react';
import { useAuth } from '@lib/context/auth-context';
import {
  collection,
  query,
  where,
  orderBy,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  getDocs
} from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { HeroIcon } from '@components/ui/hero-icon';
import type { Bookmark } from '@lib/types/bookmark';

export function Watchlist(): JSX.Element {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const bookmarksRef = collection(db, 'bookmarks');
    const q = query(
      bookmarksRef,
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newBookmarks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Bookmark[];
      setBookmarks(newBookmarks);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.id]);

  const addToWatchlist = async (
    bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'userId'>
  ) => {
    if (!user?.id) return;

    try {
      await addDoc(collection(db, 'bookmarks'), {
        ...bookmark,
        userId: user.id,
        createdAt: Date.now()
      });
    } catch (error) {
      console.error('Error adding bookmark:', error);
    }
  };

  const removeFromWatchlist = async (bookmarkId: string) => {
    try {
      await deleteDoc(doc(db, 'bookmarks', bookmarkId));
    } catch (error) {
      console.error('Error removing bookmark:', error);
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
      <h2 className='px-4 text-xl font-bold'>My Watchlist</h2>
      {bookmarks.length === 0 ? (
        <p className='py-8 text-center text-gray-500 dark:text-gray-400'>
          No items in your watchlist yet
        </p>
      ) : (
        <div className='divide-y divide-gray-200 dark:divide-gray-800'>
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className='flex items-start justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-900'
            >
              <div>
                <h3 className='font-medium'>{bookmark.title}</h3>
                {bookmark.description && (
                  <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                    {bookmark.description}
                  </p>
                )}
                {bookmark.tags && bookmark.tags.length > 0 && (
                  <div className='mt-2 flex gap-2'>
                    {bookmark.tags.map((tag) => (
                      <span
                        key={tag}
                        className='rounded-full bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800'
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => removeFromWatchlist(bookmark.id)}
                className='text-red-500 hover:text-red-600 dark:hover:text-red-400'
              >
                <HeroIcon className='h-5 w-5' iconName='TrashIcon' />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
