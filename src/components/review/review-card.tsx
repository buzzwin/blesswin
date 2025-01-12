import { UserAvatar } from '@components/user/user-avatar';
import { TweetDate } from '@components/tweet/tweet-date';
import { ReviewActions } from '@components/review/review-actions';
import { cn } from '@lib/utils';
import type { ReviewWithUser } from '@lib/types/review';

type ReviewCardProps = {
  review: ReviewWithUser;
  onDelete?: () => void;
};

export function ReviewCard({ review, onDelete }: ReviewCardProps): JSX.Element {
  if (!review.user) return <></>;

  return (
    <div
      className={cn(
        'relative rounded-xl border border-gray-100 p-4',
        'bg-white/50 backdrop-blur-sm',
        'dark:border-gray-800 dark:bg-gray-900/50'
      )}
    >
      <ReviewActions
        reviewId={review.id}
        userId={review.userId}
        onDelete={onDelete}
      />

      {/* User Info and Date */}
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
            <span className='text-sm text-gray-500 dark:text-gray-400'>·</span>
            <TweetDate createdAt={review.createdAt} viewTweet={false} />
          </div>
          <span className='text-2xl'>{review.rating}</span>
        </div>
      </div>

      {/* Review Content */}
      <div className='mt-3 space-y-3'>
        <p className='text-gray-600 dark:text-gray-300'>{review.review}</p>
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
          <img
            src={`https://image.tmdb.org/t/p/w92${review.posterPath}`}
            alt={review.title}
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
