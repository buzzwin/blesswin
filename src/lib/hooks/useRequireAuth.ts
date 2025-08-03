import { useEffect } from 'react';
import { useRouter } from 'next/router';
import type { User } from '@lib/types/user';
import { useAuth } from '@lib/context/auth-context';

export function useRequireAuth(redirectUrl?: string): User | null {
  const { user, loading, isEmailVerified } = useAuth();
  const { replace } = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        void replace(redirectUrl ?? '/');
      } else if (!isEmailVerified) {
        void replace('/verify-email');
      }
    }
  }, [user, loading, isEmailVerified]);

  return user;
}
