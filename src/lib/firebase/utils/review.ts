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
  deleteDoc,
  limit
} from 'firebase/firestore';
import type { Review, ReviewWithUser, RatingType } from '@lib/types/review';
import { reviewsCollection, usersCollection } from '../collections';
import type { User } from '@lib/types/user';
import { invalidateRecommendationsCache } from './recommendations';

export const createReview = async (
  reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt' | 'likes'>
): Promise<ReviewWithUser> => {
  if (!reviewData.userId) {
    throw new Error('User ID is required to create a review');
  }

  try {
    // Validate required fields
    if (!reviewData.tmdbId || !reviewData.title || !reviewData.mediaType || !reviewData.rating) {
      throw new Error('Missing required fields for review');
    }

    // Create firestore data with all required fields
    const firestoreData = {
      ...reviewData,
      review: reviewData.review || '', // Ensure review field exists
      tags: reviewData.tags || [], // Ensure tags field exists
      createdAt: serverTimestamp(),
      updatedAt: null,
      likes: []
    } as const;

    // Add to reviews collection
    const reviewRef = await addDoc(reviewsCollection, firestoreData as any);

    // Invalidate recommendations cache for the user
    await invalidateRecommendationsCache(reviewData.userId);

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
    // console.error('Error in createReview:', error);
    throw new Error(
      error instanceof Error 
        ? `Failed to create review: ${error.message}`
        : 'Failed to create review'
    );
  }
};

// Function to create a rating (review without review text)
export const createRating = async (
  ratingData: Omit<Review, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'review' | 'tags' | 'tweetId'>
): Promise<ReviewWithUser> => {
  if (!ratingData.userId) {
    throw new Error('User ID is required to create a rating');
  }

  try {
    // Validate required fields
    if (!ratingData.tmdbId || !ratingData.title || !ratingData.mediaType || !ratingData.rating) {
      throw new Error('Missing required fields for rating');
    }

    // Create firestore data for rating
    const firestoreData = {
      ...ratingData,
      review: '', // Empty review for ratings
      tags: [], // Empty tags for ratings
      createdAt: serverTimestamp(),
      updatedAt: null,
      likes: []
    } as const;

    // Add to reviews collection
    const ratingRef = await addDoc(reviewsCollection, firestoreData as any);

    // Invalidate recommendations cache for the user
    await invalidateRecommendationsCache(ratingData.userId);

    // Get user data for response
    const userDoc = await getDoc(doc(usersCollection, ratingData.userId));
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();

    return {
      ...ratingData,
      id: ratingRef.id,
      review: '',
      tags: [],
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
    // console.error('Error in createRating:', error);
    throw new Error(
      error instanceof Error 
        ? `Failed to create rating: ${error.message}`
        : 'Failed to create rating'
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
    // console.error('Error fetching media reviews:', error);
    return [];
  }
};

export const getUserReviews = async (userId: string): Promise<ReviewWithUser[]> => {
  try {
    const q = query(
      reviewsCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    // Get user data for the reviews
    const userDoc = await getDoc(doc(usersCollection, userId));
    const userData = userDoc.data() as User;

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt, // Keep as Timestamp
        user: {
          id: userData.id,
          name: userData.name,
          username: userData.username,
          photoURL: userData.photoURL,
          verified: userData.verified
        }
      } as ReviewWithUser;
    });
  } catch (error) {
    // console.error('Error fetching user reviews:', error);
    return [];
  }
};

// Get user ratings (reviews without review text)
export const getUserRatings = async (userId: string): Promise<ReviewWithUser[]> => {
  try {
    const q = query(
      reviewsCollection,
      where('userId', '==', userId),
      where('review', '==', ''), // Only get entries with empty review text
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    // Get user data for the ratings
    const userDoc = await getDoc(doc(usersCollection, userId));
    const userData = userDoc.data() as User;

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt,
        user: {
          id: userData.id,
          name: userData.name,
          username: userData.username,
          photoURL: userData.photoURL,
          verified: userData.verified
        }
      } as ReviewWithUser;
    });
  } catch (error) {
    // console.error('Error fetching user ratings:', error);
    return [];
  }
};

