import type { NextApiRequest, NextApiResponse } from 'next';
import { getDoc, addDoc, getDocs, query, where, collection, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { ritualsCollection } from '@lib/firebase/collections';

interface InviteRequest {
  userId: string;
  ritualId: string;
  inviteeEmail?: string;
}

interface InviteResponse {
  success: boolean;
  inviteLink: string;
  inviteId?: string;
  error?: string;
}

interface TrackInviteRequest {
  inviteId: string;
  userId: string; // User who joined via invite
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<InviteResponse | { success: boolean; error?: string }>
): Promise<void> {
  if (req.method === 'POST') {
    try {
      const { userId, ritualId, inviteeEmail } = req.body as InviteRequest;

      if (!userId || !ritualId) {
        res.status(400).json({ success: false, error: 'User ID and Ritual ID are required' });
        return;
      }

      // Verify ritual exists
      const ritualDoc = await getDoc(doc(ritualsCollection, ritualId));
      if (!ritualDoc.exists()) {
        res.status(404).json({ success: false, error: 'Ritual not found' });
        return;
      }

      // Generate invite link
      const inviteId = `${userId}_${ritualId}_${Date.now()}`;
      const inviteLink = `https://buzzwin.com/rituals/${ritualId}?invite=${inviteId}`;

      // Store invite record
      const invitesRef = collection(db, 'ritual_invites');
      await addDoc(invitesRef, {
        userId,
        ritualId,
        inviteId,
        inviteeEmail: inviteeEmail || null,
        createdAt: serverTimestamp(),
        joinedCount: 0
      });

      res.status(200).json({
        success: true,
        inviteLink,
        inviteId
      });
    } catch (error) {
      console.error('Error creating invite:', error);
      res.status(500).json({ success: false, error: 'Failed to create invite' });
    }
  } else if (req.method === 'PATCH') {
    // Track when someone joins via invite
    try {
      const { inviteId, userId } = req.body as TrackInviteRequest;

      if (!inviteId || !userId) {
        res.status(400).json({ success: false, error: 'Invite ID and User ID are required' });
        return;
      }

      // Find invite record
      const invitesRef = collection(db, 'ritual_invites');
      const invitesQuery = query(invitesRef, where('inviteId', '==', inviteId));
      const snapshot = await getDocs(invitesQuery);

      if (snapshot.empty) {
        res.status(404).json({ success: false, error: 'Invite not found' });
        return;
      }

      const inviteDoc = snapshot.docs[0];
      const inviteData = inviteDoc.data();

      // Update joined count
      await updateDoc(inviteDoc.ref, {
        joinedCount: (inviteData.joinedCount || 0) + 1,
        lastJoinedAt: serverTimestamp(),
        lastJoinedBy: userId
      });

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error tracking invite:', error);
      res.status(500).json({ success: false, error: 'Failed to track invite' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'PATCH']);
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

