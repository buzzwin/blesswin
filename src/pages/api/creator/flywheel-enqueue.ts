import type { NextApiRequest, NextApiResponse } from 'next';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { buildProposalFromAgent } from '@lib/creator/agents';
import { hasCreatorSecret, promptHash } from '@lib/creator/auth';

type EnqueueResponse = {
  success: boolean;
  created?: string[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EnqueueResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  if (!hasCreatorSecret(req)) {
    res.status(403).json({ success: false, error: 'Invalid creator secret' });
    return;
  }

  try {
    const userId =
      typeof req.body?.userId === 'string' && req.body.userId.trim()
        ? req.body.userId.trim()
        : 'system';

    const topic =
      typeof req.body?.topic === 'string' && req.body.topic.trim()
        ? req.body.topic.trim()
        : 'weekly creator workflow insights';

    const research = await buildProposalFromAgent({
      agent: 'research',
      input: topic,
      createdBy: userId,
      source: 'cron',
      promptHash: promptHash(topic)
    });

    const researchRef = await addDoc(collection(db, 'creator_proposals'), {
      ...research,
      createdAt: serverTimestamp()
    });

    const content = await buildProposalFromAgent({
      agent: 'content',
      input: `${research.title}\n\n${research.summary}`,
      linkedProposalId: researchRef.id,
      createdBy: userId,
      source: 'cron',
      promptHash: promptHash(`${research.title}:${research.summary}`)
    });

    const contentRef = await addDoc(collection(db, 'creator_proposals'), {
      ...content,
      createdAt: serverTimestamp()
    });

    res.status(200).json({
      success: true,
      created: [researchRef.id, contentRef.id]
    });
  } catch (error) {
    console.error('[creator/flywheel-enqueue]', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to enqueue flywheel'
    });
  }
}
