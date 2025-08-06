import { useState } from 'react';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { useAuth } from '@lib/context/auth-context';
import { db } from '@lib/firebase/app';
import { manageBookmark } from '@lib/firebase/utils';
import { HeroIcon } from '@components/ui/hero-icon';
import { AddToWatchlistModal } from './add-to-watchlist-modal';
import type { Bookmark } from '@lib/types/bookmark';

type BookmarkButtonProps = {
  title: string;
  mediaId: string;
  mediaType: 'movie' | 'tv';
  posterPath?: string;
};

export function BookmarkButton({
  title,
  mediaId,
  mediaType,
  posterPath
}: BookmarkButtonProps): JSX.Element {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const addToWatchlist = async (watchlistId: string): Promise<void> => {
    if (!user?.id) return;

    await manageBookmark('bookmark', user.id, mediaId, {
      title,
      mediaType,
      posterPath,
      watchlistId,
      mediaId,
      tags: []
    });
  };

  return (
    <>
      <AddToWatchlistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addToWatchlist}
        mediaData={{
          id: mediaId,
          title,
          mediaType,
          posterPath
        }}
      />

      <button
        onClick={() => setIsModalOpen(true)}
        className='flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
      >
        <HeroIcon className='h-5 w-5' iconName='BookmarkIcon' />
        <span>Add to Watchlist</span>
      </button>
    </>
  );
}
