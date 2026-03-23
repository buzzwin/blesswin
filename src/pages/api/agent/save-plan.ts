import type { NextApiRequest, NextApiResponse } from 'next';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@lib/firebase/app';

interface SavePlanBody {
  userId: string;
  title: string;
  content: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ success: boolean; id?: string; error?: string }>
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const { userId, title, content } = req.body as SavePlanBody;

    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ success: false, error: 'User ID required' });
      return;
    }
    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ success: false, error: 'Title required' });
      return;
    }
    if (!content || typeof content !== 'string' || !content.trim()) {
      res.status(400).json({ success: false, error: 'Content required' });
      return;
    }

    const ref = await addDoc(collection(db, 'users', userId, 'saved_plans'), {
      userId,
      title: title.trim().slice(0, 200),
      content: content.trim().slice(0, 20000),
      createdAt: serverTimestamp()
    });

    res.status(200).json({ success: true, id: ref.id });
  } catch (error) {
    console.error('[save-plan]', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save plan'
    });
  }
}
