import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@lib/context/auth-context';
import { MobileSidebar } from '@components/sidebar/mobile-sidebar';
import LogoIcon from '@components/ui/logo';
import { Button } from '@components/ui/button-shadcn';
// import { SimpleSocialShare as SocialShare } from '@components/share/simple-social-share';

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
          {/* Social Share - Temporarily disabled */}
          {/* <SocialShare
            title='Check out Buzzwin - Rate Shows & Movies'
            description='Discover and rate your favorite shows and movies with AI-powered recommendations!'
            url={typeof window !== 'undefined' ? window.location.origin : ''}
            hashtags={['Buzzwin', 'Movies', 'TVShows', 'Recommendations']}
            showTitle={false}
            size='sm'
            variant='minimal'
          /> */}
          <MobileSidebar />
        </div>
      </div>
    </header>
  );
}
