import { useRouter } from 'next/router';
import { doc } from 'firebase/firestore';
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

  return (
    <div>
      <SEO title={`${watchlist?.name || 'Watchlist'} / Buzzwin`} />
      <MainHeader useActionButton action={back}>
        <div className='flex items-center gap-3'>
          <h2 className='text-xl font-bold'>
            {watchlist?.name || 'Watchlist'}
          </h2>
        </div>
      </MainHeader>

      <div className='p-4'>
        {loading ? (
          <Loading />
        ) : !watchlist ? (
          <Error message='Watchlist not found' />
        ) : (
          <div>{/* Watchlist content */}</div>
        )}
      </div>
    </div>
  );
}

WatchlistPage.getLayout = (page: ReactElement): ReactNode => (
  <ProtectedLayout>
    <WatchListsLayout>{page}</WatchListsLayout>
  </ProtectedLayout>
);
