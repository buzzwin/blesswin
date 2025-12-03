import type { NextApiRequest, NextApiResponse } from 'next';
import { callGeminiAPI, extractJSONFromResponse } from '@lib/api/gemini';

interface CurrentEvent {
  title: string;
  description: string;
  date: string;
  source?: string;
  url?: string;
  category: 'yoga' | 'meditation' | 'world-peace' | 'wellness';
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
    const currentDate = new Date().toISOString().split('T')[0];
    
    const prompt = `You are a wellness news curator. Find and summarize current events, news, and happenings from the past 30 days related to:
- Yoga (yoga events, workshops, studies, community initiatives)
- Meditation (meditation retreats, mindfulness programs, research findings)
- World Peace (peace initiatives, conflict resolution, humanitarian efforts, global harmony movements)
- Wellness (general wellness news, health and wellness events)

Return ONLY a valid JSON object with this structure:
{
  "events": [
    {
      "title": "Event title (be specific and factual)",
      "description": "Brief description (2-3 sentences)",
      "date": "YYYY-MM-DD format",
      "source": "Source name if available",
      "url": "URL if available (optional)",
      "category": "yoga" | "meditation" | "world-peace" | "wellness"
    }
  ]
}

Important guidelines:
- Only include real, verifiable events from the past 30 days
- Be factual and accurate
- Include 5-8 events total
- Mix categories appropriately
- If you cannot find real current events, create realistic but clearly marked as "example" events
- Focus on positive, inspiring news that aligns with wellness and peace
- IMPORTANT: Only include URLs if they are real, verifiable URLs from actual news sources or official websites
- DO NOT include placeholder URLs like "example.com" or fake URLs
- If you don't have a real URL, omit the "url" field entirely

Current date: ${currentDate}`;

    const geminiResponse = await callGeminiAPI(prompt, 4096, 0.7);

    if (!geminiResponse || typeof geminiResponse !== 'string') {
      throw new Error('No response received from Gemini API');
    }

    // Parse Gemini response
    let parsedResponse: { events: CurrentEvent[] };
    try {
      const rawResponse = extractJSONFromResponse(geminiResponse);
      parsedResponse = rawResponse as unknown as { events: CurrentEvent[] };
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      throw new Error('Invalid response format from Gemini API');
    }

    // Validate response
    if (!parsedResponse.events || !Array.isArray(parsedResponse.events)) {
      throw new Error('Invalid response format from Gemini API');
    }

    // Filter out invalid/placeholder URLs and limit to 6 events max
    const invalidUrlPatterns = [
      'example.com',
      'placeholder',
      'test.com',
      'dummy',
      'fake'
    ];

    const events = parsedResponse.events
      .slice(0, 6)
      .map((event) => {
        // Remove URL if it contains invalid patterns
        if (event.url) {
          const urlLower = event.url.toLowerCase();
          const hasInvalidPattern = invalidUrlPatterns.some((pattern) =>
            urlLower.includes(pattern)
          );
          
          if (hasInvalidPattern) {
            // Remove the invalid URL
            const { url, ...eventWithoutUrl } = event;
            return eventWithoutUrl;
          }
          
          // Validate URL format
          try {
            new URL(event.url);
          } catch {
            // Invalid URL format, remove it
            const { url, ...eventWithoutUrl } = event;
            return eventWithoutUrl;
          }
        }
        return event;
      });

    res.status(200).json({ events });
  } catch (error) {
    console.error('Error fetching current events:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
}

