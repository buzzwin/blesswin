import type { Timestamp } from 'firebase/firestore';

export type RatingType = 'love' | 'hate' | 'meh';

export type Review = {
  id: string;
  tmdbId: number;
  userId: string;
  title: string;
  mediaType: 'movie' | 'tv';
  rating: RatingType; // Changed from string to RatingType
  review?: string; // Made optional since some entries might just be ratings
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp | null;
  likes: string[];
  posterPath: string;
  tweetId?: string;
  // Additional fields from ratings
  overview?: string;
  releaseDate?: string;
  voteAverage?: number;
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

export interface MediaCard {
  id: string;
  tmdbId: number;
  title: string;
  mediaType: 'movie' | 'tv';
  posterPath: string;
  overview: string;
  releaseDate: string;
  voteAverage: number;
  backdropPath?: string;
  genres?: string[];
  reason?: string;
  confidence?: number;
}

export interface SwipeAction {
  type: RatingType;
  mediaId: string;
  userId: string;
} 