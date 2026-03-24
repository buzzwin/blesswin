import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { requireCreator } from '@lib/creator/auth';
import type { CreatorProposalStatus } from '@lib/types/creator';

type UpdateResponse = {
  success: boolean;
  error?: string;
};

const STATUS_SET: CreatorProposalStatus[] = [
  'pending',
  'approved',
  'rejected',
  'edited'
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UpdateResponse>
): Promise<void> {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH']);
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  const creatorAccess = await requireCreator(req);
  if (!creatorAccess.ok || !creatorAccess.userId) {
    res.status(403).json({ success: false, error: creatorAccess.reason || 'Forbidden' });
    return;
  }

  const id = typeof req.query.id === 'string' ? req.query.id : '';
  if (!id) {
    res.status(400).json({ success: false, error: 'Missing id' });
    return;
  }

  const {
    status,
    reviewNotes,
    editedContent
  } = req.body as {
    status?: CreatorProposalStatus;
    reviewNotes?: string;
    editedContent?: string;
  };

  if (!status || !STATUS_SET.includes(status)) {
    res.status(400).json({ success: false, error: 'Invalid status' });
    return;
  }

  try {
    const ref = doc(db, 'creator_proposals', id);
    const exists = await getDoc(ref);
    if (!exists.exists()) {
      res.status(404).json({ success: false, error: 'Proposal not found' });
      return;
    }

    await updateDoc(ref, {
      status,
      reviewNotes: reviewNotes?.trim() || null,
      editedContent: editedContent?.trim() || null,
      reviewedBy: creatorAccess.userId,
      reviewedAt: serverTimestamp()
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('[creator/proposals/:id]', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update proposal'
    });
  }
}
