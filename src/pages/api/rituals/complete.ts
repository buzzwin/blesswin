import type { NextApiRequest, NextApiResponse } from 'next';
import { getDoc, addDoc, updateDoc, setDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { userRitualStateDoc, ritualCompletionsCollection } from '@lib/firebase/collections';
import { getTodayDateString, calculateStreak, calculateLongestStreak } from '@lib/utils/ritual-stats';
import type { RitualCompletion, UserRitualState } from '@lib/types/ritual';
import { awardKarma } from '@lib/utils/karma-calculator';

interface CompleteRitualRequest {
  userId: string;
  ritualId: string;
  completedQuietly: boolean;
  sharedAsMomentId?: string;
}

interface CompleteRitualResponse {
  success: boolean;
  completion?: RitualCompletion;
  updatedStreak?: number;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CompleteRitualResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const { userId, ritualId, completedQuietly, sharedAsMomentId } = req.body as CompleteRitualRequest;

    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ success: false, error: 'User ID is required' });
      return;
    }

    if (!ritualId || typeof ritualId !== 'string') {
      res.status(400).json({ success: false, error: 'Ritual ID is required' });
      return;
    }

    if (typeof completedQuietly !== 'boolean') {
      res.status(400).json({ success: false, error: 'completedQuietly must be a boolean' });
      return;
    }

    const today = getTodayDateString();

    // Check if user already completed this ritual today
    const todayCompletionsQuery = query(
      ritualCompletionsCollection(userId),
      where('date', '==', today),
      where('ritualId', '==', ritualId)
    );
    const existingCompletions = await getDocs(todayCompletionsQuery);
    
    if (!existingCompletions.empty) {
      res.status(400).json({ success: false, error: 'Ritual already completed today' });
      return;
    }

    // Create completion record
    const completionData = {
      ritualId,
      userId,
      completedAt: serverTimestamp(),
      completedQuietly,
      date: today,
      ...(sharedAsMomentId && { sharedAsMomentId })
    };

    const completionRef = await addDoc(ritualCompletionsCollection(userId), completionData as any);

    // Update user ritual state
    const userStateDoc = userRitualStateDoc(userId);
    const userStateSnapshot = await getDoc(userStateDoc);
    const userState = userStateSnapshot.exists() ? userStateSnapshot.data() : null;

    // Get all completions to calculate streak
    const allCompletionsQuery = query(ritualCompletionsCollection(userId));
    const allCompletionsSnapshot = await getDocs(allCompletionsQuery);
    const allCompletions = allCompletionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as RitualCompletion[];

    // Calculate new streak
    const newStreak = calculateStreak(allCompletions);
    const newLongestStreak = calculateLongestStreak(allCompletions);

    // Calculate stats
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - 7);
    const thisWeekCompletions = allCompletions.filter(c => c.date >= thisWeekStart.toISOString().split('T')[0]);

    const thisMonthStart = new Date();
    thisMonthStart.setMonth(thisMonthStart.getMonth() - 1);
    const thisMonthCompletions = allCompletions.filter(c => c.date >= thisMonthStart.toISOString().split('T')[0]);

    const updatedState = {
      totalCompleted: allCompletions.length,
      completedThisWeek: thisWeekCompletions.length,
      completedThisMonth: thisMonthCompletions.length,
      currentStreak: newStreak,
      longestStreak: Math.max(userState?.longestStreak || 0, newStreak, newLongestStreak),
      lastCompletedDate: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    if (userStateSnapshot.exists()) {
      await updateDoc(userStateDoc, updatedState as any);
    } else {
      // Create initial state if it doesn't exist
      const initialState = {
        userId,
        enabled: true,
        notificationPreferences: {
          morning: true,
          evening: true,
          milestones: true
        },
        currentStreak: newStreak,
        longestStreak: newStreak,
        totalCompleted: allCompletions.length,
        completedThisWeek: thisWeekCompletions.length,
        completedThisMonth: thisMonthCompletions.length,
        lastCompletedDate: serverTimestamp(),
        onboardingCompleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await setDoc(userStateDoc, initialState as any);
    }

    // Award karma for ritual completion
    try {
      const karmaAction = completedQuietly ? 'ritual_completed_quiet' : 'ritual_completed_shared';
      await awardKarma(userId, karmaAction);

      // Check for streak milestones
      if (newStreak === 7) {
        await awardKarma(userId, 'streak_milestone_7');
      } else if (newStreak === 30) {
        await awardKarma(userId, 'streak_milestone_30');
      }
    } catch (karmaError) {
      // Log karma error but don't fail the request
      console.error('Error awarding karma for ritual completion:', karmaError);
    }

    const completion: RitualCompletion = {
      id: completionRef.id,
      ritualId,
      userId,
      completedAt: new Date(), // Approximate for response
      completedQuietly,
      date: today,
      ...(sharedAsMomentId && { sharedAsMomentId })
    };

    res.status(200).json({
      success: true,
      completion,
      updatedStreak: newStreak
    });
  } catch (error) {
    console.error('Error completing ritual:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete ritual'
    });
  }
}

