import type { Timestamp, FirestoreDataConverter } from 'firebase/firestore';

export type ImpactTag = 'mind' | 'body' | 'relationships' | 'nature' | 'community';
export type EffortLevel = 'tiny' | 'medium' | 'deep';
export type RippleType = 'inspired' | 'grateful' | 'joined_you' | 'sent_love';

export interface MoodCheckIn {
  before: number; // 1-5 scale
  after: number; // 1-5 scale
}

export interface ImpactMoment {
  id?: string;
  text: string;
  tags: ImpactTag[];
  effortLevel: EffortLevel;
  moodCheckIn?: MoodCheckIn;
  images?: string[];
  videoUrl?: string;
  createdBy: string;
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
  ripples: {
    inspired: string[]; // user IDs
    grateful: string[];
    joined_you: string[];
    sent_love: string[];
  };
  rippleCount: number;
  userRipples?: string[]; // user IDs who have rippled this
  joinedFromMomentId?: string; // ID of the original moment this was joined from
  joinedByUsers?: string[]; // user IDs who have joined this moment
  fromDailyRitual?: boolean; // Whether this Impact Moment was created from a Daily Ritual
  ritualId?: string; // ID of the ritual that inspired this moment
  ritualTitle?: string; // Title of the ritual (for display)
  fromRealStory?: boolean; // Whether this Impact Moment was inspired by a Real Story
  storyId?: string; // Identifier of the story that inspired this moment
  storyTitle?: string; // Title of the story (for display)
}

export interface ImpactMomentWithUser extends ImpactMoment {
  user: {
    id: string;
    name: string;
    username: string;
    photoURL: string;
    verified?: boolean;
  };
}

export const impactTagLabels: Record<ImpactTag, string> = {
  mind: 'Mind',
  body: 'Body',
  relationships: 'Relationships',
  nature: 'Nature',
  community: 'Community'
};

export const impactTagColors: Record<ImpactTag, string> = {
  mind: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  body: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  relationships: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  nature: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  community: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
};

export const effortLevelLabels: Record<EffortLevel, string> = {
  tiny: 'Tiny',
  medium: 'Medium',
  deep: 'Deep'
};

export const effortLevelIcons: Record<EffortLevel, string> = {
  tiny: '🌱',
  medium: '🌿',
  deep: '🌳'
};

export const rippleTypeLabels: Record<RippleType, string> = {
  inspired: 'Inspired',
  grateful: 'Grateful',
  joined_you: 'Joined You',
  sent_love: 'Sent Love'
};

export const rippleTypeIcons: Record<RippleType, string> = {
  inspired: '✨',
  grateful: '🙏',
  joined_you: '🤝',
  sent_love: '💚'
};

export const impactMomentConverter: FirestoreDataConverter<ImpactMoment> = {
  toFirestore(moment) {
    const { id, updatedAt, moodCheckIn, images, videoUrl, userRipples, joinedFromMomentId, joinedByUsers, fromDailyRitual, ritualId, ritualTitle, fromRealStory, storyId, storyTitle, ...requiredData } = moment;
    const firestoreData: Record<string, unknown> = {
      ...requiredData,
      createdAt: moment.createdAt instanceof Date ? moment.createdAt : moment.createdAt
    };
    
    // Only include optional fields if they have values (not undefined)
    if (moodCheckIn !== undefined) {
      firestoreData.moodCheckIn = moodCheckIn;
    }
    if (images !== undefined) {
      firestoreData.images = images;
    }
    if (videoUrl !== undefined) {
      firestoreData.videoUrl = videoUrl;
    }
    if (updatedAt !== undefined) {
      firestoreData.updatedAt = updatedAt instanceof Date ? updatedAt : updatedAt;
    }
    if (userRipples !== undefined) {
      firestoreData.userRipples = userRipples;
    }
    if (joinedFromMomentId !== undefined) {
      firestoreData.joinedFromMomentId = joinedFromMomentId;
    }
    if (joinedByUsers !== undefined) {
      firestoreData.joinedByUsers = joinedByUsers;
    }
    if (fromDailyRitual !== undefined) {
      firestoreData.fromDailyRitual = fromDailyRitual;
    }
    if (ritualId !== undefined) {
      firestoreData.ritualId = ritualId;
    }
    if (ritualTitle !== undefined) {
      firestoreData.ritualTitle = ritualTitle;
    }
    if (fromRealStory !== undefined) {
      firestoreData.fromRealStory = fromRealStory;
    }
    if (storyId !== undefined) {
      firestoreData.storyId = storyId;
    }
    if (storyTitle !== undefined) {
      firestoreData.storyTitle = storyTitle;
    }
    
    return firestoreData;
  },
  fromFirestore(snapshot, options) {
    const { id } = snapshot;
    const data = snapshot.data(options);
    return { id, ...data } as ImpactMoment;
  }
};

