import { HomeLayout, ProtectedLayout } from '@components/layout/common-layout';
import { MainHeader } from '@components/home/main-header';
import { SEO } from '@components/common/seo';
import { useAuth } from '@lib/context/auth-context';
import { useEffect, useState } from 'react';
import { ReviewWithUser } from '@lib/types/review';
import {
  collection,
  query,
  orderBy,
  getDocs,
  getDoc,
  doc
} from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { reviewsCollection, usersCollection } from '@lib/firebase/collections';
import { TweetReviews } from '@components/tweet/tweet-reviews';
import { Loading } from '@components/ui/loading';
import { StatsEmpty } from '@components/tweet/stats-empty';
import type { ReactElement, ReactNode } from 'react';
import { User } from '@lib/types/user';

export default function Reviews(): JSX.Element {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllReviews = async (): Promise<void> => {
      try {
        // Create query to get all reviews, ordered by creation date
        const reviewsQuery = query(
          reviewsCollection,
          orderBy('createdAt', 'desc')
        );

        const reviewsSnapshot = await getDocs(reviewsQuery);

        // Map through reviews and fetch user data for each
        const reviewsWithUser = await Promise.all(
          reviewsSnapshot.docs.map(async (reviewDoc) => {
            const reviewData = reviewDoc.data();

            // Fetch user data for this review
            const userDoc = await getDoc(
              doc(usersCollection, reviewData.userId)
            );
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

        setReviews(reviewsWithUser);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error loading reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadAllReviews();
  }, []);

  const handleReviewDeleted = (reviewId: string) => {
    setReviews((prevReviews) =>
      prevReviews.filter((review) => review.id !== reviewId)
    );
  };

  return (
    <section className='mt-2'>
      <SEO title='Reviews / Buzzwin' />
      <MainHeader title='All Reviews' />
      <div className='mt-0.5 px-4'>
        {loading ? (
          <Loading className='mt-5' />
        ) : !reviews.length ? (
          <StatsEmpty
            title='No reviews yet'
            description='Be the first to share your thoughts about a show or movie!'
          />
        ) : (
          <div className='mt-4 space-y-4'>
            <p className='text-gray-600 dark:text-gray-400'>
              {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}{' '}
              shared
            </p>
            <TweetReviews
              reviews={reviews}
              loading={false}
              onReviewDeleted={handleReviewDeleted}
            />
          </div>
        )}
      </div>
    </section>
  );
}

Reviews.getLayout = (page: ReactElement): ReactNode => (
  <ProtectedLayout>
    <HomeLayout>{page}</HomeLayout>
  </ProtectedLayout>
);
