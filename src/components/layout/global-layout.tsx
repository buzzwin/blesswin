import { useRouter } from 'next/router';
import type { ReactNode } from 'react';

interface GlobalLayoutProps {
  children: ReactNode;
}

function isPublicationPath(pathname: string): boolean {
  return pathname === '/blog' || pathname.startsWith('/blog/');
}

export function GlobalLayout({ children }: GlobalLayoutProps): JSX.Element {
  const { pathname } = useRouter();

  if (isPublicationPath(pathname)) {
    return (
      <div className='min-h-screen bg-cream dark:bg-[#1c1510]'>{children}</div>
    );
  }

  return <div className='min-h-screen bg-main-background'>{children}</div>;
}
