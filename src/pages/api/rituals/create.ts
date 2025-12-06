import type { NextApiRequest, NextApiResponse } from 'next';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import type { RitualDefinition, RitualTimeOfDay } from '@lib/types/ritual';
import type { ImpactTag, EffortLevel } from '@lib/types/impact-moment';

interface CreateRitualRequest {
  userId: string;
  title: string;
  description: string;
  tags: ImpactTag[];
  effortLevel: EffortLevel;
  suggestedTimeOfDay: RitualTimeOfDay;
  durationEstimate: string;
  storyId?: string;
  storyTitle?: string;
  createdFromMomentId?: string; // If ritual was created from an impact moment
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
    const { userId, title, description, tags, effortLevel, suggestedTimeOfDay, durationEstimate, storyId, storyTitle, createdFromMomentId } = req.body as CreateRitualRequest;

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

    const validTags = ['mind', 'body', 'relationships', 'nature', 'community'];
    if (!tags.every((tag) => validTags.includes(tag))) {
      res.status(400).json({ success: false, error: 'Invalid tag(s)' });
      return;
    }

    if (!effortLevel || !['tiny', 'medium', 'deep'].includes(effortLevel)) {
      res.status(400).json({ success: false, error: 'Valid effort level is required' });
      return;
    }

    // Create custom ritual document
    const ritualDoc: Record<string, unknown> = {
      title: title.trim(),
      description: description.trim(),
      tags,
      effortLevel,
      scope: 'personalized', // User-created rituals are personalized
      suggestedTimeOfDay: suggestedTimeOfDay || 'anytime',
      durationEstimate: durationEstimate || '5 minutes',
      prefillTemplate: `Completed ritual: ${title.trim()}\n\n${description.trim()}`,
      createdAt: serverTimestamp(),
      usageCount: 0,
      completionRate: 0,
      createdBy: userId,
      fromRealStory: storyId ? true : false,
      storyId: storyId || null,
      storyTitle: storyTitle || null,
      joinedByUsers: [], // Initialize empty
      ...(createdFromMomentId && { createdFromMomentId })
    };

    const docRef = await addDoc(userCustomRitualsCollection(userId), ritualDoc);

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

