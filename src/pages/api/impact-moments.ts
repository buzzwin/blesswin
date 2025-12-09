import type { NextApiRequest, NextApiResponse } from 'next';
import { addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { impactMomentsCollection } from '@lib/firebase/collections';
import type { ImpactMoment } from '@lib/types/impact-moment';
import { awardKarma } from '@lib/utils/karma-calculator';

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
  fromRealStory?: boolean;
  storyId?: string;
  storyTitle?: string;
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
    const { text, tags, effortLevel, moodCheckIn, images, videoUrl, userId, fromDailyRitual, ritualId, ritualTitle, fromRealStory, storyId, storyTitle } = req.body as CreateImpactMomentRequest;

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

    const validTags = ['mind', 'body', 'relationships', 'nature', 'community', 'chores'];
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
    
    // Add story-related fields if provided
    if (fromRealStory !== undefined) {
      impactMomentData.fromRealStory = fromRealStory;
    }
    if (storyId !== undefined) {
      impactMomentData.storyId = storyId;
    }
    if (storyTitle !== undefined) {
      impactMomentData.storyTitle = storyTitle;
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

    // Award karma for creating impact moment
    try {
      // Determine which karma action to award
      // Story-inspired moments get bonus karma (same as ritual-inspired)
      let karmaAction: 'impact_moment_created' | 'impact_moment_with_mood' | 'impact_moment_from_ritual';
      
      if (fromDailyRitual && ritualId) {
        karmaAction = 'impact_moment_from_ritual';
      } else if (moodCheckIn) {
        karmaAction = 'impact_moment_with_mood';
      } else {
        karmaAction = 'impact_moment_created';
      }
      
      // Award bonus karma for story-inspired moments (same as ritual bonus)
      if (fromRealStory && storyId) {
        karmaAction = 'impact_moment_from_ritual'; // Use same bonus as ritual-inspired
      }

      await awardKarma(userId, karmaAction);

      // Check for impact moment milestones
      const userMomentsQuery = query(
        impactMomentsCollection,
        where('createdBy', '==', userId)
      );
      const userMomentsSnapshot = await getDocs(userMomentsQuery);
      const totalMoments = userMomentsSnapshot.size;

      // Award milestone bonuses
      if (totalMoments === 100) {
        await awardKarma(userId, 'impact_milestone_100');
      } else if (totalMoments === 500) {
        await awardKarma(userId, 'impact_milestone_500');
      }
    } catch (karmaError) {
      // Log karma error but don't fail the request
      console.error('Error awarding karma for impact moment:', karmaError);
    }

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

