import type { Timestamp } from 'firebase-admin/firestore';
import type { ImpactTag } from './impact-moment';

export interface RitualDefinition {
  id?: string;
  title: string;
  description: string;
  tags: ImpactTag[];
  effortLevel: 'tiny' | 'medium' | 'deep';
  suggestedTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'anytime';
  durationEstimate: string;
  isGlobal: boolean;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export interface UserRitualState {
  id?: string;
  userId: string;
  enabled: boolean;
  notificationPreferences: {
    morning: boolean;
    evening: boolean;
    milestones: boolean;
    morningTime?: string;
    eveningTime?: string;
    quietHoursStart?: string;
    quietHoursEnd?: string;
  };
  emailPreferences?: {
    joinedAction: boolean;
    ritualReminders: boolean;
    weeklySummary: boolean;
  };
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
  completedThisWeek: number;
  completedThisMonth: number;
  lastCompletedDate?: Timestamp | Date;
  lastRitualSeenDate?: Timestamp | Date;
  preferredTags?: ImpactTag[];
  onboardingCompleted: boolean;
  pausedUntil?: Timestamp | Date;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

