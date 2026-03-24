import { WindowContextProvider } from '@lib/context/window-context';
import { MainLayout } from './main-layout';
import { PublicationHeader } from './publication-header';
import { cn } from '@lib/utils';
import type { ReactNode } from 'react';

type PublicationLayoutProps = {
  children: ReactNode;
  /** Wider column for archive grids or related sections */
  wide?: boolean;
};

export function PublicationLayout({
  children,
  wide = false
}: PublicationLayoutProps): JSX.Element {
  return (
    <WindowContextProvider>
      <MainLayout>
        <div className='min-h-screen bg-cream dark:bg-gray-950'>
          <PublicationHeader />
          <div
            className={cn(
              'mx-auto w-full px-4 pb-20 pt-6 sm:px-6',
              wide ? 'max-w-3xl' : 'max-w-[680px]'
            )}
          >
            {children}
          </div>
        </div>
      </MainLayout>
    </WindowContextProvider>
  );
}
