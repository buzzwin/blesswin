import type { NextApiRequest, NextApiResponse } from 'next';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { impactMomentsCollection } from '@lib/firebase/collections';
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

    // Use provided title/description or default to moment's content
    const ritualTitle = title?.trim() || moment.text.substring(0, 50) || 'New Ritual';
    const ritualDescription = description?.trim() || moment.text || 'A ritual inspired by an impact moment';

    // Create custom ritual document from moment
    const ritualDoc: Record<string, unknown> = {
      title: ritualTitle,
      description: ritualDescription,
      tags: moment.tags || [],
      effortLevel: moment.effortLevel || 'medium',
      scope: 'personalized', // User-created rituals are personalized
      suggestedTimeOfDay: suggestedTimeOfDay || 'anytime',
      durationEstimate: durationEstimate || '5 minutes',
      prefillTemplate: moment.text || `Completed ritual: ${ritualTitle}`,
      createdAt: serverTimestamp(),
      usageCount: 0,
      completionRate: 0,
      createdBy: userId,
      createdFromMomentId: momentId, // Link back to source moment
      joinedByUsers: [], // Initialize empty
      rippleCount: 0 // Initialize to 0
    };

    const docRef = await addDoc(userCustomRitualsCollection(userId), ritualDoc);

    res.status(200).json({
      success: true,
      ritualId: docRef.id
    });
  } catch (error) {
    console.error('Error creating ritual from moment:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create ritual from moment'
    });
  }
}

