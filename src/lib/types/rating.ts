export type RatingType = 'love' | 'hate' | 'meh';

export interface MediaRating {
  id: string;
  tmdbId: string;
  title: string;
  mediaType: 'movie' | 'tv';
  posterPath: string;
  rating: RatingType;
  userId: string;
  createdAt: Date;
  overview?: string;
  releaseDate?: string;
  voteAverage?: number;
}

export interface MediaCard {
  id: string;
  tmdbId: string;
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