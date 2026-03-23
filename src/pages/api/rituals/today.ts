import type { NextApiRequest, NextApiResponse } from 'next';
import { getDoc, query, where, getDocs, setDoc, serverTimestamp, doc, collection, orderBy, limit } from 'firebase/firestore';
import { ritualsCollection, userRitualStateDoc, impactMomentsCollection, ritualCompletionsCollection } from '@lib/firebase/collections';
import { db } from '@lib/firebase/app';
import { getGlobalRituals, getPersonalizedRitualsByTag } from '@lib/data/ritual-definitions';
import type { RitualDefinition, TodayRituals, RitualFrequency, RitualScope, RitualTimeOfDay } from '@lib/types/ritual';
import type { AutomationTrigger } from '@lib/types/automation';
import { isDateMatchingRRULE } from '@lib/utils/rrule';
import type { ImpactTag, EffortLevel } from '@lib/types/impact-moment';
import { isAutomation } from '@lib/types/unified-ritual';

interface TodayRitualsResponse {
  rituals: TodayRituals;
  error?: string;
}

const impactTagValues: ImpactTag[] = ['mind', 'body', 'relationships', 'nature', 'community', 'chores'];
const effortLevels: EffortLevel[] = ['tiny', 'medium', 'deep'];
const ritualScopes: RitualScope[] = ['global', 'personalized', 'public'];
const ritualTimes: RitualTimeOfDay[] = ['morning', 'afternoon', 'evening', 'anytime'];

const asString = (value: unknown, fallback: string): string =>
  typeof value === 'string' ? value : fallback;

const asStringArray = (value: unknown, fallback: string[] = []): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : fallback;

const asImpactTags = (value: unknown, fallback: ImpactTag[] = ['mind']): ImpactTag[] => {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const tags = value.filter((item): item is ImpactTag => impactTagValues.includes(item as ImpactTag));
  return tags.length ? tags : fallback;
};

const asEffortLevel = (value: unknown, fallback: EffortLevel = 'tiny'): EffortLevel =>
  effortLevels.includes(value as EffortLevel) ? (value as EffortLevel) : fallback;

const asRitualScope = (value: unknown, fallback: RitualScope = 'personalized'): RitualScope =>
  ritualScopes.includes(value as RitualScope) ? (value as RitualScope) : fallback;

const asRitualTime = (value: unknown, fallback: RitualTimeOfDay = 'anytime'): RitualTimeOfDay =>
  ritualTimes.includes(value as RitualTimeOfDay) ? (value as RitualTimeOfDay) : fallback;

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Check if a ritual is due based on its frequency and last completion
 */
function isRitualDue(
  ritual: RitualDefinition,
  lastCompletionDate: Date | null,
  today: Date = new Date()
): boolean {
  const rrule: RitualFrequency | undefined = ritual.frequency;
  
  // If no RRULE, default to daily
  if (!rrule) {
    // Default to daily - check if not completed today
    if (!lastCompletionDate) {
      return true;
    }
    const lastCompletionDay = new Date(lastCompletionDate);
    const isCompletedToday = 
      lastCompletionDay.getDate() === today.getDate() &&
      lastCompletionDay.getMonth() === today.getMonth() &&
      lastCompletionDay.getFullYear() === today.getFullYear();
    return !isCompletedToday;
  }
  
  // Use RRULE parser to check if date matches
  return isDateMatchingRRULE(rrule, today, lastCompletionDate);
}

/**
 * Calculate user's preferred tags from their Impact Moments
 */
async function getUserPreferredTags(userId: string): Promise<ImpactTag[]> {
  try {
    const userMomentsQuery = query(
      impactMomentsCollection,
      where('createdBy', '==', userId)
    );
    const momentsSnapshot = await getDocs(userMomentsQuery);
    
    const tagCounts: Record<ImpactTag, number> = {
      mind: 0,
      body: 0,
      relationships: 0,
      nature: 0,
      community: 0,
      chores: 0
    };

    momentsSnapshot.docs.forEach(doc => {
      const moment = doc.data();
      moment.tags.forEach((tag: ImpactTag) => {
        if (tagCounts[tag] !== undefined) {
          tagCounts[tag]++;
        }
      });
    });

    // Sort tags by frequency and return top 2-3
    const sortedTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .filter(([, count]) => count > 0)
      .slice(0, 3)
      .map(([tag]) => tag as ImpactTag);

    return sortedTags.length > 0 ? sortedTags : ['mind', 'body']; // Default tags
  } catch (error) {
    console.error('Error calculating preferred tags:', error);
    return ['mind', 'body']; // Default fallback
  }
}

