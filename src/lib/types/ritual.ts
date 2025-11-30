import type { Timestamp, FirestoreDataConverter } from 'firebase/firestore';
import type { ImpactTag, EffortLevel } from './impact-moment';

export type RitualScope = 'global' | 'personalized';
export type RitualTimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime';

export interface RitualDefinition {
  id?: string;
  title: string;
  description: string;
  tags: ImpactTag[];
  effortLevel: EffortLevel;
  scope: RitualScope;
  suggestedTimeOfDay: RitualTimeOfDay;
  durationEstimate: string; // e.g., "2 minutes", "5 minutes"
  prefillTemplate: string; // Template for Impact Moment when shared
  icon?: string; // Emoji or icon identifier
  createdAt?: Timestamp | Date;
  usageCount?: number; // How many times assigned
  completionRate?: number; // Percentage completion rate
  completed?: boolean; // Whether this ritual was completed today (client-side only)
}

export interface UserRitualState {
  id?: string;
  userId: string;
  enabled: boolean;
  notificationPreferences: {
    morning: boolean;
    evening: boolean;
    milestones: boolean;
    morningTime?: string; // e.g., "08:00"
    eveningTime?: string; // e.g., "19:00"
    quietHoursStart?: string; // e.g., "22:00"
    quietHoursEnd?: string; // e.g., "07:00"
  };
  emailPreferences?: {
    joinedAction?: boolean;
    ritualReminders?: boolean;
    weeklySummary?: boolean;
  };
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
  completedThisWeek: number;
  completedThisMonth: number;
  lastCompletedDate?: Timestamp | Date;
  lastRitualSeenDate?: Timestamp | Date;
  preferredTags?: ImpactTag[]; // Calculated from user's history
  onboardingCompleted: boolean;
  pausedUntil?: Timestamp | Date; // If user paused rituals
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export interface RitualCompletion {
  id?: string;
  ritualId: string;
  userId: string;
  completedAt: Timestamp | Date;
  sharedAsMomentId?: string; // If user shared as Impact Moment
  completedQuietly: boolean;
  date: string; // YYYY-MM-DD format for easy querying
}

export interface TodayRituals {
  globalRitual: RitualDefinition | null;
  personalizedRituals: RitualDefinition[];
  date: string; // YYYY-MM-DD
}

export interface RitualStats {
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
  completedThisWeek: number;
  completedThisMonth: number;
  completedDays: number; // Days with at least one completion
  mostActiveTags: Array<{ tag: ImpactTag; count: number }>;
  sharedCount: number; // How many were shared as Impact Moments
  quietCount: number; // How many were completed quietly
  // Enhanced metrics
  averageCompletionsPerDay?: number;
  completionRate?: number; // Percentage of days with at least one completion
  bestDay?: string; // Day of week with most completions
  preferredTimeOfDay?: string; // Most common time of day for completions
  streakMilestones?: Array<{ milestone: number; achieved: boolean; achievedAt?: string }>;
  completionMilestones?: Array<{ milestone: number; achieved: boolean; achievedAt?: string }>;
  recentStreaks?: Array<{ startDate: string; endDate: string; length: number }>; // Recent streak history
  completionTrend?: 'increasing' | 'decreasing' | 'stable';
  lastCompletedDate?: string;
}

export const ritualDefinitionConverter: FirestoreDataConverter<RitualDefinition> = {
  toFirestore(ritual) {
    const { id, createdAt, usageCount, completionRate, icon, ...requiredData } = ritual;
    const firestoreData: Record<string, unknown> = {
      ...requiredData
    };

    if (createdAt !== undefined) {
      firestoreData.createdAt = createdAt instanceof Date ? createdAt : createdAt;
    }
    if (usageCount !== undefined) {
      firestoreData.usageCount = usageCount;
    }
    if (completionRate !== undefined) {
      firestoreData.completionRate = completionRate;
    }
    if (icon !== undefined) {
      firestoreData.icon = icon;
    }

    return firestoreData;
  },
  fromFirestore(snapshot, options) {
    const { id } = snapshot;
    const data = snapshot.data(options);
    return { id, ...data } as RitualDefinition;
  }
};

export const userRitualStateConverter: FirestoreDataConverter<UserRitualState> = {
  toFirestore(state) {
    const {
      id,
      lastCompletedDate,
      lastRitualSeenDate,
      pausedUntil,
      preferredTags,
      createdAt,
      updatedAt,
      ...requiredData
    } = state;
    const firestoreData: Record<string, unknown> = {
      ...requiredData
    };

    if (lastCompletedDate !== undefined) {
      firestoreData.lastCompletedDate =
        lastCompletedDate instanceof Date ? lastCompletedDate : lastCompletedDate;
    }
    if (lastRitualSeenDate !== undefined) {
      firestoreData.lastRitualSeenDate =
        lastRitualSeenDate instanceof Date ? lastRitualSeenDate : lastRitualSeenDate;
    }
    if (pausedUntil !== undefined) {
      firestoreData.pausedUntil = pausedUntil instanceof Date ? pausedUntil : pausedUntil;
    }
    if (preferredTags !== undefined) {
      firestoreData.preferredTags = preferredTags;
    }
    if (createdAt !== undefined) {
      firestoreData.createdAt = createdAt instanceof Date ? createdAt : createdAt;
    }
    if (updatedAt !== undefined) {
      firestoreData.updatedAt = updatedAt instanceof Date ? updatedAt : updatedAt;
    }

    return firestoreData;
  },
  fromFirestore(snapshot, options) {
    const { id } = snapshot;
    const data = snapshot.data(options);
    return { id, ...data } as UserRitualState;
  }
};

export const ritualCompletionConverter: FirestoreDataConverter<RitualCompletion> = {
  toFirestore(completion) {
    const { id, completedAt, sharedAsMomentId, ...requiredData } = completion;
    const firestoreData: Record<string, unknown> = {
      ...requiredData,
      completedAt: completedAt instanceof Date ? completedAt : completedAt
    };

    if (sharedAsMomentId !== undefined) {
      firestoreData.sharedAsMomentId = sharedAsMomentId;
    }

    return firestoreData;
  },
  fromFirestore(snapshot, options) {
    const { id } = snapshot;
    const data = snapshot.data(options);
    return { id, ...data } as RitualCompletion;
  }
};

