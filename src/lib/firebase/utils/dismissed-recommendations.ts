import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  setDoc
} from 'firebase/firestore';
import { db } from '../app';

/**
 * Save a dismissed recommendation to Firestore
 */
export async function dismissRecommendation(
  userId: string,
  tmdbId: string,
  mediaType: 'movie' | 'tv',
  title: string
): Promise<void> {
  try {
    // Check if already dismissed
    const dismissedRef = collection(db, 'dismissed_recommendations');
    const q = query(
      dismissedRef,
      where('userId', '==', userId),
      where('tmdbId', '==', tmdbId),
      where('mediaType', '==', mediaType)
    );
    
    const existing = await getDocs(q);
    if (!existing.empty) {
      // Already dismissed
      return;
    }

    // Add dismissed recommendation
    await addDoc(dismissedRef, {
      userId,
      tmdbId,
      mediaType,
      title,
      dismissedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error dismissing recommendation:', error);
    throw error;
  }
}

/**
 * Get all dismissed recommendations for a user
 */
export async function getDismissedRecommendations(
  userId: string
): Promise<Set<string>> {
  try {
    const dismissedRef = collection(db, 'dismissed_recommendations');
    const q = query(dismissedRef, where('userId', '==', userId));
    
    const snapshot = await getDocs(q);
    const dismissedSet = new Set<string>();
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      dismissedSet.add(`${data.tmdbId}-${data.mediaType}`);
    });
    
    return dismissedSet;
  } catch (error) {
    console.error('Error getting dismissed recommendations:', error);
    return new Set<string>();
  }
}

/**
 * Check if a recommendation is dismissed
 */
export async function isRecommendationDismissed(
  userId: string,
  tmdbId: string,
  mediaType: 'movie' | 'tv'
): Promise<boolean> {
  try {
    const dismissedRef = collection(db, 'dismissed_recommendations');
    const q = query(
      dismissedRef,
      where('userId', '==', userId),
      where('tmdbId', '==', tmdbId),
      where('mediaType', '==', mediaType)
    );
    
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking dismissed recommendation:', error);
    return false;
  }
}

