import { useState, useEffect, useCallback } from 'react';
import { getAllReviews } from '@lib/firebase/utils/review';
import type { ReviewWithUser } from '@lib/types/review';

interface UseRecentReviewsReturn {
  reviews: ReviewWithUser[];
  loading: boolean;
  error: string | null;
  refreshReviews: () => Promise<void>;
}

export function useRecentReviews(limit = 6): UseRecentReviewsReturn {
  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const recentReviews = await getAllReviews(limit);
      setReviews(recentReviews);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recent reviews');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const refreshReviews = useCallback(async (): Promise<void> => {
    await fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    void fetchReviews();
  }, [fetchReviews]);

  return {
    reviews,
    loading,
    error,
    refreshReviews
  };
} 