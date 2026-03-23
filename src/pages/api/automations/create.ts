import type { NextApiRequest, NextApiResponse } from 'next';
import { collection, addDoc, serverTimestamp, getDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { usersCollection, ritualsCollection } from '@lib/firebase/collections';
import type { CreateAutomationRequest, Automation } from '@lib/types/automation';
import { automationToUnified } from '@lib/types/unified-ritual';
import type { UnifiedRitual } from '@lib/types/unified-ritual';

interface CreateAutomationResponse {
  success: boolean;
  automation?: Automation;
  error?: string;
}

// User automations collection
const userAutomationsCollection = (userId: string) => 
  collection(db, 'users', userId, 'automations');

// Public automations registry
const automationsRegistryCollection = collection(db, 'automations_registry');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateAutomationResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const {
      userId,
      title,
      description,
      category,
      triggers,
      actions,
      isPublic = false,
      conversationHistory
    } = req.body as CreateAutomationRequest;

    if (!userId || typeof userId !== 'string') {
      res.status(401).json({ success: false, error: 'Unauthorized. User ID required.' });
      return;
    }

    // Validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      res.status(400).json({ success: false, error: 'Title is required' });
      return;
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      res.status(400).json({ success: false, error: 'Description is required' });
      return;
    }

    if (!triggers || !Array.isArray(triggers) || triggers.length === 0) {
      res.status(400).json({ success: false, error: 'At least one trigger is required' });
      return;
    }

    if (!actions || !Array.isArray(actions) || actions.length === 0) {
      res.status(400).json({ success: false, error: 'At least one action is required' });
      return;
    }

    // Get user data
    const userDoc = await getDoc(doc(usersCollection, userId));
    if (!userDoc.exists()) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    const user = userDoc.data();

    // Map category to tags for unified model
    const categoryToTags: Record<string, string[]> = {
      wellness: ['mind', 'body'],
      productivity: ['mind'],
      relationships: ['relationships'],
      health: ['body'],
      finance: ['mind'],
      learning: ['mind'],
      other: ['mind']
    };

    const tags = categoryToTags[category || 'other'] || ['mind'];
    const hasRitualAction = actions?.some(a => a.type === 'ritual') || false;

    // Create unified ritual document (automation with triggers)
    const unifiedRitual: Omit<UnifiedRitual, 'id' | 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> } = {
      userId,
      title: title.trim(),
      description: description.trim(),
      tags: tags as any,
      effortLevel: 'tiny',
      suggestedTimeOfDay: 'anytime',
      durationEstimate: '5 minutes',
      prefillTemplate: `Completed automation: ${title.trim()}`,
      triggers,
      actions,
      category,
      isPublic: isPublic || false,
      isJoinable: isPublic || false,
      isCompletable: hasRitualAction,
      isActive: true,
      scope: isPublic ? 'public' : 'personalized',
      createdAt: serverTimestamp(),
      joinedByUsers: [],
      usageCount: 0,
      completionRate: 0,
      conversationHistory: conversationHistory?.map(msg => ({
        ...msg,
        timestamp:
          msg.timestamp instanceof Date
            ? msg.timestamp
            : msg.timestamp instanceof Timestamp
              ? msg.timestamp.toDate()
              : new Date(msg.timestamp)
      })) || []
    };

    // Save to user's custom_rituals collection (unified storage)
    const userCustomRitualsCollection = collection(db, 'users', userId, 'custom_rituals');
    const docRef = await addDoc(userCustomRitualsCollection, unifiedRitual as any);

    // If public, also create in main rituals collection for discovery
    if (isPublic) {
      await addDoc(ritualsCollection, {
        ...unifiedRitual,
        sourceRitualId: docRef.id,
        sourceUserId: userId,
        createdBy: userId,
        joinedByUsers: [userId]
      } as any);
    }

    // Also save to automations collection for backward compatibility
    const automationDoc: Omit<Automation, 'id' | 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> } = {
      userId,
      title: title.trim(),
      description: description.trim(),
      category,
      triggers,
      actions,
      isPublic,
      isActive: true,
      sharedCount: 0,
      createdAt: serverTimestamp(),
      conversationHistory: conversationHistory || []
    };
    await addDoc(userAutomationsCollection(userId), automationDoc as any);

    // If public, also add to registry (for backward compatibility)
    if (isPublic) {
      await addDoc(automationsRegistryCollection, {
        automationId: docRef.id,
        userId,
        creator: {
          userId,
          name: user.name,
          username: user.username,
          photoURL: user.photoURL || undefined
        },
        stats: {
          sharedCount: 0,
          activeUsers: 1
        },
        tags: [category],
        createdAt: serverTimestamp()
      } as any);
    }

    const createdAutomation: Automation = {
      id: docRef.id,
      ...automationDoc
    } as Automation;

    res.status(200).json({
      success: true,
      automation: createdAutomation
    });
  } catch (error) {
    console.error('Error creating automation:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create automation'
    });
  }
}
