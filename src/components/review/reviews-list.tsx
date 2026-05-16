import { useState } from 'react';
import { cn } from '@lib/utils';
import { ReviewCard } from '@components/review/review-card';
import { HeroIcon } from '@components/ui/hero-icon';
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

  // console.log('ReviewsList received reviews:', reviews);
  // console.log('Current filterBy:', filterBy);

  if (loading) {
    return (
      <div className='flex justify-center py-4'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-[#C9A96E] border-t-transparent' />
      </div>
    );
  }

  const filteredReviews = reviews.filter((review) => {
    if (filterBy === 'all') return true;
    // console.log(
    //   'Filtering review:',
    //   review.title,
    //   'mediaType:',
    //   review.mediaType,
    //   'filterBy:',
    //   filterBy
    // );
    return review.mediaType === filterBy;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return a.createdAt.seconds - b.createdAt.seconds;
      case 'rating':
        return (b.rating?.length ?? 0) - (a.rating?.length ?? 0);
      default: // latest
        return b.createdAt.seconds - a.createdAt.seconds;
    }
  });

  return (
    <div className='space-y-4'>
      {/* Filters and Sort Controls */}
      <div className='flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[#faf8f4] p-4 shadow-sm dark:bg-[#1c1510]'>
        {/* Filter Buttons */}
        <div className='flex gap-2'>
          <button
            onClick={() => {
              // console.log('All button clicked');
              setFilterBy('all');
            }}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium',
              filterBy === 'all'
                ? 'bg-[#C97D60] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#231a10] dark:text-[#C4B5A0]'
            )}
          >
            All
          </button>
          <button
            onClick={() => {
              // console.log('Movie button clicked');
              setFilterBy('movie');
            }}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium',
              filterBy === 'movie'
                ? 'bg-[#C97D60] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#231a10] dark:text-[#C4B5A0]'
            )}
          >
            Movies
          </button>
          <button
            onClick={() => {
              // console.log('TV button clicked');
              setFilterBy('tv');
            }}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium',
              filterBy === 'tv'
                ? 'bg-[#C97D60] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#231a10] dark:text-[#C4B5A0]'
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
            'bg-gray-100 dark:bg-[#231a10]',
            'text-sm font-medium',
            'border-0',
            'focus:ring-2 focus:ring-[rgba(201,169,110,0.35)]'
          )}
        >
          <option value='latest'>Latest First</option>
          <option value='oldest'>Oldest First</option>
          <option value='rating'>By Rating</option>
        </select>
      </div>

      {/* Reviews List */}
      {sortedReviews.length === 0 ? (
        <div className='flex flex-col items-center gap-2 rounded-xl bg-[#faf8f4] p-8 text-center dark:bg-[#1c1510]'>
          <HeroIcon
            iconName='FilmIcon'
            className='h-12 w-12 text-gray-400 dark:text-[#3d2e1e]'
          />
          <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
            No reviews found
          </h3>
          <p className='text-gray-500 dark:text-[#9E8B76]'>
            {filterBy === 'all'
              ? 'Be the first to share your thoughts!'
              : `No reviews found for ${
                  filterBy === 'movie' ? 'movies' : 'TV shows'
                }`}
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'>
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
