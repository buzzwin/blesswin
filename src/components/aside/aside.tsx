import { useAuth } from '@lib/context/auth-context';
import { useWindow } from '@lib/context/window-context';
import { useWatchlists } from '@lib/hooks/useWatchlists';
import { useSuggestedUsers } from '@lib/hooks/useSuggestedUsers';
import { Watchlists } from '@components/bookmarks/watchlists';
import { HeroIcon } from '@components/ui/hero-icon';
import { Button } from '@components/ui/button';
import { SearchBar } from './search-bar';
import { AsideFooter } from './aside-footer';
import { cn } from '@lib/utils';
import Link from 'next/link';
import { UserAvatar } from '@components/user/user-avatar';
import { UserName } from '@components/user/user-name';
import { UserUsername } from '@components/user/user-username';
import { ReactNode } from 'react';

type AsideProps = {
  children?: ReactNode;
};

export function Aside({ children }: AsideProps): JSX.Element {
  const { isMobile } = useWindow();
  const { user } = useAuth();
  const { watchlists, loading: watchlistsLoading } = useWatchlists();
  const { users: suggestedUsers, loading: usersLoading } = useSuggestedUsers();

  if (isMobile) return <></>;

  return (
    <aside className='flex w-96 flex-col gap-4 px-4'>
      <div
        className={cn(
          'sticky top-0 z-10',
          'flex flex-col gap-4',
          'h-screen pt-4 pb-20',
          'overflow-y-auto'
        )}
      >
        <SearchBar />

        {children}

        {/* Who to follow section */}
        {/* <section
          className={cn(
            'rounded-xl',
            'bg-white dark:bg-gray-800',
            'border border-gray-100 dark:border-gray-700',
            'overflow-hidden'
          )}
        >
          <div className='p-4 border-b border-gray-100 dark:border-gray-700'>
            <h2 className='font-bold'>Who to follow</h2>
          </div>
          <div className='p-4'>
            {user ? (
              usersLoading ? (
                <div className='flex justify-center py-8'>
                  <div className='w-8 h-8 border-4 rounded-full animate-spin border-emerald-500 border-t-transparent' />
                </div>
              ) : suggestedUsers.length > 0 ? (
                <div className='space-y-4'>
                  {suggestedUsers.map((suggestedUser) => (
                    <div
                      key={suggestedUser.id}
                      className='flex items-center justify-between'
                    >
                      <div className='flex items-center gap-3'>
                        <UserAvatar
                          src={suggestedUser.photoURL}
                          alt={suggestedUser.name}
                          username={suggestedUser.username}
                        />
                        <div className='flex flex-col'>
                          <UserName
                            name={suggestedUser.name}
                            verified={suggestedUser.verified}
                          />
                          <UserUsername username={suggestedUser.username} />
                        </div>
                      </div>
                      <Button className='ml-auto flex items-center gap-2 rounded-full bg-gray-900 px-4 py-1.5 text-sm font-bold text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100'>
                        Follow
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='py-4 text-center text-gray-500 dark:text-gray-400'>
                  No suggestions available
                </div>
              )
            ) : (
              <div className='flex flex-col items-center gap-4 py-8 text-center'>
                <div className='p-3 bg-gray-100 rounded-full dark:bg-gray-700'>
                  <HeroIcon
                    iconName='UserGroupIcon'
                    className='w-6 h-6 text-gray-500 dark:text-gray-400'
                  />
                </div>
                <div>
                  <p className='font-medium text-gray-900 dark:text-white'>
                    Sign in to follow others
                  </p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    See what others are watching
                  </p>
                </div>
              </div>
            )}
          </div>
        </section> */}

        <AsideFooter />
      </div>
    </aside>
  );
}
