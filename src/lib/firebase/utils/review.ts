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
  type WithFieldValue,
  type QueryDocumentSnapshot,
  deleteDoc
} from 'firebase/firestore';
import { reviewsCollection, usersCollection } from '../collections';
import type { Review, ReviewWithUser } from '@lib/types/review';
import type { User } from '@lib/types/user';

export const createReview = async (
  reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt' | 'likes'>
): Promise<ReviewWithUser> => {
  if (!reviewData.userId) {
    throw new Error('User ID is required to create a review');
  }

  try {
    // Validate required fields
    if (!reviewData.tmdbId || !reviewData.title || !reviewData.mediaType) {
      throw new Error('Missing required fields for review');
    }

    const firestoreData: WithFieldValue<Omit<Review, 'id'>> = {
      ...reviewData,
      createdAt: serverTimestamp(),
      updatedAt: null,
      likes: []
    };

    // Add to reviews collection
    const reviewRef = await addDoc(reviewsCollection, firestoreData);

    // Get user data for response
    const userDoc = await getDoc(doc(usersCollection, reviewData.userId));
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();

    return {
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
  } catch (error) {
    console.error('Error in createReview:', error);
    throw new Error(
      error instanceof Error 
        ? `Failed to create review: ${error.message}`
        : 'Failed to create review'
    );
  }
};

export const getMediaReviews = async (tmdbId: number): Promise<ReviewWithUser[]> => {
  try {
    const q = query(
      reviewsCollection,
      where('tmdbId', '==', tmdbId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    // Get user data for each review
    const reviews = await Promise.all(
      snapshot.docs.map(async (docSnapshot: QueryDocumentSnapshot<Review>) => {
        const data = docSnapshot.data();
        // Get user data
        const userDocRef = doc(usersCollection, data.userId);
        const userDocSnap = await getDoc(userDocRef);
        const userData = userDocSnap.data() as User;

        return {
          ...data,
          id: docSnapshot.id,
          createdAt: data.createdAt,
          user: {
            id: userData.id,
            name: userData.name,
            username: userData.username,
            photoURL: userData.photoURL,
            verified: userData.verified
          }
        } as ReviewWithUser;
      })
    );

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

export const deleteReview = async (reviewId: string, userId: string): Promise<void> => {
  try {
    const reviewRef = doc(reviewsCollection, reviewId);
    const reviewSnap = await getDoc(reviewRef);
    
    if (!reviewSnap.exists()) {
      throw new Error('Review not found');
    }

    const reviewData = reviewSnap.data();
    if (reviewData.userId !== userId) {
      throw new Error('Not authorized to delete this review');
    }

    await deleteDoc(reviewRef);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error deleting review:', error);
    throw error;
  }
}; 