import { useState, useEffect } from 'react';
import type { DocumentReference } from 'firebase/firestore';
import { refEqual } from 'firebase/firestore';

export function useCacheRef<T>(
  ref: DocumentReference<T>
): DocumentReference<T> {
  const [cachedRef, setCachedRef] = useState(ref);

  useEffect(() => {
    if (!refEqual(ref, cachedRef)) setCachedRef(ref);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  return cachedRef;
}
