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
  getDoc
} from 'firebase/firestore';
import { reviewsCollection, usersCollection } from '../collections';
import type { Review, ReviewWithUser } from '@lib/types/review';

export const createReview = async (
  reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt' | 'likes'>
): Promise<ReviewWithUser> => {
  console.log('Starting review creation with data:', reviewData);
  
  if (!reviewData.userId) {
    console.error('No userId provided for review');
    throw new Error('User ID is required to create a review');
  }

  try {
    // Validate required fields
    if (!reviewData.tmdbId || !reviewData.title || !reviewData.mediaType) {
      throw new Error('Missing required fields for review');
    }

    const firestoreData = {
      ...reviewData,
      createdAt: serverTimestamp(),
      updatedAt: null,
      likes: []
    };

    console.log('Attempting to save review to Firestore:', firestoreData);

    const review = await addDoc(reviewsCollection, firestoreData);
    console.log('Review saved successfully with ID:', review.id);

    // Get user data
    const userDoc = await getDoc(doc(usersCollection, reviewData.userId));
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    console.log('Retrieved user data:', userData);

    const newReview: ReviewWithUser = {
      ...reviewData,
      id: review.id,
      createdAt: new Date(),
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

    console.log('Created review with user data:', newReview);
    return newReview;
  } catch (error) {
    console.error('Error in createReview:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to create review: ${error.message}`);
    }
    throw new Error('Failed to create review');
  }
};

export const getMediaReviews = async (tmdbId: number) => {
  console.log('Fetching reviews for media:', tmdbId);
  
  try {
    // First try with the composite index
    const q = query(
      reviewsCollection,
      where('tmdbId', '==', tmdbId),
      orderBy('createdAt', 'desc')
    );

    try {
      const snapshot = await getDocs(q);
      const reviews = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate()
        };
      });
      
      console.log('Found reviews:', reviews);
      return reviews;
    } catch (indexError) {
      console.warn('Index not ready, falling back to simple query:', indexError);
      
      // Fallback to simple query without ordering
      const simpleQuery = query(
        reviewsCollection,
        where('tmdbId', '==', tmdbId)
      );
      
      const snapshot = await getDocs(simpleQuery);
      const reviews = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate()
        };
      });

      // Sort in memory as fallback
      reviews.sort((a, b) => b.createdAt - a.createdAt);
      
      console.log('Found reviews (fallback):', reviews);
      return reviews;
    }
  } catch (error) {
    console.error('Error fetching media reviews:', error);
    // Return empty array instead of throwing
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