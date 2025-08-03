import { useAuth } from '@lib/context/auth-context';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { MobileSidebar } from '@components/sidebar/mobile-sidebar';
import LogoIcon from '@components/ui/logo';

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

        {/* Right side - Mobile menu only */}
        <div className='flex items-center gap-1'>
          <MobileSidebar />
        </div>
      </div>
    </header>
  );
}
