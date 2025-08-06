import { callGeminiAPI, extractJSONFromResponse } from '@lib/api/gemini';
import type { NextApiRequest, NextApiResponse } from 'next';

interface NetworkTrend {
  network: string;
  type: 'streaming' | 'cable' | 'broadcast';
  trendingShows: Array<{
    title: string;
    tmdbId: string;
    mediaType: 'movie' | 'tv';
    posterPath: string;
    overview: string;
    releaseDate: string;
    voteAverage?: number;
    reason: string;
    culturalImpact: string;
  }>;
  networkInsight: string;
  overallTrend: string;
}

interface GeminiNetworkResponse {
  networks: NetworkTrend[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });

    const prompt = `You are a TV and streaming industry expert specializing in American popular culture and current trends.

Your task is to provide a comprehensive analysis of trending shows by network/platform for ${currentMonth} ${currentYear}.

🎯 Focus on MAJOR NETWORKS AND PLATFORMS:
- Netflix
- HBO Max/Max
- Hulu
- Disney+
- Prime Video
- Apple TV+
- Peacock
- Paramount+
- AMC
- FX
- ABC, CBS, NBC, FOX (for broadcast)

📺 For each network, provide:
1. 3-5 REAL trending shows with actual TMDB IDs
2. Cultural impact and why they're popular
3. Network-specific insights
4. Overall trend analysis

💡 Output Format:
Return ONLY a valid JSON object:

{
  "networks": [
    {
      "network": "Netflix",
      "type": "streaming",
      "trendingShows": [
        {
          "title": "Real Show Title",
          "tmdbId": "1234567",
          "mediaType": "tv",
          "posterPath": "/real-poster-path.jpg",
          "overview": "Real description from TMDB",
          "releaseDate": "2024",
          "voteAverage": 8.5,
          "reason": "Why this show is trending on this network",
          "culturalImpact": "How this show is impacting culture"
        }
      ],
      "networkInsight": "What's driving Netflix's current success",
      "overallTrend": "Netflix's overall strategy and market position"
    }
  ]
}

🚨 CRITICAL REQUIREMENTS:
- Use ONLY REAL TMDB IDs, titles, and poster paths
- Focus on shows from ${currentYear - 1}, ${currentYear}, or ${currentYear + 1}
- Provide insightful cultural analysis
- Explain why shows are trending on specific networks
- Include current events and cultural context

⚠️ NO fake titles or made-up data. Only real, current content.`;

    try {
      const responseText = await callGeminiAPI(prompt, 3000, 0.8);
      const rawResponse = extractJSONFromResponse(responseText);
      
      // Validate the response structure before casting
      if (rawResponse && typeof rawResponse === 'object' && 'networks' in rawResponse) {
        const parsedResponse = rawResponse as unknown as GeminiNetworkResponse;
        
        if (parsedResponse.networks && Array.isArray(parsedResponse.networks)) {
          res.status(200).json({ 
            networks: parsedResponse.networks,
            source: 'gemini-llm',
            generatedAt: new Date().toISOString()
          });
        } else {
          throw new Error('Invalid response structure from Gemini');
        }
      } else {
        throw new Error('Invalid response structure from Gemini');
      }
    } catch (geminiError) {
      console.error('Gemini API failed:', geminiError);
      
      // Fallback to basic network data
      const fallbackNetworks: NetworkTrend[] = [
        {
          network: 'Netflix',
          type: 'streaming',
          trendingShows: [],
          networkInsight: 'Netflix continues to dominate with original content and international series.',
          overallTrend: 'Focusing on diverse storytelling and global content.'
        },
        {
          network: 'HBO Max',
          type: 'streaming',
          trendingShows: [],
          networkInsight: 'Premium content strategy with high-quality dramas and comedies.',
          overallTrend: 'Maintaining prestige television reputation.'
        },
        {
          network: 'Disney+',
          type: 'streaming',
          trendingShows: [],
          networkInsight: 'Family-friendly content with strong IP-driven programming.',
          overallTrend: 'Expanding Marvel and Star Wars universes.'
        }
      ];

      res.status(200).json({ 
        networks: fallbackNetworks,
        source: 'fallback',
        generatedAt: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Network trends API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch network trends',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 