/**
 * Get or assign today's global ritual
 * Only uses Firestore rituals - no hardcoded fallback
 */
async function getTodaysGlobalRitual(): Promise<RitualDefinition | null> {
  const today = getTodayDateString();
  
  // Only get from Firestore - no hardcoded fallback
  const ritualsSnapshot = await getDocs(ritualsCollection);
  const firestoreRituals = ritualsSnapshot.docs
    .map(doc => {
      const data = doc.data();
      // Remove any id field from document data to ensure we use the Firestore document ID
      const { id: _, ...dataWithoutId } = data;
      return {
        id: doc.id, // Use Firestore document ID, not any id field in the document
        ...dataWithoutId
      } as RitualDefinition;
    })
    .filter(r => r.scope === 'global');
  
  if (firestoreRituals.length === 0) {
    return null;
  }

  // Use day of year to rotate rituals consistently
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const selectedRitual = firestoreRituals[dayOfYear % firestoreRituals.length];
  return selectedRitual;
}

/**
 * Get personalized rituals for user using AI personalization
 */
async function getPersonalizedRituals(userId: string): Promise<RitualDefinition[]> {
  try {
    // First, try to get from Firestore
        const ritualsSnapshot = await getDocs(ritualsCollection);
        const firestoreRituals = ritualsSnapshot.docs
          .map(doc => {
            const data = doc.data();
            // Remove any id field from document data to ensure we use the Firestore document ID
            const { id: _, ...dataWithoutId } = data;
            return {
              id: doc.id, // Use Firestore document ID, not any id field in the document
              ...dataWithoutId
            } as RitualDefinition;
          })
          .filter(r => r.scope === 'personalized');
    
    // Use AI personalization API (call functions directly)
    const personalizeModule = await import('./personalize');
    
    const userPatterns = await personalizeModule.analyzeUserPatterns(userId);
    const completionHistory = await personalizeModule.analyzeCompletionHistory(userId);
    
    // Only use Firestore rituals - no hardcoded fallback
    if (firestoreRituals.length === 0) {
      return [];
    }
    
    const personalizedRituals = firestoreRituals;
    
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

    if (availableRituals.length === 0) {
      return getPersonalizedRitualsFallback(userId);
    }

    const { selectedRituals } = await personalizeModule.generatePersonalizedRituals(
      userPatterns,
      completionHistory,
      availableRituals
    );

    return selectedRituals.length > 0 ? selectedRituals : getPersonalizedRitualsFallback(userId);
  } catch (error) {
    console.error('Error fetching personalized rituals:', error);
    // Fallback to rule-based selection
    return getPersonalizedRitualsFallback(userId);
  }
}

/**
 * Fallback rule-based personalized ritual selection
 */
