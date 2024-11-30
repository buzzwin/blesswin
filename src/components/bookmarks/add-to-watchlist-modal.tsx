import { useState, useEffect } from 'react';
import { useAuth } from '@lib/context/auth-context';
import {
  collection,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  doc,
  increment,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { HeroIcon } from '@components/ui/hero-icon';
import { Modal } from '@components/modal/modal';
import { manageBookmark } from '@lib/firebase/utils';
import { cn } from '@lib/utils';
import type { Watchlist } from '@lib/types/bookmark';
import { toast } from 'react-hot-toast';

type AddToWatchlistModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (watchlistId: string) => Promise<void>;
  mediaData: {
    id: string;
    title: string;
    description?: string;
    mediaType: 'movie' | 'tv';
    posterPath?: string;
  };
};

export function AddToWatchlistModal({
  isOpen,
  onClose,
  onAdd,
  mediaData
}: AddToWatchlistModalProps): JSX.Element {
  const { user } = useAuth();
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWatchlist, setSelectedWatchlist] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [newWatchlistDesc, setNewWatchlistDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [isPublic, setIsPublic] = useState(false);

  // Reset states when modal is opened/closed
  useEffect(() => {
    if (!isOpen) {
      setSelectedWatchlist('');
      setIsCreating(false);
      setNewWatchlistName('');
      setNewWatchlistDesc('');
      setIsPublic(false);
      setSaving(false);
      setError(null);
    }
  }, [isOpen]);

  // Fetch user's watchlists
  useEffect(() => {
    if (!user?.id || !isOpen) return;

    setLoading(true);
    setError(null);

    const watchlistsRef = collection(db, 'watchlists');
    const q = query(
      watchlistsRef,
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const newWatchlists = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          })) as Watchlist[];
          setWatchlists(newWatchlists);
          setError(null);
        } catch (err) {
          console.error('Error processing watchlists:', err);
          setError('Error loading watchlists');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Error fetching watchlists:', error);
        setError('Failed to load watchlists');
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      setWatchlists([]);
      setError(null);
    };
  }, [user?.id, isOpen]);

  const handleCreateWatchlist = async (): Promise<void> => {
    if (!user?.id || !newWatchlistName.trim()) return;

    try {
      setSaving(true);
      const watchlistRef = await addDoc(collection(db, 'watchlists'), {
        name: newWatchlistName.trim(),
        description: newWatchlistDesc.trim() || undefined,
        userId: user.id,
        createdAt: serverTimestamp(),
        isPublic,
        totalItems: 0
      });

      // Ensure all required fields are present and have default values
      const bookmarkData = {
        title: mediaData.title,
        description: mediaData.description || '',
        mediaType: mediaData.mediaType || 'movie', // Provide default value
        posterPath: mediaData.posterPath || '',
        watchlistId: watchlistRef.id,
        mediaId: mediaData.id,
        tags: [],
        userId: user.id, // Add userId to bookmark data
        createdAt: serverTimestamp()
      };

      await manageBookmark('bookmark', user.id, mediaData.id, bookmarkData);

      // Update watchlist total items
      await updateDoc(watchlistRef, {
        totalItems: increment(1)
      });

      toast.success('Added to new watchlist!');
      onClose();
    } catch (error) {
      console.error('Error creating watchlist:', error);
      toast.error('Failed to create watchlist');
    } finally {
      setSaving(false);
    }
  };

  const handleAddToExisting = async (): Promise<void> => {
    if (!selectedWatchlist) return;

    try {
      setSaving(true);
      await onAdd(selectedWatchlist);
      toast.success('Added to watchlist!');
      onClose();
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      toast.error('Failed to add to watchlist');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={isOpen} closeModal={onClose}>
      <div className='w-full max-w-md rounded-xl bg-white p-6 dark:bg-gray-900'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-xl font-bold'>Add to Watchlist</h2>
          <button
            onClick={onClose}
            className='rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800'
          >
            <HeroIcon className='h-5 w-5' iconName='XMarkIcon' />
          </button>
        </div>

        <div className='mb-4'>
          <h3 className='font-medium text-gray-900 dark:text-white'>
            {mediaData.title}
          </h3>
          {mediaData.description && (
            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
              {mediaData.description}
            </p>
          )}
        </div>

        {isCreating ? (
          <div className='space-y-4'>
            <input
              type='text'
              placeholder='Watchlist name'
              value={newWatchlistName}
              onChange={(e) => setNewWatchlistName(e.target.value)}
              className='w-full rounded-lg border p-2 dark:border-gray-700 dark:bg-gray-800'
            />
            <textarea
              placeholder='Description (optional)'
              value={newWatchlistDesc}
              onChange={(e) => setNewWatchlistDesc(e.target.value)}
              className='w-full rounded-lg border p-2 dark:border-gray-700 dark:bg-gray-800'
            />
            <div className='flex items-center gap-3 rounded-lg border p-3 dark:border-gray-700'>
              <div className='flex-1'>
                <p className='font-medium text-gray-900 dark:text-white'>
                  Make Watchlist Public
                </p>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  Anyone can view public watchlists
                </p>
              </div>
              <button
                type='button'
                role='switch'
                aria-checked={isPublic}
                onClick={() => setIsPublic(!isPublic)}
                className={cn(
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                  isPublic ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                    isPublic ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </button>
            </div>
            <div className='flex justify-end gap-2'>
              <button
                onClick={() => setIsCreating(false)}
                className='rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWatchlist}
                disabled={!newWatchlistName.trim() || saving}
                className='rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50'
              >
                {saving ? 'Creating...' : 'Create & Add'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className='max-h-60 space-y-2 overflow-y-auto'>
              {loading ? (
                <div className='flex justify-center py-4'>
                  <HeroIcon
                    className='h-6 w-6 animate-spin'
                    iconName='ArrowPathIcon'
                  />
                </div>
              ) : error ? (
                <div className='py-4 text-center'>
                  <p className='text-red-500 dark:text-red-400'>{error}</p>
                  <button
                    onClick={() => {
                      setError(null);
                      setLoading(true);
                    }}
                    className='mt-2 text-sm text-blue-500 hover:text-blue-600'
                  >
                    Try again
                  </button>
                </div>
              ) : watchlists.length === 0 ? (
                <div className='py-4 text-center'>
                  <p className='text-gray-500 dark:text-gray-400'>
                    No watchlists yet. Create your first one!
                  </p>
                  <button
                    onClick={() => setIsCreating(true)}
                    className='mt-2 text-sm text-blue-500 hover:text-blue-600'
                  >
                    Create Watchlist
                  </button>
                </div>
              ) : (
                watchlists.map((watchlist) => (
                  <button
                    key={watchlist.id}
                    onClick={() => setSelectedWatchlist(watchlist.id)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg p-3',
                      selectedWatchlist === watchlist.id
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    )}
                  >
                    <div>
                      <p className='font-medium'>{watchlist.name}</p>
                      {watchlist.description && (
                        <p className='text-sm text-gray-500 dark:text-gray-400'>
                          {watchlist.description}
                        </p>
                      )}
                    </div>
                    {selectedWatchlist === watchlist.id && (
                      <HeroIcon className='h-5 w-5' iconName='CheckIcon' />
                    )}
                  </button>
                ))
              )}
            </div>

            <div className='mt-4 flex items-center justify-between border-t pt-4 dark:border-gray-700'>
              <button
                onClick={() => setIsCreating(true)}
                className='flex items-center gap-2 rounded-lg px-4 py-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              >
                <HeroIcon className='h-5 w-5' iconName='PlusIcon' />
                <span>New Watchlist</span>
              </button>

              <button
                onClick={handleAddToExisting}
                disabled={!selectedWatchlist || saving}
                className='rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50'
              >
                {saving ? 'Adding...' : 'Add to Selected'}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
