import type { NextApiRequest, NextApiResponse } from 'next';
import { callGeminiAPI, extractJSONFromResponse } from '@lib/api/gemini';
import type { RitualDefinition } from '@lib/types/ritual';
import { query, getDocs, where } from 'firebase/firestore';
import { ritualsCollection } from '@lib/firebase/collections';
import type { RealStory } from '@lib/types/real-story';

interface StoryRitualSuggestionsRequest {
  story: RealStory;
  userId?: string;
}

interface StoryRitualSuggestionsResponse {
  success: boolean;
  suggestions?: RitualDefinition[];
  analysis?: {
    connection: string;
    whyTheseRituals: string[];
    personalizedNote?: string;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StoryRitualSuggestionsResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const { story, userId } = req.body as StoryRitualSuggestionsRequest;

    if (!story || !story.title || !story.description) {
      res.status(400).json({ success: false, error: 'Story data is required' });
      return;
    }

    // Fetch available rituals from Firestore
    const ritualsSnapshot = await getDocs(ritualsCollection);
    const availableRituals = ritualsSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as RitualDefinition))
      .filter(r => r.id && r.title && r.description);

    if (availableRituals.length === 0) {
      res.status(200).json({
        success: true,
        suggestions: [],
        analysis: {
          connection: 'No rituals available at this time.',
          whyTheseRituals: []
        }
      });
      return;
    }

    // Create prompt for Gemini to suggest rituals based on the story
    const ritualsList = availableRituals.map((r, idx) => 
      `${idx + 1}. ${r.title} - ${r.description} (Tags: ${r.tags.join(', ')}, Effort: ${r.effortLevel})`
    ).join('\n');

    const prompt = `You are a wellness advisor helping someone create meaningful daily rituals inspired by an inspiring story.

STORY DETAILS:
Title: ${story.title}
Description: ${story.description}
Category: ${story.category}
${story.location ? `Location: ${story.location}` : ''}
${story.date ? `Date: ${story.date}` : ''}
${story.source ? `Source: ${story.source}` : ''}
${story.url ? `Learn more: ${story.url}` : ''}

AVAILABLE RITUALS (select 2-3 that deeply connect to this story):
${ritualsList}

YOUR TASK:
Based on this inspiring story, suggest 2-3 rituals that would help the user:
1. Process and reflect on the story's themes and messages
2. Take concrete action inspired by the story's values
3. Build sustainable habits that align with the story's impact

ANALYSIS REQUIRED:
- Deeply analyze the story's core message and values
- Identify specific themes, emotions, or actions the story evokes
- Match rituals that can help translate this inspiration into daily practice
- Consider how each ritual connects to the story's specific category (${story.category})
- Think about rituals that honor the story's impact and help the user embody similar values

IMPORTANT:
- Select rituals that create a meaningful bridge between the story and daily life
- Prioritize rituals that help the user internalize and act on the story's lessons
- Ensure suggestions are practical and actionable
- Make connections explicit and meaningful

Return ONLY a valid JSON object:
{
  "selectedRitualIndices": [1, 5, 12], // 1-based indices from the rituals list above
  "analysis": {
    "connection": "A thoughtful explanation of how these rituals connect to the story's themes and help translate inspiration into daily practice",
    "whyTheseRituals": [
      "Specific reason why ritual 1 helps process/act on this story (be detailed)",
      "Specific reason why ritual 2 helps process/act on this story (be detailed)",
      "Specific reason why ritual 3 helps process/act on this story (be detailed)"
    ],
    "personalizedNote": "A personalized message that connects the story to the user's wellness journey and explains how these rituals can help them embody the story's values"
  }
}`;

    try {
      const response = await callGeminiAPI(prompt, 1024, 0.7);
      const parsed = extractJSONFromResponse(response) as {
        selectedRitualIndices?: number[];
        analysis?: {
          connection: string;
          whyTheseRituals: string[];
          personalizedNote?: string;
        };
      };

      const selectedIndices = parsed.selectedRitualIndices || [];
      const selectedRituals = selectedIndices
        .map(idx => availableRituals[idx - 1]) // Convert 1-based to 0-based
        .filter(Boolean)
        .slice(0, 3); // Max 3 suggestions

      res.status(200).json({
        success: true,
        suggestions: selectedRituals,
        analysis: parsed.analysis || {
          connection: 'These rituals can help you process and act on the inspiration from this story.',
          whyTheseRituals: selectedRituals.map(r => `"${r.title}" aligns with the story's themes.`)
        }
      });
    } catch (geminiError) {
      console.error('Error generating ritual suggestions with Gemini:', geminiError);
      
      // Fallback: Select rituals based on story category
      const categoryTagMap: Record<RealStory['category'], string[]> = {
        community: ['community'],
        environment: ['nature'],
        education: ['mind'],
        health: ['body', 'mind'],
        'social-justice': ['community', 'relationships'],
        innovation: ['mind']
      };

      const relevantTags = categoryTagMap[story.category] || ['community'];
      const fallbackRituals = availableRituals
        .filter(r => r.tags.some(tag => relevantTags.includes(tag)))
        .slice(0, 3);

      res.status(200).json({
        success: true,
        suggestions: fallbackRituals,
        analysis: {
          connection: `These rituals connect to the ${story.category} theme of this story.`,
          whyTheseRituals: fallbackRituals.map(r => 
            `"${r.title}" relates to the story's ${story.category} focus.`
          )
        }
      });
    }
  } catch (error) {
    console.error('Error generating story-based ritual suggestions:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate suggestions'
    });
  }
}

