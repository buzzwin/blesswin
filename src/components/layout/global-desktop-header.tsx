import { useRouter } from 'next/router';
import Link from 'next/link';
import type { MouseEvent } from 'react';
import {
  BarChart3,
  Sparkles,
  Clock,
  User,
  LogOut,
  BookOpen,
  Heart,
  Calendar,
  Bookmark,
  Settings
} from 'lucide-react';
import { useAuth } from '@lib/context/auth-context';
import LogoIcon from '@components/ui/logo';
import { Button } from '@components/ui/button-shadcn';
import { UserAvatar } from '@components/user/user-avatar';
// import { SimpleSocialShare as SocialShare } from '@components/share/simple-social-share';

export function GlobalDesktopHeader(): JSX.Element {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async (): Promise<void> => {
    try {
      await signOut();
      void router.push('/');
    } catch (error) {
      // console.error('Logout error:', error);
    }
  };

  const handleSignIn = (): void => {
    void router.push('/login');
  };


  return (
    <header className='sticky top-0 z-50 hidden border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 md:block'>
      <div className='mx-auto flex max-w-6xl items-center justify-between px-4 py-3'>
        {/* Logo and Brand */}
        <Link href={user ? '/rituals' : '/'}>
          <a className='flex items-center gap-2 sm:gap-3'>
            <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-gray-900 dark:bg-white sm:h-8 sm:w-8'>
              <LogoIcon className='h-3.5 w-3.5 text-white dark:text-gray-900 sm:h-4 sm:w-4' />
            </div>
            <h1 className='text-base font-semibold text-gray-900 dark:text-white sm:text-lg'>
              Buzzwin
            </h1>
          </a>
        </Link>

        {/* Navigation Links */}
        <nav className='flex items-center gap-2 sm:gap-4'>
          <Link href='/rituals'>
            <a className='flex items-center gap-1.5 text-xs font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white sm:gap-2 sm:text-sm'>
              <Calendar className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
              <span className='hidden sm:inline'>Rituals</span>
            </a>
          </Link>
          <Link href='/home'>
            <a className='flex items-center gap-1.5 text-xs font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white sm:gap-2 sm:text-sm'>
              <Sparkles className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
              <span className='hidden sm:inline'>Feed</span>
            </a>
          </Link>
          <Link href='/blog'>
            <a className='flex items-center gap-1.5 text-xs font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white sm:gap-2 sm:text-sm'>
              <BookOpen className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
              <span className='hidden sm:inline'>Blog</span>
            </a>
          </Link>
          <Link href='/real-stories'>
            <a className='flex items-center gap-1.5 text-xs font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white sm:gap-2 sm:text-sm'>
              <Heart className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
              <span className='hidden sm:inline'>Stories</span>
            </a>
          </Link>
          {user && (
            <Link href='/story-bookmarks'>
              <a className='flex items-center gap-1.5 text-xs font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white sm:gap-2 sm:text-sm'>
                <Bookmark className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
                <span className='hidden sm:inline'>Bookmarks</span>
              </a>
            </Link>
          )}
          {user && (
            <Link href='/settings'>
              <a className='flex items-center gap-1.5 text-xs font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white sm:gap-2 sm:text-sm'>
                <Settings className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
                <span className='hidden sm:inline'>Settings</span>
              </a>
            </Link>
          )}
        </nav>

        {/* User Actions */}
        <div className='flex items-center gap-3'>
          {/* Compact Social Share - Temporarily disabled */}
          {/* <SocialShare
            title='Check out Buzzwin - Wellness & Good Deeds'
            description='Join a community focused on wellness, positive actions, and inspiring others to do good!'
            url={typeof window !== 'undefined' ? window.location.origin : ''}
            hashtags={['Buzzwin', 'Wellness', 'GoodDeeds', 'PositiveImpact']}
            showTitle={false}
            size='sm'
            variant='compact'
          /> */}

          {user ? (
            <>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => router.push(`/user/${user.username}`)}
                className='text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              >
                <User className='mr-2 h-4 w-4' />
                {user.username}
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleLogout}
                className='text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400'
              >
                <LogOut className='h-4 w-4' />
              </Button>
            </>
          ) : (
            <Button
              onClick={handleSignIn}
              className='bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100'
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
