import { useState, useEffect } from 'react';
import type { Recommendation } from '@lib/types/recommendation';

interface UserRecommendationStats {
  totalRecommendations: number;
  lastRecommendationDate: Date | null;
  mostRecommendedGenres: string[];
  totalAnalyses: number;
}

interface UseUserRecommendationsReturn {
  // History data (now just recommendations)
  history: Recommendation[];
  historyLoading: boolean;
  historyError: string | null;
  
  // Latest analysis
  latest: any;
  latestLoading: boolean;
  latestError: string | null;
  
  // Statistics
  stats: UserRecommendationStats | null;
  statsLoading: boolean;
  statsError: string | null;
  
  // Actions
  refreshHistory: () => void;
  refreshLatest: () => void;
  refreshStats: () => void;
}

export const useUserRecommendations = (userId: string | null): UseUserRecommendationsReturn => {
  const [history, setHistory] = useState<Recommendation[]>([]);
  const [latest, setLatest] = useState<any>(null);
  const [stats, setStats] = useState<UserRecommendationStats | null>(null);

  const [historyLoading, setHistoryLoading] = useState(true);
  const [latestLoading, setLatestLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  const [historyError, setHistoryError] = useState<string | null>(null);
  const [latestError, setLatestError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  const fetchHistory = async (limit = 20) => {
    if (!userId) {
      setHistory([]);
      setHistoryLoading(false);
      return;
    }
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const res = await fetch(`/api/user-recommendations?userId=${userId}&type=history&limit=${limit}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || 'Failed to fetch recommendation history');
      }
      const data = await res.json();
      setHistory(data.recommendations);
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : 'Unknown error fetching history');
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchLatest = async () => {
    if (!userId) {
      setLatest(null);
      setLatestLoading(false);
      return;
    }
    setLatestLoading(true);
    setLatestError(null);
    try {
      const res = await fetch(`/api/user-recommendations?userId=${userId}&type=latest`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || 'Failed to fetch latest recommendation');
      }
      const data = await res.json();
      setLatest(data.recommendations);
    } catch (err) {
      setLatestError(err instanceof Error ? err.message : 'Unknown error fetching latest');
      setLatest(null);
    } finally {
      setLatestLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!userId) {
      setStats(null);
      setStatsLoading(false);
      return;
    }
    setStatsLoading(true);
    setStatsError(null);
    try {
      const res = await fetch(`/api/user-recommendations?userId=${userId}&type=stats`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || 'Failed to fetch recommendation stats');
      }
      const data = await res.json();
      setStats(data.stats);
    } catch (err) {
      setStatsError(err instanceof Error ? err.message : 'Unknown error fetching stats');
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  const refreshHistory = () => void fetchHistory();
  const refreshLatest = () => void fetchLatest();
  const refreshStats = () => void fetchStats();
  const refreshAll = () => {
    void fetchHistory();
    void fetchLatest();
    void fetchStats();
  };

  // Auto-fetch when userId changes
  useEffect(() => {
    if (userId) {
      refreshAll();
    } else {
      setHistory([]);
      setLatest(null);
      setStats(null);
      setHistoryLoading(false);
      setLatestLoading(false);
      setStatsLoading(false);
    }
  }, [userId]);

  return {
    history,
    latest,
    stats,
    historyLoading,
    latestLoading,
    statsLoading,
    historyError,
    latestError,
    statsError,
    refreshHistory,
    refreshLatest,
    refreshStats
  };
};