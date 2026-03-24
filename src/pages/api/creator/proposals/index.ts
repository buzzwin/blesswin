import type { NextApiRequest, NextApiResponse } from 'next';
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { requireCreator } from '@lib/creator/auth';
import type { CreatorProposal } from '@lib/types/creator';

type ProposalsResponse = {
  success: boolean;
  proposals?: CreatorProposal[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ProposalsResponse>
): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  const creatorAccess = await requireCreator(req);
  if (!creatorAccess.ok || !creatorAccess.userId) {
    res.status(403).json({ success: false, error: creatorAccess.reason || 'Forbidden' });
    return;
  }

  try {
    const status = typeof req.query.status === 'string' ? req.query.status : 'all';

    const base = collection(db, 'creator_proposals');
    const q = status && status !== 'all'
      ? query(base, where('status', '==', status), orderBy('createdAt', 'desc'), limit(100))
      : query(base, orderBy('createdAt', 'desc'), limit(100));

    const snapshot = await getDocs(q);
    const proposals = snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as Omit<CreatorProposal, 'id'> & { createdAt?: Timestamp };
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt || new Date()
      } as CreatorProposal;
    });

    res.status(200).json({ success: true, proposals });
  } catch (error) {
    console.error('[creator/proposals]', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list proposals'
    });
  }
}
