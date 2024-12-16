import type { Timestamp } from 'firebase/firestore';

export type Review = {
  id: string;
  tmdbId: number;
  userId: string;
  title: string;
  mediaType: 'movie' | 'tv';
  rating: string;
  review: string;
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp | null;
  likes: string[];
  posterPath: string;
  tweetId?: string;
};

export type ReviewWithUser = Review & {
  user: {
    id: string;
    name: string;
    username: string;
    photoURL: string;
    verified: boolean;
  };
}; 