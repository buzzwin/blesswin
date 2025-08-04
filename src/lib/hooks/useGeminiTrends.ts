import { useState, useEffect, useCallback } from 'react';
import { fetchGeminiTrends, getFallbackTrends, type GeminiTrendsResponse } from '@lib/api/gemini';

interface UseGeminiTrendsReturn {
  trendingShows: GeminiTrendsResponse['trendingShows'];
  trendingNetworks: GeminiTrendsResponse['trendingNetworks'];
  loading: boolean;
  error: string | null;
  refreshTrends: () => Promise<void>;
}

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
let cachedData: GeminiTrendsResponse | null = null;
let cacheTimestamp = 0;

export function useGeminiTrends(): UseGeminiTrendsReturn {
  const [trendingShows, setTrendingShows] = useState<GeminiTrendsResponse['trendingShows']>([]);
  const [trendingNetworks, setTrendingNetworks] = useState<GeminiTrendsResponse['trendingNetworks']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrends = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Check if we have valid cached data
      const now = Date.now();
      if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
        setTrendingShows(cachedData.trendingShows);
        setTrendingNetworks(cachedData.trendingNetworks);
        setLoading(false);
        return;
      }

      // Try to fetch from Gemini API
      try {
        const data = await fetchGeminiTrends();
        setTrendingShows(data.trendingShows);
        setTrendingNetworks(data.trendingNetworks);
        
        // Cache the successful response
        cachedData = data;
        cacheTimestamp = now;
      } catch (apiError) {
        // Gemini API failed, using fallback data
        
        // Use fallback data if API fails
        const fallbackData = getFallbackTrends();
        setTrendingShows(fallbackData.trendingShows);
        setTrendingNetworks(fallbackData.trendingNetworks);
        
        // Cache fallback data
        cachedData = fallbackData;
        cacheTimestamp = now;
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load trends');
      
      // Use fallback data as last resort
      const fallbackData = getFallbackTrends();
      setTrendingShows(fallbackData.trendingShows);
      setTrendingNetworks(fallbackData.trendingNetworks);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshTrends = useCallback(async (): Promise<void> => {
    // Clear cache to force fresh data
    cachedData = null;
    cacheTimestamp = 0;
    await fetchTrends();
  }, [fetchTrends]);

  useEffect(() => {
    void fetchTrends();
  }, [fetchTrends]);

  return {
    trendingShows,
    trendingNetworks,
    loading,
    error,
    refreshTrends
  };
} 