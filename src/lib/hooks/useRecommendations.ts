import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@lib/context/auth-context';

interface Recommendation {
  tmdbId: string;
  title: string;
  mediaType: 'movie' | 'tv';
  posterPath: string;
  reason: string;
  confidence: number;
  genre: string;
  year: string;
}

interface Analysis {
  preferredGenres: string[];
  preferredYears: string[];
  ratingPattern: string;
  suggestions: string[];
}

interface RecommendationsResponse {
  recommendations: Recommendation[];
  analysis: Analysis;
  cached: boolean;
  error?: string;
}

export function useRecommendations() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user?.id ?? null
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data: RecommendationsResponse = await response.json();
      
      setRecommendations(data.recommendations);
      setAnalysis(data.analysis);
      
      if (data.error) {
        // console.warn('Recommendations API warning:', data.error);
      }

    } catch (err) {
      // console.error('Error fetching recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const refreshRecommendations = () => {
    // Always fetch fresh recommendations (no caching)
    void fetchRecommendations();
  };

  useEffect(() => {
    void fetchRecommendations();
  }, [fetchRecommendations]);

  return {
    recommendations,
    analysis,
    loading,
    error,
    refreshRecommendations,
    refetch: fetchRecommendations
  };
} 