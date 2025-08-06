import { useRouter } from 'next/router';
import { doc } from 'firebase/firestore';
import { useState } from 'react';
import { useDocument } from '@lib/hooks/useDocument';
import { watchlistsCollection } from '@lib/firebase/collections';
import {
  ProtectedLayout,
  WatchListsLayout
} from '@components/layout/common-layout';
import { MainHeader } from '@components/home/main-header';
import { Loading } from '@components/ui/loading';
import { Error } from '@components/ui/error';
import { SEO } from '@components/common/seo';
import { Watchlist } from '@components/bookmarks/watchlist';
import { WatchlistShare } from '@components/share/watchlist-share';
import { HeroIcon } from '@components/ui/hero-icon';
import type { ReactElement, ReactNode } from 'react';

export default function WatchlistPage(): JSX.Element {
  const {
    query: { id },
    back
  } = useRouter();

  const { data: watchlist, loading } = useDocument(
    doc(watchlistsCollection, id as string),
    { allowNull: true }
  );

  const [isShareOpen, setIsShareOpen] = useState(false);

  return (
    <div>
      <SEO title={`${watchlist?.name ?? 'Watchlist'} / Buzzwin`} />
      <MainHeader useActionButton action={back}>
        <div className='flex w-full items-center justify-between px-4'>
          <div className='flex items-center gap-3'>
            <h2 className='text-xl font-bold'>
              {watchlist?.name ?? 'Watchlist'}
            </h2>
            {watchlist?.isPublic && (
              <span className='inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'>
                <HeroIcon className='h-4 w-4' iconName='GlobeAltIcon' />
                Public
              </span>
            )}
          </div>
          {watchlist && (
            <button
              onClick={() => setIsShareOpen(true)}
              className='flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
            >
              <HeroIcon className='h-5 w-5' iconName='ShareIcon' />
              Share Watchlist
            </button>
          )}
        </div>
      </MainHeader>

      <div className='p-4'>
        {loading ? (
          <Loading />
        ) : !watchlist ? (
          <Error message='Watchlist not found' />
        ) : (
          <Watchlist watchlistId={id as string} />
        )}
      </div>

      {watchlist && (
        <WatchlistShare
          watchlist={watchlist}
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
        />
      )}
    </div>
  );
}

WatchlistPage.getLayout = (page: ReactElement): ReactNode => (
  <ProtectedLayout>
    <WatchListsLayout>{page}</WatchListsLayout>
  </ProtectedLayout>
);
