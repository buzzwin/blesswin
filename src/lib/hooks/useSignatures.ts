import { useState, useEffect } from 'react';
import { query, orderBy, onSnapshot } from 'firebase/firestore';
import { buzzSignaturesCollection } from '@lib/firebase/collections';
import type { Signature } from '@lib/types/buzz';

type UseSignatures = {
  signatures: Signature[] | null;
  loading: boolean;
};

/**
 * Subscribes to signatures for a buzz in real-time.
 * Pass disabled=true until the reveal gate is open — Firestore rules will
 * reject the read if revealAt hasn't passed and the caller isn't the creator.
 */
export function useSignatures(buzzId: string | null, options?: { disabled?: boolean }): UseSignatures {
  const [signatures, setSignatures] = useState<Signature[] | null>(null);
  const [loading, setLoading] = useState(true);

  const disabled = options?.disabled ?? false;

  useEffect(() => {
    if (!buzzId || disabled) {
      setSignatures(null);
      setLoading(false);
      return;
    }

    setSignatures(null);
    setLoading(true);

    const q = query(
      buzzSignaturesCollection(buzzId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setSignatures(snapshot.docs.map((d) => d.data({ serverTimestamps: 'estimate' })));
        setLoading(false);
      },
      () => {
        // Read denied (before revealAt) — treat as empty, not an error
        setSignatures(null);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [buzzId, disabled]);

  return { signatures, loading };
}
