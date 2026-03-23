import type { NextApiRequest, NextApiResponse } from 'next';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@lib/firebase/app';

type PlanRow = {
  id: string;
  title: string;
  content: string;
  createdAt: unknown;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ plans: PlanRow[]; error?: string }>
): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ plans: [], error: 'Method not allowed' });
    return;
  }

  try {
    const userId = req.query.userId;
    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ plans: [], error: 'userId required' });
      return;
    }

    const q = query(
      collection(db, 'users', userId, 'saved_plans'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const plans: PlanRow[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: typeof data.title === 'string' ? data.title : '',
        content: typeof data.content === 'string' ? data.content : '',
        createdAt: data.createdAt
      };
    });

    res.status(200).json({ plans });
  } catch (error) {
    console.error('[saved-plans]', error);
    res.status(500).json({
      plans: [],
      error: error instanceof Error ? error.message : 'Failed to load plans'
    });
  }
}
