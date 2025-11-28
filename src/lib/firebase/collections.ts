import { collection, doc } from 'firebase/firestore';
import { userConverter } from '@lib/types/user';
import { tweetConverter } from '@lib/types/tweet';
import { bookmarkConverter, watchlistConverter } from '@lib/types/bookmark';
import { statsConverter } from '@lib/types/stats';
import { db } from './app';
import type { CollectionReference, DocumentReference } from 'firebase/firestore';
import type { Bookmark } from '@lib/types/bookmark';
import type { Stats } from '@lib/types/stats';
import type { Review } from '@lib/types/review';
import { impactMomentConverter } from '@lib/types/impact-moment';
import type { ImpactMoment } from '@lib/types/impact-moment';
import { commentConverter } from '@lib/types/comment';
import type { Comment } from '@lib/types/comment';
import { ritualDefinitionConverter, userRitualStateConverter, ritualCompletionConverter } from '@lib/types/ritual';
import type { RitualDefinition, UserRitualState, RitualCompletion } from '@lib/types/ritual';

export const usersCollection = collection(db, 'users').withConverter(
  userConverter
);

export const tweetsCollection = collection(db, 'tweets').withConverter(
  tweetConverter
);

export function userBookmarksCollection(
  id: string
): CollectionReference<Bookmark> {
  return collection(db, `users/${id}/bookmarks`).withConverter(
    bookmarkConverter
  );
}

export function userStatsCollection(id: string): CollectionReference<Stats> {
  return collection(db, `users/${id}/stats`).withConverter(statsConverter);
}

export const watchlistsCollection = collection(db, 'watchlists').withConverter(watchlistConverter);

export const reviewsCollection = collection(db, 'reviews') as CollectionReference<Review>;

export const visitsCollection = collection(db, 'visits');

export const recommendationsCollection = collection(db, 'ai_recommendations');

export const impactMomentsCollection = collection(db, 'impact_moments').withConverter(impactMomentConverter);

export function impactMomentCommentsCollection(momentId: string): CollectionReference<Comment> {
  return collection(db, `impact_moments/${momentId}/comments`).withConverter(commentConverter);
}

export const ritualsCollection = collection(db, 'rituals').withConverter(ritualDefinitionConverter);

export function userRitualStateDoc(userId: string): DocumentReference<UserRitualState> {
  return doc(db, `users/${userId}/ritual_state/${userId}`).withConverter(userRitualStateConverter);
}

export function ritualCompletionsCollection(userId: string): CollectionReference<RitualCompletion> {
  return collection(db, `users/${userId}/ritual_completions`).withConverter(ritualCompletionConverter);
}

export const realStoriesCacheCollection = collection(db, 'real_stories_cache');
