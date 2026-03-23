import type { NextApiRequest, NextApiResponse } from 'next';
import { collection, getDocs, query, orderBy, limit, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { usersCollection } from '@lib/firebase/collections';
import type { AutomationRegistryEntry, Automation } from '@lib/types/automation';

interface RegistryResponse {
  success: boolean;
  automations?: AutomationRegistryEntry[];
  error?: string;
}

const automationsRegistryCollection = collection(db, 'automations_registry');
const userAutomationsCollection = (userId: string) => 
  collection(db, 'users', userId, 'automations');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RegistryResponse>
): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const { category, limit: limitParam = '20' } = req.query;

    // Get public automations from registry
    let q = query(
      automationsRegistryCollection,
      orderBy('createdAt', 'desc'),
      limit(parseInt(limitParam as string, 10))
    );

    if (category && typeof category === 'string') {
      q = query(
        automationsRegistryCollection,
        where('tags', 'array-contains', category),
        orderBy('createdAt', 'desc'),
        limit(parseInt(limitParam as string, 10))
      );
    }

    const snapshot = await getDocs(q);
    const registryEntries: AutomationRegistryEntry[] = [];

    for (const registryDoc of snapshot.docs) {
      const data = registryDoc.data();
      const automationId = data.automationId;
      const userId = data.userId;

      // Fetch the actual automation from user's collection
      const automationDocRef = doc(userAutomationsCollection(userId), automationId);
      const automationDoc = await getDoc(automationDocRef);
      
      if (automationDoc.exists()) {
        const automation = { id: automationDoc.id, ...automationDoc.data() } as Automation;

        if (automation.isPublic) {
          registryEntries.push({
            id: registryDoc.id,
            automation,
            creator: data.creator,
            stats: data.stats || {
              sharedCount: 0,
              activeUsers: 0
            },
            tags: data.tags || [automation.category]
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      automations: registryEntries
    });
  } catch (error) {
    console.error('Error fetching automation registry:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch automations'
    });
  }
}
