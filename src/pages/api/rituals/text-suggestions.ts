import type { NextApiRequest, NextApiResponse } from 'next';
import { callGeminiAPI, extractJSONFromResponse } from '@lib/api/gemini';
import type { RealStory } from '@lib/types/real-story';

interface TextSuggestionsRequest {
  story: RealStory;
}

interface TextSuggestionsResponse {
  success: boolean;
  suggestions?: Array<{
    title: string;
    description: string;
  }>;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TextSuggestionsResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const { story } = req.body as TextSuggestionsRequest;

    if (!story || !story.title || !story.description) {
      res.status(400).json({ success: false, error: 'Story data is required' });
      return;
    }

    const prompt = `You are a wellness advisor helping someone create meaningful daily rituals inspired by an inspiring story.

STORY DETAILS:
Title: ${story.title}
Description: ${story.description}
Category: ${story.category}
${story.location ? `Location: ${story.location}` : ''}
${story.date ? `Date: ${story.date}` : ''}
${story.source ? `Source: ${story.source}` : ''}

TASK:
Based on this inspiring story, generate 3-5 creative ritual title and description suggestions that would help someone:
1. Process and reflect on the story's themes and messages
2. Take concrete action inspired by the story's values
3. Build sustainable habits that align with the story's impact

REQUIREMENTS:
- Each ritual should be practical and actionable (5-15 minutes)
- Titles should be clear, inspiring, and specific (e.g., "Morning Gratitude Reflection", "Community Connection Practice")
- Descriptions should be detailed enough to understand what the ritual involves (2-4 sentences)
- Rituals should connect meaningfully to the story's core message
- Consider the story's category (${story.category}) when creating suggestions
- Make each ritual unique and distinct

Return ONLY a valid JSON object:
{
  "suggestions": [
    {
      "title": "Ritual Title 1",
      "description": "Detailed description of what this ritual involves, how it connects to the story, and how to practice it."
    },
    {
      "title": "Ritual Title 2",
      "description": "Detailed description..."
    },
    {
      "title": "Ritual Title 3",
      "description": "Detailed description..."
    }
  ]
}`;

    try {
      const response = await callGeminiAPI(prompt, 1024, 0.8);
      const parsed = extractJSONFromResponse(response) as {
        suggestions?: Array<{
          title: string;
          description: string;
        }>;
      };

      const suggestions = parsed.suggestions || [];
      
      if (suggestions.length === 0) {
        throw new Error('No suggestions generated');
      }

      res.status(200).json({
        success: true,
        suggestions: suggestions.slice(0, 5) // Max 5 suggestions
      });
    } catch (geminiError) {
      console.error('Error generating text suggestions with Gemini:', geminiError);
      
      // Fallback: Generate simple suggestions based on story category
      const categorySuggestions: Record<RealStory['category'], Array<{ title: string; description: string }>> = {
        community: [
          {
            title: 'Daily Community Connection',
            description: 'Take 5 minutes each day to reach out to someone in your community. Send a message, make a call, or plan a small act of kindness that strengthens your connections.'
          },
          {
            title: 'Gratitude for Community',
            description: 'Reflect on three ways your community has supported you today. Write them down and consider how you can give back.'
          }
        ],
        environment: [
          {
            title: 'Nature Appreciation Practice',
            description: 'Spend 10 minutes outside observing nature. Notice the details around you and reflect on your connection to the environment.'
          },
          {
            title: 'Eco-Conscious Daily Action',
            description: 'Choose one small action each day to reduce your environmental impact. Document it and reflect on the cumulative effect.'
          }
        ],
        education: [
          {
            title: 'Daily Learning Moment',
            description: 'Dedicate 10 minutes to learning something new related to the story\'s theme. Read, watch, or listen to educational content.'
          },
          {
            title: 'Reflective Learning Practice',
            description: 'After learning something new, take 5 minutes to reflect on how it connects to your values and how you can apply it.'
          }
        ],
        health: [
          {
            title: 'Mindful Wellness Check',
            description: 'Take 5 minutes each day to check in with your physical and mental well-being. Note what feels good and what needs attention.'
          },
          {
            title: 'Holistic Health Practice',
            description: 'Choose one wellness activity (breathing, stretching, meditation) and practice it mindfully, connecting it to your overall health goals.'
          }
        ],
        'social-justice': [
          {
            title: 'Daily Awareness Practice',
            description: 'Spend 10 minutes learning about or reflecting on social justice issues. Consider how you can contribute to positive change.'
          },
          {
            title: 'Action-Oriented Reflection',
            description: 'Reflect on one way you can support social justice today, even if it\'s small. Take that action and document how it felt.'
          }
        ],
        innovation: [
          {
            title: 'Creative Problem-Solving',
            description: 'Take 10 minutes to think about a challenge you\'re facing and brainstorm creative solutions inspired by innovative thinking.'
          },
          {
            title: 'Innovation Reflection',
            description: 'Reflect on one innovative idea or solution you encountered today. Consider how you can apply similar thinking to your own life.'
          }
        ]
      };

      const fallbackSuggestions = categorySuggestions[story.category] || categorySuggestions.community;

      res.status(200).json({
        success: true,
        suggestions: fallbackSuggestions.slice(0, 3)
      });
    }
  } catch (error) {
    console.error('Error generating ritual text suggestions:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate suggestions'
    });
  }
}

