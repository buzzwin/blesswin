import type { Theme, Accent } from './theme';
import type { Timestamp, FirestoreDataConverter } from 'firebase/firestore';
import type { KarmaBreakdown } from './karma';

export type User = {
  id: string;
  bio: string | null;
  name: string;
  theme: Theme | null;
  accent: Accent | null;
  website: string | null;
  location: string | null;
  username: string;
  photoURL: string;
  verified: boolean;
  following: string[];
  followers: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp | null;
  totalTweets: number;
  totalPhotos: number;
  pinnedTweet: string | null;
  coverPhotoURL: string | null;
  // Karma system fields
  karmaPoints?: number; // Total karma points (default: 0)
  karmaBreakdown?: KarmaBreakdown; // Breakdown by category
  lastKarmaUpdate?: Timestamp | Date; // Last time karma was updated
};

export type EditableData = Extract<
  keyof User,
  'bio' | 'name' | 'website' | 'photoURL' | 'location' | 'coverPhotoURL'
>;

export type EditableUserData = Pick<User, EditableData>;

export const userConverter: FirestoreDataConverter<User> = {
  toFirestore(user) {
    return { ...user };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return { ...data } as User;
  }
};
