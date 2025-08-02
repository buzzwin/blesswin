import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserRatings } from '@lib/firebase/utils/rating';

interface RecommendedContent {
  tmdbId: string;
  title: string;
  mediaType: 'movie' | 'tv';
  posterPath: string;
  overview: string;
  releaseDate: string;
  voteAverage: number;
  reason: string;
  confidence: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { userId, count = 20 } = req.body as { userId: string; count?: number };

    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    // Fetch user's ratings
    const ratings = await getUserRatings(userId);

    if (ratings.length === 0) {
      // If no ratings, return popular content
      const popularContent = getPopularContent(count);
      res.status(200).json({ content: popularContent, source: 'popular' });
      return;
    }

    // Prepare data for OpenAI
    const ratingData = ratings.map(rating => ({
      title: rating.title,
      rating: rating.rating,
      mediaType: rating.mediaType,
      overview: rating.overview ?? '',
      releaseDate: rating.releaseDate ?? '',
      voteAverage: rating.voteAverage ?? 0
    }));

    // Call OpenAI API for content recommendations
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a movie and TV show recommendation expert. Based on the user's ratings, suggest content they should rate next.

IMPORTANT: You must respond with ONLY a valid JSON object. No additional text, explanations, or formatting outside the JSON.

The user has rated the following content:
${JSON.stringify(ratingData, null, 2)}

Return a JSON object with this EXACT structure:
{
  "content": [
    {
      "tmdbId": "string (must be a valid TMDB ID)",
      "title": "string (exact movie/show title)",
      "mediaType": "movie" or "tv",
      "posterPath": "string (TMDB poster path starting with /)",
      "overview": "string (brief description)",
      "releaseDate": "string (YYYY-MM-DD format)",
      "voteAverage": number (between 0 and 10),
      "reason": "string (why this content matches their preferences)",
      "confidence": number (between 0.1 and 1.0)
    }
  ]
}

Rules:
- Provide exactly ${count} recommendations
- Use only valid TMDB IDs
- Ensure all fields are properly formatted
- Focus on content the user is likely to enjoy based on their ratings
- Mix of movies and TV shows based on their preferences
- No text outside the JSON object`
          }
        ],
        temperature: 0.3,
        max_tokens: 3000
      })
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.statusText}`);
    }

    const openAIData = await openAIResponse.json();
    const content = openAIData.choices?.[0]?.message?.content;

    if (!content || typeof content !== 'string') {
      throw new Error('No content received from OpenAI');
    }

    // Clean the content to extract only JSON
    let jsonContent = content.trim();
    
    // Remove any text before the first {
    const firstBraceIndex = jsonContent.indexOf('{');
    if (firstBraceIndex > 0) {
      jsonContent = jsonContent.substring(firstBraceIndex);
    }
    
    // Remove any text after the last }
    const lastBraceIndex = jsonContent.lastIndexOf('}');
    if (lastBraceIndex !== -1 && lastBraceIndex < jsonContent.length - 1) {
      jsonContent = jsonContent.substring(0, lastBraceIndex + 1);
    }

    // Parse the JSON response
    let recommendations: { content: RecommendedContent[] };
    try {
      recommendations = JSON.parse(jsonContent);
    } catch (error) {
      console.error('Failed to parse OpenAI response:', content);
      console.error('Cleaned content:', jsonContent);
      throw new Error('Invalid response format from OpenAI');
    }

    // Validate the response structure
    if (!recommendations.content || !Array.isArray(recommendations.content)) {
      throw new Error('Invalid content structure');
    }

    res.status(200).json({ 
      content: recommendations.content, 
      source: 'ai',
      userRatingsCount: ratings.length
    });
  } catch (error) {
    console.error('Error generating recommended content:', error);
    
    // Fallback to popular content if AI fails
    try {
      const popularContent = getPopularContent(20);
      res.status(200).json({ 
        content: popularContent, 
        source: 'popular-fallback',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } catch (fallbackError) {
      res.status(500).json({ 
        error: 'Failed to generate recommended content',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

// Fallback function to get popular content
function getPopularContent(count: number): RecommendedContent[] {
  // This would typically fetch from TMDB API or a curated list
  // For now, returning a basic list of popular content
  const popularContent: RecommendedContent[] = [
    {
      tmdbId: '550',
      title: 'Fight Club',
      mediaType: 'movie',
      posterPath: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
      overview: 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.',
      releaseDate: '1999-10-15',
      voteAverage: 8.8,
      reason: 'Popular classic film with strong themes',
      confidence: 0.7
    },
    {
      tmdbId: '13',
      title: 'Forrest Gump',
      mediaType: 'movie',
      posterPath: '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
      overview: 'A man with a low IQ has accomplished great things in his life and been present during significant historic events.',
      releaseDate: '1994-07-06',
      voteAverage: 8.8,
      reason: 'Beloved classic with emotional depth',
      confidence: 0.7
    },
    {
      tmdbId: '238',
      title: 'The Godfather',
      mediaType: 'movie',
      posterPath: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
      overview: 'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family.',
      releaseDate: '1972-03-14',
      voteAverage: 9.2,
      reason: 'Cinematic masterpiece and cultural icon',
      confidence: 0.8
    }
  ];

  return popularContent.slice(0, count);
} 