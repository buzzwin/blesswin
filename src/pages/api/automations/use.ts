import type { NextApiRequest, NextApiResponse } from 'next';
import { collection, addDoc, doc, getDoc, getDocs, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import type { Automation } from '@lib/types/automation';

interface UseAutomationRequest {
  userId: string;
  automationId: string;
  sourceUserId: string;
}

interface UseAutomationResponse {
  success: boolean;
  automationId?: string;
  error?: string;
}

// User automations collection
const userAutomationsCollection = (userId: string) => 
  collection(db, 'users', userId, 'automations');

// Public automations registry
const automationsRegistryCollection = collection(db, 'automations_registry');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UseAutomationResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const { userId, automationId, sourceUserId } = req.body as UseAutomationRequest;

    if (!userId || !automationId || !sourceUserId) {
      res.status(400).json({ success: false, error: 'Missing required fields' });
      return;
    }

    // Get the source automation
    const sourceAutomationDoc = await getDoc(doc(userAutomationsCollection(sourceUserId), automationId));
    
    if (!sourceAutomationDoc.exists()) {
      res.status(404).json({ success: false, error: 'Automation not found' });
      return;
    }

    const sourceAutomation = { id: sourceAutomationDoc.id, ...sourceAutomationDoc.data() } as Automation;

    // Create a copy for the user (they can customize it)
    const userAutomation: Omit<Automation, 'id' | 'createdAt' | 'updatedAt'> & {
      createdAt: ReturnType<typeof serverTimestamp>;
      updatedAt: ReturnType<typeof serverTimestamp>;
    } = {
      ...sourceAutomation,
      userId, // Change to new user
      isActive: true,
      isPublic: false, // User's copy is private by default
      sharedCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Save to user's automations
    const newDocRef = await addDoc(userAutomationsCollection(userId), userAutomation as any);

    // Update registry stats if it's a public automation
    if (sourceAutomation.isPublic) {
      const registryQuery = await getDocs(automationsRegistryCollection);
      const registryEntry = registryQuery.docs.find(
        doc => doc.data().automationId === automationId && doc.data().userId === sourceUserId
      );

      if (registryEntry) {
        await updateDoc(registryEntry.ref, {
          'stats.activeUsers': increment(1),
          'stats.sharedCount': increment(1)
        });
      }
    }

    res.status(200).json({
      success: true,
      automationId: newDocRef.id
    });
  } catch (error) {
    console.error('Error using automation:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to use automation'
    });
  }
}
