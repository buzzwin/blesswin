import type { NextApiRequest, NextApiResponse } from 'next';
import { getDoc, query, getDocs } from 'firebase/firestore';
import { userRitualStateDoc, ritualCompletionsCollection, ritualsCollection } from '@lib/firebase/collections';
import { calculateStats, calculateStreak, calculateLongestStreak, getRecentStreaks, calculateCompletionTrend, getBestDay } from '@lib/utils/ritual-stats';
import type { RitualCompletion, RitualDefinition } from '@lib/types/ritual';

/**
 * Test endpoint to verify enhanced stats calculations
 * This endpoint provides detailed information about stats calculations for debugging
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    // Get all completions
    const completionsQuery = query(ritualCompletionsCollection(userId));
    const completionsSnapshot = await getDocs(completionsQuery);
    const completions = completionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as RitualCompletion[];

    // Get ritual definitions
    const ritualsSnapshot = await getDocs(ritualsCollection);
    const ritualDefinitions = ritualsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as RitualDefinition[];

    // Get user state
    const userStateDoc = userRitualStateDoc(userId);
    const userStateSnapshot = await getDoc(userStateDoc);
    const userState = userStateSnapshot.exists() ? userStateSnapshot.data() : null;

    // Calculate all stats
    const stats = calculateStats(completions, userState, ritualDefinitions);
    const currentStreak = calculateStreak(completions);
    const longestStreak = calculateLongestStreak(completions);
    const recentStreaks = getRecentStreaks(completions);
    const completionTrend = calculateCompletionTrend(completions);
    const bestDay = getBestDay(completions);

    // Get unique dates
    const uniqueDates = Array.from(new Set(completions.map(c => c.date))).sort().reverse();

    // Detailed breakdown
    const breakdown = {
      totalCompletions: completions.length,
      uniqueDates: uniqueDates.length,
      dateRange: {
        first: uniqueDates[uniqueDates.length - 1] || null,
        last: uniqueDates[0] || null,
        days: uniqueDates.length > 0 
          ? Math.floor((new Date(uniqueDates[0]).getTime() - new Date(uniqueDates[uniqueDates.length - 1]).getTime()) / (1000 * 60 * 60 * 24)) + 1
          : 0
      },
      completionsByDate: uniqueDates.slice(0, 10).map(date => ({
        date,
        count: completions.filter(c => c.date === date).length
      })),
      sharedVsQuiet: {
        shared: completions.filter(c => !c.completedQuietly && c.sharedAsMomentId).length,
        quiet: completions.filter(c => c.completedQuietly).length
      }
    };

    res.status(200).json({
      success: true,
      stats,
      calculations: {
        currentStreak,
        longestStreak,
        recentStreaks,
        completionTrend,
        bestDay
      },
      breakdown,
      completions: completions.slice(0, 10), // First 10 for inspection
      ritualDefinitionsCount: ritualDefinitions.length
    });
  } catch (error) {
    console.error('Error testing stats:', error);
    res.status(500).json({
      error: 'Failed to test stats',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

