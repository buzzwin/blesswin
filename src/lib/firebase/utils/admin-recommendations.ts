import { adminDb } from '../admin';

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

// Cache duration for different user types
const CACHE_DURATION_DAYS = {
  ANONYMOUS: 7, // Longer cache for anonymous users
  AUTHENTICATED: 3, // Standard cache for authenticated users
  FREQUENT_USER: 1 // Shorter cache for users who rate frequently
};

// Global cache for anonymous users (in-memory)
const anonymousCache = new Map<string, CachedRecommendations>();

export async function getCachedRecommendations(userId: string | null): Promise<CachedRecommendations | null> {
  try {
    // For anonymous users, use in-memory cache
    if (!userId) {
      const cacheKey = 'anonymous_recommendations';
      const cached = anonymousCache.get(cacheKey);
      
      if (cached && new Date() < cached.expiresAt) {
        // console.log('Using anonymous cache');
        return cached;
      }
      
      // Clear expired cache
      if (cached) {
        anonymousCache.delete(cacheKey);
      }
      
      return null;
    }

    // For authenticated users, use Firestore (admin SDK for server-side)
    if (!adminDb) {
      console.warn('Admin SDK not available, returning null for cached recommendations');
      return null;
    }
    
    const docRef = adminDb.collection('recommendations').doc(userId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return null;
    }

    const data = docSnap.data() as CachedRecommendations;
    const expiresAt = data.expiresAt instanceof Date ? data.expiresAt : (data.expiresAt as { toDate?: () => Date })?.toDate?.() ?? new Date();

    if (new Date() >= expiresAt) {
      // Cache expired, delete it
      await docRef.delete();
      return null;
    }

    // console.log('Using cached recommendations');
    return data;

  } catch (error) {
    // console.error('Error getting cached recommendations:', error);
    return null;
  }
}

export async function cacheRecommendations(
  userId: string | null,
  recommendations: Recommendation[],
  analysis: Analysis
): Promise<void> {
  try {
    const now = new Date();
    
    // Determine cache duration based on user type
    let cacheDuration = CACHE_DURATION_DAYS.AUTHENTICATED;
    
    if (!userId) {
      cacheDuration = CACHE_DURATION_DAYS.ANONYMOUS;
    } else {
      // Check if user is a frequent rater (has more than 10 ratings in last 7 days)
      // This could be enhanced with more sophisticated logic
      cacheDuration = CACHE_DURATION_DAYS.FREQUENT_USER;
    }
    
    const expiresAt = new Date(now.getTime() + cacheDuration * 24 * 60 * 60 * 1000);

    const cachedData: CachedRecommendations = {
      recommendations,
      analysis,
      createdAt: now,
      expiresAt
    };

    // For anonymous users, use in-memory cache
    if (!userId) {
      anonymousCache.set('anonymous_recommendations', cachedData);
      // console.log('Cached anonymous recommendations in memory');
      return;
    }

    // For authenticated users, use Firestore (admin SDK for server-side)
    if (!adminDb) {
      console.warn('Admin SDK not available, cannot cache recommendations');
      return;
    }
    
    const docRef = adminDb.collection('recommendations').doc(userId);
    await docRef.set(cachedData);
    // console.log('Cached recommendations in Firestore');

  } catch (error) {
    // console.error('Error caching recommendations:', error);
  }
}

export async function invalidateRecommendationsCache(userId: string | null): Promise<void> {
  try {
    // For anonymous users, clear in-memory cache
    if (!userId) {
      anonymousCache.clear();
      // console.log('Cleared anonymous cache');
      return;
    }

    // For authenticated users, delete from Firestore (admin SDK for server-side)
    if (!adminDb) {
      console.warn('Admin SDK not available, cannot invalidate recommendations cache');
      return;
    }
    
    const docRef = adminDb.collection('recommendations').doc(userId);
    await docRef.delete();
    // console.log('Invalidated recommendations cache');

  } catch (error) {
    // console.error('Error invalidating recommendations cache:', error);
  }
}

// Function to get global recommendations for anonymous users
export function getGlobalRecommendations(): Recommendation[] {
  // Check if we have cached global recommendations
  const cached = anonymousCache.get('global_recommendations');
  
  if (cached && new Date() < cached.expiresAt) {
    return cached.recommendations;
  }

  // If no cache, return empty array
  return [];
} 