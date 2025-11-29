import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc, addDoc, deleteDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { userStoryBookmarksCollection } from '@lib/firebase/collections';
import { awardKarma } from '@lib/utils/karma-calculator';
import type { RealStory } from '@lib/types/real-story';

interface BookmarkStoryRequest {
  userId: string;
  story: RealStory;
  collectionId?: string;
  notes?: string;
}

interface UnbookmarkStoryRequest {
  userId: string;
  storyId: string;
}

interface StoryBookmarkResponse {
  success: boolean;
  bookmarked?: boolean;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StoryBookmarkResponse>
): Promise<void> {
  if (req.method === 'POST') {
    // Bookmark a story
    try {
      const { userId, story, collectionId, notes } = req.body as BookmarkStoryRequest;

      if (!userId || typeof userId !== 'string') {
        res.status(401).json({ success: false, error: 'Unauthorized. User ID required.' });
        return;
      }

      if (!story || !story.title) {
        res.status(400).json({ success: false, error: 'Story data is required' });
        return;
      }

      const bookmarksRef = userStoryBookmarksCollection(userId);
      
      // Check if already bookmarked
      const existingQuery = query(
        bookmarksRef,
        where('storyId', '==', story.title)
      );
      const existingSnapshot = await getDocs(existingQuery);

      if (!existingSnapshot.empty) {
        res.status(200).json({ success: true, bookmarked: true });
        return;
      }

      // Create bookmark
      const bookmarkData: Record<string, unknown> = {
        userId,
        storyId: story.title,
        storyTitle: story.title,
        storyDescription: story.description,
        storyCategory: story.category,
        createdAt: serverTimestamp()
      };
      
      // Only include optional fields if they have values
      if (story.location) {
        bookmarkData.storyLocation = story.location;
      }
      if (story.date) {
        bookmarkData.storyDate = story.date;
      }
      if (story.source) {
        bookmarkData.storySource = story.source;
      }
      if (story.url) {
        bookmarkData.storyUrl = story.url;
      }
      if (collectionId) {
        bookmarkData.collectionId = collectionId;
      }
      if (notes && notes.trim()) {
        bookmarkData.notes = notes.trim();
      }
      
      await addDoc(bookmarksRef, bookmarkData as any);

      // Award karma for bookmarking stories (+3 points)
      try {
        await awardKarma(userId, 'comment_created'); // Reuse comment karma for bookmarking
      } catch (karmaError) {
        console.error('Error awarding karma for story bookmark:', karmaError);
        // Don't fail the bookmark if karma fails
      }

      res.status(201).json({ success: true, bookmarked: true });
    } catch (error) {
      console.error('Error bookmarking story:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to bookmark story'
      });
    }
  } else if (req.method === 'DELETE') {
    // Unbookmark a story
    try {
      const { userId, storyId } = req.body as UnbookmarkStoryRequest;

      if (!userId || typeof userId !== 'string') {
        res.status(401).json({ success: false, error: 'Unauthorized. User ID required.' });
        return;
      }

      if (!storyId || typeof storyId !== 'string') {
        res.status(400).json({ success: false, error: 'Story ID is required' });
        return;
      }

      const bookmarksRef = userStoryBookmarksCollection(userId);
      const existingQuery = query(
        bookmarksRef,
        where('storyId', '==', storyId)
      );
      const existingSnapshot = await getDocs(existingQuery);

      if (existingSnapshot.empty) {
        res.status(200).json({ success: true, bookmarked: false });
        return;
      }

      // Delete bookmark
      const bookmarkDoc = existingSnapshot.docs[0];
      await deleteDoc(doc(bookmarksRef, bookmarkDoc.id));

      res.status(200).json({ success: true, bookmarked: false });
    } catch (error) {
      console.error('Error unbookmarking story:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to unbookmark story'
      });
    }
  } else {
    res.setHeader('Allow', ['POST', 'DELETE']);
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

