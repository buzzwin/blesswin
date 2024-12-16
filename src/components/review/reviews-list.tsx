import { useState } from 'react';
import { ReviewCard } from '@components/review/review-card';
import { HeroIcon } from '@components/ui/hero-icon';
import { cn } from '@lib/utils';
import type { ReviewWithUser } from '@lib/types/review';

type ReviewsListProps = {
  reviews: ReviewWithUser[];
  loading?: boolean;
  onReviewDeleted?: (reviewId: string) => void;
};

type SortOption = 'latest' | 'oldest' | 'rating';
type FilterOption = 'all' | 'movie' | 'tv';

export function ReviewsList({
  reviews,
  loading,
  onReviewDeleted
}: ReviewsListProps): JSX.Element {
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  if (loading) {
    return (
      <div className='flex justify-center py-4'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent' />
      </div>
    );
  }

  const filteredReviews = reviews.filter((review) => {
    if (filterBy === 'all') return true;
    return review.mediaType === filterBy;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return a.createdAt.seconds - b.createdAt.seconds;
      case 'rating':
        return (b.rating?.length || 0) - (a.rating?.length || 0);
      default: // latest
        return b.createdAt.seconds - a.createdAt.seconds;
    }
  });

  return (
    <div className='space-y-4'>
      {/* Filters and Sort Controls */}
      <div className='flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800'>
        {/* Filter Buttons */}
        <div className='flex gap-2'>
          <button
            onClick={() => setFilterBy('all')}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium',
              filterBy === 'all'
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilterBy('movie')}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium',
              filterBy === 'movie'
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            )}
          >
            Movies
          </button>
          <button
            onClick={() => setFilterBy('tv')}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium',
              filterBy === 'tv'
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            )}
          >
            TV Shows
          </button>
        </div>

        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className={cn(
            'rounded-lg px-3 py-1.5',
            'bg-gray-100 dark:bg-gray-700',
            'text-sm font-medium',
            'border-0',
            'focus:ring-2 focus:ring-emerald-500'
          )}
        >
          <option value='latest'>Latest First</option>
          <option value='oldest'>Oldest First</option>
          <option value='rating'>By Rating</option>
        </select>
      </div>

      {/* Reviews List */}
      {sortedReviews.length === 0 ? (
        <div className='flex flex-col items-center gap-2 rounded-xl bg-white p-8 text-center dark:bg-gray-800'>
          <HeroIcon
            iconName='FilmIcon'
            className='h-12 w-12 text-gray-400 dark:text-gray-600'
          />
          <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
            No reviews found
          </h3>
          <p className='text-gray-500 dark:text-gray-400'>
            {filterBy === 'all'
              ? 'Be the first to share your thoughts!'
              : `No reviews found for ${
                  filterBy === 'movie' ? 'movies' : 'TV shows'
                }`}
          </p>
        </div>
      ) : (
        <div className='space-y-4'>
          {sortedReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onDelete={() => onReviewDeleted?.(review.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
