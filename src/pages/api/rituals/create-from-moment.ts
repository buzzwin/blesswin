import type { NextApiRequest, NextApiResponse } from 'next';
import { collection, addDoc, serverTimestamp, doc, getDoc, query, where, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { impactMomentsCollection, ritualsCollection } from '@lib/firebase/collections';
import type { RitualDefinition, RitualTimeOfDay } from '@lib/types/ritual';
import type { ImpactTag, EffortLevel } from '@lib/types/impact-moment';

interface CreateRitualFromMomentRequest {
  userId: string;
  momentId: string;
  title?: string; // Optional - defaults to moment text
  description?: string; // Optional - defaults to moment description
  suggestedTimeOfDay?: RitualTimeOfDay;
  durationEstimate?: string;
}

interface CreateRitualFromMomentResponse {
  success: boolean;
  ritualId?: string;
  joined?: boolean; // true if user joined existing ritual, false if created new one
  error?: string;
}

// User custom rituals collection
const userCustomRitualsCollection = (userId: string) => 
  collection(db, 'users', userId, 'custom_rituals');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateRitualFromMomentResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const { userId, momentId, title, description, suggestedTimeOfDay, durationEstimate } = req.body as CreateRitualFromMomentRequest;

    if (!userId || typeof userId !== 'string') {
      res.status(401).json({ success: false, error: 'Unauthorized. User ID required.' });
      return;
    }

    if (!momentId || typeof momentId !== 'string') {
      res.status(400).json({ success: false, error: 'Moment ID is required' });
      return;
    }

    // Fetch the impact moment
    const momentDoc = await getDoc(doc(impactMomentsCollection, momentId));
    if (!momentDoc.exists()) {
      res.status(404).json({ success: false, error: 'Impact moment not found' });
      return;
    }

    const momentData = momentDoc.data();
    const moment = { id: momentDoc.id, ...momentData } as any;

    // If moment was created from a ritual, join that ritual directly
    if (moment.ritualId) {
      // Find the ritual - could be in main collection or user's custom_rituals
      let ritualDocRef: any = null;
      let ritualData: any = null;
      let ritualScope: 'global' | 'personalized' | undefined = undefined;

      // Try main rituals collection first
      try {
        const ritualDoc = await getDoc(doc(ritualsCollection, moment.ritualId));
        if (ritualDoc.exists()) {
          ritualDocRef = ritualDoc.ref;
          ritualData = ritualDoc.data();
          ritualScope = ritualData.scope === 'global' ? 'global' : 'personalized';
        }
      } catch (error) {
        // Ritual might be in a user's custom_rituals collection
        console.log('Ritual not found in main collection, checking custom rituals...');
      }

      // If not found, try to find it in any user's custom_rituals
      // (This is a limitation - we'd need to know which user owns it)
      // For now, if ritualId exists but ritual not found, create/join based on moment
      if (!ritualDocRef) {
        // Ritual might have been deleted or is in a user's custom collection
        // Fall through to create/join logic below
      } else {
        // Found the ritual - join it
        const currentJoinedBy = ritualData.joinedByUsers || [];
        
        if (!currentJoinedBy.includes(userId)) {
          await updateDoc(ritualDocRef, {
            joinedByUsers: arrayUnion(userId)
          });
        }

        // Ritual remains only in the main ritualsCollection - no copy created

        res.status(200).json({
          success: true,
          ritualId: moment.ritualId,
          joined: true
        });
        return;
      }
    }

    // If moment doesn't have ritualId, check if a ritual was created from this moment
    // Check if a ritual already exists for this moment (viral effect - multiple users join same ritual)
    const existingRitualQuery = query(
      ritualsCollection,
      where('createdFromMomentId', '==', momentId)
    );
    const existingRituals = await getDocs(existingRitualQuery);

    if (!existingRituals.empty) {
      // Ritual already exists - join it instead of creating a new one
      const existingRitual = existingRituals.docs[0];
      const existingRitualData = existingRitual.data();
      const currentJoinedBy = existingRitualData.joinedByUsers || [];

      // Add user to joinedByUsers if not already there
      if (!currentJoinedBy.includes(userId)) {
        await updateDoc(existingRitual.ref, {
          joinedByUsers: arrayUnion(userId),
          rippleCount: (existingRitualData.rippleCount || 0) + 1
        });
      }

      // Ritual remains only in the main ritualsCollection - no copy created

      res.status(200).json({
        success: true,
        ritualId: existingRitual.id,
        joined: true // Indicates user joined existing ritual
      });
      return;
    }

    // No existing ritual - create a new shared ritual in main collection
    const ritualTitle = title?.trim() || moment.text.substring(0, 50) || 'New Ritual';
    const ritualDescription = description?.trim() || moment.text || 'A ritual inspired by an impact moment';

    // Create prefillTemplate, ensuring it's under 280 characters
    const fullPrefillTemplate = moment.text || `Completed ritual: ${ritualTitle}`;
    const prefillTemplate = fullPrefillTemplate.length > 280 
      ? fullPrefillTemplate.substring(0, 277) + '...'
      : fullPrefillTemplate;

    // Create shared ritual in main rituals collection (so others can join)
    const ritualDoc = {
      title: ritualTitle,
      description: ritualDescription,
      tags: moment.tags || [],
      effortLevel: moment.effortLevel || 'medium',
      scope: 'personalized', // Shared but personalized scope
      suggestedTimeOfDay: suggestedTimeOfDay || 'anytime',
      durationEstimate: durationEstimate || '5 minutes',
      prefillTemplate,
      createdAt: serverTimestamp(),
      usageCount: 0,
      completionRate: 0,
      createdBy: userId,
      createdFromMomentId: momentId, // Link back to source moment
      joinedByUsers: [userId] // Creator is first to join
    };

    const docRef = await addDoc(ritualsCollection, ritualDoc as any);

    // Ritual remains only in the main ritualsCollection - no copy created
    // Creator automatically joins their own ritual (already in joinedByUsers array)

    res.status(200).json({
      success: true,
      ritualId: docRef.id,
      joined: false // Indicates user created new ritual
    });
  } catch (error) {
    console.error('Error creating ritual from moment:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create ritual from moment'
    });
  }
}

