import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  BarChart3,
  Sparkles,
  Clock,
  User,
  LogOut,
  BookOpen,
  Youtube
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
        <Link href='/'>
          <a className='flex items-center gap-3'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 dark:bg-white'>
              <LogoIcon className='h-4 w-4 text-white dark:text-gray-900' />
            </div>
            <h1 className='text-lg font-semibold text-gray-900 dark:text-white'>
              Buzzwin
            </h1>
          </a>
        </Link>

        {/* Navigation Links */}
        <nav className='flex items-center gap-4'>
          <Link href='/blog'>
            <a className='flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'>
              <BookOpen className='h-4 w-4' />
              Blog
            </a>
          </Link>
          <Link href='/videos'>
            <a className='flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'>
              <Youtube className='h-4 w-4' />
              Videos
            </a>
          </Link>
        </nav>

        {/* User Actions */}
        <div className='flex items-center gap-3'>
          {/* Compact Social Share - Temporarily disabled */}
          {/* <SocialShare
            title='Check out Buzzwin - Rate Shows & Movies'
            description='Discover and rate your favorite shows and movies with AI-powered recommendations!'
            url={typeof window !== 'undefined' ? window.location.origin : ''}
            hashtags={['Buzzwin', 'Movies', 'TVShows', 'Recommendations']}
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
