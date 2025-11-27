import type { NextApiRequest, NextApiResponse } from 'next';
import { query, where, getDocs, orderBy } from 'firebase/firestore';
import { impactMomentsCollection, ritualCompletionsCollection, userRitualStateDoc } from '@lib/firebase/collections';
import { getDoc } from 'firebase/firestore';
import { callGeminiAPI, extractJSONFromResponse } from '@lib/api/gemini';
import { getAllRitualDefinitions } from '@lib/data/ritual-definitions';
import type { RitualDefinition, RitualCompletion } from '@lib/types/ritual';
import type { ImpactMoment, ImpactTag, EffortLevel } from '@lib/types/impact-moment';

interface PersonalizeRequest {
  userId: string;
}

interface PersonalizeResponse {
  personalizedRituals: RitualDefinition[];
  analysis?: {
    preferredTags: ImpactTag[];
    preferredEffortLevel: EffortLevel;
    preferredTimeOfDay: string;
    completionPattern: string;
    suggestions: string[];
  };
  error?: string;
}

/**
 * Analyze user's Impact Moments to understand patterns
 * Exported for use in today.ts
 */
export async function analyzeUserPatterns(userId: string): Promise<{
  moments: ImpactMoment[];
  tagFrequency: Record<ImpactTag, number>;
  effortLevelFrequency: Record<EffortLevel, number>;
  moodPatterns: { before: number[]; after: number[] };
  textSamples: string[];
}> {
  const momentsQuery = query(
    impactMomentsCollection,
    where('createdBy', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const momentsSnapshot = await getDocs(momentsQuery);
  const moments = momentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ImpactMoment));

  const tagFrequency: Record<ImpactTag, number> = {
    mind: 0,
    body: 0,
    relationships: 0,
    nature: 0,
    community: 0
  };

  const effortLevelFrequency: Record<EffortLevel, number> = {
    tiny: 0,
    medium: 0,
    deep: 0
  };

  const moodPatterns = { before: [] as number[], after: [] as number[] };
  const textSamples: string[] = [];

  moments.forEach(moment => {
    moment.tags.forEach(tag => {
      tagFrequency[tag]++;
    });
    effortLevelFrequency[moment.effortLevel]++;
    
    if (moment.moodCheckIn) {
      moodPatterns.before.push(moment.moodCheckIn.before);
      moodPatterns.after.push(moment.moodCheckIn.after);
    }
    
    if (moment.text) {
      textSamples.push(moment.text.substring(0, 200)); // Sample first 200 chars
    }
  });

  return {
    moments,
    tagFrequency,
    effortLevelFrequency,
    moodPatterns,
    textSamples: textSamples.slice(0, 10) // Keep last 10 samples
  };
}

/**
 * Analyze completion history
 * Exported for use in today.ts
 */
export async function analyzeCompletionHistory(userId: string): Promise<{
  completions: RitualCompletion[];
  completedRitualIds: Set<string>;
  completionRate: number;
  preferredTimeOfDay: string[];
}> {
  const completionsQuery = query(ritualCompletionsCollection(userId));
  const completionsSnapshot = await getDocs(completionsQuery);
  const completions = completionsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as RitualCompletion[];

  const completedRitualIds = new Set(completions.map(c => c.ritualId));
  
  // Calculate completion rate (completions per week)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recentCompletions = completions.filter(c => {
    const completedAt = c.completedAt instanceof Date ? c.completedAt : c.completedAt?.toDate();
    return completedAt && completedAt >= weekAgo;
  });

  // For now, we'll use a simple heuristic for preferred time of day
  // In a full implementation, we'd track actual completion times
  const preferredTimeOfDay = ['morning', 'afternoon', 'evening'];

  return {
    completions,
    completedRitualIds,
    completionRate: recentCompletions.length / 7, // Completions per day
    preferredTimeOfDay
  };
}

/**
 * Use Gemini to generate personalized ritual suggestions
 * Exported for use in today.ts
 */
