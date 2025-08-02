import {
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  serverTimestamp,
  collection,
  addDoc
} from 'firebase/firestore';
import { db } from '../app';
import { clearRecommendationsCache } from './recommendations';
import type { MediaRating, RatingType } from '@lib/types/rating';

// Create a ratings collection reference
const ratingsCollection = collection(db, 'ratings');

export async function saveRating(
  userId: string,
  tmdbId: string,
  title: string,
  mediaType: 'movie' | 'tv',
  posterPath: string,
  rating: RatingType,
  overview?: string,
  releaseDate?: string,
  voteAverage?: number
): Promise<void> {
  try {
    // Use addDoc to auto-generate document ID instead of custom ID
    const ratingData: Omit<MediaRating, 'id'> = {
      tmdbId,
      title,
      mediaType,
      posterPath,
      rating,
      userId,
      createdAt: new Date(),
      overview,
      releaseDate,
      voteAverage
    };

    await addDoc(ratingsCollection, ratingData);
    
    // Clear recommendations cache when user rates something
    await clearRecommendationsCache(userId);
  } catch (error) {
    console.error('Error saving rating:', error);
    throw new Error('Failed to save rating');
  }
}

export async function getUserRatings(userId: string): Promise<MediaRating[]> {
  try {
    console.log('Fetching ratings for userId:', userId);
    
    const q = query(
      ratingsCollection,
      where('userId', '==', userId)
      // Temporarily removed orderBy until index is created
      // orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    console.log('Query snapshot size:', querySnapshot.size);
    
    const ratings: MediaRating[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Document data:', { id: doc.id, ...data });
      
      const ratingData = {
        id: doc.id,
        ...data,
        createdAt: new Date()
      } as MediaRating;
      
      ratings.push(ratingData);
    });
    
    // Sort ratings by creation date (newest first)
    ratings.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(String(a.createdAt));
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(String(b.createdAt));
      return dateB.getTime() - dateA.getTime();
    });
    
    console.log('Processed ratings:', ratings);
    return ratings;
  } catch (error) {
    console.error('Error fetching user ratings:', error);
    throw new Error('Failed to fetch ratings');
  }
}

export async function getRatingStats(userId: string): Promise<{
  love: number;
  hate: number;
  meh: number;
  total: number;
}> {
  try {
    const ratings = await getUserRatings(userId);
    
    const stats = ratings.reduce(
      (acc, rating) => {
        acc[rating.rating]++;
        acc.total++;
        return acc;
      },
      { love: 0, hate: 0, meh: 0, total: 0 }
    );
    
    return stats;
  } catch (error) {
    console.error('Error fetching rating stats:', error);
    return { love: 0, hate: 0, meh: 0, total: 0 };
  }
}

export async function getPopularRatings(limitCount = 10): Promise<{
  tmdbId: string;
  title: string;
  mediaType: 'movie' | 'tv';
  posterPath: string;
  loveCount: number;
  hateCount: number;
  mehCount: number;
  totalRatings: number;
}[]> {
  try {
    const q = query(ratingsCollection, limit(100)); // Get more to aggregate
    const querySnapshot = await getDocs(q);
    
    const ratingMap = new Map<string, {
      tmdbId: string;
      title: string;
      mediaType: 'movie' | 'tv';
      posterPath: string;
      loveCount: number;
      hateCount: number;
      mehCount: number;
      totalRatings: number;
    }>();
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as {
        tmdbId: string;
        title: string;
        mediaType: 'movie' | 'tv';
        posterPath: string;
        rating: RatingType;
      };
      const key = data.tmdbId;
      
      if (!ratingMap.has(key)) {
        ratingMap.set(key, {
          tmdbId: data.tmdbId,
          title: data.title,
          mediaType: data.mediaType,
          posterPath: data.posterPath,
          loveCount: 0,
          hateCount: 0,
          mehCount: 0,
          totalRatings: 0
        });
      }
      
      const item = ratingMap.get(key)!;
      if (data.rating === 'love') {
        item.loveCount++;
      } else if (data.rating === 'hate') {
        item.hateCount++;
      } else if (data.rating === 'meh') {
        item.mehCount++;
      }
      item.totalRatings++;
    });
    
    // Convert to array and sort by total ratings
    const popularRatings = Array.from(ratingMap.values())
      .sort((a, b) => b.totalRatings - a.totalRatings)
      .slice(0, limitCount);
    
    return popularRatings;
  } catch (error) {
    console.error('Error fetching popular ratings:', error);
    return [];
  }
}

export async function updateRating(
  userId: string,
  tmdbId: string,
  newRating: RatingType
): Promise<void> {
  try {
    const ratingId = `${userId}-${tmdbId}`;
    const ratingRef = doc(ratingsCollection, ratingId);
    
    await setDoc(ratingRef, {
      rating: newRating,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error updating rating:', error);
    throw new Error('Failed to update rating');
  }
}

export async function deleteRating(userId: string, tmdbId: string): Promise<void> {
  try {
    const q = query(
      ratingsCollection,
      where('userId', '==', userId),
      where('tmdbId', '==', tmdbId)
    );
    
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    querySnapshot.forEach((doc) => {
      batch.update(doc.ref, { deleted: true });
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error deleting rating:', error);
    throw new Error('Failed to delete rating');
  }
}

// Function to fix existing ratings that are missing userId field
export async function fixExistingRatings(userId: string): Promise<void> {
  try {
    // Query for ratings that might be missing userId (using document ID pattern)
    const q = query(
      ratingsCollection,
      where('tmdbId', '!=', '') // Get all ratings with tmdbId
    );
    
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    let updateCount = 0;
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Check if this rating belongs to the current user and is missing userId
      if (doc.id.startsWith(userId) && !data.userId) {
        batch.update(doc.ref, { userId });
        updateCount++;
      }
    });
    
    if (updateCount > 0) {
      await batch.commit();
      console.log(`Fixed ${updateCount} ratings for user ${userId}`);
    }
  } catch (error) {
    console.error('Error fixing existing ratings:', error);
  }
} 