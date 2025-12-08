import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { impactMomentsCollection } from '@lib/firebase/collections';
import type { ImpactMoment } from '@lib/types/impact-moment';

interface UpdateImpactMomentRequest {
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
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'Ritual share ID is required' });
    return;
  }

  const momentDocRef = doc(impactMomentsCollection, id);
  const momentDoc = await getDoc(momentDocRef);

  if (!momentDoc.exists()) {
    res.status(404).json({ error: 'Ritual share not found' });
    return;
  }

  const momentData = momentDoc.data();

  if (req.method === 'PUT' || req.method === 'PATCH') {
    // Update impact moment
    try {
      const { text, tags, effortLevel, moodCheckIn, images, videoUrl, userId } = req.body as UpdateImpactMomentRequest;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized. User ID required.' });
        return;
      }

      // Verify ownership
      if (momentData.createdBy !== userId) {
        res.status(403).json({ error: 'Forbidden. You can only edit your own ritual shares.' });
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

      // Build update object
      const updateData: Record<string, unknown> = {
        text: text.trim(),
        tags: tags as ImpactMoment['tags'],
        effortLevel: effortLevel as ImpactMoment['effortLevel'],
        updatedAt: serverTimestamp()
      };

      // Only update optional fields if provided
      if (moodCheckIn !== undefined) {
        updateData.moodCheckIn = moodCheckIn;
      } else if (moodCheckIn === null) {
        // Allow removing mood check-in by passing null
        updateData.moodCheckIn = null;
      }

      if (images !== undefined) {
        updateData.images = images;
      }

      if (videoUrl !== undefined) {
        updateData.videoUrl = videoUrl;
      }

      await updateDoc(momentDocRef, updateData);

      res.status(200).json({
        success: true,
        message: 'Ritual share updated successfully'
      });
    } catch (error) {
      console.error('Error updating ritual share:', error);
      res.status(500).json({
        error: 'Failed to update ritual share',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else if (req.method === 'DELETE') {
    // Delete impact moment
    try {
      const { userId } = req.body as { userId: string };

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized. User ID required.' });
        return;
      }

      // Verify ownership
      if (momentData.createdBy !== userId) {
        res.status(403).json({ error: 'Forbidden. You can only delete your own ritual shares.' });
        return;
      }

      await deleteDoc(momentDocRef);

      res.status(200).json({
        success: true,
        message: 'Ritual share deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting ritual share:', error);
        res.status(500).json({
          error: 'Failed to delete ritual share',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'PATCH', 'DELETE']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}

