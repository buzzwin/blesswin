import type { Timestamp, FirestoreDataConverter } from 'firebase/firestore';
import type { RealStory } from './real-story';

export interface StoryBookmark {
  id?: string;
  userId: string;
  storyId: string; // Story identifier (title)
  storyTitle: string;
  storyDescription: string;
  storyCategory: RealStory['category'];
  storyLocation?: string;
  storyDate?: string | null;
  storySource?: string;
  storyUrl?: string;
  collectionId?: string; // Optional: which collection this belongs to
  notes?: string; // User's personal notes about the story
  createdAt: Timestamp | Date;
}

export interface StoryCollection {
  id?: string;
  userId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  storyIds: string[]; // Array of story IDs in this collection
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export const storyBookmarkConverter: FirestoreDataConverter<StoryBookmark> = {
  toFirestore(bookmark) {
    const { id, ...data } = bookmark;
    const firestoreData: Record<string, unknown> = {
      userId: data.userId,
      storyId: data.storyId,
      storyTitle: data.storyTitle,
      storyDescription: data.storyDescription,
      storyCategory: data.storyCategory,
      createdAt: data.createdAt instanceof Date ? data.createdAt : data.createdAt
    };
    
    // Only include optional fields if they have values
    if (data.storyLocation !== undefined) {
      firestoreData.storyLocation = data.storyLocation;
    }
    if (data.storyDate !== undefined && data.storyDate !== null) {
      firestoreData.storyDate = data.storyDate;
    }
    if (data.storySource !== undefined) {
      firestoreData.storySource = data.storySource;
    }
    if (data.storyUrl !== undefined) {
      firestoreData.storyUrl = data.storyUrl;
    }
    if (data.collectionId !== undefined && data.collectionId !== null) {
      firestoreData.collectionId = data.collectionId;
    }
    if (data.notes !== undefined && data.notes !== null && typeof data.notes === 'string' && data.notes.trim() !== '') {
      firestoreData.notes = data.notes;
    }
    
    return firestoreData;
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return { id: snapshot.id, ...data } as StoryBookmark;
  }
};

export const storyCollectionConverter: FirestoreDataConverter<StoryCollection> = {
  toFirestore(collection) {
    const { id, ...data } = collection;
    const firestoreData: Record<string, unknown> = {
      userId: data.userId,
      name: data.name,
      isPublic: data.isPublic,
      storyIds: data.storyIds || [],
      createdAt: data.createdAt instanceof Date ? data.createdAt : data.createdAt
    };
    
    // Only include optional fields if they have values
    if (data.description !== undefined && data.description !== null && typeof data.description === 'string' && data.description.trim() !== '') {
      firestoreData.description = data.description;
    }
    if (data.updatedAt !== undefined && data.updatedAt !== null) {
      firestoreData.updatedAt = data.updatedAt instanceof Date ? data.updatedAt : data.updatedAt;
    }
    
    return firestoreData;
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return { id: snapshot.id, ...data } as StoryCollection;
  }
};

