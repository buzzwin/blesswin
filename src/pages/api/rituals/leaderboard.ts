import type { NextApiRequest, NextApiResponse } from 'next';
import { getDocs, query, orderBy, limit, collection } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { calculateLevel } from '@lib/utils/level-calculation';
import type { LeaderboardEntry } from '@lib/types/ritual';

interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  userRank?: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LeaderboardResponse | { error: string }>
): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { userId, period = 'all-time', limit: limitParam = '10' } = req.query;
    const limitValue = parseInt(limitParam as string, 10) || 10;

    // Get all users ordered by karma
    const usersQuery = query(
      collection(db, 'users'),
      orderBy('karmaPoints', 'desc'),
      limit(limitValue)
    );

    const usersSnapshot = await getDocs(usersQuery);
    const entries: LeaderboardEntry[] = [];
    let userRank: number | undefined;

    usersSnapshot.docs.forEach((doc, index) => {
      const userData = doc.data();
      const karmaPoints = userData.karmaPoints || 0;
      
      // Get ritual stats (simplified - you might want to query actual completions)
      const totalCompleted = 0; // TODO: Calculate from ritual completions
      const currentStreak = 0; // TODO: Calculate from ritual completions

      const entry: LeaderboardEntry = {
        userId: doc.id,
        username: userData.username || '',
        name: userData.name || '',
        photoURL: userData.photoURL || '',
        karmaPoints,
        level: calculateLevel(karmaPoints),
        totalCompleted,
        currentStreak,
        rank: index + 1
      };

      entries.push(entry);

      if (userId && doc.id === userId) {
        userRank = index + 1;
      }
    });

      // If user is not in top results, find their rank
      if (userId && !userRank) {
        const allUsersQuery = query(
          collection(db, 'users'),
          orderBy('karmaPoints', 'desc')
        );
      const allUsersSnapshot = await getDocs(allUsersQuery);
      let rank = 0;
      for (const doc of allUsersSnapshot.docs) {
        rank++;
        if (doc.id === userId) {
          userRank = rank;
          break;
        }
      }
    }

    res.status(200).json({
      entries,
      userRank
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}

