import { ReviewCard } from '@components/review/review-card';
import type { ReviewWithUser } from '@lib/types/review';

type TweetReviewsProps = {
  reviews: ReviewWithUser[];
  loading: boolean;
  onReviewDeleted?: (reviewId: string) => void;
};

export function TweetReviews({
  reviews,
  loading,
  onReviewDeleted
}: TweetReviewsProps): JSX.Element {
  if (loading) {
    return (
      <div className='flex justify-center py-4'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-[#C9A96E] border-t-transparent' />
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          onDelete={() => onReviewDeleted?.(review.id)}
        />
      ))}
    </div>
  );
}
