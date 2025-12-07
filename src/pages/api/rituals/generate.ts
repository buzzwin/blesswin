import type { NextApiRequest, NextApiResponse } from 'next';
import { callGeminiAPI, extractJSONFromResponse } from '@lib/api/gemini';
import type { ImpactTag, EffortLevel } from '@lib/types/impact-moment';
import type { RitualTimeOfDay } from '@lib/types/ritual';

interface GenerateRitualRequest {
  userInput?: string; // Optional user description or idea
  userId?: string; // Optional for personalization
}

interface GenerateRitualResponse {
  success: boolean;
  ritual?: {
    title: string;
    description: string;
    tags: ImpactTag[];
    effortLevel: EffortLevel;
    suggestedTimeOfDay: RitualTimeOfDay;
    durationEstimate: string;
  };
  error?: string;
}

const validTags: ImpactTag[] = ['mind', 'body', 'relationships', 'nature', 'community'];
const validEffortLevels: EffortLevel[] = ['tiny', 'medium', 'deep'];
const validTimeOfDay: RitualTimeOfDay[] = ['morning', 'afternoon', 'evening', 'anytime'];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenerateRitualResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const { userInput, userId } = req.body as GenerateRitualRequest;

    const userInputSection = userInput 
      ? `USER'S IDEA OR REQUEST:
"${userInput}"

`
      : '';

    const taskNote = userInput 
      ? '- Inspired by or related to the user\'s idea above'
      : '- Focused on general wellness and personal growth';

    const prompt = `You are a wellness advisor helping someone create a meaningful daily ritual.

${userInputSection}TASK:
Generate a complete, practical daily ritual that is:
- Actionable and achievable (5-15 minutes typically)
- Meaningful and aligned with wellness goals
- Clear and specific enough to practice daily
${taskNote}

REQUIREMENTS:
1. Title: Clear, inspiring, and specific (e.g., "Morning Gratitude Practice", "Evening Reflection Ritual", "Nature Connection Walk")
2. Description: Detailed 2-4 sentence description explaining what the ritual involves, why it's meaningful, and how to practice it
3. Tags: Select 1-3 tags from: ${validTags.join(', ')}
4. Effort Level: Choose one: ${validEffortLevels.join(', ')}
   - "tiny" = Very easy, minimal effort (e.g., breathing, quick reflection)
   - "medium" = Moderate effort (e.g., short walk, journaling, stretching)
   - "deep" = More involved, requires focus (e.g., meditation, exercise, creative practice)
5. Suggested Time of Day: Choose one: ${validTimeOfDay.join(', ')}
6. Duration Estimate: Realistic time estimate (e.g., "2 minutes", "5 minutes", "10 minutes", "15 minutes")

Return ONLY a valid JSON object:
{
  "title": "Ritual Title Here",
  "description": "Detailed description of what this ritual involves, why it's meaningful, and how to practice it. Be specific and actionable.",
  "tags": ["tag1", "tag2"],
  "effortLevel": "tiny",
  "suggestedTimeOfDay": "morning",
  "durationEstimate": "5 minutes"
}

IMPORTANT:
- Ensure all tags are from the valid list: ${validTags.join(', ')}
- Ensure effortLevel is one of: ${validEffortLevels.join(', ')}
- Ensure suggestedTimeOfDay is one of: ${validTimeOfDay.join(', ')}
- Make the ritual practical and achievable
- Focus on positive impact and wellness`;

    try {
      const response = await callGeminiAPI(prompt, 1024, 0.8);
      const parsed = extractJSONFromResponse(response) as {
        title?: string;
        description?: string;
        tags?: string[];
        effortLevel?: string;
        suggestedTimeOfDay?: string;
        durationEstimate?: string;
      };

      // Validate and sanitize the response
      if (!parsed.title || !parsed.description) {
        throw new Error('Missing required fields in AI response');
      }

      // Validate tags
      const validTagsList = parsed.tags?.filter(tag => 
        validTags.includes(tag as ImpactTag)
      ) as ImpactTag[] || [];

      if (validTagsList.length === 0) {
        // Default to 'mind' if no valid tags
        validTagsList.push('mind');
      }

      // Validate effort level
      const validEffort = validEffortLevels.includes(parsed.effortLevel as EffortLevel)
        ? (parsed.effortLevel as EffortLevel)
        : 'tiny';

      // Validate time of day
      const validTime = validTimeOfDay.includes(parsed.suggestedTimeOfDay as RitualTimeOfDay)
        ? (parsed.suggestedTimeOfDay as RitualTimeOfDay)
        : 'anytime';

      // Validate duration
      const duration = parsed.durationEstimate || '5 minutes';

      res.status(200).json({
        success: true,
        ritual: {
          title: parsed.title.trim(),
          description: parsed.description.trim(),
          tags: validTagsList,
          effortLevel: validEffort,
          suggestedTimeOfDay: validTime,
          durationEstimate: duration.trim()
        }
      });
    } catch (geminiError) {
      console.error('Error generating ritual with Gemini:', geminiError);
      
      // Fallback: Generate a simple default ritual
      res.status(200).json({
        success: true,
        ritual: {
          title: userInput ? `Ritual: ${userInput.substring(0, 50)}` : 'Daily Wellness Practice',
          description: userInput 
            ? `A personalized ritual inspired by: ${userInput}. Take a few minutes each day to practice this and build positive habits.`
            : 'Take a few minutes each day to practice mindfulness and self-care. This ritual helps you stay grounded and connected to your wellness goals.',
          tags: ['mind'],
          effortLevel: 'tiny',
          suggestedTimeOfDay: 'anytime',
          durationEstimate: '5 minutes'
        }
      });
    }
  } catch (error) {
    console.error('Error generating ritual:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate ritual'
    });
  }
}

