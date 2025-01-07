import type { Timestamp, FirestoreDataConverter } from 'firebase/firestore';
import type { User } from './user';

export type WatchClub = {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp | null;
  members: string[];
  totalMembers: number;
  isPublic: boolean;
  genre?: string;
  tags?: string[];
  coverImage?: string;
  tmdbId?: string;
  mediaType?: 'movie' | 'tv';
  media?: ClubMedia[];
};

export type WatchClubWithUser = WatchClub & {
  user: Pick<User, 'id' | 'name' | 'username' | 'photoURL' | 'verified'>;
};

export type ClubMedia = {
  id: string;
  tmdbId: string;
  title: string;
  overview: string;
  posterPath: string | null;
  releaseDate: string;
  mediaType: 'movie' | 'tv';
  createdAt: Timestamp;
  discussions: string[];
};

export const watchClubConverter: FirestoreDataConverter<WatchClub> = {
  toFirestore(watchClub) {
    const { id, ...rest } = watchClub;
    return rest;
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      ...data
    } as WatchClub;
  }
}; 