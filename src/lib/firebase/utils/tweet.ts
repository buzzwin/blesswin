import { addDoc, serverTimestamp, type WithFieldValue, doc, getDoc, deleteDoc } from 'firebase/firestore';
import type { ViewingActivity } from '@components/activity/types';
import { tweetsCollection } from '../collections';
import type { Tweet, TweetUser } from '@lib/types/tweet';

export const sendTweet = async (
  viewingActivity: ViewingActivity,
  userData: TweetUser,
  parentTweet?: { id: string; username: string } | null
): Promise<string> => {
  try {
    type NewTweet = Omit<Tweet, 'id'>;
    
    const tweetData: WithFieldValue<NewTweet> = {
      text: viewingActivity.review ?? null,
      images: null,
      parent: parentTweet ?? null,
      userLikes: [],
      createdBy: userData.id,
      userReplies: 0,
      userRetweets: [],
      viewingActivity,
      photoURL: userData.photoURL,
      userWatching: [],
      totalWatchers: 0,
      updatedAt: null,
      user: userData,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(tweetsCollection, tweetData);
    return docRef.id;
  } catch (error) {
    // console.error('Error sending tweet:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to send tweet');
  }
};

export const deleteTweet = async (tweetId: string, userId: string): Promise<void> => {
  try {
    const tweetRef = doc(tweetsCollection, tweetId);
    const tweetSnap = await getDoc(tweetRef);
    
    if (!tweetSnap.exists()) {
      throw new Error('Tweet not found');
    }

    const tweetData = tweetSnap.data();
    if (tweetData.createdBy !== userId) {
      throw new Error('Not authorized to delete this tweet');
    }

    await deleteDoc(tweetRef);
  } catch (error) {
    // console.error('Error deleting tweet:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to delete tweet');
  }
};