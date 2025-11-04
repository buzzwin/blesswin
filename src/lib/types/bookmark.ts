import type { Timestamp, FirestoreDataConverter } from 'firebase/firestore';

export type Bookmark = {
  id: string;
  userId: string;
  watchlistId: string;
  title: string;
  description?: string;
  mediaType?: 'movie' | 'tv';
  mediaId?: string;
  posterPath?: string;
  tags?: string[];
  createdAt: Timestamp;
};

export type Watchlist = {
  id: string;
  name: string;
  description?: string;
  userId: string;
  isPublic: boolean;
  totalItems: number;
  createdAt: Timestamp;
};

export const bookmarkConverter: FirestoreDataConverter<Bookmark> = {
  toFirestore(bookmark) {
    return { ...bookmark };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return { id: snapshot.id, ...data } as Bookmark;
  }
};

export const watchlistConverter: FirestoreDataConverter<Watchlist> = {
  toFirestore(watchlist) {
    return { ...watchlist };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return { id: snapshot.id, ...data } as Watchlist;
  }
};
