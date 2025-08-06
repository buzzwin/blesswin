import { cn } from '@lib/utils';
import { ReviewCard } from '@components/review/review-card';
import { Loading } from '@components/ui/loading';
import { HeroIcon } from '@components/ui/hero-icon';
import type { ReviewWithUser } from '@lib/types/review';

type RecentReviewsProps = {
  reviews: ReviewWithUser[];
  loading?: boolean;
  error?: string | null;
  variant?: 'default' | 'dark';
  className?: string;
};

export function RecentReviews({
  reviews,
  loading,
  error,
  variant = 'default',
  className
}: RecentReviewsProps): JSX.Element {
  if (loading) {
    return (
      <div className={cn('flex justify-center py-8', className)}>
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('py-8 text-center', className)}>
        <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30'>
          <HeroIcon
            iconName='ExclamationTriangleIcon'
            className='h-6 w-6 text-red-600 dark:text-red-400'
          />
        </div>
        <p className='text-sm text-gray-600 dark:text-gray-400'>{error}</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className={cn('py-8 text-center', className)}>
        <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800'>
          <HeroIcon
            iconName='FilmIcon'
            className='h-6 w-6 text-gray-400 dark:text-gray-600'
          />
        </div>
        <h3 className='mb-2 text-lg font-medium text-gray-900 dark:text-white'>
          No reviews yet
        </h3>
        <p className='text-sm text-gray-500 dark:text-gray-400'>
          Be the first to share your thoughts!
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
          Recent Reviews
        </h3>
        <span className='text-sm text-gray-500 dark:text-gray-400'>
          {reviews.length} reviews
        </span>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        {reviews.slice(0, 4).map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {reviews.length > 4 && (
        <div className='pt-4 text-center'>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            +{reviews.length - 4} more reviews
          </p>
        </div>
      )}
    </div>
  );
}
