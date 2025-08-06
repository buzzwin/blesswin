import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  Sparkles,
  Star,
  Clock,
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '@lib/context/auth-context';
import LogoIcon from '@components/ui/logo';
import { Button } from '@components/ui/button-shadcn';
import { UserAvatar } from '@components/user/user-avatar';

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
    <header className='sticky top-0 z-50 hidden border-b border-gray-200 bg-white/95 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/95 md:block'>
      <div className='mx-auto flex max-w-7xl items-center justify-between px-6 py-4'>
        {/* Logo and Brand */}
        <Link href='/'>
          <a className='flex items-center gap-3 transition-opacity hover:opacity-80'>
            <div className='flex h-8 w-8 items-center justify-center'>
              <LogoIcon className='h-8 w-8' />
            </div>
            <div>
              <h1 className='text-xl font-bold text-gray-900 dark:text-white'>
                Buzzwin
              </h1>
            </div>
          </a>
        </Link>

        {/* Navigation Links */}
        <nav className='flex items-center gap-6'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => router.push('/trends')}
            className='flex items-center gap-2 text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400'
          >
            <TrendingUp className='h-4 w-4' />
            Trends
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => router.push('/recommendations')}
            className='flex items-center gap-2 text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400'
          >
            <Sparkles className='h-4 w-4' />
            AI Recommendations
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => router.push('/ratings')}
            className='flex items-center gap-2 text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400'
          >
            <Star className='h-4 w-4' />
            Ratings & Reviews
          </Button>
        </nav>

        {/* User Actions */}
        <div className='flex items-center gap-4'>
          {user ? (
            <div className='flex items-center gap-4'>
              {/* Profile Link */}
              <Button
                variant='ghost'
                size='sm'
                onClick={() => router.push(`/user/${user.username}`)}
                className='flex items-center gap-2 text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400'
              >
                <User className='h-4 w-4' />
                Profile
              </Button>

              {/* User Avatar and Name */}
              <div className='flex items-center gap-3 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800'>
                <UserAvatar
                  src={user.photoURL ?? ''}
                  alt={user.name ?? ''}
                  username={user.username ?? ''}
                  className='h-6 w-6'
                />
                <span className='text-sm font-medium text-gray-900 dark:text-white'>
                  {user.name}
                </span>
              </div>

              {/* Sign Out Button */}
              <Button
                variant='outline'
                size='sm'
                onClick={handleLogout}
                className='border-red-300 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30'
              >
                <LogOut className='mr-2 h-4 w-4' />
                Sign Out
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleSignIn}
              className='bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-2 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-amber-600 hover:to-orange-600 hover:shadow-xl'
            >
              <Sparkles className='mr-2 h-4 w-4' />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
