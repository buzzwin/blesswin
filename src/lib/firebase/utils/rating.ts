import { db } from '../app';
import type { Timestamp } from 'firebase/firestore';
import { collection, addDoc, query, where, getDocs, orderBy, limit, deleteDoc } from 'firebase/firestore';
import { invalidateRecommendationsCache } from './recommendations';

// Helper function to safely convert Firestore timestamp to Date
function safeTimestampToDate(timestamp: Timestamp | null | undefined): Date {
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  return new Date();
}

interface Rating {
  id: string;
  userId: string;
  tmdbId: string;
  title: string;
  mediaType: 'movie' | 'tv';
  rating: 'love' | 'hate' | 'meh';
  overview?: string;
  releaseDate?: string;
  voteAverage?: number;
  posterPath: string;
  createdAt: Date;
}

export async function saveRating(ratingData: Omit<Rating, 'id' | 'createdAt'>): Promise<void> {
  try {
    // Add the rating to Firestore
    await addDoc(collection(db, 'ratings'), {
      ...ratingData,
      createdAt: new Date()
    });

    // Invalidate recommendations cache for the user
    await invalidateRecommendationsCache(ratingData.userId);

    // console.log('Rating saved and cache invalidated');
  } catch (error) {
    // console.error('Error saving rating:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to save rating');
  }
}

export async function getUserRatings(userId: string): Promise<Rating[]> {
  try {
    // console.log('Fetching ratings for userId:', userId);
    
    const q = query(
      collection(db, 'ratings'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    // console.log('Query snapshot size:', querySnapshot.size);
    
    const ratings: Rating[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // console.log('Document data:', data);
      
      ratings.push({
        id: doc.id,
        userId: data.userId as string,
        tmdbId: data.tmdbId as string,
        title: data.title as string,
        mediaType: data.mediaType as 'movie' | 'tv',
        rating: data.rating as 'love' | 'hate' | 'meh',
        overview: data.overview as string | undefined,
        releaseDate: data.releaseDate as string | undefined,
        voteAverage: data.voteAverage as number | undefined,
        posterPath: data.posterPath as string,
        createdAt: safeTimestampToDate(data.createdAt as Timestamp)
      });
    });
    
    // console.log('Processed ratings:', ratings.length);
    return ratings;
    
  } catch (error) {
    // console.error('Error fetching user ratings:', error);
    return [];
  }
}

export async function getRecentRatings(limitCount = 10): Promise<Rating[]> {
  try {
    const q = query(
      collection(db, 'ratings'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const ratings: Rating[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      ratings.push({
        id: doc.id,
        userId: data.userId as string,
        tmdbId: data.tmdbId as string,
        title: data.title as string,
        mediaType: data.mediaType as 'movie' | 'tv',
        rating: data.rating as 'love' | 'hate' | 'meh',
        overview: data.overview as string | undefined,
        releaseDate: data.releaseDate as string | undefined,
        voteAverage: data.voteAverage as number | undefined,
        posterPath: data.posterPath as string,
        createdAt: safeTimestampToDate(data.createdAt as Timestamp)
      });
    });
    
    return ratings;
  } catch (error) {
    // console.error('Error fetching recent ratings:', error);
    return [];
  }
}

// Function to handle anonymous user ratings (store in localStorage or session)
export function saveAnonymousRating(ratingData: Omit<Rating, 'id' | 'userId' | 'createdAt'>): void {
  try {
    // Store in localStorage for anonymous users
    const anonymousRatings = JSON.parse(localStorage.getItem('anonymousRatings') ?? '[]') as unknown[];
    const newRating = {
      ...ratingData,
      id: `anon_${Date.now()}`,
      userId: 'anonymous',
      createdAt: new Date()
    };
    
    anonymousRatings.push(newRating);
    localStorage.setItem('anonymousRatings', JSON.stringify(anonymousRatings));
    
    // Invalidate anonymous cache
    void invalidateRecommendationsCache(null);
    
    // console.log('Anonymous rating saved');
  } catch (error) {
    // console.error('Error saving anonymous rating:', error);
  }
}

export function getAnonymousRatings(): Rating[] {
  try {
    const anonymousRatings = JSON.parse(localStorage.getItem('anonymousRatings') ?? '[]') as unknown[];
    return anonymousRatings.map((rating: unknown) => {
      const ratingData = rating as Omit<Rating, 'createdAt'> & { createdAt: string };
      return {
        ...ratingData,
        createdAt: new Date(ratingData.createdAt)
      };
    });
  } catch (error) {
    // console.error('Error getting anonymous ratings:', error);
    return [];
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
    // console.error('Error fetching rating stats:', error);
    return { love: 0, hate: 0, meh: 0, total: 0 };
  }
}

export async function deleteRating(userId: string, tmdbId: string): Promise<void> {
  try {
    const q = query(
      collection(db, 'ratings'),
      where('userId', '==', userId),
      where('tmdbId', '==', tmdbId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      await deleteDoc(docRef);
      // console.log('Rating deleted successfully');
    }
  } catch (error) {
    // console.error('Error deleting rating:', error);
    throw new Error('Failed to delete rating');
  }
} 