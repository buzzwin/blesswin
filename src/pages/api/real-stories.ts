import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { callGeminiAPI } from '@lib/api/gemini';
import { realStoriesCacheCollection } from '@lib/firebase/collections';
import type { RealStory, CachedRealStories } from '@lib/types/real-story';

interface RealStoriesResponse {
  stories: RealStory[];
  error?: string;
  cached?: boolean;
}

const CACHE_DURATION_DAYS = 1; // Refresh daily for fresh stories
const CACHE_DOC_ID = 'latest';

function createOptimizedPrompt(): string {
  const currentDate = new Date().toISOString().split('T')[0];
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0];
  
  return `Find and share 10 real stories about people, communities, or organizations doing good in the world. 

CRITICAL REQUIREMENTS:
- Include stories from the last year (from ${oneYearAgoStr} to ${currentDate})
- Prioritize the MOST RECENT stories available (current month/week first, then expand to older stories if needed)
- Only include stories that are verifiable and from credible sources
- Prioritize stories with actual dates and sources

Focus on these categories:
- Community initiatives and grassroots movements
- Environmental conservation and climate action
- Education and mentorship programs
- Healthcare and wellness initiatives
- Social justice and human rights work
- Innovation for social good

For each story, provide:
- A compelling, specific title
- A detailed description (2-3 sentences) of what they're doing and the impact
- Location (city, country) if available
- Date (when it happened or was reported) - MUST be a valid date in YYYY-MM-DD format between ${oneYearAgoStr} and ${currentDate}. Use null ONLY if you absolutely cannot find a specific date.
- Source (news outlet, organization name, etc.) - REQUIRED
- URL if available (only real, verifiable URLs from actual news sources)

Return ONLY a valid JSON array with this structure:
[
  {
    "title": "Story title",
    "description": "Detailed description of the story",
    "location": "City, Country",
    "date": "2024-12-15" or null if date is truly unknown,
    "source": "Source name",
    "url": "https://real-url.com/article" or null,
    "category": "community"
  }
]

Categories must be one of: community, environment, education, health, social-justice, innovation.

IMPORTANT:
- You MUST return exactly 10 stories
- Stories can be from the last year (${oneYearAgoStr} to ${currentDate})
- Prioritize the MOST RECENT stories available - start with current month/week, then expand if needed
- Use null for date ONLY if you cannot find a specific, verifiable date
- Make sure all URLs are real and verifiable - do not include placeholder URLs
- All stories must be real and verifiable from credible sources
- Sort stories by date (most recent first) in your response

Current date: ${currentDate}
One year ago: ${oneYearAgoStr}`;
}

function validateAndFilterStories(stories: RealStory[]): RealStory[] {
  const now = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  return stories
    .filter((story) => {
      // Basic validation
      if (!story.title || !story.description || !story.source) return false;
      
      // Validate date if provided
      if (story.date) {
        try {
          const storyDate = new Date(story.date);
          // Check if date is valid
          if (isNaN(storyDate.getTime())) {
            story.date = null;
          } else {
            // Check if date is not in the future
            if (storyDate > now) {
              story.date = null;
            }
            // Only include stories from the last year
            if (storyDate < oneYearAgo) {
              return false; // Reject stories older than 1 year
            }
          }
        } catch {
          story.date = null;
        }
      }
      
      // Filter out placeholder URLs
      if (story.url) {
        const invalidPatterns = ['example.com', 'placeholder', 'test.com', 'dummy', 'fake'];
        const urlLower = story.url.toLowerCase();
        if (invalidPatterns.some((pattern) => urlLower.includes(pattern))) {
          return false;
        }
        
        // Validate URL format
        try {
          new URL(story.url);
        } catch {
          return false;
        }
      }
      
      return true;
    })
    // Sort by date (most recent first), then by null dates last
    .sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
}

async function getCachedStories(): Promise<{ stories: RealStory[]; isValid: boolean } | null> {
  try {
    const cacheDocRef = doc(realStoriesCacheCollection, CACHE_DOC_ID);
    const cacheDoc = await getDoc(cacheDocRef);
    
    if (!cacheDoc.exists()) {
      return null;
    }
    
    const cacheData = cacheDoc.data() as CachedRealStories;
    
    // Check if we have stories
    if (!cacheData.stories || cacheData.stories.length === 0) {
      return null;
    }
    
    const fetchedAt = cacheData.fetchedAt instanceof Timestamp 
      ? cacheData.fetchedAt.toDate() 
      : new Date(cacheData.fetchedAt);
    
    const now = new Date();
    const daysSinceFetch = (now.getTime() - fetchedAt.getTime()) / (1000 * 60 * 60 * 24);
    
    // Strict check: cache is valid if it's less than 15 days old (not equal to or greater)
    const isValid = daysSinceFetch < CACHE_DURATION_DAYS;
    
    if (!isValid) {
      return null;
    }
    
    return { stories: cacheData.stories, isValid: true };
  } catch (error) {
    console.error('[CACHE] Error reading cache:', error);
    return null;
  }
}

