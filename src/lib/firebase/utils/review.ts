import { 
  addDoc, 
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  query, 
  where, 
  orderBy,
  serverTimestamp,
  getDoc,
  Timestamp,
  type WithFieldValue
} from 'firebase/firestore';
import { reviewsCollection, usersCollection } from '../collections';
import type { Review, ReviewWithUser } from '@lib/types/review';

export const createReview = async (
  reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt' | 'likes'>
): Promise<ReviewWithUser> => {
  if (!reviewData.userId) {
    throw new Error('User ID is required to create a review');
  }

  try {
    if (!reviewData.tmdbId || !reviewData.title || !reviewData.mediaType) 
      throw new Error('Missing required fields for review');

    // Destructure to remove id from data
    const { tmdbId, userId, title, mediaType, rating, review, tags, posterPath, tweetId } = reviewData;
    
    const firestoreData: WithFieldValue<Omit<Review, 'id'>> = {
      tmdbId,
      userId,
      title,
      mediaType,
      rating,
      review,
      tags,
      posterPath,
      tweetId,
      createdAt: serverTimestamp(),
      updatedAt: null,
      likes: []
    };

    const reviewRef = await addDoc(reviewsCollection, firestoreData);

    const userDoc = await getDoc(doc(usersCollection, reviewData.userId));
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();

    const newReview: ReviewWithUser = {
      ...reviewData,
      id: reviewRef.id,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: null,
      likes: [],
      user: {
        id: userData.id,
        name: userData.name,
        username: userData.username,
        photoURL: userData.photoURL,
        verified: userData.verified
      }
    };

    return newReview;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create review: ${error.message}`);
    }
    throw new Error('Failed to create review');
  }
};

export const getMediaReviews = async (tmdbId: number) => {
  try {
    const q = query(
      reviewsCollection,
      where('tmdbId', '==', tmdbId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const reviews = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate()
      };
    });

    reviews.sort((a, b) => 
      (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
    );
    
    console.log('Found reviews (fallback):', reviews);
    return reviews;
  } catch (error) {
    console.error('Error fetching media reviews:', error);
    return [];
  }
};

export const getUserReviews = async (userId: string) => {
  try {
    const q = query(
      reviewsCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate()
      };
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    return [];
  }
};

export const toggleReviewLike = async (
  reviewId: string,
  userId: string,
  isLiked: boolean
) => {
  try {
    const reviewRef = doc(reviewsCollection, reviewId);
    await updateDoc(reviewRef, {
      likes: isLiked
        ? arrayRemove(userId)
        : arrayUnion(userId)
    });
  } catch (error) {
    console.error('Error toggling review like:', error);
    throw error;
  }
}; 