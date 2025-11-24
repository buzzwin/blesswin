import { useState, useEffect, useCallback } from 'react';
import type { RecommendationItem } from '@lib/types/recommendation-item';

interface RecommendationsFeedResponse {
  items: RecommendationItem[];
  hasMore: boolean;
  nextCursor?: string;
}

export function useRecommendationsFeed(userId: string | null) {
  const [items, setItems] = useState<RecommendationItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | undefined>();

  const fetchRecommendations = useCallback(
    async (append = false) => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        if (append) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
        }
        setError(null);

        const response = await fetch('/api/recommendations-feed', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId,
            limit: 10,
            cursor
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }

        const data: RecommendationsFeedResponse = await response.json();

        if (append) {
          setItems((prev) => [...prev, ...data.items]);
        } else {
          setItems(data.items);
        }

        setHasMore(data.hasMore);
        setCursor(data.nextCursor);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [userId, cursor]
  );

  const loadMore = useCallback(() => {
    if (hasMore && !isLoadingMore && !isLoading) {
      void fetchRecommendations(true);
    }
  }, [hasMore, isLoadingMore, isLoading, fetchRecommendations]);

  const refresh = useCallback(() => {
    setCursor(undefined);
    void fetchRecommendations(false);
  }, [fetchRecommendations]);

  useEffect(() => {
    if (userId) {
      setItems([]);
      setCursor(undefined);
      void fetchRecommendations(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]); // Only fetch when userId changes

  return {
    items,
    error,
    isLoading,
    isLoadingMore,
    isEmpty: items.length === 0 && !isLoading,
    isReachingEnd: !hasMore,
    loadMore,
    refresh
  };
}

