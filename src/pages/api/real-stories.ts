import type { NextApiRequest, NextApiResponse } from 'next';
import { callGeminiAPI } from '@lib/api/gemini';

interface RealStory {
  title: string;
  description: string;
  location?: string;
  date?: string | null;
  source?: string;
  url?: string;
  category: 'community' | 'environment' | 'education' | 'health' | 'social-justice' | 'innovation';
}

interface RealStoriesResponse {
  stories: RealStory[];
  error?: string;
}

function createPrompt(monthsAgo: number): string {
  const dateRangeText = monthsAgo === 3 
    ? 'very recent, real stories (from the last 3 months)' 
    : monthsAgo === 6
    ? 'recent, real stories (from the last 6 months)'
    : monthsAgo === 12
    ? 'real stories (from the last year)'
    : 'real stories (from recent years)';
  
  return `Find and share 10 ${dateRangeText} about people, communities, or organizations doing good in the world. ${monthsAgo <= 3 ? 'Prioritize stories from the current month and recent weeks.' : 'Prioritize the most recent stories available.'} Focus on:
- Community initiatives and grassroots movements
- Environmental conservation and climate action
- Education and mentorship programs
- Healthcare and wellness initiatives
- Social justice and human rights work
- Innovation for social good

For each story, provide:
- A compelling title
- A detailed description (2-3 sentences) of what they're doing and the impact
- Location (city, country)
- Date (when it happened or was reported) - MUST be a valid date in YYYY-MM-DD format. If you cannot find a specific date, use null instead of guessing.
- Source (news outlet, organization name, etc.)
- URL if available (only real, verifiable URLs)

Return ONLY a valid JSON array with this structure:
[
  {
    "title": "Story title",
    "description": "Detailed description of the story",
    "location": "City, Country",
    "date": "2024-12-15" or null if date is unknown,
    "source": "Source name",
    "url": "https://real-url.com/article" or null,
    "category": "community"
  }
]

Categories should be one of: community, environment, education, health, social-justice, innovation.

IMPORTANT:
- You MUST return exactly 10 stories. If you cannot find enough stories from the specified time period, expand your search to include slightly older stories until you have 10 stories.
- Use null for date if you cannot find a specific, verifiable date
- Make sure all URLs are real and verifiable. Do not include placeholder URLs.
- Prioritize the most current stories available within the time range.`;
}

function validateAndFilterStories(
  stories: RealStory[],
  maxMonthsAgo: number
): RealStory[] {
  const now = new Date();
  const cutoffDate = new Date(now.getFullYear(), now.getMonth() - maxMonthsAgo, now.getDate());
  
  return stories
    .filter((story) => {
      // Basic validation
      if (!story.title || !story.description) return false;
      
      // Validate date if provided
      if (story.date) {
        try {
          const storyDate = new Date(story.date);
          // Check if date is valid
          if (isNaN(storyDate.getTime())) {
            // Invalid date, set to null
            story.date = null;
          } else {
            // Check if date is within the allowed range
            if (storyDate < cutoffDate) {
              // Too old for current range, skip this story
              return false;
            }
            // Check if date is not in the future
            if (storyDate > now) {
              // Future date, invalid
              story.date = null;
            }
          }
        } catch {
          // Invalid date format, set to null
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
    const dateRanges = [3, 6, 12, 24]; // Try 3 months, 6 months, 1 year, 2 years
    let allValidStories: RealStory[] = [];
    let lastError: Error | null = null;

    // Try each date range until we get at least 10 valid stories
    for (const monthsAgo of dateRanges) {
      try {
        const prompt = createPrompt(monthsAgo);
        const response = await callGeminiAPI(prompt);
        
        // Extract JSON from response
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
          throw new Error('No valid JSON array found in response');
        }

        const stories = JSON.parse(jsonMatch[0]) as RealStory[];
        const validStories = validateAndFilterStories(stories, monthsAgo);
        
        // Add valid stories to our collection
        allValidStories = [...allValidStories, ...validStories];
        
        // Remove duplicates based on title
        const uniqueStories = allValidStories.filter((story, index, self) =>
          index === self.findIndex((s) => s.title.toLowerCase() === story.title.toLowerCase())
        );
        
        allValidStories = uniqueStories;
        
        // If we have at least 10 stories, we're done
        if (allValidStories.length >= 10) {
          break;
        }
      } catch (error) {
        console.error(`Error fetching stories for ${monthsAgo} months range:`, error);
        lastError = error instanceof Error ? error : new Error('Unknown error');
        // Continue to next date range
        continue;
      }
    }

    // If we still don't have 10 stories, try one more time with a very broad prompt
    if (allValidStories.length < 10) {
      try {
        const broadPrompt = `Find and share 10 real stories about people, communities, or organizations doing good in the world. These can be from any recent time period. Focus on:
- Community initiatives and grassroots movements
- Environmental conservation and climate action
- Education and mentorship programs
- Healthcare and wellness initiatives
- Social justice and human rights work
- Innovation for social good

For each story, provide:
- A compelling title
- A detailed description (2-3 sentences) of what they're doing and the impact
- Location (city, country)
- Date (when it happened or was reported) - MUST be a valid date in YYYY-MM-DD format. If you cannot find a specific date, use null instead of guessing.
- Source (news outlet, organization name, etc.)
- URL if available (only real, verifiable URLs)

Return ONLY a valid JSON array with this structure:
[
  {
    "title": "Story title",
    "description": "Detailed description of the story",
    "location": "City, Country",
    "date": "2024-12-15" or null if date is unknown,
    "source": "Source name",
    "url": "https://real-url.com/article" or null,
    "category": "community"
  }
]

Categories should be one of: community, environment, education, health, social-justice, innovation.

IMPORTANT:
- You MUST return exactly 10 stories.
- Use null for date if you cannot find a specific, verifiable date
- Make sure all URLs are real and verifiable. Do not include placeholder URLs.
- Prioritize the most current stories available.`;

        const response = await callGeminiAPI(broadPrompt);
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const stories = JSON.parse(jsonMatch[0]) as RealStory[];
          const validStories = validateAndFilterStories(stories, 60); // Allow up to 5 years
          
          // Add to collection and remove duplicates
          allValidStories = [...allValidStories, ...validStories];
          const uniqueStories = allValidStories.filter((story, index, self) =>
            index === self.findIndex((s) => s.title.toLowerCase() === story.title.toLowerCase())
          );
          allValidStories = uniqueStories;
        }
      } catch (error) {
        console.error('Error fetching stories with broad prompt:', error);
      }
    }

    // Take the top 10 stories (sorted by date, most recent first)
    const finalStories = allValidStories.slice(0, 10);

    if (finalStories.length === 0 && lastError) {
      throw lastError;
    }

    res.status(200).json({ stories: finalStories });
  } catch (error) {
    console.error('Error fetching real stories:', error);
    res.status(500).json({
      stories: [],
      error: error instanceof Error ? error.message : 'Failed to fetch stories'
    });
  }
}

