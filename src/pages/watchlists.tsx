import { useAuth } from '@lib/context/auth-context';
import {
  ProtectedLayout,
  WatchListsLayout
} from '@components/layout/common-layout';
import { MainHeader } from '@components/home/main-header';
import { useState } from 'react';
import { HeroIcon } from '@components/ui/hero-icon';
import { Modal } from '@components/modal/modal';
import { useModal } from '@lib/hooks/useModal';
import { useWatchlists } from '@lib/hooks/useWatchlists';
import { cn } from '@lib/utils';
import { SEO } from '@components/common/seo';
import { Watchlists } from '@components/bookmarks/watchlists';
import { WatchlistsStats } from '@components/bookmarks/watchlists-stats';
import { WindowContextProvider } from '@lib/context/window-context';
import type { ReactElement, ReactNode } from 'react';

function CreateWatchlistModal({
  open,
  closeModal,
  createWatchlist
}: {
  open: boolean;
  closeModal: () => void;
  createWatchlist: (
    name: string,
    description?: string,
    isPublic?: boolean
  ) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const handleSubmit = async (): Promise<void> => {
    await createWatchlist(name, description, isPublic);
    setName('');
    setDescription('');
    setIsPublic(false);
    closeModal();
  };

  return (
    <Modal
      modalClassName='max-w-lg bg-white dark:bg-gray-900 w-full p-8 rounded-2xl'
      open={open}
      closeModal={closeModal}
    >
      <div className='space-y-6'>
        <div>
          <h2 className='text-2xl font-bold'>Create new watchlist</h2>
          <p className='text-gray-500 dark:text-gray-400'>
            Create a new watchlist to organize your movies and TV shows
          </p>
        </div>

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
              className='block w-full px-4 py-2 mt-1 text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-emerald-500'
              placeholder='My Favorite Movies'
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
              className='block w-full px-4 py-2 mt-1 text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-emerald-500'
              placeholder='A collection of my all-time favorites'
              rows={3}
            />
          </div>

          <div className='flex items-center gap-3 p-3 border rounded-lg dark:border-gray-700'>
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
            onClick={closeModal}
            className='px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className='px-4 py-2 text-white rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50'
          >
            Create
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function WatchlistsPage(): JSX.Element {
  const { user } = useAuth();
  const { open, openModal, closeModal } = useModal();
  const { watchlists, loading, createWatchlist } = useWatchlists();

  return (
    <div>
      <SEO title='Watchlists / Buzzwin' />
      <MainHeader>
        <div className='flex items-center justify-between px-4'>
          <div>
            <h2 className='text-xl font-bold'>My Watchlists</h2>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              Organize your movies and TV shows
            </p>
          </div>
          <span className='px-4'></span>
          <button
            onClick={openModal}
            className='flex items-center gap-2 px-4 py-2 text-white rounded-lg bg-emerald-500 hover:bg-emerald-600'
          >
            <HeroIcon className='w-5 h-5' iconName='PlusIcon' />
            <span>New Watchlist</span>
          </button>
        </div>
      </MainHeader>

      <div className='flex flex-col gap-6 p-4'>
        <WatchlistsStats userId={user?.id as string} />
        <div className='min-h-[calc(100vh-13rem)] w-full'>
          <Watchlists watchlists={watchlists} loading={loading} />
        </div>
      </div>

      <CreateWatchlistModal
        open={open}
        closeModal={closeModal}
        createWatchlist={createWatchlist}
      />
    </div>
  );
}

WatchlistsPage.getLayout = (page: ReactElement): ReactNode => (
  <ProtectedLayout>
    <WatchListsLayout>{page}</WatchListsLayout>
  </ProtectedLayout>
);
