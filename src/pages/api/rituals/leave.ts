import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc, updateDoc, arrayRemove, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { adminDb } from '@lib/firebase/admin';
import { ritualsCollection } from '@lib/firebase/collections';
import type { RitualDefinition } from '@lib/types/ritual';
import { FieldValue } from 'firebase-admin/firestore';

interface LeaveRitualRequest {
  userId: string;
  ritualId: string;
  ritualScope?: 'global' | 'personalized'; // Whether ritual is from global/personalized collection or custom
}

interface LeaveRitualResponse {
  success: boolean;
  error?: string;
}

// User custom rituals collection
const userCustomRitualsCollection = (userId: string) =>
  collection(db, 'users', userId, 'custom_rituals');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LeaveRitualResponse>
): Promise<void> {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const { userId, ritualId, ritualScope } = req.body as LeaveRitualRequest;

    if (!userId || typeof userId !== 'string') {
      res.status(401).json({ success: false, error: 'Unauthorized. User ID required.' });
      return;
    }

    if (!ritualId || typeof ritualId !== 'string') {
      res.status(400).json({ success: false, error: 'Ritual ID is required' });
      return;
    }

    // Determine which collection the ritual is in
    let ritualDocRef;
    let ritualData: RitualDefinition | null = null;

    if (ritualScope === 'global' || ritualScope === 'personalized') {
      // Try to get ritual from global/personalized collection first
      let ritualSnapshot;
      let ritualDoc;
      
      if (adminDb) {
        // Use Admin SDK
        ritualDoc = adminDb.collection('rituals').doc(ritualId);
        ritualSnapshot = await ritualDoc.get();
        
        if (ritualSnapshot.exists) {
          ritualData = { id: ritualSnapshot.id, ...ritualSnapshot.data() } as RitualDefinition;
          const currentJoinedBy = ritualData.joinedByUsers || [];

          if (currentJoinedBy.includes(userId)) {
            // Remove user from joinedByUsers array
            console.log('✅ Removing user from ritual with Admin SDK:', {
              ritualId: ritualDoc.id,
              userId,
              currentRippleCount: ritualData.rippleCount || 0,
              newRippleCount: Math.max((ritualData.rippleCount || 0) - 1, 0)
            });
            await ritualDoc.update({
              joinedByUsers: FieldValue.arrayRemove(userId),
              rippleCount: Math.max((ritualData.rippleCount || 0) - 1, 0)
            });
            
            // Verify the update
            const verifySnapshot = await ritualDoc.get();
            const verifyData = verifySnapshot.data();
            console.log('✅ Verified leave - joinedByUsers after:', verifyData?.joinedByUsers);
          } else {
            console.log('⚠️ User not in joinedByUsers array, cannot leave');
          }
        }
      } else {
        // Fallback to client SDK
        ritualDocRef = doc(ritualsCollection, ritualId);
        const clientSnapshot = await getDoc(ritualDocRef);

        if (clientSnapshot.exists()) {
          ritualData = { id: clientSnapshot.id, ...clientSnapshot.data() } as RitualDefinition;
          const currentJoinedBy = ritualData.joinedByUsers || [];

          if (currentJoinedBy.includes(userId)) {
            // Remove user from joinedByUsers array
            await updateDoc(ritualDocRef, {
              joinedByUsers: arrayRemove(userId),
              rippleCount: Math.max((ritualData.rippleCount || 0) - 1, 0)
            });
          }
        }
      }
    }

    // Also check user's custom_rituals (in case they joined a ritual that was copied there)
    if (ritualData?.title) {
      if (adminDb) {
        const customRitualsSnapshot = await adminDb.collection(`users/${userId}/custom_rituals`)
          .where('title', '==', ritualData.title)
          .get();

        if (!customRitualsSnapshot.empty) {
          const customRitual = customRitualsSnapshot.docs[0];
          const customRitualData = customRitual.data() as RitualDefinition;
          const customJoinedBy = customRitualData.joinedByUsers || [];

          if (customJoinedBy.includes(userId)) {
            // Remove user from joinedByUsers array in custom ritual
            await adminDb.collection(`users/${userId}/custom_rituals`).doc(customRitual.id).update({
              joinedByUsers: FieldValue.arrayRemove(userId),
              rippleCount: Math.max((customRitualData.rippleCount || 0) - 1, 0)
            });
          }
        }
      } else {
        // Fallback to client SDK
        const customRitualsQuery = query(
          userCustomRitualsCollection(userId),
          where('title', '==', ritualData.title)
        );
        const existingCustomRituals = await getDocs(customRitualsQuery);

        if (!existingCustomRituals.empty) {
          const customRitual = existingCustomRituals.docs[0];
          const customRitualData = customRitual.data() as RitualDefinition;
          const customJoinedBy = customRitualData.joinedByUsers || [];

          if (customJoinedBy.includes(userId)) {
            // Remove user from joinedByUsers array in custom ritual
            await updateDoc(doc(userCustomRitualsCollection(userId), customRitual.id), {
              joinedByUsers: arrayRemove(userId),
              rippleCount: Math.max((customRitualData.rippleCount || 0) - 1, 0)
            });
          }
        }
      }
    }

    res.status(200).json({
      success: true
    });
  } catch (error) {
    console.error('Error leaving ritual:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to leave ritual'
    });
  }
}

