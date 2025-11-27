import type { NextApiRequest, NextApiResponse } from 'next';
import { addDoc, serverTimestamp } from 'firebase/firestore';
import { impactMomentsCollection } from '@lib/firebase/collections';
import type { ImpactMoment } from '@lib/types/impact-moment';

interface CreateImpactMomentRequest {
  text: string;
  tags: string[];
  effortLevel: string;
  moodCheckIn?: {
    before: number;
    after: number;
  };
  images?: string[];
  videoUrl?: string;
  userId: string;
  fromDailyRitual?: boolean;
  ritualId?: string;
  ritualTitle?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { text, tags, effortLevel, moodCheckIn, images, videoUrl, userId, fromDailyRitual, ritualId, ritualTitle } = req.body as CreateImpactMomentRequest;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized. User ID required.' });
      return;
    }

    // Validation
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      res.status(400).json({ error: 'Text is required' });
      return;
    }

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      res.status(400).json({ error: 'At least one tag is required' });
      return;
    }

    const validTags = ['mind', 'body', 'relationships', 'nature', 'community'];
    if (!tags.every((tag) => validTags.includes(tag))) {
      res.status(400).json({ error: 'Invalid tag(s)' });
      return;
    }

    if (!effortLevel || !['tiny', 'medium', 'deep'].includes(effortLevel)) {
      res.status(400).json({ error: 'Valid effort level is required' });
      return;
    }

    if (moodCheckIn) {
      if (
        typeof moodCheckIn.before !== 'number' ||
        typeof moodCheckIn.after !== 'number' ||
        moodCheckIn.before < 1 ||
        moodCheckIn.before > 5 ||
        moodCheckIn.after < 1 ||
        moodCheckIn.after > 5
      ) {
        res.status(400).json({ error: 'Mood check-in values must be between 1 and 5' });
        return;
      }
    }

    // Build the data object, excluding undefined fields
    const impactMomentData: Record<string, unknown> = {
      text: text.trim(),
      tags: tags as ImpactMoment['tags'],
      effortLevel: effortLevel as ImpactMoment['effortLevel'],
      createdBy: userId,
      createdAt: serverTimestamp(),
      ripples: {
        inspired: [],
        grateful: [],
        joined_you: [],
        sent_love: []
      },
      rippleCount: 0
    };

    // Add ritual-related fields if provided
    if (fromDailyRitual !== undefined) {
      impactMomentData.fromDailyRitual = fromDailyRitual;
    }
    if (ritualId !== undefined) {
      impactMomentData.ritualId = ritualId;
    }
    if (ritualTitle !== undefined) {
      impactMomentData.ritualTitle = ritualTitle;
    }

    // Only include optional fields if they have values
    if (moodCheckIn) {
      impactMomentData.moodCheckIn = moodCheckIn;
    }
    if (images && images.length > 0) {
      impactMomentData.images = images;
    }
    if (videoUrl) {
      impactMomentData.videoUrl = videoUrl;
    }

    const docRef = await addDoc(impactMomentsCollection, impactMomentData as any);

    res.status(201).json({
      success: true,
      id: docRef.id,
      momentId: docRef.id, // Alias for compatibility
      message: 'Impact moment created successfully'
    });
  } catch (error) {
    console.error('Error creating impact moment:', error);
    res.status(500).json({
      error: 'Failed to create impact moment',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

