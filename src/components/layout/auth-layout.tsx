import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@lib/context/auth-context';
import { Placeholder } from '@components/common/placeholder';
import type { ReactNode } from 'react';

export function AuthLayout({ children }: { children: ReactNode }): JSX.Element {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is authenticated and on login page, redirect appropriately
    if (user && router.pathname === '/login') {
      const redirect = router.query.redirect as string | undefined;
      if (redirect) {
        // Redirect to the specified URL
        void router.replace(redirect);
      } else {
        // Default redirect to rituals page
        void router.replace('/rituals');
      }
    }
  }, [user, router]);

  if (loading) return <Placeholder />;

  return <>{children}</>;
}