export async function generatePersonalizedRituals(
  userPatterns: Awaited<ReturnType<typeof analyzeUserPatterns>>,
  completionHistory: Awaited<ReturnType<typeof analyzeCompletionHistory>>,
  availableRituals: RitualDefinition[]
): Promise<{
  selectedRituals: RitualDefinition[];
  analysis: PersonalizeResponse['analysis'];
}> {
  // Prepare context for Gemini
  const topTags = Object.entries(userPatterns.tagFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([tag]) => tag);

  const topEffortLevel = Object.entries(userPatterns.effortLevelFrequency)
    .sort(([, a], [, b]) => b - a)[0]?.[0] as EffortLevel || 'tiny';

  const avgMoodImprovement = userPatterns.moodPatterns.after.length > 0
    ? userPatterns.moodPatterns.after.reduce((a, b) => a + b, 0) / userPatterns.moodPatterns.after.length -
      userPatterns.moodPatterns.before.reduce((a, b) => a + b, 0) / userPatterns.moodPatterns.before.length
    : 0;

  const prompt = `You are a wellness AI assistant helping personalize daily rituals for a user.

USER PATTERNS:
- Most active tags: ${topTags.join(', ')}
- Preferred effort level: ${topEffortLevel}
- Average mood improvement: ${avgMoodImprovement.toFixed(1)} points
- Total Impact Moments: ${userPatterns.moments.length}
- Recent completion rate: ${completionHistory.completionRate.toFixed(1)} per day
- Already completed rituals: ${completionHistory.completedRitualIds.size}

AVAILABLE RITUALS:
${availableRituals.map((r, idx) => `
${idx + 1}. "${r.title}"
   Tags: ${r.tags.join(', ')}
   Effort: ${r.effortLevel}
   Time: ${r.suggestedTimeOfDay}
   Duration: ${r.durationEstimate}
   Description: ${r.description}
`).join('\n')}

TASK: Select 1-2 personalized rituals that:
1. Match the user's preferred tags (${topTags.join(', ')})
2. Align with their preferred effort level (${topEffortLevel})
3. Haven't been completed recently (exclude: ${Array.from(completionHistory.completedRitualIds).slice(0, 5).join(', ')})
4. Would help them continue their wellness journey
5. Are appropriate for their completion rate (${completionHistory.completionRate.toFixed(1)} per day)

Return ONLY a valid JSON object:
{
  "selectedRitualIndices": [1, 5], // Indices from the available rituals list (1-based)
  "analysis": {
    "preferredTags": ["tag1", "tag2"],
    "preferredEffortLevel": "tiny" | "medium" | "deep",
    "preferredTimeOfDay": "morning" | "afternoon" | "evening" | "anytime",
    "completionPattern": "Brief description of user's completion pattern",
    "suggestions": ["Suggestion 1", "Suggestion 2"]
  }
}`;

  try {
    const response = await callGeminiAPI(prompt, 1024, 0.7);
    const parsed = extractJSONFromResponse(response) as {
      selectedRitualIndices?: number[];
      analysis?: PersonalizeResponse['analysis'];
    };

    const selectedIndices = parsed.selectedRitualIndices || [];
    const selectedRituals = selectedIndices
      .map(idx => availableRituals[idx - 1]) // Convert 1-based to 0-based
      .filter(Boolean)
      .slice(0, 2); // Max 2 personalized rituals

    return {
      selectedRituals,
      analysis: parsed.analysis || {
        preferredTags: topTags as ImpactTag[],
        preferredEffortLevel: topEffortLevel,
        preferredTimeOfDay: 'anytime',
        completionPattern: `User completes ${completionHistory.completionRate.toFixed(1)} rituals per day`,
        suggestions: []
      }
    };
  } catch (error) {
    console.error('Error generating personalized rituals with AI:', error);
    // Fallback to rule-based selection
    return {
      selectedRituals: availableRituals
        .filter(r => topTags.some(tag => r.tags.includes(tag as ImpactTag)))
        .filter(r => !completionHistory.completedRitualIds.has(r.id || ''))
        .slice(0, 2),
      analysis: {
        preferredTags: topTags as ImpactTag[],
        preferredEffortLevel: topEffortLevel,
        preferredTimeOfDay: 'anytime',
        completionPattern: `User completes ${completionHistory.completionRate.toFixed(1)} rituals per day`,
        suggestions: []
      }
    };
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PersonalizeResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({
      personalizedRituals: [],
      error: 'Method not allowed'
    });
    return;
  }

  try {
    const { userId } = req.body as PersonalizeRequest;

    if (!userId || typeof userId !== 'string') {
      res.status(400).json({
        personalizedRituals: [],
        error: 'User ID is required'
      });
      return;
    }

    // Get user ritual state
    const userStateDoc = userRitualStateDoc(userId);
    const userStateSnapshot = await getDoc(userStateDoc);
    const userState = userStateSnapshot.exists() ? userStateSnapshot.data() : null;

    if (!userState || !userState.enabled) {
      res.status(200).json({
        personalizedRituals: [],
        error: 'Rituals not enabled for this user'
      });
      return;
    }

    // Analyze user patterns
    const userPatterns = await analyzeUserPatterns(userId);
    const completionHistory = await analyzeCompletionHistory(userId);

    // Get all available personalized rituals
    const allRituals = getAllRitualDefinitions();
    const personalizedRituals = allRituals.filter(r => r.scope === 'personalized');

    // Filter out recently completed rituals (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentCompletions = completionHistory.completions.filter(c => {
      const completedAt = c.completedAt instanceof Date ? c.completedAt : c.completedAt?.toDate();
      return completedAt && completedAt >= weekAgo;
    });
    const recentlyCompletedIds = new Set(recentCompletions.map(c => c.ritualId));

    const availableRituals = personalizedRituals.filter(
      r => !recentlyCompletedIds.has(r.id || '')
    );

    // If no available rituals, return empty
    if (availableRituals.length === 0) {
      res.status(200).json({
        personalizedRituals: [],
        analysis: {
          preferredTags: Object.entries(userPatterns.tagFrequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([tag]) => tag as ImpactTag),
          preferredEffortLevel: Object.entries(userPatterns.effortLevelFrequency)
            .sort(([, a], [, b]) => b - a)[0]?.[0] as EffortLevel || 'tiny',
          preferredTimeOfDay: 'anytime',
          completionPattern: `User completes ${completionHistory.completionRate.toFixed(1)} rituals per day`,
          suggestions: ['Try completing more rituals to get personalized suggestions']
        }
      });
      return;
    }

    // Use AI to generate personalized suggestions
    const { selectedRituals, analysis } = await generatePersonalizedRituals(
      userPatterns,
      completionHistory,
      availableRituals
    );

    res.status(200).json({
      personalizedRituals: selectedRituals,
      analysis
    });
  } catch (error) {
    console.error('Error personalizing rituals:', error);
    res.status(500).json({
      personalizedRituals: [],
      error: 'Failed to personalize rituals'
    });
  }
}

