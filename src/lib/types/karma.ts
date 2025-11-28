import type { Timestamp } from 'firebase/firestore';

/**
 * Karma action types that can earn points
 */
export type KarmaAction =
  | 'impact_moment_created'
  | 'impact_moment_with_mood'
  | 'impact_moment_from_ritual'
  | 'ritual_completed_quiet'
  | 'ritual_completed_shared'
  | 'comment_created'
  | 'ripple_received'
  | 'joined_you_received'
  | 'joined_you_created'
  | 'streak_milestone_7'
  | 'streak_milestone_30'
  | 'impact_milestone_100'
  | 'impact_milestone_500';

/**
 * Karma breakdown by category
 */
export interface KarmaBreakdown {
  impactMoments: number; // Points from creating and sharing moments
  rituals: number; // Points from completing rituals
  engagement: number; // Points from comments and ripples received
  chains: number; // Points from "Joined You" actions
  milestones: number; // Bonus points for achievements
}

/**
 * Karma point values for each action
 */
export const KARMA_POINTS: Record<KarmaAction, number> = {
  impact_moment_created: 10,
  impact_moment_with_mood: 15,
  impact_moment_from_ritual: 12,
  ritual_completed_quiet: 5,
  ritual_completed_shared: 10,
  comment_created: 3,
  ripple_received: 2,
  joined_you_received: 15,
  joined_you_created: 10,
  streak_milestone_7: 25,
  streak_milestone_30: 100,
  impact_milestone_100: 50,
  impact_milestone_500: 250
};

/**
 * Default karma breakdown (all zeros)
 */
export const DEFAULT_KARMA_BREAKDOWN: KarmaBreakdown = {
  impactMoments: 0,
  rituals: 0,
  engagement: 0,
  chains: 0,
  milestones: 0
};

/**
 * Helper function to get karma points for an action
 */
export function getKarmaPoints(action: KarmaAction): number {
  return KARMA_POINTS[action] || 0;
}

/**
 * Helper function to determine which category an action belongs to
 */
export function getKarmaCategory(action: KarmaAction): keyof KarmaBreakdown {
  if (action.startsWith('impact_moment')) {
    return 'impactMoments';
  }
  if (action.startsWith('ritual_completed')) {
    return 'rituals';
  }
  if (action === 'comment_created' || action === 'ripple_received') {
    return 'engagement';
  }
  if (action.startsWith('joined_you')) {
    return 'chains';
  }
  if (action.includes('milestone')) {
    return 'milestones';
  }
  return 'impactMoments'; // Default fallback
}

