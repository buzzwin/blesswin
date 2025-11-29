import type { NextApiRequest, NextApiResponse } from 'next';
import { query, where, getDocs } from 'firebase/firestore';
import { userStoryBookmarksCollection } from '@lib/firebase/collections';

interface CheckBookmarkRequest {
  userId: string;
  storyId: string;
}

interface CheckBookmarkResponse {
  success: boolean;
  bookmarked: boolean;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CheckBookmarkResponse>
): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ success: false, bookmarked: false, error: 'Method not allowed' });
    return;
  }

  try {
    const { userId, storyId } = req.query as unknown as CheckBookmarkRequest;

    if (!userId || typeof userId !== 'string') {
      res.status(401).json({ success: false, bookmarked: false, error: 'User ID required' });
      return;
    }

    if (!storyId || typeof storyId !== 'string') {
      res.status(400).json({ success: false, bookmarked: false, error: 'Story ID is required' });
      return;
    }

    const bookmarksRef = userStoryBookmarksCollection(userId);
    const bookmarkQuery = query(
      bookmarksRef,
      where('storyId', '==', storyId)
    );
    const snapshot = await getDocs(bookmarkQuery);

    res.status(200).json({
      success: true,
      bookmarked: !snapshot.empty
    });
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    res.status(500).json({
      success: false,
      bookmarked: false,
      error: error instanceof Error ? error.message : 'Failed to check bookmark status'
    });
  }
}

