import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc, updateDoc, arrayUnion, collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { ritualsCollection } from '@lib/firebase/collections';
import type { RitualDefinition } from '@lib/types/ritual';

interface JoinRitualRequest {
  userId: string;
  ritualId: string;
  ritualScope?: 'global' | 'personalized'; // Whether ritual is from global/personalized collection or custom
}

interface JoinRitualResponse {
  success: boolean;
  error?: string;
}

// User custom rituals collection
const userCustomRitualsCollection = (userId: string) => 
  collection(db, 'users', userId, 'custom_rituals');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<JoinRitualResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const { userId, ritualId, ritualScope } = req.body as JoinRitualRequest;

    if (!userId || typeof userId !== 'string') {
      res.status(401).json({ success: false, error: 'Unauthorized. User ID required.' });
      return;
    }

    if (!ritualId || typeof ritualId !== 'string') {
      res.status(400).json({ success: false, error: 'Ritual ID is required' });
      return;
    }

    // Determine which collection the ritual is in
    // If ritualScope is 'global' or 'personalized', it's in the rituals collection
    // Otherwise, it's a custom ritual in users/{userId}/custom_rituals
    let ritualDocRef;
    let ritualData: RitualDefinition | null = null;

    if (ritualScope === 'global' || ritualScope === 'personalized') {
      // Get ritual from global/personalized collection
      ritualDocRef = doc(ritualsCollection, ritualId);
      const ritualSnapshot = await getDoc(ritualDocRef);
      
      if (!ritualSnapshot.exists()) {
        res.status(404).json({ success: false, error: 'Ritual not found' });
        return;
      }

      ritualData = { id: ritualSnapshot.id, ...ritualSnapshot.data() } as RitualDefinition;

      // Add user to joinedByUsers array
      const currentJoinedBy = ritualData.joinedByUsers || [];
      if (!currentJoinedBy.includes(userId)) {
        await updateDoc(ritualDocRef, {
          joinedByUsers: arrayUnion(userId),
          rippleCount: (ritualData.rippleCount || 0) + 1 // Increment ripple count
        });
      }

      // Also add this ritual to user's custom_rituals so they can complete it
      const customRitualsQuery = query(
        userCustomRitualsCollection(userId),
        where('title', '==', ritualData.title)
      );
      const existingCustomRituals = await getDocs(customRitualsQuery);
      
      if (existingCustomRituals.empty) {
        // Copy ritual to user's custom_rituals
        await addDoc(userCustomRitualsCollection(userId), {
          ...ritualData,
          id: undefined, // Remove id so Firestore generates new one
          createdAt: serverTimestamp(),
          createdBy: userId,
          scope: 'personalized',
          joinedByUsers: [],
          rippleCount: 0
        } as any);
      }
    } else {
      // Custom ritual - find it in the creator's custom_rituals
      // We need to find which user owns this ritual
      // For now, let's check if it's in the current user's custom_rituals
      const customRitualsQuery = query(userCustomRitualsCollection(userId));
      const customRitualsSnapshot = await getDocs(customRitualsQuery);
      
      const customRitual = customRitualsSnapshot.docs.find(d => d.id === ritualId);
      
      if (customRitual) {
        ritualData = { id: customRitual.id, ...customRitual.data() } as RitualDefinition;
        ritualDocRef = doc(userCustomRitualsCollection(userId), ritualId);
        
        // Add user to joinedByUsers array
        const currentJoinedBy = ritualData.joinedByUsers || [];
        if (!currentJoinedBy.includes(userId)) {
          await updateDoc(ritualDocRef, {
            joinedByUsers: arrayUnion(userId),
            rippleCount: (ritualData.rippleCount || 0) + 1
          });
        }
      } else {
        // Try to find it in other users' custom_rituals
        // This is more complex - for now, return error
        res.status(404).json({ success: false, error: 'Custom ritual not found' });
        return;
      }
    }

    res.status(200).json({
      success: true
    });
  } catch (error) {
    console.error('Error joining ritual:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to join ritual'
    });
  }
}

