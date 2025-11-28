import type { Timestamp } from 'firebase/firestore';

export interface RealStory {
  title: string;
  description: string;
  location?: string;
  date?: string | null;
  source?: string;
  url?: string;
  category: 'community' | 'environment' | 'education' | 'health' | 'social-justice' | 'innovation';
}

export interface CachedRealStories {
  stories: RealStory[];
  fetchedAt: Timestamp | Date;
  expiresAt: Timestamp | Date;
}

