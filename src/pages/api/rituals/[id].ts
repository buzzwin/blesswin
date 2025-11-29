import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { collection } from 'firebase/firestore';
import type { RitualDefinition, RitualTimeOfDay } from '@lib/types/ritual';
import type { ImpactTag, EffortLevel } from '@lib/types/impact-moment';

interface UpdateRitualRequest {
  userId: string;
  title: string;
  description: string;
  tags: ImpactTag[];
  effortLevel: EffortLevel;
  suggestedTimeOfDay: RitualTimeOfDay;
  durationEstimate: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    res.status(400).json({ success: false, error: 'Ritual ID is required' });
    return;
  }

  const userCustomRitualsCollection = (userId: string) => 
    collection(db, 'users', userId, 'custom_rituals');
  
  // We need to find which user owns this ritual
  // For now, we'll require userId in the request body
  const { userId } = req.body as { userId: string };

  if (!userId || typeof userId !== 'string') {
    res.status(401).json({ success: false, error: 'Unauthorized. User ID required.' });
    return;
  }

  const ritualDocRef = doc(userCustomRitualsCollection(userId), id);
  const ritualDoc = await getDoc(ritualDocRef);

  if (!ritualDoc.exists()) {
    res.status(404).json({ success: false, error: 'Ritual not found' });
    return;
  }

  const ritualData = ritualDoc.data();

  // Verify ownership
  if (ritualData.createdBy !== userId) {
    res.status(403).json({ success: false, error: 'Forbidden. You can only edit your own rituals.' });
    return;
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    // Update ritual
    try {
      const { title, description, tags, effortLevel, suggestedTimeOfDay, durationEstimate } = req.body as UpdateRitualRequest;

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

      const updateData = {
        title: title.trim(),
        description: description.trim(),
        tags,
        effortLevel,
        suggestedTimeOfDay: suggestedTimeOfDay || 'anytime',
        durationEstimate: durationEstimate || '5 minutes',
        prefillTemplate: `Completed ritual: ${title.trim()}\n\n${description.trim()}`,
        updatedAt: serverTimestamp()
      };

      await updateDoc(ritualDocRef, updateData as any);

      res.status(200).json({
        success: true,
        message: 'Ritual updated successfully'
      });
    } catch (error) {
      console.error('Error updating ritual:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update ritual',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else if (req.method === 'DELETE') {
    // Delete ritual
    try {
      await deleteDoc(ritualDocRef);

      res.status(200).json({
        success: true,
        message: 'Ritual deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting ritual:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete ritual',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'PATCH', 'DELETE']);
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

