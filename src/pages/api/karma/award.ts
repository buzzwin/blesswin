/**
 * API endpoint to award karma to a user
 * POST /api/karma/award
 * 
 * Body: {
 *   userId: string;
 *   action: KarmaAction;
 * }
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { awardKarma } from '@lib/utils/karma-calculator';
import type { KarmaAction } from '@lib/types/karma';

interface AwardKarmaRequest {
  userId: string;
  action: KarmaAction;
}

interface AwardKarmaResponse {
  success: boolean;
  karmaPoints?: number;
  karmaBreakdown?: {
    impactMoments: number;
    rituals: number;
    engagement: number;
    chains: number;
    milestones: number;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AwardKarmaResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const { userId, action } = req.body as AwardKarmaRequest;

    // Validation
    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ success: false, error: 'User ID is required' });
      return;
    }

    if (!action || typeof action !== 'string') {
      res.status(400).json({ success: false, error: 'Karma action is required' });
      return;
    }

    // Validate action is a valid KarmaAction
    const validActions: KarmaAction[] = [
      'impact_moment_created',
      'impact_moment_with_mood',
      'impact_moment_from_ritual',
      'ritual_completed_quiet',
      'ritual_completed_shared',
      'comment_created',
      'ripple_received',
      'joined_you_received',
      'joined_you_created',
      'streak_milestone_7',
      'streak_milestone_30',
      'impact_milestone_100',
      'impact_milestone_500'
    ];

    if (!validActions.includes(action)) {
      res.status(400).json({ success: false, error: 'Invalid karma action' });
      return;
    }

    // Award karma
    const result = await awardKarma(userId, action);

    res.status(200).json({
      success: true,
      karmaPoints: result.karmaPoints,
      karmaBreakdown: result.karmaBreakdown
    });
  } catch (error) {
    console.error('Error awarding karma:', error);
    const message = error instanceof Error ? error.message : 'Failed to award karma';
    res.status(500).json({
      success: false,
      error: message
    });
  }
}

