import { useRouter } from 'next/router';
import Link from 'next/link';
import { BarChart3, TrendingUp } from 'lucide-react';
import { useAuth } from '@lib/context/auth-context';
import { MobileSidebar } from '@components/sidebar/mobile-sidebar';
import LogoIcon from '@components/ui/logo';
import { Button } from '@components/ui/button-shadcn';

export function GlobalMobileHeader(): JSX.Element {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async (): Promise<void> => {
    try {
      await signOut();
      void router.push('/');
    } catch (error) {
      // console.error('Logout error:', error);
    }
  };

  return (
    <header className='sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/95 md:hidden'>
      <div className='flex items-center justify-between px-3 py-2'>
        {/* Logo - Much smaller */}
        <Link href='/'>
          <a className='flex items-center gap-2 transition-opacity hover:opacity-80'>
            <div className='flex h-6 w-6 items-center justify-center'>
              <LogoIcon className='h-6 w-6' />
            </div>
            <div>
              <h1 className='text-sm font-bold text-gray-900 dark:text-white'>
                Buzzwin
              </h1>
            </div>
          </a>
        </Link>

        {/* Right side - Quick Actions and Mobile menu */}
        <div className='flex items-center gap-2'>
          {/* Quick Actions - Compact for mobile */}
          <div className='flex items-center gap-1'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => router.push('/ratings')}
              className='border-blue-300 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20'
            >
              <BarChart3 className='mr-1 h-3 w-3' />
              Ratings
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => router.push('/trends')}
              className='border-purple-300 px-2 py-1 text-xs font-medium text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-900/20'
            >
              <TrendingUp className='mr-1 h-3 w-3' />
              Trends
            </Button>
          </div>
          <MobileSidebar />
        </div>
      </div>
    </header>
  );
}
