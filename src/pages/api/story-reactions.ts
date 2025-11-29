import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { storyReactionsCollection } from '@lib/firebase/collections';
import { awardKarma } from '@lib/utils/karma-calculator';
import type { StoryReactionType } from '@lib/types/story-reaction';

interface StoryReactionRequest {
  storyId: string;
  userId: string;
  reactionType: StoryReactionType;
}

interface StoryReactionResponse {
  success: boolean;
  reactionCount?: number;
  error?: string;
}

// Generate a document ID from story title (consistent identifier)
function getStoryReactionDocId(storyId: string): string {
  // Use a hash or sanitized version of the story title
  // For now, we'll use a simple hash
  return storyId.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().substring(0, 50);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StoryReactionResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const { storyId, userId, reactionType } = req.body as StoryReactionRequest;

    if (!userId || typeof userId !== 'string') {
      res.status(401).json({ success: false, error: 'Unauthorized. User ID required.' });
      return;
    }

    if (!storyId || typeof storyId !== 'string') {
      res.status(400).json({ success: false, error: 'Story ID is required' });
      return;
    }

    const validReactionTypes: StoryReactionType[] = ['inspired', 'want_to_try', 'sharing', 'matters_to_me'];
    if (!reactionType || !validReactionTypes.includes(reactionType)) {
      res.status(400).json({ success: false, error: 'Valid reaction type is required' });
      return;
    }

    const docId = getStoryReactionDocId(storyId);
    const reactionDocRef = doc(storyReactionsCollection, docId);
    const reactionDoc = await getDoc(reactionDocRef);

    let currentReactions: {
      inspired: string[];
      want_to_try: string[];
      sharing: string[];
      matters_to_me: string[];
      reactionCount: number;
    };

    if (reactionDoc.exists()) {
      const data = reactionDoc.data();
      currentReactions = {
        inspired: data.inspired || [],
        want_to_try: data.want_to_try || [],
        sharing: data.sharing || [],
        matters_to_me: data.matters_to_me || [],
        reactionCount: data.reactionCount || 0
      };
    } else {
      // Initialize new reaction document
      currentReactions = {
        inspired: [],
        want_to_try: [],
        sharing: [],
        matters_to_me: [],
        reactionCount: 0
      };
    }

    // Check if user has already reacted with this type
    const currentReactionUsers = currentReactions[reactionType] || [];
    const hasReacted = currentReactionUsers.includes(userId);

    // Check if user has reacted with a different type
    const allReactionTypes: StoryReactionType[] = ['inspired', 'want_to_try', 'sharing', 'matters_to_me'];
    let wasReactedElsewhere = false;
    for (const type of allReactionTypes) {
      if (type !== reactionType && currentReactions[type]?.includes(userId)) {
        wasReactedElsewhere = true;
        // Remove from other reaction type
        currentReactions[type] = currentReactions[type].filter(id => id !== userId);
      }
    }

    if (hasReacted) {
      // Remove reaction
      currentReactions[reactionType] = currentReactions[reactionType].filter(id => id !== userId);
      currentReactions.reactionCount = Math.max(0, currentReactions.reactionCount - 1);

      await updateDoc(reactionDocRef, {
        [reactionType]: currentReactions[reactionType],
        reactionCount: currentReactions.reactionCount,
        updatedAt: serverTimestamp()
      });

      res.status(200).json({
        success: true,
        reactionCount: currentReactions.reactionCount
      });
    } else {
      // Add reaction
      currentReactions[reactionType].push(userId);
      if (!wasReactedElsewhere) {
        currentReactions.reactionCount += 1;
      }

      const updateData: {
        storyId: string;
        [key: string]: unknown;
        reactionCount: number;
        updatedAt: ReturnType<typeof serverTimestamp>;
      } = {
        storyId,
        [reactionType]: currentReactions[reactionType],
        reactionCount: currentReactions.reactionCount,
        updatedAt: serverTimestamp()
      };

      // Update other reaction types if user switched
      if (wasReactedElsewhere) {
        for (const type of allReactionTypes) {
          if (type !== reactionType) {
            updateData[type] = currentReactions[type];
          }
        }
      }

      if (reactionDoc.exists()) {
        await updateDoc(reactionDocRef, updateData as any);
      } else {
        await setDoc(reactionDocRef, {
          ...updateData,
          createdAt: serverTimestamp()
        } as any);
      }

      // Award karma for reacting to stories (+2 points, similar to ripple_received)
      try {
        await awardKarma(userId, 'ripple_received'); // Reuse ripple_received for story reactions
      } catch (karmaError) {
        console.error('Error awarding karma for story reaction:', karmaError);
        // Don't fail the reaction if karma fails
      }

      res.status(200).json({
        success: true,
        reactionCount: currentReactions.reactionCount
      });
    }
  } catch (error) {
    console.error('Error handling story reaction:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process reaction'
    });
  }
}

