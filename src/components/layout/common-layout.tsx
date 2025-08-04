import type { ReactNode } from 'react';
import { WindowContextProvider } from '@lib/context/window-context';
import { useRequireAuth } from '@lib/hooks/useRequireAuth';
import { Placeholder } from '@components/common/placeholder';
import { Toaster } from 'react-hot-toast';
import { MainLayout } from './main-layout';

interface CommonLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectUrl?: string;
}

export function CommonLayout({
  children,
  requireAuth = false,
  redirectUrl
}: CommonLayoutProps): JSX.Element {
  // Always call useRequireAuth but only use the result if required
  useRequireAuth(requireAuth ? redirectUrl : undefined);

  return (
    <WindowContextProvider>
      <MainLayout>{children}</MainLayout>
      <Toaster position='bottom-center' />
    </WindowContextProvider>
  );
}

export function ProtectedLayout({
  children
}: {
  children: ReactNode;
}): JSX.Element {
  const user = useRequireAuth();

  if (!user) return <Placeholder />;

  return <>{children}</>;
}

export function HomeLayout({ children }: { children: ReactNode }): JSX.Element {
  return <CommonLayout>{children}</CommonLayout>;
}

export function UserLayout({ children }: { children: ReactNode }): JSX.Element {
  return <CommonLayout>{children}</CommonLayout>;
}

export function TrendsLayout({
  children
}: {
  children: ReactNode;
}): JSX.Element {
  return <CommonLayout>{children}</CommonLayout>;
}

export function PeopleLayout({
  children
}: {
  children: ReactNode;
}): JSX.Element {
  return <CommonLayout>{children}</CommonLayout>;
}

export function WatchListsLayout({
  children
}: {
  children: ReactNode;
}): JSX.Element {
  return <CommonLayout>{children}</CommonLayout>;
}

export function BookmarksLayout({
  children
}: {
  children: ReactNode;
}): JSX.Element {
  return <CommonLayout>{children}</CommonLayout>;
}
