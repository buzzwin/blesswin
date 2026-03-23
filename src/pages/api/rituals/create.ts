import type { NextApiRequest, NextApiResponse } from 'next';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import type { RitualDefinition, RitualTimeOfDay, RitualScope, RitualFrequency } from '@lib/types/ritual';
import type { ImpactTag, EffortLevel } from '@lib/types/impact-moment';
import type { AutomationTrigger, AutomationAction } from '@lib/types/automation';
import { ritualsCollection } from '@lib/firebase/collections';

interface CreateRitualRequest {
  userId: string;
  title: string;
  description: string;
  tags: ImpactTag[];
  effortLevel: EffortLevel;
  suggestedTimeOfDay: RitualTimeOfDay;
  durationEstimate: string;
  frequency?: RitualFrequency; // How often this ritual should be done
  scope?: RitualScope; // 'personalized' (private) or 'public'
  storyId?: string;
  storyTitle?: string;
  createdFromMomentId?: string; // If ritual was created from an impact moment
  // Unified model fields (optional for backward compatibility)
  triggers?: AutomationTrigger[]; // If provided, this is an automation
  actions?: AutomationAction[]; // Actions to perform when triggered
  category?: 'wellness' | 'productivity' | 'relationships' | 'health' | 'finance' | 'learning' | 'other';
  isPublic?: boolean; // Shareable in registry
  isJoinable?: boolean; // Others can join
  isCompletable?: boolean; // Can be completed and create impact moments
  isActive?: boolean; // For automations with triggers
  conversationHistory?: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
  }>;
}

interface CreateRitualResponse {
  success: boolean;
  ritualId?: string;
  error?: string;
}

// User custom rituals collection
const userCustomRitualsCollection = (userId: string) => 
  collection(db, 'users', userId, 'custom_rituals');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateRitualResponse>
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
      tags, 
      effortLevel, 
      suggestedTimeOfDay, 
      durationEstimate, 
      frequency, 
      scope, 
      storyId, 
      storyTitle, 
      createdFromMomentId,
      triggers,
      actions,
      category,
      isPublic,
      isJoinable,
      isCompletable,
      isActive,
      conversationHistory
    } = req.body as CreateRitualRequest;

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

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      res.status(400).json({ success: false, error: 'At least one tag is required' });
      return;
    }

    const validTags = ['mind', 'body', 'relationships', 'nature', 'community', 'chores'];
    if (!tags.every((tag) => validTags.includes(tag))) {
      res.status(400).json({ success: false, error: 'Invalid tag(s)' });
      return;
    }

    if (!effortLevel || !['tiny', 'medium', 'deep'].includes(effortLevel)) {
      res.status(400).json({ success: false, error: 'Valid effort level is required' });
      return;
    }

    // Determine if this is an automation (has triggers) or manual ritual
    const hasTriggers = Array.isArray(triggers) && triggers.length > 0;
    const isAutomation = hasTriggers;

    // Validate scope - use provided scope or determine from isPublic/isJoinable
    let ritualScope: RitualScope = scope || 'personalized';
    if (isPublic !== undefined) {
      ritualScope = isPublic ? 'public' : 'personalized';
    } else if (isJoinable !== undefined) {
      ritualScope = isJoinable ? 'public' : 'personalized';
    }

    // Create prefillTemplate, ensuring it's under 280 characters
    const fullPrefillTemplate = `Completed ${isAutomation ? 'automation' : 'ritual'}: ${title.trim()}\n\n${description.trim()}`;
    const prefillTemplate = fullPrefillTemplate.length > 280 
      ? fullPrefillTemplate.substring(0, 277) + '...'
      : fullPrefillTemplate;

    // Determine social features
    const isCompletableValue = isCompletable !== undefined ? isCompletable : (!isAutomation || (actions?.some(a => a.type === 'ritual') || false));
    const isJoinableValue = isJoinable !== undefined ? isJoinable : (ritualScope === 'public' || ritualScope === 'global');
    const isPublicValue = isPublic !== undefined ? isPublic : (ritualScope === 'public' || ritualScope === 'global');
    const isActiveValue = isActive !== undefined ? isActive : true;

    // Create unified ritual document
    const ritualDoc: Record<string, unknown> = {
      userId,
      title: title.trim(),
      description: description.trim(),
      tags,
      effortLevel,
      scope: ritualScope,
      suggestedTimeOfDay: suggestedTimeOfDay || 'anytime',
      durationEstimate: durationEstimate || '5 minutes',
      prefillTemplate,
      frequency: frequency || 'FREQ=DAILY;INTERVAL=1', // Default to daily if not specified
      // Unified model fields
      triggers: triggers || undefined, // Only include if provided
      actions: actions || undefined, // Only include if provided
      category: category || undefined,
      isPublic: isPublicValue,
      isJoinable: isJoinableValue,
      isCompletable: isCompletableValue,
      isActive: isActiveValue,
      // Metadata
      createdAt: serverTimestamp(),
      usageCount: 0,
      completionRate: 0,
      createdBy: userId,
      fromRealStory: storyId ? true : false,
      storyId: storyId || null,
      storyTitle: storyTitle || null,
      joinedByUsers: [userId], // Creator automatically joins their own ritual
      ...(createdFromMomentId && { createdFromMomentId }),
      ...(conversationHistory && { conversationHistory })
    };

    // Always create in user's custom rituals collection
    const docRef = await addDoc(userCustomRitualsCollection(userId), ritualDoc);

    // If public, also create in main rituals collection for discovery
    if (ritualScope === 'public') {
      const publicRitualDoc = {
        ...ritualDoc,
        sourceRitualId: docRef.id, // Link back to user's copy
        sourceUserId: userId,
        joinedByUsers: [userId] // Creator also joins the public version
      };
      await addDoc(ritualsCollection, publicRitualDoc as any);
    }

    res.status(200).json({
      success: true,
      ritualId: docRef.id
    });
  } catch (error) {
    console.error('Error creating custom ritual:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create ritual'
    });
  }
}