async function cacheStories(stories: RealStory[]): Promise<void> {
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + CACHE_DURATION_DAYS * 24 * 60 * 60 * 1000);
    
    const cacheData: CachedRealStories = {
      stories,
      fetchedAt: serverTimestamp() as Timestamp,
      expiresAt: Timestamp.fromDate(expiresAt)
    };
    
    const cacheDocRef = doc(realStoriesCacheCollection, CACHE_DOC_ID);
    await setDoc(cacheDocRef, cacheData);
  } catch (error) {
    console.error('Error caching stories:', error);
    // Don't throw - caching failure shouldn't break the API
  }
}

async function fetchStoriesFromGemini(): Promise<RealStory[]> {
  // CRITICAL: This function should ONLY be called when cache is invalid/missing
  // Double-check cache one more time as a safety guard (race condition protection)
  const lastCacheCheck = await getCachedStories();
  if (lastCacheCheck && lastCacheCheck.isValid && lastCacheCheck.stories.length > 0) {
    return lastCacheCheck.stories;
  }
  
  try {
    const prompt = createOptimizedPrompt();
    const response = await callGeminiAPI(prompt, 4096, 0.7);
    
    // Extract JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No valid JSON array found in response');
    }

    const stories = JSON.parse(jsonMatch[0]) as RealStory[];
    const validStories = validateAndFilterStories(stories);
    
    // Remove duplicates based on title
    const uniqueStories = validStories.filter((story, index, self) =>
      index === self.findIndex((s) => s.title.toLowerCase() === story.title.toLowerCase())
    );
    
    // Return top 10 stories
    return uniqueStories.slice(0, 10);
  } catch (error) {
    console.error('Error fetching stories from Gemini:', error);
    throw error;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RealStoriesResponse>
): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ stories: [], error: 'Method not allowed' });
    return;
  }

  // Check if cache-only mode is requested (for home page)
  const cacheOnly = req.query.cacheOnly === 'true';

  try {
    // STEP 1: Check cache first - CRITICAL: This must happen BEFORE any Gemini calls
    const cacheResult = await getCachedStories();
    
    // STEP 2: If valid cache exists, return immediately - NO GEMINI CALL
    if (cacheResult && cacheResult.isValid && cacheResult.stories.length > 0) {
      return res.status(200).json({ 
        stories: cacheResult.stories,
        cached: true
      });
    }
    
    // STEP 2.5: If cache-only mode and cache is invalid/missing, return empty array
    // Home page should NEVER trigger Gemini calls
    if (cacheOnly) {
      // Try to return stale cache as fallback for home page
      try {
        const cacheDocRef = doc(realStoriesCacheCollection, CACHE_DOC_ID);
        const cacheDoc = await getDoc(cacheDocRef);
        if (cacheDoc.exists()) {
          const cacheData = cacheDoc.data() as CachedRealStories;
          if (cacheData.stories && cacheData.stories.length > 0) {
            return res.status(200).json({ 
              stories: cacheData.stories,
              cached: true
            });
          }
        }
      } catch (fallbackError) {
        console.error('[CACHE-ONLY] Error reading fallback cache:', fallbackError);
      }
      return res.status(200).json({ 
        stories: [],
        cached: false
      });
    }
    
    // STEP 3: Only if cache is invalid/missing AND not cache-only mode, fetch from Gemini
    // This is the ONLY place where Gemini should be called (from real-stories page)
    const stories = await fetchStoriesFromGemini();
    
    // STEP 4: Cache the fetched stories for future requests
    await cacheStories(stories);
    
    res.status(200).json({ 
      stories,
      cached: false
    });
  } catch (error) {
    console.error('[ERROR] Error fetching real stories:', error);
    
    // STEP 5: Fallback - try to return stale cache if Gemini fails
    // This prevents complete failure but still avoids calling Gemini again
    try {
      const cacheDocRef = doc(realStoriesCacheCollection, CACHE_DOC_ID);
      const cacheDoc = await getDoc(cacheDocRef);
      if (cacheDoc.exists()) {
        const cacheData = cacheDoc.data() as CachedRealStories;
        if (cacheData.stories && cacheData.stories.length > 0) {
          return res.status(200).json({ 
            stories: cacheData.stories,
            cached: true
          });
        }
      }
    } catch (fallbackError) {
      console.error('[FALLBACK] Error reading fallback cache:', fallbackError);
    }
    
    res.status(500).json({
      stories: [],
      error: error instanceof Error ? error.message : 'Failed to fetch stories'
    });
  }
}
