import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@lib/context/auth-context';
import { Placeholder } from '@components/common/placeholder';
import type { ReactNode } from 'react';

export function AuthLayout({ children }: { children: ReactNode }): JSX.Element {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is authenticated and on login page, redirect to home
    if (user && router.pathname === '/login') {
      router.replace('/home');
    }
  }, [user, router]);

  if (loading) return <Placeholder />;

  return <>{children}</>;
}
