import { adminDb } from '../admin';
import type { Timestamp } from 'firebase/firestore';

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
  posterPath?: string;
  createdAt: Date;
}

export async function getUserRatings(userId: string): Promise<Rating[]> {
  // console.log('Fetching ratings for userId:', userId);
  
  const querySnapshot = await adminDb
    .collection('ratings')
    .where('userId', '==', userId)
    .get();

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
      posterPath: data.posterPath as string | undefined,
      createdAt: safeTimestampToDate(data.createdAt as Timestamp)
    });
  });

  // console.log('Processed ratings:', ratings);
  return ratings;
}

export async function saveUserRating(rating: Omit<Rating, 'id' | 'createdAt'>): Promise<void> {
  try {
    const docRef = adminDb.collection('ratings').doc();
    await docRef.set({
      ...rating,
      createdAt: new Date()
    });
  } catch (error) {
    // console.error('Error saving user rating:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to save rating');
  }
} 