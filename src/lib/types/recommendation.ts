export interface Recommendation {
  tmdbId: string;
  title: string;
  mediaType: 'movie' | 'tv';
  posterPath: string;
  reason: string;
  confidence: number;
  genre: string;
  year: string;
  overview?: string;
  releaseDate?: string;
  voteAverage?: number;
}

export interface AIAnalysis {
  preferredGenres: string[];
  preferredYears: string[];
  ratingPattern: string;
  suggestions: string[];
}

export interface RecommendationsResponse {
  recommendations: Recommendation[];
  analysis: AIAnalysis;
  cached: boolean;
  fallback?: boolean;
  sessionId?: string;
}
