import { useState, useEffect } from 'react';
import { useAuth } from '@lib/context/auth-context';
import {
  collection,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { toast } from 'react-hot-toast';
import type { Watchlist } from '@lib/types/bookmark';

export function useWatchlists() {
  const { user } = useAuth();
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const watchlistsRef = collection(db, 'watchlists');
    const q = query(
      watchlistsRef,
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newWatchlists = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Watchlist[];

      setWatchlists(newWatchlists);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.id]);

  const createWatchlist = async (
    name: string,
    description?: string,
    isPublic = false
  ): Promise<void> => {
    if (!user?.id || !name.trim()) return;

    try {
      await addDoc(collection(db, 'watchlists'), {
        name: name.trim(),
        description: description?.trim() || undefined,
        userId: user.id,
        createdAt: serverTimestamp(),
        isPublic,
        totalItems: 0,
        movies: 0,
        tvShows: 0
      });
      toast.success('Watchlist created!');
    } catch (error) {
      console.error('Error creating watchlist:', error);
      toast.error('Failed to create watchlist');
    }
  };

  return {
    watchlists,
    loading,
    createWatchlist
  };
} 