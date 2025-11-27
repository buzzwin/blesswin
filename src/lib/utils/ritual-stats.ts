import type { RitualCompletion, UserRitualState, RitualStats } from '@lib/types/ritual';
import type { ImpactTag } from '@lib/types/impact-moment';

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Get date string for N days ago
 */
export function getDateStringDaysAgo(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

/**
 * Check if two dates are consecutive days
 */
export function areConsecutiveDays(date1: string, date2: string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

/**
 * Calculate current streak from completion dates
 */
export function calculateStreak(completions: RitualCompletion[]): number {
  if (completions.length === 0) return 0;

  // Sort by date descending
  const sortedCompletions = [...completions].sort((a, b) => {
    const dateA = typeof a.completedAt === 'string' ? a.date : a.date;
    const dateB = typeof b.completedAt === 'string' ? b.date : b.date;
    return dateB.localeCompare(dateA);
  });

  // Get unique dates
  const uniqueDates = Array.from(new Set(sortedCompletions.map(c => c.date))).sort().reverse();
  
  if (uniqueDates.length === 0) return 0;

  const today = getTodayDateString();
  const yesterday = getDateStringDaysAgo(1);

  // Check if streak is still active (completed today or yesterday)
  let streak = 0;
  let expectedDate = today;

  // If most recent completion is today, start counting from today
  if (uniqueDates[0] === today) {
    streak = 1;
    expectedDate = yesterday;
  } else if (uniqueDates[0] === yesterday) {
    // If most recent is yesterday, streak is still active
    streak = 1;
    expectedDate = getDateStringDaysAgo(2);
  } else {
    // Streak is broken
    return 0;
  }

  // Count consecutive days backwards
  for (let i = 1; i < uniqueDates.length; i++) {
    if (uniqueDates[i] === expectedDate) {
      streak++;
      const expectedDateObj = new Date(expectedDate);
      expectedDateObj.setDate(expectedDateObj.getDate() - 1);
      expectedDate = expectedDateObj.toISOString().split('T')[0];
    } else {
      // Gap found, streak ends
      break;
    }
  }

  return streak;
}

/**
 * Calculate longest streak from all completions
 */
export function calculateLongestStreak(completions: RitualCompletion[]): number {
  if (completions.length === 0) return 0;

  const uniqueDates = Array.from(new Set(completions.map(c => c.date)))
    .sort()
    .reverse();

  if (uniqueDates.length === 0) return 0;

  let longestStreak = 1;
  let currentStreak = 1;

  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const date1 = new Date(uniqueDates[i]);
    const date2 = new Date(uniqueDates[i + 1]);
    const diffDays = Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return longestStreak;
}

/**
 * Get recent streak history
 */
export function getRecentStreaks(completions: RitualCompletion[]): Array<{ startDate: string; endDate: string; length: number }> {
  if (completions.length === 0) return [];

  const uniqueDates = Array.from(new Set(completions.map(c => c.date)))
    .sort()
    .reverse();

  const streaks: Array<{ startDate: string; endDate: string; length: number }> = [];
  let currentStreakStart: string | null = null;
  let currentStreakLength = 0;

  for (let i = 0; i < uniqueDates.length; i++) {
    const currentDate = uniqueDates[i];
    const prevDate = i > 0 ? uniqueDates[i - 1] : null;

    if (prevDate) {
      const date1 = new Date(currentDate);
      const date2 = new Date(prevDate);
      const diffDays = Math.floor((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day
        if (!currentStreakStart) {
          currentStreakStart = prevDate;
          currentStreakLength = 2;
        } else {
          currentStreakLength++;
        }
      } else {
        // Gap found, save streak
        if (currentStreakStart && currentStreakLength >= 2) {
          streaks.push({
            startDate: currentStreakStart,
            endDate: prevDate,
            length: currentStreakLength
          });
        }
        currentStreakStart = null;
        currentStreakLength = 0;
      }
    }
  }

  // Save last streak if exists
  if (currentStreakStart && currentStreakLength >= 2) {
    streaks.push({
      startDate: currentStreakStart,
      endDate: uniqueDates[0],
      length: currentStreakLength
    });
  }

  return streaks.slice(0, 5); // Return last 5 streaks
}

/**
 * Calculate completion trend
 */
export function calculateCompletionTrend(completions: RitualCompletion[]): 'increasing' | 'decreasing' | 'stable' {
  if (completions.length < 7) return 'stable';

  const today = getTodayDateString();
  const weekAgo = getDateStringDaysAgo(7);
  const twoWeeksAgo = getDateStringDaysAgo(14);

  const lastWeek = completions.filter(c => c.date >= weekAgo && c.date < today).length;
  const previousWeek = completions.filter(c => c.date >= twoWeeksAgo && c.date < weekAgo).length;

  if (lastWeek > previousWeek * 1.1) return 'increasing';
  if (lastWeek < previousWeek * 0.9) return 'decreasing';
  return 'stable';
}

/**
 * Get best day of week for completions
 */
export function getBestDay(completions: RitualCompletion[]): string | undefined {
  if (completions.length === 0) return undefined;

  const dayCounts: Record<string, number> = {
    Sunday: 0,
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0
  };

  completions.forEach(c => {
    const date = new Date(c.date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    dayCounts[dayName]++;
  });

  const sorted = Object.entries(dayCounts)
    .sort(([, a], [, b]) => b - a);

  return sorted[0]?.[1] > 0 ? sorted[0][0] : undefined;
}

/**
 * Calculate stats from completions with enhanced metrics
 */
export function calculateStats(
  completions: RitualCompletion[],
  userState: UserRitualState | null,
  ritualDefinitions?: Array<{ id?: string; tags: ImpactTag[] }> // Optional ritual data for tag counting
): RitualStats {
  const today = getTodayDateString();
  const weekAgo = getDateStringDaysAgo(7);
  const monthAgo = getDateStringDaysAgo(30);

  // Filter completions by date ranges
  const thisWeek = completions.filter(c => c.date >= weekAgo);
  const thisMonth = completions.filter(c => c.date >= monthAgo);

  // Get unique completion dates
  const uniqueDates = Array.from(new Set(completions.map(c => c.date)));

  // Count by tag if we have ritual data
  const tagCounts: Record<ImpactTag, number> = {
    mind: 0,
    body: 0,
    relationships: 0,
    nature: 0,
    community: 0
  };

  if (ritualDefinitions && ritualDefinitions.length > 0) {
    const ritualMap = new Map(ritualDefinitions.map(r => [r.id, r]));
    completions.forEach(c => {
      const ritual = ritualMap.get(c.ritualId);
      if (ritual) {
        ritual.tags.forEach(tag => {
          tagCounts[tag]++;
        });
      }
    });
  }

  const mostActiveTags = Object.entries(tagCounts)
    .filter(([, count]) => count > 0)
    .map(([tag, count]) => ({ tag: tag as ImpactTag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const sharedCount = completions.filter(c => !c.completedQuietly && c.sharedAsMomentId).length;
  const quietCount = completions.filter(c => c.completedQuietly).length;

  const currentStreak = calculateStreak(completions);
  const longestStreak = Math.max(
    userState?.longestStreak || 0,
    currentStreak,
    calculateLongestStreak(completions)
  );

  // Calculate enhanced metrics
  const totalDays = Math.max(1, Math.floor((Date.now() - new Date(uniqueDates[uniqueDates.length - 1] || today).getTime()) / (1000 * 60 * 60 * 24)) + 1);
  const averageCompletionsPerDay = completions.length / totalDays;
  const completionRate = (uniqueDates.length / totalDays) * 100;

  // Milestones
  const streakMilestones = [7, 14, 30, 60, 100].map(milestone => {
    const achieved = longestStreak >= milestone;
    // Find when milestone was achieved (simplified - would need more detailed tracking)
    return {
      milestone,
      achieved,
      achievedAt: achieved ? undefined : undefined // Would need to track when achieved
    };
  });

  const completionMilestones = [10, 25, 50, 100, 250, 500].map(milestone => {
    const achieved = completions.length >= milestone;
    return {
      milestone,
      achieved,
      achievedAt: achieved ? undefined : undefined
    };
  });

  const recentStreaks = getRecentStreaks(completions);
  const completionTrend = calculateCompletionTrend(completions);
  const bestDay = getBestDay(completions);
  const lastCompletedDate = uniqueDates.length > 0 ? uniqueDates[0] : undefined;

  return {
    currentStreak,
    longestStreak,
    totalCompleted: completions.length,
    completedThisWeek: thisWeek.length,
    completedThisMonth: thisMonth.length,
    completedDays: uniqueDates.length,
    mostActiveTags,
    sharedCount,
    quietCount,
    averageCompletionsPerDay: parseFloat(averageCompletionsPerDay.toFixed(2)),
    completionRate: parseFloat(completionRate.toFixed(1)),
    bestDay,
    streakMilestones,
    completionMilestones,
    recentStreaks,
    completionTrend,
    lastCompletedDate
  };
}

