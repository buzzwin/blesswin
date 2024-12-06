import type { Timestamp } from 'firebase/firestore';

export type Review = {
  id: string;
  tmdbId: number;
  userId: string;
  title: string;
  mediaType: 'movie' | 'tv';
  rating: string; // emoji rating
  review: string;
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp | null;
  likes: string[]; // array of userIds who liked the review
  posterPath: string;
  tweetId?: string; // optional reference to a tweet
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