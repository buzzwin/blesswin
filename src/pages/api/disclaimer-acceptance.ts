import { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@lib/firebase/app';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method === 'GET') {
    // Check if user has accepted disclaimer
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    try {
      // Use client SDK (respects Firestore security rules)
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        res.status(200).json({ accepted: false });
        return;
      }

      const userData = userDoc.data();
      const accepted = userData?.disclaimerAccepted === true;
      const acceptedAt = userData?.disclaimerAcceptedAt;

      res.status(200).json({
        accepted,
        acceptedAt: acceptedAt?.toDate?.()?.toISOString() || acceptedAt
      });
    } catch (error) {
      console.error('Error checking disclaimer acceptance:', error);
      res.status(500).json({ error: 'Failed to check disclaimer acceptance', accepted: false });
    }
  } else if (req.method === 'POST') {
    // Save disclaimer acceptance
    const { userId } = req.body;

    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    try {
      // Use client SDK (respects Firestore security rules)
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create user document if it doesn't exist
        await setDoc(userDocRef, {
          disclaimerAccepted: true,
          disclaimerAcceptedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        });
      } else {
        // Update existing user document
        await updateDoc(userDocRef, {
          disclaimerAccepted: true,
          disclaimerAcceptedAt: serverTimestamp()
        });
      }

      res.status(200).json({ success: true, accepted: true });
    } catch (error) {
      console.error('Error saving disclaimer acceptance:', error);
      res.status(500).json({ error: 'Failed to save disclaimer acceptance' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