async function getPersonalizedRitualsFallback(userId: string): Promise<RitualDefinition[]> {
  const preferredTags = await getUserPreferredTags(userId);
  
  // Get 1-2 personalized rituals based on preferred tags
  const personalizedRituals: RitualDefinition[] = [];
  const usedRitualIds = new Set<string>();

  // Only use Firestore rituals - no hardcoded fallback
        const ritualsSnapshot = await getDocs(ritualsCollection);
        const firestoreRituals = ritualsSnapshot.docs
          .map(doc => {
            const data = doc.data();
            // Remove any id field from document data to ensure we use the Firestore document ID
            const { id: _, ...dataWithoutId } = data;
            return {
              id: doc.id, // Use Firestore document ID, not any id field in the document
              ...dataWithoutId
            } as RitualDefinition;
          })
          .filter(r => r.scope === 'personalized');
  
  if (firestoreRituals.length === 0) {
    return [];
  }

  for (const tag of preferredTags.slice(0, 2)) {
    const tagRituals = firestoreRituals.filter(r => r.tags.includes(tag));
    
    // Filter out rituals user has seen recently (last 7 days)
    const availableRituals = tagRituals.filter(r => !usedRitualIds.has(r.id || ''));
    
    if (availableRituals.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableRituals.length);
      const selectedRitual = availableRituals[randomIndex];
      personalizedRituals.push(selectedRitual);
      if (selectedRitual.id) {
        usedRitualIds.add(selectedRitual.id);
      }
    }
  }

  return personalizedRituals.slice(0, 2); // Max 2 personalized rituals
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TodayRitualsResponse>
): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ rituals: { globalRitual: null, personalizedRituals: [], date: getTodayDateString() }, error: 'Method not allowed' });
    return;
  }

  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ 
        rituals: { globalRitual: null, personalizedRituals: [], date: getTodayDateString() }, 
        error: 'User ID is required' 
      });
      return;
    }

    // Check if user has rituals enabled
    const userStateDoc = userRitualStateDoc(userId);
    const userStateSnapshot = await getDoc(userStateDoc);
    const userState = userStateSnapshot.exists() ? userStateSnapshot.data() : null;

    if (!userState || !userState.enabled) {
      res.status(200).json({
        rituals: {
          globalRitual: null,
          personalizedRituals: [],
          date: getTodayDateString()
        },
        error: 'Rituals not enabled for this user'
      });
      return;
    }

    // Get today's rituals
    const globalRitual = await getTodaysGlobalRitual();
    
    // Get user's custom rituals (including automations)
    const customRitualsCollection = collection(db, 'users', userId, 'custom_rituals');
    const customRitualsSnapshot = await getDocs(customRitualsCollection);
    const customRituals: RitualDefinition[] = customRitualsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as RitualDefinition));

    // Get automations from user's automations collection (for backward compatibility)
    const userAutomationsCollection = collection(db, 'users', userId, 'automations');
    const automationsSnapshot = await getDocs(userAutomationsCollection);
    const automations = automationsSnapshot.docs.map(doc => ({
      id: doc.id,
      data: doc.data() as Record<string, unknown>
    }));

    // Filter automations with time triggers that match current time
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
    const currentTimeString = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

    const triggeredAutomations = automations.filter(({ data }) => {
      if (data.isActive === false) {
        return false;
      }

      const triggers = Array.isArray(data.triggers) ? data.triggers : [];
      if (triggers.length === 0) {
        return false;
      }

      return triggers.some((trigger: unknown) => {
        if (!trigger || typeof trigger !== 'object') {
          return false;
        }

        const typedTrigger = trigger as AutomationTrigger;
        if (typedTrigger.type !== 'time') return false;
        
        const config = typedTrigger.config;
        if (!config?.time) return false;

        // Check if time matches (simple HH:MM comparison)
        const triggerTime = config.time;
        if (triggerTime === currentTimeString) {
          // Check frequency
          if (config.frequency === 'daily') {
            return true;
          } else if (config.frequency === 'weekly' && config.daysOfWeek) {
            return config.daysOfWeek.includes(currentDayOfWeek);
          } else if (config.frequency === 'monthly') {
            // For monthly, check if it's the same day of month
            return now.getDate() === 1; // Simple: trigger on 1st of month
          }
        }
        return false;
      });
    });

    // Convert triggered automations to ritual format for today's list
    const automationRituals: RitualDefinition[] = triggeredAutomations
      .filter(({ data }) => {
        // Only include if automation has a ritual action or is completable
        const actions = Array.isArray(data.actions) ? data.actions : [];
        const hasRitualAction = actions.some(action => {
          if (!action || typeof action !== 'object') {
            return false;
          }

          return (action as Record<string, unknown>).type === 'ritual';
        });
        return hasRitualAction || data.isCompletable === true;
      })
      .map(({ id, data }) => ({
        id,
        title: asString(data.title, 'Untitled automation'),
        description: asString(data.description, ''),
        tags: asImpactTags(data.tags),
        effortLevel: asEffortLevel(data.effortLevel),
        scope: asRitualScope(data.scope),
        suggestedTimeOfDay: asRitualTime(data.suggestedTimeOfDay),
        durationEstimate: asString(data.durationEstimate, '5 minutes'),
        prefillTemplate: asString(
          data.prefillTemplate,
          `Completed automation: ${asString(data.title, 'automation')}`
        ),
        frequency: typeof data.frequency === 'string' ? data.frequency : undefined,
        createdAt: data.createdAt as RitualDefinition['createdAt'],
        usageCount: typeof data.usageCount === 'number' ? data.usageCount : 0,
        completionRate: typeof data.completionRate === 'number' ? data.completionRate : 0,
        joinedByUsers: asStringArray(data.joinedByUsers),
        // Mark as automation for UI
        _isAutomation: true,
        _automationTriggers: data.triggers,
        _automationActions: data.actions
      } as RitualDefinition));

    // Get joined rituals from main collection (rituals where user is in joinedByUsers)
    // Since joined rituals are no longer copied to custom_rituals, we need to fetch them from main collection
    const allRitualsSnapshot = await getDocs(ritualsCollection);
    const joinedRitualsFromMain: RitualDefinition[] = allRitualsSnapshot.docs
      .map(doc => {
        const data = doc.data();
        const { id: _, ...dataWithoutId } = data;
        return {
          id: doc.id,
          ...dataWithoutId
        } as RitualDefinition;
      })
      .filter(ritual => {
        const joinedByUsers = ritual.joinedByUsers || [];
        return joinedByUsers.includes(userId);
      });

    // Get all completions for this user to check last completion dates
    const allCompletionsQuery = query(
      ritualCompletionsCollection(userId),
      orderBy('completedAt', 'desc')
    );
    const allCompletionsSnapshot = await getDocs(allCompletionsQuery);
    
    // Build a map of ritualId -> last completion date
    const lastCompletionDates = new Map<string, Date>();
    allCompletionsSnapshot.docs.forEach(doc => {
      const completion = doc.data();
      const ritualId = completion.ritualId;
      
      // Handle both Timestamp and Date types
      let completedAt: Date | null = null;
      if (completion.completedAt) {
        if (completion.completedAt instanceof Date) {
          completedAt = completion.completedAt;
        } else if (typeof completion.completedAt.toDate === 'function') {
          // Firestore Timestamp
          completedAt = completion.completedAt.toDate();
        }
      }
      
      if (ritualId && completedAt) {
        // Only keep the most recent completion for each ritual
        if (!lastCompletionDates.has(ritualId) || 
            (lastCompletionDates.get(ritualId)?.getTime() || 0) < completedAt.getTime()) {
          lastCompletionDates.set(ritualId, completedAt);
        }
      }
    });

    // Check completion status for today
    const today = getTodayDateString();
    const todayCompletionsQuery = query(
      ritualCompletionsCollection(userId),
      where('date', '==', today)
    );
    const todayCompletionsSnapshot = await getDocs(todayCompletionsQuery);
    const completedRitualIds = new Set(
      todayCompletionsSnapshot.docs.map(doc => doc.data().ritualId)
    );

    // Combine custom rituals and joined rituals from main collection
    // Deduplicate by ID to avoid showing the same ritual twice
    const allUserRitualsMap = new Map<string, RitualDefinition>();
    customRituals.forEach(ritual => {
      if (ritual.id) {
        allUserRitualsMap.set(ritual.id, ritual);
      }
    });
    joinedRitualsFromMain.forEach(ritual => {
      if (ritual.id && !allUserRitualsMap.has(ritual.id)) {
        allUserRitualsMap.set(ritual.id, ritual);
      }
    });
    const allUserRituals = Array.from(allUserRitualsMap.values());

    // Filter rituals by frequency - only show rituals that are due
    const todayDate = new Date();
    const dueCustomRituals = allUserRituals.filter(ritual => {
      if (!ritual.id) return false;
      const lastCompletion = lastCompletionDates.get(ritual.id) || null;
      return isRitualDue(ritual, lastCompletion, todayDate);
    });

    // Only use custom rituals (no personalized rituals)
    const globalRitualId = globalRitual?.id;
    
    // Check if global ritual is due (if it exists)
    let dueGlobalRitual: RitualDefinition | null = null;
    if (globalRitual) {
      const globalLastCompletion = globalRitual.id ? lastCompletionDates.get(globalRitual.id) || null : null;
      if (isRitualDue(globalRitual, globalLastCompletion, todayDate)) {
        dueGlobalRitual = globalRitual;
      }
    }
    
    // Combine custom rituals and automation-triggered rituals
    const allDueRituals = [...dueCustomRituals, ...automationRituals];

    // Deduplicate and exclude global ritual if it appears
    const seenIds = new Set<string>();
    const uniqueCustomRituals = allDueRituals.filter((ritual) => {
      if (!ritual.id) return false; // Skip rituals without IDs
      
      // Exclude global ritual from custom list
      if (ritual.id === globalRitualId) {
        return false;
      }
      
      // Deduplicate by ID
      if (seenIds.has(ritual.id)) {
        return false;
      }
      
      seenIds.add(ritual.id);
      return true;
    });

    // Mark rituals as completed if they were completed today
    const todayRituals: TodayRituals = {
      globalRitual: dueGlobalRitual ? {
        ...dueGlobalRitual,
        completed: completedRitualIds.has(dueGlobalRitual.id || '')
      } : null,
      personalizedRituals: uniqueCustomRituals.map(ritual => ({
        ...ritual,
        completed: completedRitualIds.has(ritual.id || '')
      })),
      date: today
    };

    res.status(200).json({ rituals: todayRituals });
  } catch (error) {
    console.error('Error fetching today\'s rituals:', error);
    res.status(500).json({
      rituals: { globalRitual: null, personalizedRituals: [], date: getTodayDateString() },
      error: 'Failed to fetch today\'s rituals'
    });
  }
}
