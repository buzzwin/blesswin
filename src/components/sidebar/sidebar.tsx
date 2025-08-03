import { useRouter } from 'next/router';
import { LogOut } from 'lucide-react';
import { useModal } from '@lib/hooks/useModal';
import { useAuth } from '@lib/context/auth-context';
import { Modal } from '@components/modal/modal';
import { Input } from '@components/input/input';
import { Button } from '@components/ui/button';
import { UserAvatar } from '@components/user/user-avatar';
import { UserName } from '@components/user/user-name';
import { UserUsername } from '@components/user/user-username';
import type { IconName } from '@components/ui/hero-icon';
import { SidebarLink } from './sidebar-link';

export type NavLink = {
  href: string;
  linkName: string;
  iconName: IconName;
  disabled?: boolean;
  canBeHidden?: boolean;
};

const getNavLinks = (username: string): Readonly<NavLink[]> => [
  {
    href: '/recommendations',
    linkName: 'AI Recommendations',
    iconName: 'SparklesIcon',
    disabled: false
  },
  {
    href: '/reviews',
    linkName: 'Recent Reviews',
    iconName: 'ClockIcon',
    disabled: false
  },
  {
    href: `/user/${username}`,
    linkName: 'Profile',
    iconName: 'UserIcon',
    disabled: false
  }
];

export function Sidebar(): JSX.Element {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { open, closeModal } = useModal();

  const navLinks = getNavLinks(user?.username ?? 'guest');

  const handleLogout = async (): Promise<void> => {
    try {
      await signOut();
      void router.push('/');
    } catch (error) {
      // console.error('Logout error:', error);
    }
  };

  return (
    <header
      id='sidebar'
      className='flex w-0 shrink-0 transition-opacity duration-200 xs:w-20 md:w-24 lg:max-w-none xl:-mr-4 xl:w-full xl:max-w-xs xl:justify-end'
    >
      <Modal
        className='flex items-start justify-center'
        modalClassName='bg-main-background rounded-2xl max-w-xl w-full mt-8 overflow-hidden'
        open={open}
        closeModal={closeModal}
      >
        <Input modal closeModal={closeModal} />
      </Modal>
      <div className='fixed bottom-0 z-10 flex w-full flex-col justify-between border-t border-light-border bg-main-background py-0 dark:border-dark-border xs:top-0 xs:h-full xs:w-auto xs:border-0 xs:bg-transparent xs:px-2 xs:py-3 xs:pt-2 md:px-4 xl:w-72'>
        <section className='flex flex-col justify-center gap-2 xs:items-center xl:items-stretch'>
          {/* User Profile Section - Desktop Only */}
          {user && (
            <div className='mb-6 hidden rounded-xl bg-main-sidebar-background p-4 xl:block'>
              <div className='mb-4 flex items-center gap-3'>
                <UserAvatar
                  className='h-12 w-12'
                  username={user.username}
                  src={user.photoURL}
                  alt={user.name}
                />
                <div className='min-w-0 flex-1'>
                  <UserName
                    name={user.name}
                    username={user.username}
                    verified={user.verified}
                    className='text-sm'
                  />
                  <UserUsername username={user.username} />
                </div>
              </div>
              <div className='flex gap-4 text-sm text-secondary'>
                <div className='flex items-center gap-1'>
                  <span className='font-bold'>
                    {user.following?.length ?? 0}
                  </span>
                  <span>Following</span>
                </div>
                <div className='flex items-center gap-1'>
                  <span className='font-bold'>
                    {user.followers?.length ?? 0}
                  </span>
                  <span>Followers</span>
                </div>
              </div>
            </div>
          )}

          <nav className='flex items-center justify-around xs:flex-col xs:justify-center xl:block'>
            {navLinks.map(({ ...linkData }) => (
              <SidebarLink {...linkData} key={linkData.href} />
            ))}
          </nav>

          {/* Sign Out Button - Desktop Only */}
          {user && (
            <div className='mt-4 hidden xl:block'>
              <Button
                className='accent-tab accent-bg-tab flex w-full items-center gap-2 rounded-md p-2 font-medium text-red-600
                           transition hover:bg-light-primary/10 hover:text-red-700 
                           focus-visible:ring-2 first:focus-visible:ring-[#878a8c] dark:hover:bg-dark-primary/10 dark:focus-visible:ring-white'
                onClick={handleLogout}
              >
                <LogOut className='h-4 w-4' />
                Sign Out
              </Button>
            </div>
          )}
        </section>
      </div>
    </header>
  );
}
