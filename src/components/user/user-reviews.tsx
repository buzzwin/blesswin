import { useState, useEffect } from 'react';
import { getUserReviews } from '@lib/firebase/utils/review';
import { TweetReviews } from '@components/tweet/tweet-reviews';
import type { ReviewWithUser } from '@lib/types/review';
import { Loading } from '@components/ui/loading';
import { StatsEmpty } from '@components/tweet/stats-empty';

type UserReviewsProps = {
  userId: string;
};

export function UserReviews({ userId }: UserReviewsProps): JSX.Element {
  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReviews = async (): Promise<void> => {
      try {
        const userReviews = await getUserReviews(userId);
        setReviews(userReviews);
      } catch (error) {
        console.error('Error loading reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadReviews();
  }, [userId]);

  if (loading) {
    return <Loading className='mt-5' />;
  }

  if (!reviews.length) {
    return (
      <StatsEmpty
        title='No reviews yet'
        description='When you share your thoughts about shows and movies, they will show up here.'
      />
    );
  }

  return (
    <div className='mt-4 space-y-4'>
      <TweetReviews reviews={reviews} loading={false} />
    </div>
  );
}
