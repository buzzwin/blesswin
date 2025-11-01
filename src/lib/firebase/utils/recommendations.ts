import { Timestamp } from 'firebase/firestore';
import { adminDb } from '../admin';
import type { Recommendation } from '@lib/types/recommendation';

export interface AIRecommendationSession {
  id?: string;
  userId: string;
  recommendations: Recommendation[];
  analysis: {
    preferredGenres: string[];
    preferredYears: string[];
    ratingPattern: string;
    suggestions: string[];
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  source: 'ai_generated' | 'fallback';
  userRatingCount: number;
  targetYear: number;
}

export interface RecommendationWithSession extends AIRecommendationSession {
  id: string;
}

// Save unique AI recommendations to Firestore (avoiding duplicates)
export const saveAIRecommendations = async (
  userId: string,
  recommendations: Recommendation[],
  analysis: {
    preferredGenres: string[];
    preferredYears: string[];
    ratingPattern: string;
    suggestions: string[];
  },
  userRatingCount: number,
  targetYear: number,
  source: 'ai_generated' | 'fallback' = 'ai_generated'
): Promise<string> => {
  if (!adminDb) {
    console.warn('Admin SDK not available, skipping save of recommendations');
    return 'no-admin-sdk';
  }

  try {
    // Get existing recommendations to check for duplicates
    const existingSnapshot = await adminDb
      .collection('user_recommendations')
      .where('userId', '==', userId)
      .get();

    const existingRecommendations = new Set<string>();
    existingSnapshot.forEach((doc) => {
      const data = doc.data();
      existingRecommendations.add(`${data.tmdbId}-${data.mediaType}`);
    });

    // Filter out duplicates
    const uniqueRecommendations = recommendations.filter(rec => 
      !existingRecommendations.has(`${rec.tmdbId}-${rec.mediaType}`)
    );

    if (uniqueRecommendations.length === 0) {
      console.log('No new unique recommendations to save');
      return 'no-new-recommendations';
    }

    // Save unique recommendations individually
    const batch = adminDb.batch();
    const savedIds: string[] = [];

    for (const recommendation of uniqueRecommendations) {
      const docRef = adminDb.collection('user_recommendations').doc();
      batch.set(docRef, {
        userId,
        tmdbId: recommendation.tmdbId,
        title: recommendation.title,
        mediaType: recommendation.mediaType,
        posterPath: recommendation.posterPath,
        reason: recommendation.reason,
        confidence: recommendation.confidence,
        genre: recommendation.genre,
        year: recommendation.year,
        createdAt: new Date(),
        source,
        userRatingCount,
        targetYear
      });
      savedIds.push(docRef.id);
    }

    await batch.commit();
    console.log(`Saved ${uniqueRecommendations.length} unique recommendations out of ${recommendations.length} total`);
    
    // Also save the analysis as a separate document
    const analysisRef = adminDb.collection('user_analyses').doc();
    await analysisRef.set({
      userId,
      analysis,
      createdAt: new Date(),
      source,
      userRatingCount,
      targetYear,
      recommendationCount: uniqueRecommendations.length
    });

    return analysisRef.id;
  } catch (error) {
    console.error('Error saving AI recommendations:', error);
    // Don't throw - just log and return a failure indicator
    // This allows the API to continue even if saving fails
    return 'save-failed';
  }
};

// Get user's unique AI recommendations
export const getUserAIRecommendations = async (
  userId: string,
  limitCount = 20
): Promise<Recommendation[]> => {
  if (!adminDb) {
    console.warn('Firebase Admin not available, returning empty array');
    return [];
  }

  try {
    const querySnapshot = await adminDb
      .collection('user_recommendations')
      .where('userId', '==', userId)
      .limit(limitCount)
      .get();
    
    const recommendations: Recommendation[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      recommendations.push({
        tmdbId: data.tmdbId,
        title: data.title,
        mediaType: data.mediaType,
        posterPath: data.posterPath,
        reason: data.reason,
        confidence: data.confidence,
        genre: data.genre,
        year: data.year
      });
    });

    // Sort by createdAt descending (newest first)
    recommendations.sort((a, b) => {
      const aDoc = querySnapshot.docs.find(doc => doc.data().tmdbId === a.tmdbId);
      const bDoc = querySnapshot.docs.find(doc => doc.data().tmdbId === b.tmdbId);
      
      if (!aDoc || !bDoc) return 0;
      
      const aTime = aDoc.data().createdAt;
      const bTime = bDoc.data().createdAt;
      
      if (!aTime || !bTime) return 0;
      
      // Handle both Date objects and Firestore Timestamps
      const aTimestamp = aTime instanceof Date ? aTime.getTime() : aTime.toMillis?.() || 0;
      const bTimestamp = bTime instanceof Date ? bTime.getTime() : bTime.toMillis?.() || 0;
      
      return bTimestamp - aTimestamp;
    });

    return recommendations.slice(0, limitCount);
  } catch (error) {
    console.error('Error fetching user AI recommendations:', error);
    // Return empty array instead of throwing - allows API to continue
    return [];
  }
};

