import { getUserAIRecommendations, getLatestAIRecommendations, getAIRecommendationStats } from '@lib/firebase/utils/recommendations';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, type = 'history', limit = '10' } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const limitCount = parseInt(limit as string, 10);
    
    if (isNaN(limitCount) || limitCount < 1 || limitCount > 50) {
      return res.status(400).json({ error: 'Limit must be between 1 and 50' });
    }

    switch (type) {
      case 'latest': {
        const latestRecommendations = await getLatestAIRecommendations(userId);
        return res.status(200).json({
          recommendations: latestRecommendations,
          type: 'latest'
        });
      }

      case 'stats': {
        const stats = await getAIRecommendationStats(userId);
        return res.status(200).json({
          stats,
          type: 'stats'
        });
      }

      case 'history':
      default: {
        const history = await getUserAIRecommendations(userId, limitCount);
        return res.status(200).json({
          recommendations: history,
          type: 'history',
          count: history.length
        });
      }
    }
  } catch (error) {
    console.error('Error fetching user recommendations:', error);
    
    // Return empty data instead of 500 error for better UX
    const emptyResponse = {
      recommendations: [],
      type: type as string,
      count: 0
    };

    if (type === 'stats') {
      return res.status(200).json({
        stats: {
          totalRecommendations: 0,
          lastRecommendationDate: null,
          mostRecommendedGenres: [],
          totalAnalyses: 0
        },
        type: 'stats'
      });
    }

    return res.status(200).json(emptyResponse);
  }
}
