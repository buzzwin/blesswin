import { addDoc, serverTimestamp, type WithFieldValue } from 'firebase/firestore';
import { tweetsCollection } from '../collections';
import type { ViewingActivity } from '@components/activity/types';
import type { Tweet, TweetUser } from '@lib/types/tweet';

export const sendTweet = async (
  viewingActivity: ViewingActivity,
  userData: TweetUser,
  parentTweet?: { id: string; username: string } | null
): Promise<string> => {
  try {
    type NewTweet = Omit<Tweet, 'id'>;
    
    const tweetData: WithFieldValue<NewTweet> = {
      text: viewingActivity.review || null,
      images: null,
      parent: parentTweet || null,
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
    console.error('Error sending tweet:', error);
    throw error;
  }
}; 