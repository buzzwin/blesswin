import { UserAvatar } from '@components/user/user-avatar';
import { TweetDate } from '@components/tweet/tweet-date';
import { ReviewActions } from '@components/review/review-actions';
import { ReviewShare } from '@components/review/review-share';
import type { ReviewWithUser } from '@lib/types/review';
import { cn } from '@lib/utils';
import Image from 'next/image';

type ReviewCardProps = {
  review: ReviewWithUser;
  onDelete?: () => void;
  viewReview?: boolean;
};

export function ReviewCard({
  review,
  onDelete,
  viewReview
}: ReviewCardProps): JSX.Element {
  if (!review.user) return <></>;

  return (
    <div
      className={cn(
        'relative rounded-xl border border-gray-100 p-6',
        'bg-white/50 backdrop-blur-sm',
        'dark:border-gray-800 dark:bg-gray-900/50'
      )}
    >
      <div className='absolute right-4 top-4 flex items-center gap-2'>
        <ReviewShare
          reviewId={review.id}
          viewReview={viewReview}
          text={review.review || ''}
          reviewTitle={review.title}
        />
        <ReviewActions
          reviewId={review.id}
          userId={review.userId}
          onDelete={onDelete}
        />
      </div>

      {/* User Info and Date */}
      <div className='flex items-center gap-3'>
        <UserAvatar
          src={review.user.photoURL ?? ''}
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
            <span className='text-sm text-gray-500 dark:text-gray-400'>·</span>
            <TweetDate createdAt={review.createdAt} viewTweet={false} />
          </div>
          <span className='text-2xl'>{review.rating}</span>
        </div>
      </div>

      {/* Review Content */}
      <div className='mt-3 space-y-3'>
        {review.review && (
          <p className='text-gray-600 dark:text-gray-300'>{review.review}</p>
        )}
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

      {/* Movie/Show Info */}
      {review.posterPath && (
        <div className='mt-4 flex items-center gap-3'>
          <Image
            src={`https://image.tmdb.org/t/p/w92${review.posterPath}`}
            alt={review.title}
            width={48}
            height={64}
            className='h-16 w-12 rounded-md object-cover'
          />
          <div>
            <h3 className='font-medium text-gray-900 dark:text-white'>
              {review.title}
            </h3>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              {review.mediaType === 'movie' ? 'Movie' : 'TV Show'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
