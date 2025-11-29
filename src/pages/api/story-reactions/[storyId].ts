import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { storyReactionsCollection } from '@lib/firebase/collections';
import type { StoryReactions } from '@lib/types/story-reaction';

interface StoryReactionsResponse {
  success: boolean;
  reactions?: StoryReactions;
  error?: string;
}

// Generate a document ID from story title (consistent identifier)
function getStoryReactionDocId(storyId: string): string {
  return storyId.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().substring(0, 50);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StoryReactionsResponse>
): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const { storyId } = req.query;

    if (!storyId || typeof storyId !== 'string') {
      res.status(400).json({ success: false, error: 'Story ID is required' });
      return;
    }

    const docId = getStoryReactionDocId(storyId);
    const reactionDocRef = doc(storyReactionsCollection, docId);
    const reactionDoc = await getDoc(reactionDocRef);

    if (!reactionDoc.exists()) {
      // Return empty reactions if document doesn't exist
      res.status(200).json({
        success: true,
        reactions: {
          inspired: [],
          want_to_try: [],
          sharing: [],
          matters_to_me: [],
          reactionCount: 0
        }
      });
      return;
    }

    const data = reactionDoc.data();
    const reactions: StoryReactions = {
      inspired: data.inspired || [],
      want_to_try: data.want_to_try || [],
      sharing: data.sharing || [],
      matters_to_me: data.matters_to_me || [],
      reactionCount: data.reactionCount || 0
    };

    res.status(200).json({
      success: true,
      reactions
    });
  } catch (error) {
    console.error('Error fetching story reactions:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch reactions'
    });
  }
}

