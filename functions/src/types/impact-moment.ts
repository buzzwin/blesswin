import type { Timestamp } from 'firebase-admin/firestore';

export type ImpactTag = 'mind' | 'body' | 'relationships' | 'nature' | 'community' | 'chores';
export type EffortLevel = 'tiny' | 'medium' | 'deep';
export type RippleType = 'inspired' | 'grateful' | 'joined_you' | 'sent_love';

export interface ImpactMoment {
  id?: string;
  text: string;
  tags: ImpactTag[];
  effortLevel: EffortLevel;
  createdBy: string;
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
  ripples: {
    inspired: string[];
    grateful: string[];
    joined_you: string[];
    sent_love: string[];
  };
  rippleCount: number;
  joinedFromMomentId?: string;
  joinedByUsers?: string[];
  moodCheckIn?: {
    before: number;
    after: number;
  };
  images?: string[];
  fromDailyRitual?: boolean;
  ritualId?: string;
  ritualTitle?: string;
  fromRealStory?: boolean;
  storyId?: string;
  storyTitle?: string;
}

