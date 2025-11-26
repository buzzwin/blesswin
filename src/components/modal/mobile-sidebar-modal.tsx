import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  LogOut,
  Settings,
  HelpCircle,
  Moon,
  Sun,
  User as UserIcon,
  Star,
  Sparkles,
  Heart,
  Bookmark,
  Home,
  BookOpen,
  Youtube
} from 'lucide-react';
import cn from 'clsx';
import { useModal } from '@lib/hooks/useModal';
import { useAuth } from '@lib/context/auth-context';
import { Button } from '@components/ui/button';
import { UserAvatar } from '@components/user/user-avatar';
import { UserName } from '@components/user/user-name';
import { UserUsername } from '@components/user/user-username';
import { MainHeader } from '@components/home/main-header';
import { Modal } from './modal';
import { DisplayModal } from './display-modal';
import type { User } from '@lib/types/user';

export type MobileNavLink = {
  href: string;
  linkName: string;
  iconName: string;
  disabled?: boolean;
};

const getNavLinks = (username: string): Readonly<MobileNavLink[]> => [
  {
    href: '/',
    linkName: 'Home',
    iconName: 'home',
    disabled: false
  },
  {
    href: '/blog',
    linkName: 'Blog',
    iconName: 'book',
    disabled: false
  },
  {
    href: '/videos',
    linkName: 'Videos',
    iconName: 'youtube',
    disabled: false
  },
  {
    href: '/watchlists',
    linkName: 'Watchlists',
    iconName: 'bookmark',
    disabled: false
  },
  {
    href: `/user/${username}`,
    linkName: 'Profile',
    iconName: 'user',
    disabled: false
  }
];

type Stats = [string, string, number];

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
  coverPhotoURL,
  closeModal
}: MobileSidebarModalProps): JSX.Element {
  const { signOut } = useAuth();
  const router = useRouter();
  const {
    open: displayOpen,
    openModal: displayOpenModal,
    closeModal: displayCloseModal
  } = useModal();
  const navLinks = getNavLinks(username);

  const handleLogout = async (): Promise<void> => {
    try {
      await signOut();
      closeModal();
      void router.push('/');
    } catch (error) {
      // console.error('Logout error:', error);
    }
  };

  const getIcon = (iconName: string, href?: string) => {
    switch (iconName) {
      case 'home':
        return <Home className='h-6 w-6' />;
      case 'book':
        return <BookOpen className='h-6 w-6' />;
      case 'youtube':
        return <Youtube className='h-6 w-6' />;
      case 'sparkles':
        return <Sparkles className='h-6 w-6' />;
      case 'star':
        return <Star className='h-6 w-6' />;
      case 'bookmark':
        return <Bookmark className='h-6 w-6' />;
      case 'user':
        return <UserIcon className='h-6 w-6' />;
      default:
        return <Sparkles className='h-6 w-6' />;
    }
  };

  return (
    <>
      <Modal
        className='items-center justify-center xs:flex'
        modalClassName='max-w-xl bg-white dark:bg-gray-900 w-full p-8 rounded-2xl'
        open={displayOpen}
        closeModal={displayCloseModal}
      >
        <DisplayModal closeModal={displayCloseModal} />
      </Modal>
      <div className='flex h-screen flex-col bg-white dark:bg-gray-900'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-gray-200 px-4 py-4 dark:border-gray-700'>
          <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
            Menu
          </h2>
          <button
            onClick={closeModal}
            className='rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800'
          >
            <svg
              className='h-6 w-6 text-gray-600 dark:text-gray-400'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        {/* User Profile Section */}
        <div className='border-b border-gray-200 bg-gradient-to-br from-purple-50 to-pink-50 px-4 py-6 dark:border-gray-700 dark:from-purple-900/20 dark:to-pink-900/20'>
          <div className='flex items-center gap-4'>
            <UserAvatar
              className='h-16 w-16 ring-4 ring-white dark:ring-gray-800'
              username={username}
              src={photoURL}
              alt={name}
            />
            <div className='flex-1'>
              <UserName
                name={name}
                username={username}
                verified={verified}
                className='text-lg font-bold text-gray-900 dark:text-white'
              />
              <UserUsername username={username} />
            </div>
          </div>
          <div className='mt-4 flex gap-6'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                {following?.length ?? 0}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                Following
              </div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                {followers?.length ?? 0}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                Followers
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className='flex-1 overflow-y-auto px-4 py-4'>
          <nav className='space-y-2'>
            {navLinks.map((link) => (
              <Link href={link.href} key={link.href}>
                <a
                  onClick={closeModal}
                  className={cn(
                    'flex items-center gap-4 rounded-xl px-4 py-3.5 transition-all hover:bg-gray-100 dark:hover:bg-gray-800',
                    'text-gray-900 dark:text-white'
                  )}
                >
                  <div className='text-gray-600 dark:text-gray-400'>
                    {getIcon(link.iconName, link.href)}
                  </div>
                  <span className='font-medium'>{link.linkName}</span>
                </a>
              </Link>
            ))}
          </nav>

          {/* Divider */}
          <div className='my-4 border-t border-gray-200 dark:border-gray-700' />

          {/* Settings Section */}
          <div className='space-y-2'>
            <button
              onClick={displayOpenModal}
              className='flex w-full items-center gap-4 rounded-xl px-4 py-3.5 transition-all hover:bg-gray-100 dark:hover:bg-gray-800'
            >
              <Settings className='h-6 w-6 text-gray-600 dark:text-gray-400' />
              <span className='font-medium text-gray-900 dark:text-white'>
                Display
              </span>
            </button>
          </div>
        </div>

        {/* Sign Out Button */}
        <div className='border-t border-gray-200 px-4 py-4 dark:border-gray-700'>
          <button
            onClick={handleLogout}
            className='flex w-full items-center justify-center gap-3 rounded-xl bg-red-50 px-4 py-3.5 font-semibold text-red-600 transition-all hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30'
          >
            <LogOut className='h-5 w-5' />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
