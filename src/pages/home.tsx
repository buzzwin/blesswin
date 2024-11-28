import { where, orderBy } from 'firebase/firestore';
import { useInfiniteScroll } from '@lib/hooks/useInfiniteScroll';
import { tweetsCollection } from '@lib/firebase/collections';
import { HomeLayout, ProtectedLayout } from '@components/layout/common-layout';
import { MainLayout } from '@components/layout/main-layout';
import { SEO } from '@components/common/seo';
import { MainContainer } from '@components/home/main-container';
import { Input } from '@components/input/input';
import { UpdateUsername } from '@components/home/update-username';
import { MainHeader } from '@components/home/main-header';
import { Tweet } from '@components/tweet/tweet';
import { Loading } from '@components/ui/loading';
import { Error } from '@components/ui/error';
import { cn } from '@lib/utils';
import type { ReactElement, ReactNode } from 'react';

export default function Home(): JSX.Element {
  const { data, loading, LoadMore } = useInfiniteScroll(
    tweetsCollection,
    [where('parent', '==', null), orderBy('createdAt', 'desc')],
    { includeUser: true, allowNull: true, preserve: true }
  );

  return (
    <MainContainer>
      <SEO title='Home / Buzzwin' />

      {/* Header Section */}
      <div
        className={cn(
          'sticky top-0 z-10',
          'bg-gradient-to-b from-white via-white/90 to-white/60',
          'dark:from-black dark:via-black/90 dark:to-black/60',
          'backdrop-blur-md backdrop-saturate-150'
        )}
      >
        <div
          className={cn(
            'px-6 py-4',
            'border-b border-gray-100 dark:border-gray-800/60'
          )}
        >
          <MainHeader
            useMobileSidebar
            title='What will you watch next ?'
            className={cn('flex items-center justify-between', 'mb-4')}
          >
            <UpdateUsername />
          </MainHeader>

          <div
            className={cn(
              'relative',
              'before:absolute before:inset-x-0 before:-top-4 before:h-4',
              'before:bg-gradient-to-b before:from-white/0 before:to-white/100',
              'dark:before:from-black/0 dark:before:to-black/100'
            )}
          >
            <Input />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div
        className={cn(
          'px-4 pt-4 pb-20',
          'bg-gray-50/50 dark:bg-gray-900/30',
          'min-h-screen'
        )}
      >
        <section className={cn('mx-auto max-w-3xl', 'space-y-4')}>
          {loading ? (
            <div
              className={cn(
                'flex items-center justify-center',
                'min-h-[200px]',
                'rounded-2xl',
                'bg-white dark:bg-gray-800/50',
                'border border-gray-100 dark:border-gray-800/60'
              )}
            >
              <Loading className='mt-5' />
            </div>
          ) : !data ? (
            <div
              className={cn(
                'flex items-center justify-center',
                'min-h-[200px]',
                'p-6',
                'rounded-2xl',
                'bg-white dark:bg-gray-800/50',
                'border border-gray-100 dark:border-gray-800/60',
                'text-gray-600 dark:text-gray-400'
              )}
            >
              <Error message='Something went wrong' />
            </div>
          ) : (
            <>
              {data.map((tweet) => (
                <div
                  key={tweet.id}
                  className={cn(
                    'rounded-2xl',
                    'bg-white dark:bg-gray-800/50',
                    'border border-gray-100 dark:border-gray-800/60',
                    'transition-all duration-200',
                    'hover:bg-gray-50 dark:hover:bg-gray-800/80',
                    'hover:border-gray-200 dark:hover:border-gray-700',
                    'hover:shadow-lg hover:shadow-gray-200/40 dark:hover:shadow-black/20',
                    'group'
                  )}
                >
                  <Tweet {...tweet} />
                </div>
              ))}

              <div
                className={cn(
                  'py-4 px-4',
                  'rounded-2xl',
                  'bg-white dark:bg-gray-800/50',
                  'border border-gray-100 dark:border-gray-800/60',
                  'transition-all duration-200'
                )}
              >
                <LoadMore />
              </div>
            </>
          )}
        </section>
      </div>
    </MainContainer>
  );
}

Home.getLayout = (page: ReactElement): ReactNode => (
  <ProtectedLayout>
    <MainLayout>
      <HomeLayout>{page}</HomeLayout>
    </MainLayout>
  </ProtectedLayout>
);
