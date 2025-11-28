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

const CACHE_DURATION_DAYS = 15;
const CACHE_DOC_ID = 'latest';

function createOptimizedPrompt(): string {
  const currentDate = new Date().toISOString().split('T')[0];
  
  return `Find and share 10 of the LATEST AVAILABLE real stories about people, communities, or organizations doing good in the world. 

CRITICAL REQUIREMENTS:
- Focus on stories from the MOST RECENT time period possible (prioritize current month, then recent weeks)
- Only include stories that are verifiable and from credible sources
- If you cannot find enough recent stories, include the most recent stories available (even if slightly older)
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
- Date (when it happened or was reported) - MUST be a valid date in YYYY-MM-DD format. Use null ONLY if you absolutely cannot find a specific date.
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
- Prioritize the MOST RECENT stories available - start with current month/week, then expand if needed
- Use null for date ONLY if you cannot find a specific, verifiable date
- Make sure all URLs are real and verifiable - do not include placeholder URLs
- All stories must be real and verifiable from credible sources
- Sort stories by date (most recent first) in your response

Current date: ${currentDate}`;
}

function validateAndFilterStories(stories: RealStory[]): RealStory[] {
  const now = new Date();
  
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

async function getCachedStories(): Promise<RealStory[] | null> {
  try {
    const cacheDocRef = doc(realStoriesCacheCollection, CACHE_DOC_ID);
    const cacheDoc = await getDoc(cacheDocRef);
    
    if (!cacheDoc.exists()) {
      return null;
    }
    
    const cacheData = cacheDoc.data() as CachedRealStories;
    const fetchedAt = cacheData.fetchedAt instanceof Timestamp 
      ? cacheData.fetchedAt.toDate() 
      : new Date(cacheData.fetchedAt);
    
    const now = new Date();
    const daysSinceFetch = (now.getTime() - fetchedAt.getTime()) / (1000 * 60 * 60 * 24);
    
    // If cache is older than 15 days, return null to trigger refresh
    if (daysSinceFetch > CACHE_DURATION_DAYS) {
      return null;
    }
    
    return cacheData.stories || null;
  } catch (error) {
    console.error('Error reading cache:', error);
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
    
    console.log(`Cached ${stories.length} stories`);
  } catch (error) {
    console.error('Error caching stories:', error);
    // Don't throw - caching failure shouldn't break the API
  }
}

async function fetchStoriesFromGemini(): Promise<RealStory[]> {
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

  try {
    // Check cache first
    const cachedStories = await getCachedStories();
    
    if (cachedStories && cachedStories.length > 0) {
      console.log(`Returning ${cachedStories.length} cached stories`);
      return res.status(200).json({ 
        stories: cachedStories,
        cached: true
      });
    }
    
    // Cache is stale or doesn't exist - fetch from Gemini
    console.log('Cache expired or missing, fetching from Gemini...');
    const stories = await fetchStoriesFromGemini();
    
    // Cache the fetched stories
    await cacheStories(stories);
    
    res.status(200).json({ 
      stories,
      cached: false
    });
  } catch (error) {
    console.error('Error fetching real stories:', error);
    
    // Try to return cached stories even if stale as fallback
    try {
      const cacheDocRef = doc(realStoriesCacheCollection, CACHE_DOC_ID);
      const cacheDoc = await getDoc(cacheDocRef);
      if (cacheDoc.exists()) {
        const cacheData = cacheDoc.data() as CachedRealStories;
        if (cacheData.stories && cacheData.stories.length > 0) {
          console.log('Returning stale cache as fallback');
          return res.status(200).json({ 
            stories: cacheData.stories,
            cached: true
          });
        }
      }
    } catch (fallbackError) {
      console.error('Error reading fallback cache:', fallbackError);
    }
    
    res.status(500).json({
      stories: [],
      error: error instanceof Error ? error.message : 'Failed to fetch stories'
    });
  }
}
