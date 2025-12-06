import type { NextApiRequest, NextApiResponse } from 'next';
import { getDoc, doc } from 'firebase/firestore';
import { usersCollection } from '@lib/firebase/collections';
import { calculateLevel, getProgressToNextLevel, getKarmaRemainingForNextLevel, getKarmaForNextLevel } from '@lib/utils/level-calculation';

interface LevelResponse {
  level: number;
  karmaPoints: number;
  progress: number;
  karmaRemaining: number;
  karmaForNextLevel: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LevelResponse | { error: string }>
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

    // Get user karma
    const userDoc = await getDoc(doc(usersCollection, userId));
    if (!userDoc.exists()) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const userData = userDoc.data();
    const karmaPoints = userData.karmaPoints || 0;
    const level = calculateLevel(karmaPoints);
    const progress = getProgressToNextLevel(karmaPoints);
    const karmaRemaining = getKarmaRemainingForNextLevel(karmaPoints);
    const karmaForNextLevel = getKarmaForNextLevel(karmaPoints);

    res.status(200).json({
      level,
      karmaPoints,
      progress,
      karmaRemaining,
      karmaForNextLevel
    });
  } catch (error) {
    console.error('Error calculating level:', error);
    res.status(500).json({ error: 'Failed to calculate level' });
  }
}

