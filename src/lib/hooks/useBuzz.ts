import { useState, useEffect } from 'react';
import { query, where, limit, onSnapshot } from 'firebase/firestore';
import { buzzesCollection } from '@lib/firebase/collections';
import type { Buzz } from '@lib/types/buzz';

type UseBuzz = {
  buzz: Buzz | null;
  loading: boolean;
  notFound: boolean;
};

export function useBuzz(shareToken: string | null): UseBuzz {
  const [buzz, setBuzz] = useState<Buzz | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!shareToken) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    setBuzz(null);
    setLoading(true);
    setNotFound(false);

    const q = query(buzzesCollection, where('shareToken', '==', shareToken), limit(1));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          setBuzz(null);
          setNotFound(true);
        } else {
          setBuzz(snapshot.docs[0].data({ serverTimestamps: 'estimate' }));
          setNotFound(false);
        }
        setLoading(false);
      },
      (_error) => {
        setBuzz(null);
        setNotFound(true);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [shareToken]);

  return { buzz, loading, notFound };
}
