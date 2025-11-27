import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@lib/context/auth-context';
import type { User } from '@lib/types/user';

export function useRequireAuth(redirectUrl?: string): User | null {
  const { user, loading, isEmailVerified } = useAuth();
  const { replace } = useRouter();

  useEffect(() => {
    // Only redirect if redirectUrl is explicitly provided (not undefined)
    if (!loading && redirectUrl !== undefined) {
      if (!user) {
        void replace(redirectUrl);
      } else if (!isEmailVerified) {
        void replace('/verify-email');
      }
    }
  }, [user, loading, isEmailVerified, redirectUrl, replace]);

  return user;
}
