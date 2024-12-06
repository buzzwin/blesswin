import { ReactNode } from 'react';
import { MainLayout } from './main-layout';
import { WindowContextProvider } from '@lib/context/window-context';
import { Aside } from '@components/aside/aside';
import { Suggestions } from '@components/aside/suggestions';
import { useRequireAuth } from '@lib/hooks/useRequireAuth';
import { Placeholder } from '@components/common/placeholder';
import { Toaster } from 'react-hot-toast';

export type LayoutProps = {
  children: ReactNode;
};

export function ProtectedLayout({ children }: LayoutProps): JSX.Element {
  const user = useRequireAuth();

  if (!user) return <Placeholder />;

  return <>{children}</>;
}

// Common layout wrapper to avoid repetition
function CommonLayout({ children }: LayoutProps): JSX.Element {
  return (
    <WindowContextProvider>
      <MainLayout>
        {children}
        <Aside>
          <Suggestions />
        </Aside>
      </MainLayout>
      <Toaster position='bottom-center' />
    </WindowContextProvider>
  );
}

export function HomeLayout({ children }: LayoutProps): JSX.Element {
  return <CommonLayout>{children}</CommonLayout>;
}

export function UserLayout({ children }: LayoutProps): JSX.Element {
  return <CommonLayout>{children}</CommonLayout>;
}

export function TrendsLayout({ children }: LayoutProps): JSX.Element {
  return <CommonLayout>{children}</CommonLayout>;
}

export function PeopleLayout({ children }: LayoutProps): JSX.Element {
  return <CommonLayout>{children}</CommonLayout>;
}

export function WatchListsLayout({ children }: LayoutProps): JSX.Element {
  return <CommonLayout>{children}</CommonLayout>;
}

export function BookmarksLayout({ children }: LayoutProps): JSX.Element {
  return <CommonLayout>{children}</CommonLayout>;
}
