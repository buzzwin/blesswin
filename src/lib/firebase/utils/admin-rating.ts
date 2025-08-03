import { adminDb } from '../admin';

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
  try {
    console.log('Fetching ratings for userId:', userId);
    
    const querySnapshot = await adminDb
      .collection('ratings')
      .where('userId', '==', userId)
      .get();

    console.log('Query snapshot size:', querySnapshot.size);
    
    const ratings: Rating[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Document data:', data);
      
      ratings.push({
        id: doc.id,
        userId: data.userId,
        tmdbId: data.tmdbId,
        title: data.title,
        mediaType: data.mediaType,
        rating: data.rating,
        overview: data.overview,
        releaseDate: data.releaseDate,
        voteAverage: data.voteAverage,
        posterPath: data.posterPath,
        createdAt: (data.createdAt as any)?.toDate?.() ?? new Date()
      });
    });

    console.log('Processed ratings:', ratings);
    return ratings;
  } catch (error) {
    console.error('Error fetching user ratings:', error);
    return [];
  }
}

export async function saveUserRating(rating: Omit<Rating, 'id' | 'createdAt'>): Promise<void> {
  try {
    const docRef = adminDb.collection('ratings').doc();
    await docRef.set({
      ...rating,
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Error saving user rating:', error);
    throw error;
  }
} 