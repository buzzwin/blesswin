import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { callGeminiAPI, extractJSONFromResponse } from '@lib/api/gemini';
import { currentEventsCacheCollection } from '@lib/firebase/collections';

interface CurrentEvent {
  title: string;
  description: string;
  date: string;
  source?: string;
  url?: string;
  category: 'yoga' | 'meditation' | 'world-peace' | 'wellness';
}

interface CachedCurrentEvents {
  events: CurrentEvent[];
  fetchedAt: Timestamp | Date;
  expiresAt: Timestamp | Date;
}

const CACHE_DURATION_HOURS = 96; // Cache for 96 hours (4 days)
const CACHE_DOC_ID = 'latest';

async function getCachedEvents(): Promise<{ events: CurrentEvent[]; isValid: boolean } | null> {
  try {
    const cacheDocRef = doc(currentEventsCacheCollection, CACHE_DOC_ID);
    const cacheDoc = await getDoc(cacheDocRef);
    
    if (!cacheDoc.exists()) {
      return null;
    }
    
    const cacheData = cacheDoc.data() as CachedCurrentEvents;
    
    // Check if we have events
    if (!cacheData.events || cacheData.events.length === 0) {
      return null;
    }
    
    const fetchedAt = cacheData.fetchedAt instanceof Timestamp 
      ? cacheData.fetchedAt.toDate() 
      : new Date(cacheData.fetchedAt);
    
    const now = new Date();
    const hoursSinceFetch = (now.getTime() - fetchedAt.getTime()) / (1000 * 60 * 60);
    
    // Cache is valid if it's less than CACHE_DURATION_HOURS old
    const isValid = hoursSinceFetch < CACHE_DURATION_HOURS;
    
    if (!isValid) {
      return null;
    }
    
    return { events: cacheData.events, isValid: true };
  } catch (error) {
    console.error('[CACHE] Error reading current events cache:', error);
    return null;
  }
}

async function cacheEvents(events: CurrentEvent[]): Promise<void> {
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + CACHE_DURATION_HOURS * 60 * 60 * 1000);
    
    const cacheData: CachedCurrentEvents = {
      events,
      fetchedAt: serverTimestamp() as Timestamp,
      expiresAt: Timestamp.fromDate(expiresAt)
    };
    
    const cacheDocRef = doc(currentEventsCacheCollection, CACHE_DOC_ID);
    await setDoc(cacheDocRef, cacheData);
  } catch (error) {
    console.error('Error caching current events:', error);
    // Don't throw - caching failure shouldn't break the API
  }
}

async function fetchEventsFromGemini(): Promise<CurrentEvent[]> {
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

  return events;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Check if cache-only mode is requested (for home page)
  const cacheOnly = req.query.cacheOnly === 'true';

  try {
    // STEP 1: Check cache first - CRITICAL: This must happen BEFORE any Gemini calls
    const cacheResult = await getCachedEvents();
    
    // STEP 2: If valid cache exists, return immediately - NO GEMINI CALL
    if (cacheResult && cacheResult.isValid && cacheResult.events.length > 0) {
      return res.status(200).json({ 
        events: cacheResult.events,
        cached: true
      });
    }
    
    // STEP 2.5: If cache-only mode and cache is invalid/missing, return empty array
    // Home page should NEVER trigger Gemini calls
    if (cacheOnly) {
      // Try to return stale cache as fallback for home page
      try {
        const cacheDocRef = doc(currentEventsCacheCollection, CACHE_DOC_ID);
        const cacheDoc = await getDoc(cacheDocRef);
        if (cacheDoc.exists()) {
          const cacheData = cacheDoc.data() as CachedCurrentEvents;
          if (cacheData.events && cacheData.events.length > 0) {
            return res.status(200).json({ 
              events: cacheData.events,
              cached: true
            });
          }
        }
      } catch (fallbackError) {
        console.error('[CACHE-ONLY] Error reading fallback cache:', fallbackError);
      }
      return res.status(200).json({ 
        events: [],
        cached: false
      });
    }
    
    // STEP 3: Only if cache is invalid/missing AND not cache-only mode, fetch from Gemini
    const events = await fetchEventsFromGemini();
    
    // STEP 4: Cache the fetched events for future requests
    await cacheEvents(events);
    
    res.status(200).json({ 
      events,
      cached: false
    });
  } catch (error) {
    console.error('[ERROR] Error fetching current events:', error);
    
    // STEP 5: Fallback - try to return stale cache if Gemini fails
    try {
      const cacheDocRef = doc(currentEventsCacheCollection, CACHE_DOC_ID);
      const cacheDoc = await getDoc(cacheDocRef);
      if (cacheDoc.exists()) {
        const cacheData = cacheDoc.data() as CachedCurrentEvents;
        if (cacheData.events && cacheData.events.length > 0) {
          return res.status(200).json({ 
            events: cacheData.events,
            cached: true
          });
        }
      }
    } catch (fallbackError) {
      console.error('[FALLBACK] Error reading fallback cache:', fallbackError);
    }
    
    res.status(500).json({
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
}

