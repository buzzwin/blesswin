import type { NextApiRequest, NextApiResponse } from 'next';
import { getDoc, getDocs, query, where, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import { usersCollection } from '@lib/firebase/collections';
import { ritualCompletionsCollection } from '@lib/firebase/collections';
import { calculateLevel } from '@lib/utils/level-calculation';
import type { Achievement, UserAchievement } from '@lib/types/ritual';

interface AchievementsResponse {
  achievements: Achievement[];
  unlockedIds: string[];
}

interface CheckAchievementsRequest {
  userId: string;
}

// Predefined achievements (same as in component)
const PREDEFINED_ACHIEVEMENTS: Omit<Achievement, 'unlockedAt'>[] = [
  { id: 'karma_50', name: 'Getting Started', description: 'Reach 50 karma points', icon: '🌱', category: 'karma', karmaThreshold: 50 },
  { id: 'karma_100', name: 'Rising Star', description: 'Reach 100 karma points', icon: '⭐', category: 'karma', karmaThreshold: 100 },
  { id: 'karma_250', name: 'Making Impact', description: 'Reach 250 karma points', icon: '✨', category: 'karma', karmaThreshold: 250 },
  { id: 'karma_500', name: 'Karma Champion', description: 'Reach 500 karma points', icon: '🏆', category: 'karma', karmaThreshold: 500 },
  { id: 'karma_1000', name: 'Karma Master', description: 'Reach 1,000 karma points', icon: '👑', category: 'karma', karmaThreshold: 1000 },
  { id: 'streak_7', name: 'Week Warrior', description: 'Complete rituals for 7 days in a row', icon: '💪', category: 'streak', streakThreshold: 7 },
  { id: 'streak_30', name: 'Monthly Master', description: 'Complete rituals for 30 days in a row', icon: '🎯', category: 'streak', streakThreshold: 30 },
  { id: 'completion_10', name: 'Getting Into It', description: 'Complete 10 rituals', icon: '📝', category: 'completion', completionThreshold: 10 },
  { id: 'completion_100', name: 'Century Club', description: 'Complete 100 rituals', icon: '💯', category: 'completion', completionThreshold: 100 }
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AchievementsResponse | { error: string }>
): Promise<void> {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { userId } = req.method === 'GET' ? req.query : req.body;
    const userIdValue = typeof userId === 'string' ? userId : Array.isArray(userId) ? userId[0] : undefined;

    if (!userIdValue) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    // Get user data
    const userDoc = await getDoc(doc(usersCollection, userIdValue));
    if (!userDoc.exists()) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const userData = userDoc.data();
    const karmaPoints = userData.karmaPoints || 0;

    // Get ritual completions for streak and completion count
    const completionsQuery = query(ritualCompletionsCollection(userIdValue));
    const completionsSnapshot = await getDocs(completionsQuery);
    const completions = completionsSnapshot.docs.map(doc => doc.data());
    
    // Calculate streak (simplified - you might want to use the actual streak calculation)
    const sortedCompletions = completions.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let checkDate = today;
    
    for (const completion of sortedCompletions) {
      if (completion.date === checkDate) {
        streak++;
        const date = new Date(checkDate);
        date.setDate(date.getDate() - 1);
        checkDate = date.toISOString().split('T')[0];
      } else {
        break;
      }
    }

    const totalCompletions = completions.length;

    // Check which achievements are unlocked
    const unlockedIds: string[] = [];
    const achievements: Achievement[] = PREDEFINED_ACHIEVEMENTS.map(ach => {
      const isUnlocked =
        (ach.karmaThreshold && karmaPoints >= ach.karmaThreshold) ||
        (ach.streakThreshold && streak >= ach.streakThreshold) ||
        (ach.completionThreshold && totalCompletions >= ach.completionThreshold);

      if (isUnlocked) {
        unlockedIds.push(ach.id);
      }

      return {
        ...ach,
        unlockedAt: isUnlocked ? new Date() : undefined
      } as Achievement;
    });

    res.status(200).json({
      achievements,
      unlockedIds
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
}

