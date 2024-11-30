import { useState } from 'react';
import { useAuth } from '@lib/context/auth-context';
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
import { db } from '@lib/firebase/app';
import { HeroIcon } from '@components/ui/hero-icon';
import { AddToWatchlistModal } from './add-to-watchlist-modal';
import { manageBookmark } from '@lib/firebase/utils';
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

    try {
      await manageBookmark('bookmark', user.id, mediaId, {
        title,
        mediaType,
        posterPath,
        watchlistId,
        mediaId,
        tags: []
      });
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      throw error;
    }
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
