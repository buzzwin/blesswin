import { useAuth } from '@lib/context/auth-context';
import { useRouter } from 'next/router';
import { Button } from '@components/ui/button-shadcn';
import { MobileSidebar } from '@components/sidebar/mobile-sidebar';
import LogoIcon from '@components/ui/logo';
import { LogOut } from 'lucide-react';

export function GlobalMobileHeader(): JSX.Element {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async (): Promise<void> => {
    try {
      await signOut();
      void router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className='sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/95 md:hidden'>
      <div className='flex items-center justify-between px-4 py-3'>
        {/* Logo */}
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center'>
            <LogoIcon className='h-10 w-10' />
          </div>
          <div>
            <h1 className='text-lg font-bold text-gray-900 dark:text-white'>
              Buzzwin
            </h1>
            <p className='text-xs text-gray-600 dark:text-gray-400'>
              What will you watch next?
            </p>
          </div>
        </div>

        {/* Right side - Mobile menu and sign out */}
        <div className='flex items-center gap-2'>
          {user && <MobileSidebar />}
          {user && (
            <Button
              variant='ghost'
              size='sm'
              onClick={handleLogout}
              className='p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            >
              <LogOut className='h-5 w-5' />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
