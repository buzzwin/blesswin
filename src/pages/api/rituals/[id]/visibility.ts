import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc, updateDoc, query, where, getDocs, addDoc, deleteDoc as firestoreDeleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { collection } from 'firebase/firestore';
import type { RitualScope } from '@lib/types/ritual';
import { ritualsCollection } from '@lib/firebase/collections';

interface UpdateVisibilityRequest {
  userId: string;
  scope: RitualScope;
}

interface UpdateVisibilityResponse {
  success: boolean;
  message?: string;
  error?: string;
}

const userCustomRitualsCollection = (userId: string) => 
  collection(db, 'users', userId, 'custom_rituals');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UpdateVisibilityResponse>
): Promise<void> {
  if (req.method !== 'POST' && req.method !== 'PUT') {
    res.setHeader('Allow', ['POST', 'PUT']);
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    res.status(400).json({ success: false, error: 'Ritual ID is required' });
    return;
  }

  try {
    const { userId, scope } = req.body as UpdateVisibilityRequest;

    if (!userId || typeof userId !== 'string') {
      res.status(401).json({ success: false, error: 'Unauthorized. User ID required.' });
      return;
    }

    if (!scope || !['personalized', 'public'].includes(scope)) {
      res.status(400).json({ success: false, error: 'Valid scope is required (personalized or public)' });
      return;
    }

    const ritualDocRef = doc(userCustomRitualsCollection(userId), id);
    const ritualDoc = await getDoc(ritualDocRef);

    if (!ritualDoc.exists()) {
      res.status(404).json({ success: false, error: 'Ritual not found' });
      return;
    }

    const ritualData = ritualDoc.data();

    // Verify ownership
    if (ritualData.createdBy !== userId) {
      res.status(403).json({ success: false, error: 'Forbidden. You can only change visibility of your own rituals.' });
      return;
    }

    const oldScope = ritualData.scope as RitualScope || 'personalized';
    const newScope: RitualScope = scope;

    // If scope hasn't changed, return early
    if (oldScope === newScope) {
      res.status(200).json({
        success: true,
        message: 'Visibility unchanged'
      });
      return;
    }

    // Update scope in user's collection
    await updateDoc(ritualDocRef, {
      scope: newScope,
      updatedAt: serverTimestamp()
    } as any);

    if (newScope === 'public') {
      // Add to public collection
      const publicRitualDoc = {
        title: ritualData.title,
        description: ritualData.description,
        tags: ritualData.tags,
        effortLevel: ritualData.effortLevel,
        scope: newScope,
        suggestedTimeOfDay: ritualData.suggestedTimeOfDay,
        durationEstimate: ritualData.durationEstimate,
        prefillTemplate: ritualData.prefillTemplate,
        createdAt: ritualData.createdAt || serverTimestamp(),
        usageCount: ritualData.usageCount || 0,
        completionRate: ritualData.completionRate || 0,
        joinedByUsers: ritualData.joinedByUsers || [],
        createdBy: userId,
        sourceRitualId: id,
        sourceUserId: userId
      };
      await addDoc(ritualsCollection, publicRitualDoc as any);
    } else if (oldScope === 'public') {
      // Remove from public collection
      const publicRitualsQuery = query(
        ritualsCollection,
        where('sourceRitualId', '==', id),
        where('sourceUserId', '==', userId)
      );
      const publicRitualsSnapshot = await getDocs(publicRitualsQuery);
      for (const publicRitualDoc of publicRitualsSnapshot.docs) {
        await firestoreDeleteDoc(publicRitualDoc.ref);
      }
    }

    res.status(200).json({
      success: true,
      message: `Ritual is now ${newScope === 'public' ? 'public' : 'private'}`
    });
  } catch (error) {
    console.error('Error updating ritual visibility:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update ritual visibility',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

