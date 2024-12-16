import { UserAvatar } from '@components/user/user-avatar';
import { TweetDate } from './tweet-date';
import { cn } from '@lib/utils';
import { ReviewActions } from '@components/review/review-actions';
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
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent' />
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {reviews.map((review) => {
        if (!review.user) return null;

        return (
          <div
            key={review.id}
            className={cn(
              'relative rounded-xl border border-gray-100 p-4',
              'bg-white/50 backdrop-blur-sm',
              'dark:border-gray-800 dark:bg-gray-900/50'
            )}
          >
            <ReviewActions
              reviewId={review.id}
              userId={review.userId}
              onDelete={() => onReviewDeleted?.(review.id)}
            />

            {/* Rest of the review content */}
            <div className='flex items-center gap-3'>
              <UserAvatar
                src={review.user.photoURL || ''}
                alt={review.user.name}
                username={review.user.username}
              />
              <div className='flex flex-col'>
                <div className='flex items-center gap-2'>
                  <span className='font-medium text-gray-900 dark:text-white'>
                    {review.user.name}
                  </span>
                  <span className='text-sm text-gray-500 dark:text-gray-400'>
                    @{review.user.username}
                  </span>
                  <span className='text-sm text-gray-500 dark:text-gray-400'>
                    ·
                  </span>
                  <TweetDate createdAt={review.createdAt} viewTweet={false} />
                </div>
                <span className='p-2 text-2xl'>{review.rating}</span>
              </div>
            </div>

            <div className='mt-3 space-y-4'>
              <p className='text-gray-600 dark:text-gray-300'>
                {review.review}
              </p>
              {review.tags.length > 0 && (
                <div className='flex flex-wrap gap-1.5'>
                  {review.tags.map((tag) => (
                    <span
                      key={tag}
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs',
                        'bg-gray-100 text-gray-600',
                        'dark:bg-gray-800 dark:text-gray-300'
                      )}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
