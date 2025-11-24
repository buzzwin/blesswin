import type { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '@lib/firebase/admin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { userId, itemId, itemType, preference } = req.body;

  if (!userId || !itemId || !itemType || !preference) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  if (!['like', 'dislike', 'neutral'].includes(preference)) {
    res.status(400).json({ error: 'Invalid preference type' });
    return;
  }

  try {
    if (!adminDb) {
      res.status(500).json({ error: 'Database not available' });
      return;
    }

    // Check if preference already exists
    const existingPref = await adminDb
      .collection('user_preferences')
      .where('userId', '==', userId)
      .where('itemId', '==', itemId)
      .limit(1)
      .get();

    if (!existingPref.empty) {
      // Update existing preference
      const doc = existingPref.docs[0];
      await doc.ref.update({
        preference,
        updatedAt: new Date()
      });
    } else {
      // Create new preference
      await adminDb.collection('user_preferences').add({
        userId,
        itemId,
        itemType,
        preference,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving preference:', error);
    res.status(500).json({ error: 'Failed to save preference' });
  }
}

