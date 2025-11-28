import type { NextApiRequest, NextApiResponse } from 'next';
import { setDoc, serverTimestamp } from 'firebase/firestore';
import { userRitualStateDoc } from '@lib/firebase/collections';
import type { ImpactTag } from '@lib/types/impact-moment';

interface InitRitualsRequest {
  userId: string;
  preferences: {
    selectedTags: ImpactTag[];
    notifications: {
      morning: boolean;
      evening: boolean;
      milestones: boolean;
      morningTime?: string;
      eveningTime?: string;
    };
  };
}

interface InitRitualsResponse {
  success: boolean;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<InitRitualsResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const { userId, preferences } = req.body as InitRitualsRequest;

    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ success: false, error: 'User ID is required' });
      return;
    }

    // Initialize user ritual state
    const userStateDoc = userRitualStateDoc(userId);
    const initialState: Record<string, unknown> = {
      userId,
      enabled: true,
      notificationPreferences: {
        morning: preferences.notifications.morning ?? true,
        evening: preferences.notifications.evening ?? true,
        milestones: preferences.notifications.milestones ?? true,
        morningTime: preferences.notifications.morningTime || '08:00',
        eveningTime: preferences.notifications.eveningTime || '19:00'
      },
      preferredTags: preferences.selectedTags || [],
      currentStreak: 0,
      longestStreak: 0,
      totalCompleted: 0,
      completedThisWeek: 0,
      completedThisMonth: 0,
      onboardingCompleted: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(userStateDoc, initialState as any);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error initializing rituals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize rituals'
    });
  }
}

