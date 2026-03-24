import Link from 'next/link';
import { useAuth } from '@lib/context/auth-context';
import { cn } from '@lib/utils';

export function PublicationHeader(): JSX.Element {
  const { user } = useAuth();

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-charcoal/10 bg-cream/95 backdrop-blur-sm dark:border-white/10 dark:bg-gray-950/95'
      )}
    >
      <div className='mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6'>
        <div className='flex min-w-0 items-center gap-3'>
          <Link href='/'>
            <a className='text-sm font-semibold text-charcoal dark:text-gray-100'>
              Buzzwin
            </a>
          </Link>
          <span className='text-charcoal/30 dark:text-white/30' aria-hidden>
            /
          </span>
          <Link href='/blog'>
            <a className='truncate text-sm font-medium text-charcoal/80 hover:text-charcoal dark:text-gray-300 dark:hover:text-white'>
              Journal
            </a>
          </Link>
        </div>
        <nav
          className='flex shrink-0 items-center gap-2 sm:gap-3'
          aria-label='Publication'
        >
          <a
            href='#publication-subscribe'
            className='rounded-full bg-charcoal px-3 py-1.5 text-xs font-semibold text-cream transition hover:opacity-90 dark:bg-white dark:text-gray-900 sm:px-4 sm:text-sm'
          >
            Subscribe
          </a>
          {user ? (
            <Link href='/home'>
              <a className='text-xs font-medium text-charcoal/70 hover:text-charcoal dark:text-gray-400 dark:hover:text-white sm:text-sm'>
                Open app
              </a>
            </Link>
          ) : (
            <Link href='/login'>
              <a className='text-xs font-medium text-charcoal/70 hover:text-charcoal dark:text-gray-400 dark:hover:text-white sm:text-sm'>
                Sign in
              </a>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
