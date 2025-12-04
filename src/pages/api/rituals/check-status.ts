import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { adminDb } from '@lib/firebase/admin';
import { ritualsCollection } from '@lib/firebase/collections';

interface CheckStatusResponse {
  ritualId: string;
  ritualTitle?: string;
  joinedByUsers: string[];
  userHasJoined: boolean;
  rippleCount: number;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CheckStatusResponse | { error: string }>
): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { ritualId, userId } = req.query;

    if (!ritualId || typeof ritualId !== 'string') {
      res.status(400).json({ error: 'Ritual ID is required' });
      return;
    }

    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    let ritualData;
    
    if (adminDb) {
      const ritualDoc = adminDb.collection('rituals').doc(ritualId);
      const snapshot = await ritualDoc.get();
      
      if (!snapshot.exists) {
        res.status(404).json({ error: 'Ritual not found' });
        return;
      }
      
      ritualData = snapshot.data();
    } else {
      const ritualDocRef = doc(ritualsCollection, ritualId);
      const snapshot = await getDoc(ritualDocRef);
      
      if (!snapshot.exists()) {
        res.status(404).json({ error: 'Ritual not found' });
        return;
      }
      
      ritualData = snapshot.data();
    }

    const joinedByUsers = ritualData?.joinedByUsers || [];
    const userHasJoined = joinedByUsers.includes(userId);

    res.status(200).json({
      ritualId,
      ritualTitle: ritualData?.title,
      joinedByUsers,
      userHasJoined,
      rippleCount: ritualData?.rippleCount || 0
    });
  } catch (error) {
    console.error('Error checking ritual status:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to check ritual status'
    });
  }
}