// Get recent ratings (reviews without review text)
export const getRecentRatings = async (limitCount = 10): Promise<ReviewWithUser[]> => {
  try {
    const q = query(
      reviewsCollection,
      where('review', '==', ''), // Only get entries with empty review text
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    // Map through ratings and fetch user data for each
    const ratingsWithUser = await Promise.all(
      snapshot.docs.slice(0, limitCount).map(async (ratingDoc) => {
        const ratingData = ratingDoc.data();

        // Fetch user data for this rating
        const userDoc = await getDoc(doc(usersCollection, ratingData.userId));
        const userData = userDoc.data() as User;

        return {
          ...ratingData,
          id: ratingDoc.id,
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

    return ratingsWithUser;
  } catch (error) {
    // console.error('Error fetching recent ratings:', error);
    return [];
  }
};

export const getAllReviews = async (limitCount = 100): Promise<ReviewWithUser[]> => {
  try {
    const q = query(
      reviewsCollection,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    
    // Map through reviews and fetch user data for each
    const reviewsWithUser = await Promise.all(
      snapshot.docs.map(async (reviewDoc) => {
        const reviewData = reviewDoc.data();

        // Fetch user data for this review
        const userDoc = await getDoc(doc(usersCollection, reviewData.userId));
        const userData = userDoc.data() as User;

        return {
          ...reviewData,
          id: reviewDoc.id,
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

    return reviewsWithUser;
  } catch (error) {
    // console.error('Error fetching all reviews:', error);
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
    // console.error('Error toggling review like:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to toggle review like');
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
    // console.error('Error deleting review:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to delete review');
  }
};

export const updateReview = async (
  reviewId: string,
  userId: string,
  updateData: Partial<Pick<Review, 'review' | 'rating' | 'tags'>>
): Promise<ReviewWithUser> => {
  try {
    const reviewRef = doc(reviewsCollection, reviewId);
    const reviewSnap = await getDoc(reviewRef);
    
    if (!reviewSnap.exists()) {
      throw new Error('Review not found');
    }

    const reviewData = reviewSnap.data();
    if (reviewData.userId !== userId) {
      throw new Error('Not authorized to update this review');
    }

    // Update the review
    await updateDoc(reviewRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });

    // Get the updated review with user data
    const updatedSnap = await getDoc(reviewRef);
    const updatedData = updatedSnap.data();
    
    // Get user data
    const userDoc = await getDoc(doc(usersCollection, userId));
    const userData = userDoc.data() as User;

    return {
      ...updatedData,
      id: reviewId,
      user: {
        id: userData.id,
        name: userData.name,
        username: userData.username,
        photoURL: userData.photoURL,
        verified: userData.verified
      }
    } as ReviewWithUser;
  } catch (error) {
    // console.error('Error updating review:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to update review');
  }
};

// Get rating stats for a user
export const getRatingStats = async (userId: string): Promise<{
  love: number;
  hate: number;
  meh: number;
  total: number;
}> => {
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
};

// Delete a rating
export const deleteRating = async (ratingId: string, userId: string): Promise<void> => {
  try {
    const ratingRef = doc(reviewsCollection, ratingId);
    const ratingSnap = await getDoc(ratingRef);
    
    if (!ratingSnap.exists()) {
      throw new Error('Rating not found');
    }

    const ratingData = ratingSnap.data();
    if (ratingData.userId !== userId) {
      throw new Error('Not authorized to delete this rating');
    }

    // Only allow deletion if it's a rating (empty review text)
    if (ratingData.review && ratingData.review.trim() !== '') {
      throw new Error('Cannot delete a review, only ratings can be deleted');
    }

    await deleteDoc(ratingRef);
  } catch (error) {
    // console.error('Error deleting rating:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to delete rating');
  }
}; 