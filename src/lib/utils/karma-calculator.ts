/**
 * Karma calculation utilities
 * Handles awarding karma points and updating user karma breakdown
 */

import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { usersCollection } from '@lib/firebase/collections';
import type { KarmaAction, KarmaBreakdown } from '@lib/types/karma';
import { getKarmaPoints, getKarmaCategory, DEFAULT_KARMA_BREAKDOWN } from '@lib/types/karma';
import type { User } from '@lib/types/user';

/**
 * Award karma to a user for a specific action
 * Updates both karmaPoints and karmaBreakdown
 * 
 * @param userId - The user ID to award karma to
 * @param action - The karma action that was performed
 * @returns Promise with updated karma values
 */
export async function awardKarma(
  userId: string,
  action: KarmaAction
): Promise<{ karmaPoints: number; karmaBreakdown: KarmaBreakdown }> {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid userId');
  }

  // Get current user data
  const userDoc = doc(usersCollection, userId);
  const userSnapshot = await getDoc(userDoc);

  if (!userSnapshot.exists()) {
    throw new Error(`User ${userId} not found`);
  }

  const userData = userSnapshot.data();
  
  // Get karma points for this action
  const pointsToAward = getKarmaPoints(action);
  const category = getKarmaCategory(action);

  // Calculate new karma values
  const currentKarmaPoints = userData.karmaPoints ?? 0;
  const currentBreakdown: KarmaBreakdown = userData.karmaBreakdown ?? DEFAULT_KARMA_BREAKDOWN;

  const newKarmaPoints = currentKarmaPoints + pointsToAward;
  const newBreakdown: KarmaBreakdown = {
    ...currentBreakdown,
    [category]: currentBreakdown[category] + pointsToAward
  };

  // Update user document
  await updateDoc(userDoc, {
    karmaPoints: newKarmaPoints,
    karmaBreakdown: newBreakdown,
    lastKarmaUpdate: serverTimestamp()
  });

  return {
    karmaPoints: newKarmaPoints,
    karmaBreakdown: newBreakdown
  };
}

/**
 * Award karma to multiple users (e.g., when someone receives a ripple)
 * 
 * @param userIds - Array of user IDs to award karma to
 * @param action - The karma action
 * @returns Promise with results for each user
 */
export async function awardKarmaToMultiple(
  userIds: string[],
  action: KarmaAction
): Promise<Array<{ userId: string; success: boolean; error?: string }>> {
  const results = await Promise.allSettled(
    userIds.map(async (userId) => {
      try {
        await awardKarma(userId, action);
        return { userId, success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { userId, success: false, error: message };
      }
    })
  );

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    return {
      userId: userIds[index],
      success: false,
      error: result.reason instanceof Error ? result.reason.message : 'Unknown error'
    };
  });
}

/**
 * Get user's current karma values
 * 
 * @param userId - The user ID
 * @returns Promise with karma points and breakdown
 */
export async function getUserKarma(
  userId: string
): Promise<{ karmaPoints: number; karmaBreakdown: KarmaBreakdown }> {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid userId');
  }

  const userDoc = doc(usersCollection, userId);
  const userSnapshot = await getDoc(userDoc);

  if (!userSnapshot.exists()) {
    throw new Error(`User ${userId} not found`);
  }

  const userData = userSnapshot.data();

  return {
    karmaPoints: userData.karmaPoints ?? 0,
    karmaBreakdown: userData.karmaBreakdown ?? DEFAULT_KARMA_BREAKDOWN
  };
}

/**
 * Recalculate karma for a user from scratch
 * This is useful for migrations or corrections
 * 
 * @param userId - The user ID
 * @returns Promise with recalculated karma values
 */
export async function recalculateUserKarma(
  userId: string
): Promise<{ karmaPoints: number; karmaBreakdown: KarmaBreakdown }> {
  // This will be implemented in Phase 6 (Migration & Backfill)
  // For now, just return current karma
  return getUserKarma(userId);
}

