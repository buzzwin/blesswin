import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc, updateDoc, arrayUnion, collection, addDoc, serverTimestamp, query, where, getDocs, type DocumentReference } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { adminDb } from '@lib/firebase/admin';
import { ritualsCollection } from '@lib/firebase/collections';
import type { RitualDefinition } from '@lib/types/ritual';
import { FieldValue } from 'firebase-admin/firestore';

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
    let ritualDocRef: DocumentReference | undefined;
    let ritualData: RitualDefinition | null = null;

    if (ritualScope === 'global' || ritualScope === 'personalized') {
      console.log('🔍 Looking for ritual:', {
        ritualId,
        ritualScope,
        userId
      });
      
      let ritualSnapshot;
      let ritualDoc;
      
      // Use Admin SDK if available (bypasses security rules)
      if (adminDb) {
        ritualDoc = adminDb.collection('rituals').doc(ritualId);
        ritualSnapshot = await ritualDoc.get();
        console.log('📄 Ritual snapshot exists (Admin SDK):', ritualSnapshot.exists);
      } else {
        // Fallback to client SDK
        ritualDocRef = doc(ritualsCollection, ritualId);
        const clientSnapshot = await getDoc(ritualDocRef);
        console.log('📄 Ritual snapshot exists (Client SDK):', clientSnapshot.exists());
        if (!clientSnapshot.exists()) {
          ritualSnapshot = null;
        } else {
          ritualSnapshot = { exists: true, data: () => clientSnapshot.data(), id: clientSnapshot.id };
        }
      }
      
      if (!ritualSnapshot || !ritualSnapshot.exists) {
        // Try to find by title as fallback (for hardcoded rituals that might have different IDs)
        console.log('⚠️ Ritual not found by ID, trying to find by title...');
        let allRituals: Array<{ id: string; title?: string; data?: any }> = [];
        
        if (adminDb) {
          const allRitualsSnapshot = await adminDb.collection('rituals').get();
          allRituals = allRitualsSnapshot.docs.map(doc => ({
            id: doc.id,
            title: doc.data().title,
            data: doc.data()
          }));
        } else {
          const allRitualsSnapshot = await getDocs(ritualsCollection);
          allRituals = allRitualsSnapshot.docs.map(doc => ({
            id: doc.id,
            title: doc.data().title,
            data: doc.data()
          }));
        }
        
        console.log('📋 All rituals in Firestore:', allRituals.map(r => ({ id: r.id, title: r.title })));
        
        // If ritualId looks like a hardcoded ID (ritual-0, ritual-1, etc.), try to find by title from request body
        const requestBody = req.body as JoinRitualRequest & { ritualTitle?: string };
        if (requestBody.ritualTitle && ritualId.match(/^ritual-\d+$/)) {
          console.log('🔍 Searching for ritual by title:', requestBody.ritualTitle);
          const matchingRitual = allRituals.find(r => 
            r.title?.toLowerCase() === requestBody.ritualTitle?.toLowerCase()
          );
          
          if (matchingRitual) {
            console.log('✅ Found ritual by title, using Firestore ID:', matchingRitual.id);
            // Use the matching ritual
            ritualData = { id: matchingRitual.id, ...matchingRitual.data } as RitualDefinition;
            
            // Update ritualDoc for Admin SDK
            if (adminDb) {
              ritualDoc = adminDb.collection('rituals').doc(matchingRitual.id);
            } else {
              ritualDocRef = doc(ritualsCollection, matchingRitual.id);
            }
          } else {
            res.status(404).json({ 
              success: false, 
              error: `Ritual not found. Ritual ID: ${ritualId}, Title: ${requestBody.ritualTitle}, Scope: ${ritualScope}. Available ritual IDs: ${allRituals.map(r => r.id).join(', ')}` 
            });
            return;
          }
        } else {
          res.status(404).json({ 
            success: false, 
            error: `Ritual not found. Ritual ID: ${ritualId}, Scope: ${ritualScope}. Available ritual IDs: ${allRituals.map(r => r.id).join(', ')}` 
          });
          return;
        }
      } else {
        // Ritual found by ID, extract data
        ritualData = { id: ritualSnapshot.id, ...ritualSnapshot.data() } as RitualDefinition;
      }

      // Add user to joinedByUsers array
      const currentJoinedBy = ritualData.joinedByUsers || [];
      console.log('📊 Current joinedByUsers before update:', currentJoinedBy);
      console.log('👤 User ID to add:', userId);
      console.log('🔍 User already in array?', currentJoinedBy.includes(userId));
      
      if (!currentJoinedBy.includes(userId)) {
        if (adminDb && ritualDoc) {
          // Use Admin SDK
          console.log('✅ Updating ritual with Admin SDK:', {
            ritualId: ritualDoc.id,
            userId,
            currentRippleCount: ritualData.rippleCount || 0,
            newRippleCount: (ritualData.rippleCount || 0) + 1
          });
          await ritualDoc.update({
            joinedByUsers: FieldValue.arrayUnion(userId),
            rippleCount: (ritualData.rippleCount || 0) + 1
          });
          
          // Verify the update
          const verifySnapshot = await ritualDoc.get();
          const verifyData = verifySnapshot.data();
          console.log('✅ Verified update - joinedByUsers after:', verifyData?.joinedByUsers);
        } else {
          // Fallback to client SDK
          console.log('✅ Updating ritual with Client SDK:', {
            ritualId: ritualDocRef?.id,
            userId,
            currentRippleCount: ritualData.rippleCount || 0,
            newRippleCount: (ritualData.rippleCount || 0) + 1
          });
          await updateDoc(ritualDocRef!, {
            joinedByUsers: arrayUnion(userId),
            rippleCount: (ritualData.rippleCount || 0) + 1
          });
        }
      } else {
        console.log('⚠️ User already in joinedByUsers array, skipping update');
      }

      // Also add this ritual to user's custom_rituals so they can complete it
      let existingCustomRituals;
      if (adminDb) {
        const customRitualsSnapshot = await adminDb.collection(`users/${userId}/custom_rituals`)
          .where('title', '==', ritualData.title)
          .get();
        existingCustomRituals = { empty: customRitualsSnapshot.empty };
      } else {
        const customRitualsQuery = query(
          userCustomRitualsCollection(userId),
          where('title', '==', ritualData.title)
        );
        existingCustomRituals = await getDocs(customRitualsQuery);
      }
      
      if (existingCustomRituals.empty) {
        // Copy ritual to user's custom_rituals
        // Remove id field entirely (don't set to undefined)
        const { id, ...ritualDataWithoutId } = ritualData;
        const ritualCopy = {
          ...ritualDataWithoutId,
          createdAt: adminDb ? FieldValue.serverTimestamp() : serverTimestamp(),
          createdBy: userId,
          scope: 'personalized',
          joinedByUsers: [],
          rippleCount: 0
        };
        
        if (adminDb) {
          await adminDb.collection(`users/${userId}/custom_rituals`).add(ritualCopy);
        } else {
          await addDoc(userCustomRitualsCollection(userId), ritualCopy as any);
        }
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

