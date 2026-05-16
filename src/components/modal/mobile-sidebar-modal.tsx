import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  LogOut,
  Settings,
  Moon,
  User as UserIcon,
  Home,
  BookOpen,
  Users,
  ChevronRight
} from 'lucide-react';
import { useModal } from '@lib/hooks/useModal';
import { useAuth } from '@lib/context/auth-context';
import { Button } from '@components/ui/button';
import { UserAvatar } from '@components/user/user-avatar';
import { UserName } from '@components/user/user-name';
import { UserUsername } from '@components/user/user-username';
import { Modal } from './modal';
import { DisplayModal } from './display-modal';
import type { User } from '@lib/types/user';

type NavLink = {
  href: string;
  label: string;
  icon: React.ReactNode;
  match?: (pathname: string) => boolean;
};

const getNavLinks = (username: string): NavLink[] => [
  {
    href: '/home',
    label: 'Home',
    icon: <Home className='h-5 w-5' />
  },
  {
    href: '/buzzes',
    label: 'Buzzbook',
    icon: <BookOpen className='h-5 w-5' />,
    match: (p) => p.startsWith('/buzzes') || p.startsWith('/b/')
  },
  {
    href: '/people',
    label: 'Discover',
    icon: <Users className='h-5 w-5' />
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: <Settings className='h-5 w-5' />
  },
  {
    href: `/user/${username}`,
    label: 'Profile',
    icon: <UserIcon className='h-5 w-5' />,
    match: (p) => p.startsWith('/user/')
  }
];

type MobileSidebarModalProps = Pick<
  User,
  | 'name'
  | 'username'
  | 'verified'
  | 'photoURL'
  | 'following'
  | 'followers'
  | 'coverPhotoURL'
> & {
  closeModal: () => void;
};

export function MobileSidebarModal({
  name,
  username,
  verified,
  photoURL,
  following,
  followers,
  closeModal
}: Partial<MobileSidebarModalProps> & { closeModal: () => void }): JSX.Element {
  const { signOut, user } = useAuth();
  const router = useRouter();
  const { pathname } = router;
  const {
    open: displayOpen,
    openModal: displayOpenModal,
    closeModal: displayCloseModal
  } = useModal();

  const navLinks = getNavLinks(username ?? 'guest');

  const handleLogout = async (): Promise<void> => {
    try {
      await signOut();
      closeModal();
      void router.push('/');
    } catch {
      // silent
    }
  };

  return (
    <>
      <Modal
        className='items-center justify-center xs:flex'
        modalClassName='max-w-xl bg-[#faf8f4] dark:bg-[#1c1510] w-full p-8 rounded-2xl'
        open={displayOpen}
        closeModal={displayCloseModal}
      >
        <DisplayModal closeModal={displayCloseModal} />
      </Modal>

      <div className='flex h-screen flex-col bg-[#faf8f4] dark:bg-[#1c1510]'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-[#e8d8c4] px-5 py-4 dark:border-[#2a1d10]'>
          <span className='font-display text-lg font-extrabold tracking-tight text-[#1a1108] dark:text-[#F5EFE6]'>
            Buzzwin
          </span>
          <button
            onClick={closeModal}
            className='rounded-full p-2 text-[#9E8B76] hover:bg-[rgba(201,169,110,0.08)] hover:text-[#C9A96E] dark:hover:bg-[rgba(201,169,110,0.06)] dark:hover:text-[#C9A96E]'
            aria-label='Close menu'
          >
            <svg className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>

        {/* User profile */}
        {user ? (
          <div className='border-b border-[#e8d8c4] px-5 py-5 dark:border-[#2a1d10]'>
            <Link href={`/user/${username ?? 'guest'}`}>
              <a onClick={closeModal} className='flex items-center gap-3'>
                <UserAvatar
                  className='h-12 w-12'
                  username={username ?? 'user'}
                  src={photoURL ?? ''}
                  alt={name ?? 'User'}
                />
                <div className='min-w-0 flex-1'>
                  <UserName
                    name={name ?? 'User'}
                    username={username ?? 'user'}
                    verified={verified ?? false}
                    className='text-sm font-bold'
                  />
                  <UserUsername username={username ?? 'user'} />
                </div>
                <ChevronRight className='h-4 w-4 shrink-0 text-[#9E8B76]' />
              </a>
            </Link>
            <div className='mt-4 flex gap-5 text-sm'>
              <span className='text-[#6b5744] dark:text-[#9E8B76]'>
                <span className='font-bold text-[#1a1108] dark:text-[#F5EFE6]'>{following?.length ?? 0}</span> Following
              </span>
              <span className='text-[#6b5744] dark:text-[#9E8B76]'>
                <span className='font-bold text-[#1a1108] dark:text-[#F5EFE6]'>{followers?.length ?? 0}</span> Followers
              </span>
            </div>
          </div>
        ) : (
          <div className='border-b border-[#e8d8c4] px-5 py-6 dark:border-[#2a1d10]'>
            <p className='mb-1 text-base font-bold text-[#1a1108] dark:text-[#F5EFE6]'>
              Celebrate your people
            </p>
            <p className='mb-4 text-sm text-[#6b5744] dark:text-[#9E8B76]'>
              Create Buzzbooks, join your tribe, share what matters.
            </p>
            <Link href='/login'>
              <a
                onClick={closeModal}
                className='block w-full rounded-xl bg-[#C97D60] py-2.5 text-center text-sm font-bold text-white transition hover:bg-[#B56540]'
              >
                Sign in / Sign up
              </a>
            </Link>
          </div>
        )}

        {/* Nav links */}
        <nav className='flex-1 overflow-y-auto px-3 py-3'>
          {navLinks.map(({ href, label, icon, match }) => {
            const isActive = match
              ? match(pathname)
              : pathname === href || pathname.startsWith(href + '/');
            return (
              <Link href={href} key={href}>
                <a
                  onClick={closeModal}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[rgba(201,169,110,0.06)] text-[#7a5510] dark:bg-[rgba(201,169,110,0.08)] dark:text-[#C9A96E]'
                      : 'text-[#3d2c1a] hover:bg-[rgba(201,169,110,0.08)] dark:text-[#C4B5A0] dark:hover:bg-[rgba(201,169,110,0.06)]'
                  }`}
                >
                  <span className={isActive ? 'text-[#8a6520] dark:text-[#C9A96E]' : 'text-[#9E8B76] dark:text-[#6b5744]'}>
                    {icon}
                  </span>
                  {label}
                </a>
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className='border-t border-[#e8d8c4] px-3 py-3 dark:border-[#2a1d10] space-y-1'>
          <button
            onClick={displayOpenModal}
            className='flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#3d2c1a] transition-colors hover:bg-[rgba(201,169,110,0.08)] dark:text-[#C4B5A0] dark:hover:bg-[#231a10]'
          >
            <Moon className='h-5 w-5 text-[#9E8B76] dark:text-[#6b5744]' />
            Display
          </button>
          {user && (
            <button
              onClick={handleLogout}
              className='flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
            >
              <LogOut className='h-5 w-5' />
              Sign Out
            </button>
          )}
        </div>
      </div>
    </>
  );
}
