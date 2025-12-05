import type { NextApiRequest, NextApiResponse } from 'next';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@lib/firebase/app';

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
    // Use client SDK (respects Firestore security rules)
    const preferencesCollection = collection(db, 'user_preferences');
    const existingPrefQuery = query(
      preferencesCollection,
      where('userId', '==', userId),
      where('itemId', '==', itemId)
    );
    const existingPref = await getDocs(existingPrefQuery);

    if (!existingPref.empty) {
      // Update existing preference
      const prefDoc = existingPref.docs[0];
      await updateDoc(doc(preferencesCollection, prefDoc.id), {
        preference,
        updatedAt: serverTimestamp()
      });
    } else {
      // Create new preference
      await addDoc(preferencesCollection, {
        userId,
        itemId,
        itemType,
        preference,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving preference:', error);
    res.status(500).json({ error: 'Failed to save preference' });
  }
}

