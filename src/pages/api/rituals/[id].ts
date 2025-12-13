import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { collection } from 'firebase/firestore';
import type { RitualDefinition, RitualTimeOfDay, RitualScope } from '@lib/types/ritual';
import type { ImpactTag, EffortLevel } from '@lib/types/impact-moment';
import { ritualsCollection } from '@lib/firebase/collections';
import { query, where, getDocs, addDoc, deleteDoc as firestoreDeleteDoc } from 'firebase/firestore';

interface UpdateRitualRequest {
  userId: string;
  title: string;
  description: string;
  tags: ImpactTag[];
  effortLevel: EffortLevel;
  suggestedTimeOfDay: RitualTimeOfDay;
  durationEstimate: string;
  scope?: RitualScope;
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
      const { title, description, tags, effortLevel, suggestedTimeOfDay, durationEstimate, scope } = req.body as UpdateRitualRequest;

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

      const validTags = ['mind', 'body', 'relationships', 'nature', 'community', 'chores'];
      if (!tags.every((tag) => validTags.includes(tag))) {
        res.status(400).json({ success: false, error: 'Invalid tag(s)' });
        return;
      }

      if (!effortLevel || !['tiny', 'medium', 'deep'].includes(effortLevel)) {
        res.status(400).json({ success: false, error: 'Valid effort level is required' });
        return;
      }

      const oldScope = ritualData.scope as RitualScope || 'personalized';
      const newScope: RitualScope = scope === 'public' ? 'public' : 'personalized';

      // Create prefillTemplate, ensuring it's under 280 characters
      const fullPrefillTemplate = `Completed ritual: ${title.trim()}\n\n${description.trim()}`;
      const prefillTemplate = fullPrefillTemplate.length > 280 
        ? fullPrefillTemplate.substring(0, 277) + '...'
        : fullPrefillTemplate;

      const updateData = {
        title: title.trim(),
        description: description.trim(),
        tags,
        effortLevel,
        scope: newScope,
        suggestedTimeOfDay: suggestedTimeOfDay || 'anytime',
        durationEstimate: durationEstimate || '5 minutes',
        prefillTemplate,
        updatedAt: serverTimestamp()
      };

      await updateDoc(ritualDocRef, updateData as any);

      // Handle scope changes - sync with public rituals collection
      if (oldScope !== newScope) {
        if (newScope === 'public') {
          // Add to public collection
          const publicRitualDoc = {
            ...updateData,
            sourceRitualId: id,
            sourceUserId: userId,
            createdAt: ritualData.createdAt || serverTimestamp(),
            usageCount: ritualData.usageCount || 0,
            completionRate: ritualData.completionRate || 0,
            joinedByUsers: ritualData.joinedByUsers || [],
            createdBy: userId
          };
          await addDoc(ritualsCollection, publicRitualDoc as any);
        } else if (oldScope === 'public') {
          // Remove from public collection (find by sourceRitualId)
          const publicRitualsQuery = query(
            ritualsCollection,
            where('sourceRitualId', '==', id),
            where('sourceUserId', '==', userId)
          );
          const publicRitualsSnapshot = await getDocs(publicRitualsQuery);
          for (const publicRitualDoc of publicRitualsSnapshot.docs) {
            await firestoreDeleteDoc(publicRitualDoc.ref);
          }
        }
      } else if (newScope === 'public') {
        // Update existing public ritual if it exists
        const publicRitualsQuery = query(
          ritualsCollection,
          where('sourceRitualId', '==', id),
          where('sourceUserId', '==', userId)
        );
        const publicRitualsSnapshot = await getDocs(publicRitualsQuery);
        if (!publicRitualsSnapshot.empty) {
          const publicRitualDoc = publicRitualsSnapshot.docs[0];
          await updateDoc(publicRitualDoc.ref, {
            ...updateData,
            updatedAt: serverTimestamp()
          } as any);
        } else {
          // Create if it doesn't exist
          const publicRitualDoc = {
            ...updateData,
            sourceRitualId: id,
            sourceUserId: userId,
            createdAt: ritualData.createdAt || serverTimestamp(),
            usageCount: ritualData.usageCount || 0,
            completionRate: ritualData.completionRate || 0,
            joinedByUsers: ritualData.joinedByUsers || [],
            createdBy: userId
          };
          await addDoc(ritualsCollection, publicRitualDoc as any);
        }
      }

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
      const ritualData = ritualDoc.data();
      const ritualScope = ritualData.scope as RitualScope || 'personalized';

      // Delete from custom_rituals
      await deleteDoc(ritualDocRef);

      // If it was public, also delete from main rituals collection
      if (ritualScope === 'public') {
        const publicRitualsQuery = query(
          ritualsCollection,
          where('sourceRitualId', '==', id),
          where('sourceUserId', '==', userId)
        );
        const publicRitualsSnapshot = await getDocs(publicRitualsQuery);
        for (const publicRitualDoc of publicRitualsSnapshot.docs) {
          await firestoreDeleteDoc(publicRitualDoc.ref);
        }
      }

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

