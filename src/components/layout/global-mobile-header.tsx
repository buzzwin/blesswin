import { useRouter } from 'next/router';
import Link from 'next/link';
import { BarChart3 } from 'lucide-react';
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
    <header className='sticky top-0 z-50 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 md:hidden'>
      <div className='flex items-center justify-between px-4 py-3'>
        {/* Logo */}
        <Link href='/'>
          <a className='flex items-center gap-2'>
            <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-gray-900 dark:bg-white'>
              <LogoIcon className='h-4 w-4 text-white dark:text-gray-900' />
            </div>
            <h1 className='text-sm font-semibold text-gray-900 dark:text-white'>
              Buzzwin
            </h1>
          </a>
        </Link>

        {/* Right side - Quick Actions and Mobile menu */}
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => router.push('/ratings')}
            className='text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          >
            <BarChart3 className='h-4 w-4' />
          </Button>
          <MobileSidebar />
        </div>
      </div>
    </header>
  );
}
