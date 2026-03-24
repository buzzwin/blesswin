import { useRouter } from 'next/router';
import { GlobalMobileHeader } from './global-mobile-header';
import { GlobalDesktopHeader } from './global-desktop-header';
import type { ReactNode } from 'react';

interface GlobalLayoutProps {
  children: ReactNode;
}

function isPublicationPath(pathname: string): boolean {
  return pathname === '/blog' || pathname.startsWith('/blog/');
}

export function GlobalLayout({ children }: GlobalLayoutProps): JSX.Element {
  const { pathname } = useRouter();
  const publication = isPublicationPath(pathname);

  if (publication) {
    return (
      <div className='min-h-screen bg-cream dark:bg-gray-950'>{children}</div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50/30 dark:from-gray-900 dark:via-gray-900'>
      <GlobalMobileHeader />
      <GlobalDesktopHeader />
      <main className='pt-0 md:pt-0'>{children}</main>
    </div>
  );
}
