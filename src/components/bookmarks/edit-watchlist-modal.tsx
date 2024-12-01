import { useState, useEffect } from 'react';
import { Modal } from '@components/modal/modal';
import { cn } from '@lib/utils';
import { HeroIcon } from '@components/ui/hero-icon';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { toast } from 'react-hot-toast';
import type { Watchlist } from '@lib/types/bookmark';

type EditWatchlistModalProps = {
  watchlist: Watchlist;
  isOpen: boolean;
  onClose: () => void;
};

export function EditWatchlistModal({
  watchlist,
  isOpen,
  onClose
}: EditWatchlistModalProps): JSX.Element {
  const [name, setName] = useState(watchlist.name);
  const [description, setDescription] = useState(watchlist.description || '');
  const [isPublic, setIsPublic] = useState(watchlist.isPublic);
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(watchlist.name);
      setDescription(watchlist.description || '');
      setIsPublic(watchlist.isPublic);
    }
  }, [isOpen, watchlist]);

  const handleSubmit = async (): Promise<void> => {
    if (!name.trim()) return;

    try {
      setLoading(true);
      const watchlistRef = doc(db, 'watchlists', watchlist.id);
      await updateDoc(watchlistRef, {
        name: name.trim(),
        description: description.trim() || null,
        isPublic
      });

      toast.success('Watchlist updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating watchlist:', error);
      toast.error('Failed to update watchlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      modalClassName='max-w-lg bg-white dark:bg-gray-900 w-full p-8 rounded-2xl'
      open={isOpen}
      closeModal={onClose}
    >
      <div className='space-y-6'>
        <div>
          <h2 className='text-2xl font-bold'>Edit watchlist</h2>
          <p className='text-gray-500 dark:text-gray-400'>
            Update your watchlist details
          </p>
        </div>

        {/* Same form fields as CreateWatchlistModal */}
        <div className='space-y-4'>
          <div>
            <label
              htmlFor='name'
              className='block text-sm font-medium text-gray-700 dark:text-gray-300'
            >
              Name
            </label>
            <input
              type='text'
              id='name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-emerald-500 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-emerald-500'
            />
          </div>

          <div>
            <label
              htmlFor='description'
              className='block text-sm font-medium text-gray-700 dark:text-gray-300'
            >
              Description (optional)
            </label>
            <textarea
              id='description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className='mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-emerald-500 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-emerald-500'
              rows={3}
            />
          </div>

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
                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
                isPublic ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
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
        </div>

        <div className='flex justify-end gap-3'>
          <button
            onClick={onClose}
            className='rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || loading}
            className='flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600 disabled:opacity-50'
          >
            {loading && (
              <HeroIcon
                className='h-5 w-5 animate-spin'
                iconName='ArrowPathIcon'
              />
            )}
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
}
