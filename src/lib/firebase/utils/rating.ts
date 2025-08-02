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
  collection
} from 'firebase/firestore';
import { db } from '../app';
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
    const ratingId = `${userId}-${tmdbId}`;
    const ratingRef = doc(ratingsCollection, ratingId);
    
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

    await setDoc(ratingRef, ratingData);
  } catch (error) {
    console.error('Error saving rating:', error);
    throw new Error('Failed to save rating');
  }
}

export async function getUserRatings(userId: string): Promise<MediaRating[]> {
  try {
    const q = query(
      ratingsCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const ratings: MediaRating[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as {
        createdAt?: { toDate: () => Date };
        [key: string]: any;
      };
      ratings.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date()
      } as MediaRating);
    });
    
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
    const ratingId = `${userId}-${tmdbId}`;
    const ratingRef = doc(ratingsCollection, ratingId);
    
    await setDoc(ratingRef, { deleted: true, deletedAt: serverTimestamp() }, { merge: true });
  } catch (error) {
    console.error('Error deleting rating:', error);
    throw new Error('Failed to delete rating');
  }
} 