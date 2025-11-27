import type { NextApiRequest, NextApiResponse } from 'next';
import { getDoc, query, getDocs } from 'firebase/firestore';
import { userRitualStateDoc, ritualCompletionsCollection, ritualsCollection } from '@lib/firebase/collections';
import { calculateStats } from '@lib/utils/ritual-stats';
import type { RitualStats, RitualCompletion, UserRitualState, RitualDefinition } from '@lib/types/ritual';

interface RitualStatsResponse {
  stats: RitualStats;
  completions?: RitualCompletion[];
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RitualStatsResponse>
): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({
      stats: {
        currentStreak: 0,
        longestStreak: 0,
        totalCompleted: 0,
        completedThisWeek: 0,
        completedThisMonth: 0,
        completedDays: 0,
        mostActiveTags: [],
        sharedCount: 0,
        quietCount: 0
      },
      error: 'Method not allowed'
    });
    return;
  }

  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      res.status(400).json({
        stats: {
          currentStreak: 0,
          longestStreak: 0,
          totalCompleted: 0,
          completedThisWeek: 0,
          completedThisMonth: 0,
          completedDays: 0,
          mostActiveTags: [],
          sharedCount: 0,
          quietCount: 0
        },
        error: 'User ID is required'
      });
      return;
    }

    // Get user ritual state
    const userStateDoc = userRitualStateDoc(userId);
    const userStateSnapshot = await getDoc(userStateDoc);
    const userState = userStateSnapshot.exists() ? userStateSnapshot.data() : null;

    // Get all completions
    const completionsQuery = query(ritualCompletionsCollection(userId));
    const completionsSnapshot = await getDocs(completionsQuery);
    const completions = completionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as RitualCompletion[];

    // Get ritual definitions for tag counting
    const ritualsSnapshot = await getDocs(ritualsCollection);
    const ritualDefinitions = ritualsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as RitualDefinition[];

    // Calculate stats with enhanced metrics
    const stats = calculateStats(completions, userState, ritualDefinitions);

    res.status(200).json({ stats, completions });
  } catch (error) {
    console.error('Error fetching ritual stats:', error);
    res.status(500).json({
      stats: {
        currentStreak: 0,
        longestStreak: 0,
        totalCompleted: 0,
        completedThisWeek: 0,
        completedThisMonth: 0,
        completedDays: 0,
        mostActiveTags: [],
        sharedCount: 0,
        quietCount: 0
      },
      error: 'Failed to fetch ritual stats'
    });
  }
}

