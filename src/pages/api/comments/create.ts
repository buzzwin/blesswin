/**
 * API endpoint to create a comment and award karma
 * POST /api/comments/create
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { impactMomentCommentsCollection, impactMomentsCollection } from '@lib/firebase/collections';
import { awardKarma } from '@lib/utils/karma-calculator';

interface CreateCommentRequest {
  momentId: string;
  text: string;
  userId: string;
}

interface CreateCommentResponse {
  success: boolean;
  commentId?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateCommentResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const { momentId, text, userId } = req.body as CreateCommentRequest;

    // Validation
    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ success: false, error: 'User ID is required' });
      return;
    }

    if (!momentId || typeof momentId !== 'string') {
      res.status(400).json({ success: false, error: 'Moment ID is required' });
      return;
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      res.status(400).json({ success: false, error: 'Comment text is required' });
      return;
    }

    // Verify moment exists
    const momentDoc = await getDoc(doc(impactMomentsCollection, momentId));
    if (!momentDoc.exists()) {
      res.status(404).json({ success: false, error: 'Impact moment not found' });
      return;
    }

    const momentData = momentDoc.data();
    const momentCreatorId = momentData.createdBy;

    // Create comment
    const commentData = {
      text: text.trim(),
      momentId,
      createdBy: userId,
      createdAt: serverTimestamp()
    };

    const commentRef = await addDoc(impactMomentCommentsCollection(momentId), commentData as any);

    // Award karma to comment creator
    try {
      await awardKarma(userId, 'comment_created');
    } catch (karmaError) {
      console.error('Error awarding karma for comment:', karmaError);
      // Don't fail the request if karma fails
    }

    // Award karma to moment creator for receiving engagement
    if (momentCreatorId && momentCreatorId !== userId) {
      try {
        await awardKarma(momentCreatorId, 'ripple_received');
      } catch (karmaError) {
        console.error('Error awarding karma to moment creator:', karmaError);
        // Don't fail the request if karma fails
      }
    }

    res.status(201).json({
      success: true,
      commentId: commentRef.id
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    const message = error instanceof Error ? error.message : 'Failed to create comment';
    res.status(500).json({
      success: false,
      error: message
    });
  }
}

