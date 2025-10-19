import { NextApiRequest, NextApiResponse } from 'next';
import { callGeminiAPI, extractJSONFromResponse } from '@lib/api/gemini';

interface GeminiReview {
  id: string;
  title: string;
  mediaType: 'movie' | 'tv';
  tmdbId: string;
  posterPath: string;
  overview: string;
  releaseDate: string;
  voteAverage: number;
  review: string;
  rating: number;
  author: string;
  createdAt: string;
  reason: string;
  culturalImpact: string;
}

interface GeminiReviewsResponse {
  reviews: GeminiReview[];
  source: string;
  generatedAt: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { count = '10' } = req.query;
    const reviewCount = Math.min(parseInt(count as string, 10), 20); // Max 20 reviews

    const prompt = `Generate ${reviewCount} realistic movie and TV show reviews with the following structure:

🎬 Generate realistic reviews for popular shows and movies from 2023-2024

📝 For each review, provide:
1. A real movie/TV show title with actual TMDB ID
2. Realistic poster path (e.g., /abc123.jpg)
3. Genuine overview from TMDB
4. Authentic review text (2-3 sentences)
5. Rating from 1-10
6. Author name (realistic)
7. Release date
8. Cultural impact description
9. Why it's trending

💡 Output Format:
Return ONLY a valid JSON object:

{
  "reviews": [
    {
      "id": "unique-id-1",
      "title": "Real Movie/Show Title",
      "mediaType": "movie" or "tv",
      "tmdbId": "1234567",
      "posterPath": "/real-poster-path.jpg",
      "overview": "Real description from TMDB",
      "releaseDate": "2024",
      "voteAverage": 8.5,
      "review": "This is an amazing show that really captures the essence of...",
      "rating": 9,
      "author": "MovieFan123",
      "createdAt": "2024-01-15T10:30:00Z",
      "reason": "Why this is trending right now",
      "culturalImpact": "How this show is impacting culture"
    }
  ]
}

🚨 CRITICAL REQUIREMENTS:
- Use ONLY REAL titles, TMDB IDs, and poster paths
- Focus on shows from 2023-2024
- Make reviews sound authentic and personal
- Include diverse genres and content types
- Provide realistic author names
- Explain cultural impact and trending reasons

⚠️ NO fake titles or made-up data. Only real, current content.`;

    try {
      const responseText = await callGeminiAPI(prompt, 4000, 0.8);
      const rawResponse = extractJSONFromResponse(responseText);
      
      // Validate the response structure before casting
      if (rawResponse && typeof rawResponse === 'object' && 'reviews' in rawResponse) {
        const parsedResponse = rawResponse as unknown as GeminiReviewsResponse;
        
        if (parsedResponse.reviews && Array.isArray(parsedResponse.reviews)) {
          res.status(200).json({ 
            reviews: parsedResponse.reviews,
            source: 'gemini-llm',
            generatedAt: new Date().toISOString()
          });
        } else {
          throw new Error('Invalid reviews structure from Gemini');
        }
      } else {
        throw new Error('Invalid response structure from Gemini');
      }
    } catch (geminiError) {
      console.error('Gemini API failed:', geminiError);
      
      // Fallback to sample reviews
      const fallbackReviews: GeminiReview[] = [
        {
          id: 'fallback-1',
          title: 'The Bear',
          mediaType: 'tv',
          tmdbId: '131927',
          posterPath: '/yT2eR2nRqTNNdNcUg4T3tIcf8Et.jpg',
          overview: 'Carmy, a young chef from the fine dining world, returns to Chicago to run his family\'s Italian beef sandwich shop.',
          releaseDate: '2022',
          voteAverage: 8.5,
          review: 'Absolutely incredible show! The way it captures the chaos of a kitchen while telling such a heartfelt story is masterful.',
          rating: 9,
          author: 'KitchenCritic',
          createdAt: new Date().toISOString(),
          reason: 'Won multiple Emmys and critical acclaim',
          culturalImpact: 'Revolutionized how we think about restaurant culture'
        },
        {
          id: 'fallback-2',
          title: 'Everything Everywhere All at Once',
          mediaType: 'movie',
          tmdbId: '545611',
          posterPath: '/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg',
          overview: 'A middle-aged Chinese immigrant is swept up in an insane adventure in which she alone can save the multiverse.',
          releaseDate: '2022',
          voteAverage: 8.1,
          review: 'Mind-bending and emotionally resonant. This film redefines what cinema can be.',
          rating: 10,
          author: 'MultiverseMaven',
          createdAt: new Date().toISOString(),
          reason: 'Oscar winner that broke genre boundaries',
          culturalImpact: 'Inspired a new wave of multiverse storytelling'
        }
      ];

      res.status(200).json({ 
        reviews: fallbackReviews,
        source: 'fallback',
        generatedAt: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Gemini reviews API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Gemini reviews',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
