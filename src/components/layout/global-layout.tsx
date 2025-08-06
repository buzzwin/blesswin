import { GlobalMobileHeader } from './global-mobile-header';
import { GlobalDesktopHeader } from './global-desktop-header';
import type { ReactNode } from 'react';

interface GlobalLayoutProps {
  children: ReactNode;
}

export function GlobalLayout({ children }: GlobalLayoutProps): JSX.Element {
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50/30 dark:from-gray-900 dark:via-gray-900'>
      <GlobalMobileHeader />
      <GlobalDesktopHeader />
      <main className='pt-0 md:pt-0'>{children}</main>
    </div>
  );
}
