import type { NextApiRequest, NextApiResponse } from 'next';
import { getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { userRitualStateDoc } from '@lib/firebase/collections';
import type { UserRitualState } from '@lib/types/ritual';
import type { ImpactTag } from '@lib/types/impact-moment';

interface UpdateSettingsRequest {
  userId: string;
  notificationPreferences?: {
    morning?: boolean;
    evening?: boolean;
    milestones?: boolean;
    morningTime?: string;
    eveningTime?: string;
    quietHoursStart?: string;
    quietHoursEnd?: string;
  };
  preferredCategories?: string[];
  enabled?: boolean;
}

interface UpdateSettingsResponse {
  success: boolean;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UpdateSettingsResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const { userId, notificationPreferences, preferredCategories, enabled } = req.body as UpdateSettingsRequest;

    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ success: false, error: 'User ID is required' });
      return;
    }

    const userStateDoc = userRitualStateDoc(userId);
    const userStateSnapshot = await getDoc(userStateDoc);

    if (!userStateSnapshot.exists()) {
      res.status(404).json({ success: false, error: 'Ritual state not found. Please complete onboarding first.' });
      return;
    }

    const currentState = userStateSnapshot.data();
    const updates: Record<string, unknown> = {
      updatedAt: serverTimestamp()
    };

    // Update notification preferences if provided
    if (notificationPreferences) {
      updates.notificationPreferences = {
        ...(currentState?.notificationPreferences || {}),
        ...notificationPreferences
      };
    }

    // Update preferred categories if provided
    if (preferredCategories) {
      updates.preferredTags = preferredCategories as ImpactTag[];
    }

    // Update enabled status if provided
    if (typeof enabled === 'boolean') {
      updates.enabled = enabled;
    }

    await updateDoc(userStateDoc, updates as any);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating ritual settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update ritual settings'
    });
  }
}

