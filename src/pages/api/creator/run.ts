import type { NextApiRequest, NextApiResponse } from 'next';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { buildProposalFromAgent } from '@lib/creator/agents';
import { hasCreatorSecret, promptHash, requireCreator } from '@lib/creator/auth';
import type { CreatorRunRequest } from '@lib/types/creator';

type RunResponse = {
  success: boolean;
  id?: string;
  proposal?: Record<string, unknown>;
  error?: string;
};

const ALLOWED_AGENTS = ['research', 'content', 'growth', 'monetization'];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RunResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  const secretAccess = hasCreatorSecret(req);
  const creatorAccess = await requireCreator(req);
  if (!secretAccess && !creatorAccess.ok) {
    res.status(403).json({ success: false, error: creatorAccess.reason || 'Forbidden' });
    return;
  }

  try {
    const {
      userId,
      agent,
      input,
      linkedProposalId,
      source = secretAccess ? 'cron' : 'manual'
    } = req.body as CreatorRunRequest;

    if (!userId || !agent || !input) {
      res.status(400).json({ success: false, error: 'userId, agent, input required' });
      return;
    }

    if (!ALLOWED_AGENTS.includes(agent)) {
      res.status(400).json({ success: false, error: 'Unsupported agent' });
      return;
    }

    const proposal = await buildProposalFromAgent({
      agent,
      input: input.trim(),
      createdBy: userId,
      linkedProposalId,
      source,
      promptHash: promptHash(input),
      toolCallSummary: agent === 'research'
        ? 'MCP-style allowlist: web.search, web.fetch, analytics.export, internal.docs.search'
        : undefined
    });

    const ref = await addDoc(collection(db, 'creator_proposals'), {
      ...proposal,
      createdAt: serverTimestamp()
    });

    res.status(200).json({
      success: true,
      id: ref.id,
      proposal: {
        id: ref.id,
        ...proposal
      }
    });
  } catch (error) {
    console.error('[creator/run]', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to run creator agent'
    });
  }
}
