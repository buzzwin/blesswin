import type { ViewingActivity } from '@components/activity/types';
import type { Timestamp, FirestoreDataConverter } from 'firebase/firestore';
import type { ImagesPreview } from './file';
import type { User } from './user';

export type TweetUser = {
  id: string;
  name: string;
  username: string;
  photoURL: string;
  verified: boolean;
};

export type BuzzRef = {
  buzzId: string;
  shareToken: string;
  occasion: string;
  recipientName: string;
  title: string;
};

export type Tweet = {
  id: string;
  text: string | null;
  images: ImagesPreview | null;
  parent: {
    id: string;
    username: string;
  } | null;
  userLikes: string[];
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp | null;
  userReplies: number;
  userRetweets: string[];
  viewingActivity: ViewingActivity;
  photoURL: string;
  userWatching: string[];
  totalWatchers: number;
  user: TweetUser;
  buzzRef?: BuzzRef;
};

export type TweetWithUser = Tweet & { user: User };

export const tweetConverter: FirestoreDataConverter<Tweet> = {
  toFirestore(tweet) {
    return { ...tweet };
  },
  fromFirestore(snapshot, options) {
    const { id } = snapshot;
    const data = snapshot.data(options);

    return { id, ...data } as Tweet;
  }
};
