import type { Timestamp } from 'firebase/firestore';

export type ItemType = 'movie' | 'tv' | 'product' | 'book' | 'music' | 'game' | 'other';

export type PreferenceType = 'like' | 'dislike' | 'neutral';

export interface RecommendationItem {
  id: string;
  itemType: ItemType;
  title: string;
  description?: string;
  imageUrl: string;
  
  // Movie/TV specific
  tmdbId?: number;
  mediaType?: 'movie' | 'tv';
  releaseDate?: string;
  voteAverage?: number;
  genres?: string[];
  
  // Product specific
  productUrl?: string;
  price?: string;
  brand?: string;
  category?: string;
  rating?: number;
  
  // Recommendation metadata
  reason?: string;
  confidence?: number;
  source?: 'ai' | 'trending' | 'similar_users' | 'manual';
  
  // User interaction
  userPreference?: PreferenceType;
  createdAt?: Timestamp;
}

export interface UserPreference {
  id: string;
  userId: string;
  itemId: string;
  itemType: ItemType;
  preference: PreferenceType;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface RecommendationFeed {
  items: RecommendationItem[];
  hasMore: boolean;
  nextCursor?: string;
}

