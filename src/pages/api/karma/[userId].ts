/**
 * API endpoint to get user's karma points and breakdown
 * GET /api/karma/[userId]
 * 
 * Public endpoint for profile display
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserKarma } from '@lib/utils/karma-calculator';

interface GetKarmaResponse {
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
  res: NextApiResponse<GetKarmaResponse>
): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ success: false, error: 'User ID is required' });
      return;
    }

    // Get user karma
    const karma = await getUserKarma(userId);

    res.status(200).json({
      success: true,
      karmaPoints: karma.karmaPoints,
      karmaBreakdown: karma.karmaBreakdown
    });
  } catch (error) {
    console.error('Error getting user karma:', error);
    const message = error instanceof Error ? error.message : 'Failed to get user karma';
    
    // Return 404 if user not found, otherwise 500
    if (message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: message
      });
    } else {
      res.status(500).json({
        success: false,
        error: message
      });
    }
  }
}

