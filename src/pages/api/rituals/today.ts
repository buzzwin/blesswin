import type { NextApiRequest, NextApiResponse } from 'next';
import { getDoc, query, where, getDocs, setDoc, serverTimestamp, doc, collection } from 'firebase/firestore';
import { ritualsCollection, userRitualStateDoc, impactMomentsCollection, ritualCompletionsCollection } from '@lib/firebase/collections';
import { db } from '@lib/firebase/app';
import { getGlobalRituals, getPersonalizedRitualsByTag } from '@lib/data/ritual-definitions';
import type { RitualDefinition, TodayRituals } from '@lib/types/ritual';
import type { ImpactTag } from '@lib/types/impact-moment';

interface TodayRitualsResponse {
  rituals: TodayRituals;
  error?: string;
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
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
      community: 0
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
    const personalizedRituals = await getPersonalizedRituals(userId);
    
    // Get user's custom rituals
    const customRitualsCollection = collection(db, 'users', userId, 'custom_rituals');
    const customRitualsSnapshot = await getDocs(customRitualsCollection);
    const customRituals: RitualDefinition[] = customRitualsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as RitualDefinition));

    // Check completion status for each ritual
    const today = getTodayDateString();
    const todayCompletionsQuery = query(
      ritualCompletionsCollection(userId),
      where('date', '==', today)
    );
    const todayCompletionsSnapshot = await getDocs(todayCompletionsQuery);
    const completedRitualIds = new Set(
      todayCompletionsSnapshot.docs.map(doc => doc.data().ritualId)
    );

    // Combine personalized and custom rituals
    const allPersonalizedRituals = [...personalizedRituals, ...customRituals];

    // Mark rituals as completed if they were completed today
    const todayRituals: TodayRituals = {
      globalRitual: globalRitual ? {
        ...globalRitual,
        completed: completedRitualIds.has(globalRitual.id || '')
      } : null,
      personalizedRituals: allPersonalizedRituals.map(ritual => ({
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