// Get the latest AI analysis for a user
export const getLatestAIRecommendations = async (
  userId: string
): Promise<any> => {
  if (!adminDb) {
    console.warn('Firebase Admin not available, returning null');
    return null;
  }

  try {
    const querySnapshot = await adminDb
      .collection('user_analyses')
      .where('userId', '==', userId)
      .limit(1)
      .get();
    
    if (querySnapshot.empty) {
      return null;
    }

    // Sort by createdAt descending and get the latest
    const sortedDocs = querySnapshot.docs.sort((a, b) => {
      const aTime = a.data().createdAt;
      const bTime = b.data().createdAt;
      if (!aTime || !bTime) return 0;
      
      // Handle both Date objects and Firestore Timestamps
      const aTimestamp = aTime instanceof Date ? aTime.getTime() : aTime.toMillis?.() || 0;
      const bTimestamp = bTime instanceof Date ? bTime.getTime() : bTime.toMillis?.() || 0;
      
      return bTimestamp - aTimestamp;
    });

    const doc = sortedDocs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error fetching latest AI analysis:', error);
    // Return null instead of throwing - allows API to continue
    return null;
  }
};

// Get AI recommendation statistics for a user
export const getAIRecommendationStats = async (userId: string): Promise<{
  totalRecommendations: number;
  lastRecommendationDate: Date | null;
  mostRecommendedGenres: string[];
  totalAnalyses: number;
}> => {
  try {
    // Check if we're in production and Firebase Admin is not available
    if (process.env.NODE_ENV === 'production' && !adminDb) {
      console.log('Firebase Admin not available in production, returning empty stats');
      return {
        totalRecommendations: 0,
        lastRecommendationDate: null,
        mostRecommendedGenres: [],
        totalAnalyses: 0
      };
    }

    // Get unique recommendations count
    const recommendationsSnapshot = await adminDb
      .collection('user_recommendations')
      .where('userId', '==', userId)
      .get();

    // Get analyses count
    const analysesSnapshot = await adminDb
      .collection('user_analyses')
      .where('userId', '==', userId)
      .get();

    if (recommendationsSnapshot.empty) {
      return {
        totalRecommendations: 0,
        lastRecommendationDate: null,
        mostRecommendedGenres: [],
        totalAnalyses: 0
      };
    }

    const genreCount: Record<string, number> = {};
    let lastRecommendationDate: Date | null = null;

    recommendationsSnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Track last recommendation date
      const createdAt = data.createdAt;
      let createdAtDate: Date | null = null;
      
      if (createdAt) {
        if (createdAt instanceof Date) {
          createdAtDate = createdAt;
        } else if (createdAt.toDate) {
          createdAtDate = createdAt.toDate();
        } else if (createdAt.toMillis) {
          createdAtDate = new Date(createdAt.toMillis());
        }
      }
      
      if (createdAtDate && (!lastRecommendationDate || createdAtDate > lastRecommendationDate)) {
        lastRecommendationDate = createdAtDate;
      }

      // Count genres
      if (data.genre) {
        genreCount[data.genre] = (genreCount[data.genre] || 0) + 1;
      }
    });

    const mostRecommendedGenres = Object.entries(genreCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([genre]) => genre);

    return {
      totalRecommendations: recommendationsSnapshot.size,
      lastRecommendationDate,
      mostRecommendedGenres,
      totalAnalyses: analysesSnapshot.size
    };
  } catch (error) {
    console.error('Error fetching AI recommendation stats:', error);
    throw new Error('Failed to fetch AI recommendation statistics');
  }
};