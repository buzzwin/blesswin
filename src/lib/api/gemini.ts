export interface TrendingShow {
  title: string;
  mediaId: string;
  mediaType: 'movie' | 'tv';
  posterPath: string;
  popularity: number;
  description: string;
  network?: string;
  releaseDate?: string;
}

export interface TrendingNetwork {
  name: string;
  type: 'streaming' | 'cable' | 'broadcast';
  popularity: number;
  description: string;
  topShows: string[];
  logoUrl?: string;
}

export interface GeminiTrendsResponse {
  trendingShows: TrendingShow[];
  trendingNetworks: TrendingNetwork[];
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  // Gemini API key not found. Trending data will be limited.
}

export async function fetchGeminiTrends(): Promise<GeminiTrendsResponse> {
  if (!GEMINI_API_KEY) {
    // Gemini API key not found. Returning empty trends.
    return getFallbackTrends();
  }

  try {
    const prompt = `You are a TV and streaming trends expert specializing in American popular culture. Provide the MOST POPULAR and TRENDING TV shows and movies in America right now.

Please return a JSON response with the following structure:
{
  "trendingShows": [
    {
      "title": "Show Name",
      "mediaId": "12345",
      "mediaType": "tv",
      "posterPath": "/path/to/poster.jpg",
      "popularity": 95,
      "description": "Why this show is popular in America right now",
      "network": "Network Name",
      "releaseDate": "CURRENT YEAR-01-15"
    }
  ],
  "trendingNetworks": [
    {
      "name": "Network Name",
      "type": "streaming",
      "popularity": 90,
      "description": "Why this network is popular in America",
      "topShows": ["Show 1", "Show 2", "Show 3"],
      "logoUrl": "/path/to/logo.jpg"
    }
  ]
}

IMPORTANT REQUIREMENTS:
- Focus ONLY on the MOST POPULAR shows in America right now
- Include shows that are currently airing, recently released, or generating major buzz
- Prioritize shows with high ratings, social media engagement, and cultural impact
- Include a mix of streaming platforms (Netflix, Hulu, Prime Video, HBO Max, Disney+, Apple TV+)
- Include both TV shows and movies that are trending
- Focus on shows that are actually popular and well-known, not niche content
- Consider shows that are being talked about on social media, news, and entertainment media
- Include shows from CURRENT YEAR and recent years that are still popular

Examples of the type of content to include:
- Blockbuster movies and hit TV series
- Shows with high viewership and ratings
- Content generating social media buzz
- Award-winning or critically acclaimed shows
- Shows from major networks and streaming platforms

Return only valid JSON, no additional text.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            text?: string
          }>
        }
      }>
    };
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini API');
    }

    const responseText = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response (in case there's additional text)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Gemini response');
    }

    const trendsData = JSON.parse(jsonMatch[0]) as GeminiTrendsResponse;
    
    return trendsData;
  } catch (error) {
    throw new Error('Failed to fetch trending data');
  }
}

// Fallback data when Gemini API is not available
export function getFallbackTrends(): GeminiTrendsResponse {
  return {
    trendingShows: [],
    trendingNetworks: []
  };
} 