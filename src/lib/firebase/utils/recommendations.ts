import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../app';

interface Recommendation {
  tmdbId: string;
  title: string;
  mediaType: 'movie' | 'tv';
  posterPath: string;
  reason: string;
  confidence: number;
  genre: string;
  year: string;
}

interface Analysis {
  preferredGenres: string[];
  preferredYears: string[];
  ratingPattern: string;
  suggestions: string[];
}

interface CachedRecommendations {
  recommendations: Recommendation[];
  analysis: Analysis;
  createdAt: Date;
  expiresAt: Date;
}

const CACHE_DURATION_DAYS = 3;

export async function getCachedRecommendations(userId: string): Promise<CachedRecommendations | null> {
  try {
    const docRef = doc(db, 'recommendations', userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data() as CachedRecommendations;
    const now = new Date();
    const expiresAt = new Date(data.expiresAt);

    // Check if cache has expired
    if (now > expiresAt) {
      // Delete expired cache
      await deleteDoc(docRef);
      return null;
    }

    return {
      ...data,
      createdAt: new Date(data.createdAt),
      expiresAt: new Date(data.expiresAt)
    };
  } catch (error) {
    console.error('Error fetching cached recommendations:', error);
    return null;
  }
}

export async function cacheRecommendations(
  userId: string, 
  recommendations: Recommendation[], 
  analysis: Analysis
): Promise<void> {
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (CACHE_DURATION_DAYS * 24 * 60 * 60 * 1000));

    const cachedData: CachedRecommendations = {
      recommendations,
      analysis,
      createdAt: now,
      expiresAt
    };

    const docRef = doc(db, 'recommendations', userId);
    await setDoc(docRef, cachedData);
  } catch (error) {
    console.error('Error caching recommendations:', error);
  }
}

export async function clearRecommendationsCache(userId: string): Promise<void> {
  try {
    const docRef = doc(db, 'recommendations', userId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error clearing recommendations cache:', error);
  }
} 